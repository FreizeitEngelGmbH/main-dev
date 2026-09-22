export type ApiValidationDetails =
  | Record<string, unknown>
  | unknown[]
  | string
  | null;

export interface ApiResponseInfo {
  url: string;
  status: number;
  statusText?: string;
  headers?: Record<string, string>;
}

export class ApiError extends Error {
  readonly status: number;
  readonly validationDetails: ApiValidationDetails;
  readonly responseInfo: ApiResponseInfo;
  readonly response?: Response;

  constructor(options: {
    status: number;
    message: string;
    validationDetails?: ApiValidationDetails;
    responseInfo: ApiResponseInfo;
    response?: Response;
  }) {
    super(options.message);
    this.name = "ApiError";
    this.status = options.status;
    this.validationDetails = options.validationDetails ?? null;
    this.responseInfo = options.responseInfo;
    this.response = options.response;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

