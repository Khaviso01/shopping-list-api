import { badRequest } from './http';
import type { CreateItemInput, UpdateItemInput } from '../models/item';

/**
 * Validates a POST /items payload. Throws a 400 ApiError (via badRequest)
 * describing exactly what's wrong if validation fails; otherwise returns a
 * clean, correctly-typed CreateItemInput.
 */
export function validateCreateItem(body: unknown): CreateItemInput {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw badRequest('Request body must be a JSON object.');
  }

  const { name, quantity, purchased } = body as Record<string, unknown>;

  if (name === undefined || name === null) {
    throw badRequest('"name" is required.');
  }
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw badRequest('"name" must be a non-empty string.');
  }

  if (quantity === undefined || quantity === null) {
    throw badRequest('"quantity" is required.');
  }
  if (typeof quantity !== 'number' || !Number.isFinite(quantity) || quantity <= 0) {
    throw badRequest('"quantity" must be a positive number.');
  }

  if (purchased !== undefined && typeof purchased !== 'boolean') {
    throw badRequest('"purchased" must be a boolean.');
  }

  return {
    name,
    quantity,
    purchased: purchased as boolean | undefined,
  };
}

/**
 * Validates a PUT /items/:id payload. All fields are optional, but any
 * field that IS present must be the correct type, and at least one field
 * must be provided (an update with nothing to update is itself invalid).
 */
export function validateUpdateItem(body: unknown): UpdateItemInput {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw badRequest('Request body must be a JSON object.');
  }

  const { name, quantity, purchased } = body as Record<string, unknown>;

  if (name === undefined && quantity === undefined && purchased === undefined) {
    throw badRequest('At least one of "name", "quantity", or "purchased" must be provided.');
  }

  const updates: UpdateItemInput = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw badRequest('"name" must be a non-empty string.');
    }
    updates.name = name;
  }

  if (quantity !== undefined) {
    if (typeof quantity !== 'number' || !Number.isFinite(quantity) || quantity <= 0) {
      throw badRequest('"quantity" must be a positive number.');
    }
    updates.quantity = quantity;
  }

  if (purchased !== undefined) {
    if (typeof purchased !== 'boolean') {
      throw badRequest('"purchased" must be a boolean.');
    }
    updates.purchased = purchased;
  }

  return updates;
}
