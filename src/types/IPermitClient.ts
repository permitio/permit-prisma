export interface IPermitClient {
  check(
    user: string | object,
    action: string,
    resource: string | object,
    context?: object
  ): Promise<boolean>;
  enforceCheck(
    user: string | object,
    action: string,
    resource: string | object,
    context?: object
  ): Promise<void>;
}
