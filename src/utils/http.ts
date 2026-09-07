import { IncomingMessage, ServerResponse } from 'http';

// Every successful response follows this exact shape.
export interface SuccessResponse<T> {
  success: true;
  data: T;
}

// Every error response follows this exact shape.
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    // Machine-readable error code, useful for client-side branching.
    code: 'BAD_REQUEST' | 'NOT_FOUND' | 'INTERNAL_ERROR';
  };
}

// subclass of Error so that it can be `instanceof`-checked in the central error handler in server.ts
export class ApiError extends Error {
  status: number;
  code: ErrorResponse['error']['code'];

  constructor(status: number, code: ErrorResponse['error']['code'], message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const badRequest = (message: string) => new ApiError(400, 'BAD_REQUEST', message);
export const notFound = (message: string) => new ApiError(404, 'NOT_FOUND', message);

// Sends a 2xx JSON response with the standard success: true, data shape.
export function sendSuccess<T>(res: ServerResponse, status: number, data: T): void {
  const body: SuccessResponse<T> = { success: true, data };
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

// Sends a JSON error response with the standard success: false, error shape. 
export function sendError(res: ServerResponse, status: number, code: ErrorResponse['error']['code'], message: string): void {
  const body: ErrorResponse = { success: false, error: { message, code } };
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

// Sends an empty response (used for 204 No Content on successful deletes).
export function sendNoContent(res: ServerResponse): void {
  res.writeHead(204);
  res.end();
}

// Parsing the request body as JSON
export function parseJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    req.on('data', (chunk) => chunks.push(chunk));

    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf-8').trim();

      // If the request body is empty, resolve with an empty object
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(badRequest('Request body must be valid JSON.'));
      }
    });

    req.on('error', (err) => reject(err));
  });
}
