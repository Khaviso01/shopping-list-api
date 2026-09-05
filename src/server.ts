import http, { IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';
import { ApiError, sendError } from './utils/http';
import { getAllItems, getItemById, createItem, updateItem, deleteItem } from './controllers/itemsController';

const PORT = Number(process.env.PORT) || 3000;

/**
 * Very small manual router: matches method + path against a fixed set of
 * routes. `/items/:id` is represented as a single dynamic segment, and the
 * matched id is passed through to the handler.
 */
async function route(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const method = req.method ?? 'GET';
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  // Split the path into segments, dropping empty strings from leading/trailing slashes.
  const segments = url.pathname.split('/').filter(Boolean);

  // Only /items and /items/:id are recognized routes.
  if (segments[0] !== 'items') {
    throw new ApiError(404, 'NOT_FOUND', `Cannot ${method} ${url.pathname}.`);
  }

  // /items
  if (segments.length === 1) {
    if (method === 'GET') return getAllItems(req, res);
    if (method === 'POST') return createItem(req, res);
    throw new ApiError(405, 'BAD_REQUEST', `Method ${method} not allowed on /items.`);
  }

  // /items/:id
  if (segments.length === 2) {
    const id = decodeURIComponent(segments[1]);
    if (method === 'GET') return getItemById(req, res, id);
    if (method === 'PUT') return updateItem(req, res, id);
    if (method === 'DELETE') return deleteItem(req, res, id);
    throw new ApiError(405, 'BAD_REQUEST', `Method ${method} not allowed on /items/:id.`);
  }

  // Anything deeper than /items/:id isn't a route we know about.
  throw new ApiError(404, 'NOT_FOUND', `Cannot ${method} ${url.pathname}.`);
}

const server = http.createServer(async (req, res) => {
  try {
    await route(req, res);
  } catch (err) {
    // Central error handler: every controller/validation function reports
    // failure by throwing an ApiError (or anything else, for genuinely
    // unexpected errors), and it all lands here as one consistent JSON
    // response — no route has to format its own error output.
    if (err instanceof ApiError) {
      sendError(res, err.status, err.code, err.message);
    } else {
      console.error('Unexpected error:', err);
      sendError(res, 500, 'INTERNAL_ERROR', 'Something went wrong on the server.');
    }
  }
});

server.listen(PORT, () => {
  console.log(`Shopping List API listening on http://localhost:${PORT}`);
});
