// src/api/items.js
import { apiFetch } from "../api/http.js";

/**
 * Get a single auction listing by ID.
 * @param {string} id
 * @returns {Promise<any>}
 */
export async function getItem(id) {
  const res = await apiFetch(
    `/auction/listings/${encodeURIComponent(id)}?_seller=true&_bids=true`
  );
  return res?.data;
}

/**
 * Get all listings with optional filters.
 * @param {{ page?: number, limit?: number, q?: string, active?: boolean, tag?: string }} options
 * @returns {Promise<{ items: any[], meta: any }>}
 */
export async function getItems({
  page = 1,
  limit = 20,
  q = "",
  active = false,
  tag = "",
} = {}) {
  const usp = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (active) usp.set("_active", "true");
  if (tag) usp.set("_tag", tag);
  usp.set("_seller", "true");
  usp.set("_bids", "true");

  const res = await apiFetch(`/auction/listings?${usp.toString()}`);
  const items = res?.data ?? [];
  const meta = res?.meta ?? {};

  if (q && !q.trim().startsWith("#")) {
    const needle = q.toLowerCase();
    items = items.filter(
      (p) =>
        (p.title || "").toLowerCase().includes(needle) ||
        (p.description || "").toLowerCase().includes(needle)
    );
  }

  return { items, meta };
}

/**
 * Create a new listing
 * @param {{ title: string, description?: string, tags?: string[], media?: { url: string, alt?: string }[], endsAt: string }} payload
 * @returns {Promise<any>}
 */
export async function createItem(payload) {
  return await apiFetch("/auction/listings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Update a listing
 * @param {string} id
 * @param {{ title?: string, description?: string, tags?: string[], media?: { url: string, alt?: string }[], endsAt?: string }} updates
 * @returns {Promise<any>}
 */
export async function updateItem(id, updates) {
  return await apiFetch(`/auction/listings/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * Delete a listing
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteItem(id) {
  await apiFetch(`/auction/listings/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/**
 * Place a bid on a listing
 * @param {string} id
 * @param {number} amount
 * @returns {Promise<any>}
 */
export async function placeBid(id, amount) {
  return await apiFetch(`/auction/listings/${encodeURIComponent(id)}/bids`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}
