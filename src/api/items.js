import { apiFetch } from "../api/http.js";
import { store } from "../state/store.js";

/**
 * Fetch a single auction listing by ID, including seller and bids.
 */
export async function getItem(id) {
  console.log("[getItem] Fetching item:", id);

  const res = await apiFetch(
    `/auction/listings/${encodeURIComponent(id)}?_seller=true&_bids=true`
  );

  console.log("[getItem] Response data:", res?.data);
  return res?.data;
}

/**
 * Fetch all auction listings with optional filters.
 */
export async function getItems({
  page = 1,
  limit = 10,
  q = "",
  active = false,
  tag = "",
} = {}) {
  const usp = new URLSearchParams({
    page,
    limit,
    _seller: "true",
    _bids: "true",
    _sort: "created",
    _order: "desc",
  });

  if (active) usp.set("_active", "true");
  if (tag) usp.set("_tag", tag);

  const url = `/auction/listings?${usp.toString()}`;
  console.log("[getItems] Request URL:", url);

  const res = await apiFetch(url);

  console.log("[getItems] Raw API response:", res);

  let items = res?.data ?? [];
  console.log("[getItems] Items before filtering:", items.length);

  const meta = {
    page: res?.meta?.page ?? page,
    pageCount: res?.meta?.pageCount ?? 1,
    totalCount: res?.meta?.totalCount ?? items.length,
  };

  // Local search filtering
  if (q && !q.trim().startsWith("#")) {
    const needle = q.toLowerCase();
    console.log("[getItems] Applying local search filter:", needle);

    items = items.filter(
      (item) =>
        (item.title || "").toLowerCase().includes(needle) ||
        (item.description || "").toLowerCase().includes(needle)
    );

    console.log("[getItems] Items after filtering:", items.length);
  }

  return { items, meta };
}

/**
 * Create a new auction listing.
 */
export async function createItem(payload) {
  console.log("[createItem] Payload:", payload);

  return await apiFetch("/auction/listings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Update an existing auction listing.
 */
export async function updateItem(id, updates) {
  console.log("[updateItem] Updating:", id, updates);

  return await apiFetch(`/auction/listings/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * Delete an auction listing.
 */
export async function deleteItem(id) {
  console.log("[deleteItem] Deleting:", id);

  await apiFetch(`/auction/listings/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/**
 * Place a bid on a listing.
 */
export async function placeBid(id, amount) {
  console.log("[placeBid] Listing:", id, "Amount:", amount);

  return await apiFetch(`/auction/listings/${encodeURIComponent(id)}/bids`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}
