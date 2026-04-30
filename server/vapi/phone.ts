export function normalizePhoneNumber(input: string) {
  const trimmed = input.trim();

  if (trimmed.startsWith("+")) {
    return trimmed.replace(/[^\d+]/g, "");
  }

  const digits = trimmed.replace(/\D/g, "");

  if (digits.startsWith("972")) {
    return `+${digits}`;
  }

  if (digits.startsWith("0")) {
    return `+972${digits.slice(1)}`;
  }

  return `+${digits}`;
}
