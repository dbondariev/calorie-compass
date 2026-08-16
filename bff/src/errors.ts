export class UpstreamError extends Error {
  readonly code: "upstream_unavailable" | "upstream_contract_error";

  constructor(
    message: string,
    code: "upstream_unavailable" | "upstream_contract_error",
  ) {
    super(message);
    this.code = code;
  }
}

export function isMalformedJson(error: unknown): boolean {
  return error instanceof SyntaxError
    && typeof error === "object"
    && error !== null
    && "status" in error
    && error.status === 400;
}
