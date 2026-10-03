/**
 * Human-friendly status phrases cycled through while the model is producing
 * a response. Kept generic so it reads as "something is happening" rather
 * than promising a specific pipeline stage.
 */
export const PROCESSING_STATUS_PHRASES = [
    'Thinking...',
    'Analyzing...',
    'Calculating...',
    'Processing...',
    'Reviewing...',
    'Searching...',
    'Connecting...',
    'Crunching...',
    'Drafting...',
    'Checking...',
    'Formulating...',
    'Contextualizing...',
] as const;
