import { setupHeader, setupHamburgerMenu } from "../utils/header.js";
import { getItems } from "../api/items.js";

document.addEventListener("DOMContentLoaded", () => {
  setupHeader();
  setupHamburgerMenu();
  initFeed();
});

let currentPage = 1;
let currentQuery = "";

const container = document.getElementById("feedContainer");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const pagination = document.getElementById("paginationControls");

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  currentQuery = searchInput.value.trim();
  currentPage = 1;
  loadFeed();
});

pagination.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-page]");
  if (!btn) return;

  const page = parseInt(btn.dataset.page, 10);
  if (!isNaN(page)) {
    currentPage = page;
    loadFeed();
  }
});

async function initFeed() {
  await loadFeed();
}

async function loadFeed() {
  container.innerHTML = `<p class="text-gray-500">Loading...</p>`;

  try {
    const { items, meta } = await getItems({
      page: currentPage,
      limit: 10,
      q: currentQuery,
      active: true,
    });

    if (!items.length) {
      container.innerHTML = `<p class="text-gray-500">No listings found for '${currentQuery || "all"}'.</p>`;
      pagination.innerHTML = "";
      return;
    }

    // Sort newest to oldest by creation date
    items.sort((a, b) => new Date(b.created) - new Date(a.created));

    container.innerHTML = items.map(renderItemCard).join("");
    buildPagination(meta.page, meta.pageCount);
  } catch (err) {
    container.innerHTML = `<p class="text-red-600">Failed to load listings: ${err.message}</p>`;
  }
}

function renderItemCard(item) {
  const highestBid = item.bids?.length
    ? Math.max(...item.bids.map((b) => b.amount))
    : 0;

  const imageUrl = item.media?.[0]?.url || "";

  return `
    <a href="./item.html?id=${item.id}" class="block bg-[#983422] border border-[#915018] overflow-hidden shadow hover:shadow-lg transition rounded-lg mb-4">
      <div class="w-full h-48 bg-cover bg-center" style="background-image: url('${imageUrl}')"></div>
      <div class="p-4 flex flex-col gap-1">
        <h2 class="text-xl font-bold text-[#DAC396] truncate">${item.title}</h2>
        <p class="text-sm text-gray-300">By: ${item.seller?.name || "Unknown"}</p>
        <p class="text-sm text-gray-400">Bids: ${item.bids?.length || 0}</p>
        <p class="text-sm text-white font-semibold">Current Bid: ${highestBid} credits</p>
        <p class="text-xs text-gray-400">Ends: ${new Date(item.endsAt).toLocaleString()}</p>
      </div>
    </a>
  `;
}

function buildPagination(current, total) {
  pagination.innerHTML = "";

  const prev = createPageButton("← Prev", current > 1 ? current - 1 : null);
  const next = createPageButton("Next →", current < total ? current + 1 : null);

  const pageLabel = document.createElement("span");
  pageLabel.textContent = `Page ${current} of ${total}`;
  pageLabel.className = "text-white px-2";

  pagination.append(prev, pageLabel, next);
}

function createPageButton(label, page) {
  const btn = document.createElement("button");
  btn.textContent = label;
  btn.className = "px-3 py-1 mx-1 border rounded disabled:opacity-50";

  if (page) {
    btn.dataset.page = String(page);
  } else {
    btn.disabled = true;
  }

  return btn;
}
