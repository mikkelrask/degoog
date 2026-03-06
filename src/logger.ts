const enabled = process.env.LOGGER === "debug";

export function debug(context: string, message: string, error?: unknown): void {
  if (!enabled) return;
  const errMsg = error instanceof Error ? error.message : error ? String(error) : "";
  console.error(`[degoog:${context}] ${message}${errMsg ? ` — ${errMsg}` : ""}`);
}
