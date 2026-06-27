import { spawn } from "child_process";
import fsp from "fs/promises";
import os from "os";
import path from "path";

type PrepareOptions = {
  revision?: string;
  token?: string;
  convert?: boolean; // try to convert to gguf using `python -m llama_cpp.convert`
  outDir?: string; // base output directory (defaults to assets/models)
};

async function ensureDir(dir: string) {
  await fsp.mkdir(dir, { recursive: true });
}

function runProcess(
  cmd: string,
  args: string[],
  cwd?: string,
): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const ps = spawn(cmd, args, { cwd, shell: false });
    let out = "";
    let err = "";
    ps.stdout.on("data", (b) => (out += b.toString()));
    ps.stderr.on("data", (b) => (err += b.toString()));
    ps.on("close", (code) => resolve({ code, stdout: out, stderr: err }));
    ps.on("error", (e) => resolve({ code: 1, stdout: out, stderr: String(e) }));
  });
}

/**
 * Download a model repo from Hugging Face using a tiny Python helper that calls
 * `huggingface_hub.snapshot_download`. The function returns the local path
 * where the repo was materialized.
 */
async function downloadWithPython(
  repoId: string,
  dest: string,
  revision?: string,
  token?: string,
) {
  const script = `"""
import argparse, sys
from huggingface_hub import snapshot_download

parser = argparse.ArgumentParser()
parser.add_argument('--repo_id')
parser.add_argument('--local_dir')
parser.add_argument('--revision', default=None)
parser.add_argument('--token', default=None)
args = parser.parse_args()

try:
    path = snapshot_download(repo_id=args.repo_id, revision=args.revision, local_dir=args.local_dir, token=args.token)
    print(path)
except Exception as e:
    print('ERROR:'+str(e), file=sys.stderr)
    sys.exit(2)
"""
`;

  const tmp = await fsp.mkdtemp(path.join(os.tmpdir(), "hf-down-"));
  const scriptPath = path.join(tmp, "download_hf.py");
  await fsp.writeFile(scriptPath, script, "utf8");

  await ensureDir(dest);
  const args = [scriptPath, "--repo_id", repoId, "--local_dir", dest];
  if (revision) args.push("--revision", revision);
  if (token) args.push("--token", token);

  const res = await runProcess("python", args);
  if (res.code !== 0) {
    throw new Error(`python downloader failed: ${res.stderr || res.stdout}`);
  }
  // stdout should contain the path
  const outPath = res.stdout.trim().split(/\r?\n/).pop() || dest;
  return outPath;
}

/**
 * Try to convert a weight file to gguf using `python -m llama_cpp.convert`.
 * This will only run if that module is available; otherwise we log and skip.
 */
async function tryConvertToGguf(inputFile: string, outGguf: string) {
  // quick probe: run the module with --help to see if it's present
  const probe = await runProcess("python", [
    "-m",
    "llama_cpp.convert",
    "--help",
  ]);
  if (probe.code !== 0) {
    return {
      converted: false,
      reason: "llama_cpp.convert not available in Python environment",
      stdout: probe.stdout,
      stderr: probe.stderr,
    };
  }

  const args = ["-m", "llama_cpp.convert", inputFile, outGguf];
  const res = await runProcess("python", args);
  return { converted: res.code === 0, stdout: res.stdout, stderr: res.stderr };
}

/**
 * Public helper: download a model from Hugging Face and optionally convert to gguf.
 * Returns an object with paths and conversion status.
 */
export async function prepareModel(
  modelId: string,
  options: PrepareOptions = {},
) {
  const baseOut =
    options.outDir || path.join(process.cwd(), "assets", "models");
  const modelDirName = modelId.replace(/[\\/:]/g, "_");
  const modelDir = path.join(baseOut, modelDirName);

  await ensureDir(modelDir);

  // 1) download repository contents into modelDir/raw
  const rawDir = path.join(modelDir, "raw");
  const downloadedPath = await downloadWithPython(
    modelId,
    rawDir,
    options.revision,
    options.token,
  ).catch((err) => {
    throw new Error(`failed to download model ${modelId}: ${String(err)}`);
  });

  // 2) look for common weight file names
  const candidates: string[] = [];
  async function walk(dir: string) {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) await walk(p);
      else {
        const low = e.name.toLowerCase();
        if (
          low.endsWith(".safetensors") ||
          low.endsWith(".bin") ||
          low.endsWith(".pt") ||
          low.endsWith(".pth")
        )
          candidates.push(p);
      }
    }
  }
  await walk(downloadedPath);

  let ggufPath: string | null = null;
  let conversion: any = null;

  if (options.convert && candidates.length > 0) {
    // pick the largest candidate (heuristic: likely the main weights)
    let best = candidates[0];
    try {
      let bestSize = 0;
      for (const c of candidates) {
        const st = await fsp.stat(c);
        if (st.size > bestSize) {
          bestSize = st.size;
          best = c;
        }
      }
      ggufPath = path.join(modelDir, `${modelDirName}.gguf`);
      conversion = await tryConvertToGguf(best, ggufPath);
      if (!conversion.converted) ggufPath = null;
    } catch (e) {
      conversion = { converted: false, error: String(e) };
      ggufPath = null;
    }
  }

  return {
    modelId,
    modelDir,
    downloadedPath,
    rawFiles: candidates,
    gguf: ggufPath,
    conversion,
  };
}

export default { prepareModel };
