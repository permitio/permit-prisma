export class PermitError extends Error {
  cause?: Error;

  constructor(message: string, options?: { cause?: Error }) {
    super(message);
    this.name = "PermitError";
    this.cause = options?.cause;
  }
}
