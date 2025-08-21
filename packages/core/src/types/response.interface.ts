import type { Prettify } from "./utils.interface";

export type VoltProcessorResponse<TSuccess = unknown, TError = unknown> = {
  data: TSuccess;
  error: TError | null;
};

export type VoltErrorResponse<TCode extends string, TData = unknown> = {
  code: TCode;
  message?: string;
  data?: TData;
};

export type VoltCommonErrorCode =
  | "ERR_UNKNOWN_ERROR"
  | "ERR_BAD_REQUEST"
  | "ERR_UNAUTHORIZED"
  | "ERR_FORBIDDEN"
  | "ERR_NOT_FOUND"
  | "ERR_REDIRECT";

export type VoltResponseSuccess<TData = unknown> = {
  data: TData;
};

export type VoltResponseBadRequest<TBadRequestData = unknown> =
  VoltResponseError<"ERR_BAD_REQUEST", TBadRequestData>;

export type VoltResponseRedirect = VoltResponseError<
  "ERR_REDIRECT",
  {
    destination: string;
    type: "replace" | "push";
  }
>;

export type VoltResponseNotFound<TNotFoundData = unknown> =
  VoltResponseError<"ERR_NOT_FOUND", TNotFoundData>;

export type VoltResponseUnauthorized<TUnauthorizedData = unknown> =
  VoltResponseError<"ERR_UNAUTHORIZED", TUnauthorizedData>;

export type VoltResponseForbidden<TForbiddenData = unknown> =
  VoltResponseError<"ERR_FORBIDDEN", TForbiddenData>;

export type VoltResponse<TData = unknown, TError = unknown> =
  | { type: "success"; data: TData; error: null }
  | {
    type: "error"; data: null; error: TError extends VoltResponseError<infer TErrorCode, infer TErrorData> ? {
      code: TErrorCode;
      message?: string;
      data?: TErrorData;
    } : never
  };

export class VoltResponseError<
  TCode extends VoltCommonErrorCode = "ERR_UNKNOWN_ERROR",
  TData = unknown,
> {
  constructor(public error: {
    code: TCode;
    message?: string;
    data?: TData;
  }) { }

  toJSON() {
    return this.error;
  }
}