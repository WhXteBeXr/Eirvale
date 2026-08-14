import type { IApiError } from '@/shared/errors/api-errors.types.ts';

/** Кастомная ошибка работы api */
export class ApiError extends Error implements IApiError {
  readonly status: number;

  constructor(
    status: number,
    message: string,
    name: string = 'Api error',
    cause?: string,
  ) {
    super(message);
    this.name = name;
    this.cause = cause;
    this.status = status;
  }
}
