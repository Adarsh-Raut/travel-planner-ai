type Level = "info" | "warn" | "error";

function log(level: Level, message: string, ...meta: unknown[]): void {
  const entry = {
    level,
    time: new Date().toISOString(),
    message,
    ...(meta.length > 0 ? { meta } : {}),
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (message: string, ...meta: unknown[]) => log("info", message, ...meta),
  warn: (message: string, ...meta: unknown[]) => log("warn", message, ...meta),
  error: (message: string, ...meta: unknown[]) => log("error", message, ...meta),
};
