import { IncomingMessage, ServerResponse } from 'http';
import { itemStore } from '../models/item.js';
import { parseJsonBody, sendSuccess, sendNoContent, notFound } from '../utils/http.js';
import { validateCreateItem, validateUpdateItem } from '../utils/validation.js';

// GET /items  returns every item on the list. 
export function getAllItems(_req: IncomingMessage, res: ServerResponse): void {
  const items = itemStore.getAll();
  sendSuccess(res, 200, items);
}

// GET /items/:id  returns a single item, or throws 404 if it doesn't exist. 
export function getItemById(_req: IncomingMessage, res: ServerResponse, id: string): void {
  const item = itemStore.getById(id);
  if (!item) {
    throw notFound(`No item found with id "${id}".`);
  }
  sendSuccess(res, 200, item);
}

// POST /items  validates the payload and creates a new item.
export async function createItem(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const body = await parseJsonBody(req);
  const input = validateCreateItem(body);
  const created = itemStore.create(input);
  sendSuccess(res, 201, created);
}

// PUT /items/:id  validates the payload and updates an existing item.
export async function updateItem(req: IncomingMessage, res: ServerResponse, id: string): Promise<void> {
  const body = await parseJsonBody(req);
  const updates = validateUpdateItem(body);

  const updated = itemStore.update(id, updates);
  if (!updated) {
    throw notFound(`No item found with id "${id}".`);
  }

  sendSuccess(res, 200, updated);
}

//DELETE /items/:id  removes an item. 204 on success, 404 if it doesn't exist.
export function deleteItem(_req: IncomingMessage, res: ServerResponse, id: string): void {
  const deleted = itemStore.delete(id);
  if (!deleted) {
    throw notFound(`No item found with id "${id}".`);
  }
  sendNoContent(res);
}
