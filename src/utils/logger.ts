import winston from "winston";

export const createLogger = (
  config: { debug?: boolean; service?: string; level?: string } = {}
) => {
  const level = config.debug ? "debug" : config.level || "info";
  const service = config.service || "prisma-permit";

  return winston.createLogger({
    level,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ timestamp, level, message, stack }) => {
        return `[${timestamp}] [${service}] [${level.toUpperCase()}]: ${message}${
          stack ? `\n${stack}` : ""
        }`;
      })
    ),
    transports: [new winston.transports.Console()],
  });
};

export default createLogger({ debug: false });
