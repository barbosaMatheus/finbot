const DATE_OF_BIRTH_PATTERN = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(19|20)\d{2}$/;

export function formatDateOfBirth(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${month}/${day}/${year}`;
}

export function parseDateOfBirth(value: string): Date | null {
  if (!DATE_OF_BIRTH_PATTERN.test(value.trim())) {
    return null;
  }

  const [monthText, dayText, yearText] = value.trim().split('/');
  const month = Number(monthText);
  const day = Number(dayText);
  const year = Number(yearText);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function getDefaultDateOfBirth(): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 25);
  date.setHours(12, 0, 0, 0);
  return date;
}

export function getEarliestDateOfBirth(): Date {
  return new Date(1900, 0, 1);
}

export function getLatestDateOfBirth(): Date {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
}
