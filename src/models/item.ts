import { randomUUID } from 'crypto';

// A single shopping list item
export interface Item {
  id: string;
  name: string;
  quantity: number;
  purchased: boolean;
  createdAt: string;
  updatedAt: string;
}

// Shape of the payload accepted when creating a new item
export interface CreateItemInput {
  name: string;
  quantity: number;
  purchased?: boolean;
}

// Shape of the payload accepted when updating an existing item, every field optional
export interface UpdateItemInput {
  name?: string;
  quantity?: number;
  purchased?: boolean;
}

// In-memory data store for shopping list items
class ItemStore {
  private items: Item[] = [];

  getAll(): Item[] {
    return this.items;
  }

  getById(id: string): Item | undefined {
    return this.items.find((item) => item.id === id);
  }

  // Creates a new item, adds it to the store, and returns it
  create(input: CreateItemInput): Item {
    const now = new Date().toISOString();
    const newItem: Item = {
      id: randomUUID(),
      name: input.name.trim(),
      quantity: input.quantity,
      purchased: input.purchased ?? false,
      createdAt: now,
      updatedAt: now,
    };
    this.items.push(newItem);
    return newItem;
  }

  // Updates an existing item, returns the updated item
  update(id: string, updates: UpdateItemInput): Item | undefined {
    const item = this.getById(id);
    if (!item) return undefined;

    if (updates.name !== undefined) item.name = updates.name.trim();
    if (updates.quantity !== undefined) item.quantity = updates.quantity;
    if (updates.purchased !== undefined) item.purchased = updates.purchased;
    item.updatedAt = new Date().toISOString();

    return item;
  }

  delete(id: string): boolean {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }
}

// in-memory list for the lifetime of the process.
export const itemStore = new ItemStore();
