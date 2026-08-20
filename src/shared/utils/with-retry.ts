import type { RetryOptions } from '@/shared/utils/with-retry.type.ts';
import { ApiError } from '@/shared/errors/api-errors.ts';

/** Функция запроса данных от сервера с повторами при ошибках */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const { maxAttempts = 3, baseDelayMs = 200 } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (attempt === maxAttempts || !isRetryable(e)) {
        throw e;
      }

      const delay = baseDelayMs * 2 ** (attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

function isRetryable(error: unknown): boolean {
  if (error instanceof ApiError) {
    // Отправляем на повтор только 500-е ошибки
    return error.status >= 500;
  }

  // Пробуем повторить при неизвестной ошибке
  return true;
}
