import z from "zod";

export class AppError extends Error {
  public statusCode: number;
  public details?: string;
  constructor(message: string, statusCode: number, details?: string) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
export const isZodError = (error: unknown): error is z.ZodError => {
  return error instanceof z.ZodError;
};
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};
export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};
