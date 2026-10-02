export class PaymentError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function errorResponse(error: unknown) {
  return Response.json(
    {
      error:
        error instanceof PaymentError
          ? error.message
          : "Payment service unavailable. Please contact Registry before retrying.",
    },
    {
      status: error instanceof PaymentError ? error.status : 502,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
