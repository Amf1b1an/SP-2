import { setupHeader, setupHamburgerMenu } from "../utils/header.js";
import { getItem, placeBid } from "../api/items.js";
import { store } from "../state/store.js";

document.addEventListener("DOMContentLoaded", async () => {
  setupHeader();
  setupHamburgerMenu();
  await loadItemPage();
});

const params = new URLSearchParams(location.search);
const id = params.get("id");
const container = document.getElementById("itemDetails");

if (!id) {
  container.textContent = "Invalid item ID.";
}

async function loadItemPage() {
  try {
    const data = await getItem(id);
    console.log("✅ Loaded item from API:", data);

    const {
      title,
      description,
      media,
      tags = [],
      created,
      updated,
      endsAt,
      seller,
      bids = [],
    } = data;

    const latestBid = bids.length ? Math.max(...bids.map((b) => b.amount)) : 0;
    const endsIn = formatTimeUntil(endsAt);

    container.innerHTML = `
      <!-- IMAGE + ENDS AT + BIDS -->
      <div class="flex flex-row w-fit justify-center gap-5 p-4">
        
        
        <img src="${media?.[0]?.url || ""}" alt="Item image" class="w-full max-w-[200px] sm:max-w-[300px] h-auto object-contain rounded shadow" />
        <div class="flex flex-col justify-evenly">
          <div class=" top-2 left-2 bg-[#983422] text-white px-3 py-1 shadow text-sm font-bold">
            Ends in: ${endsIn}
          </div>
          <div class=" top-2 right-2 bg-[#983422] text-white px-3 py-1 shadow text-sm font-semibold">
            Bids: ${bids.length}
          </div>
        </div>
      </div>

      <!-- TITLE + CREATOR -->
      <div class="w-full text-center bg-[#983422] p-5 " >
        <h1 class="text-2xl sm:text-3xl font-bold  max-w-full text-white mb-1">${title}</h1>
        <p class="text-[#DAC396] text-md">Listed by: <span class="font-semibold">${seller?.name}</span></p>
      </div>

      <!-- DESCRIPTION + TAGS -->
      <div class="w-full text-center bg-[#983422] p-5">
        <p class="text-white  mt-2">${description || "No description provided."}</p>
        <div class="mt-2 flex flex-wrap gap-2 justify-center p-2">
          ${tags.map((tag) => `<span class="bg-[#DAC396] text-[#983422] px-2 py-1 text-sm rounded">#${tag}</span>`).join("")}
        </div>
      </div>

      <!-- CURRENT BID -->
      <div class="mt-4 text-lg font-semibold text-white w-full text-center bg-[#983422] p-5">
        Current highest bid: <span class="text-green-700">${latestBid} credits</span>
      </div>

      <!-- BID FORM -->
      <form id="bidForm" class="mt-4 flex gap-2 items-center">
        <input type="number" min="1" name="amount" required placeholder="Enter bid" class="border p-2 rounded-md w-32" />
        <button type="submit" class="bg-[#915018] text-white px-4 py-2 rounded-md hover:bg-[#6c3F18]">Place Bid</button>
        <span id="bidError" class="text-red-600 text-sm hidden ml-2"></span>
      </form>

      <!-- LAST UPDATED -->
      <div class="mt-6 text-sm text-gray-500">
        Last updated: ${new Date(updated).toLocaleString()}
      </div>
    `;

    setupBidForm(endsAt);
  } catch (err) {
    container.textContent = `Error loading item: ${err.message}`;
  }
}

function setupBidForm(endsAt) {
  const bidForm = document.getElementById("bidForm");
  const bidError = document.getElementById("bidError");

  if (new Date(endsAt) < new Date()) {
    bidForm.innerHTML = `<p class="text-red-600">This auction has ended.</p>`;
    return;
  }

  bidForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const amount = parseFloat(e.target.amount.value);
    bidError.classList.add("hidden");

    try {
      await placeBid(id, amount);
      alert("Bid placed successfully!");
      location.reload();
    } catch (err) {
      bidError.textContent = err.message || "Failed to place bid.";
      bidError.classList.remove("hidden");
    }
  });
}

function formatTimeUntil(dateStr) {
  const now = new Date();
  const target = new Date(dateStr);
  const diffMs = target - now;

  if (diffMs <= 0) return "Ended";

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}
