import { setupHeader } from "../utils/header.js";
import { setupHamburgerMenu } from "../utils/header.js";
import { apiFetch } from "../api/http.js";
import { store } from "../state/store.js";

document.addEventListener("DOMContentLoaded", async () => {
  setupHeader();
  setupHamburgerMenu();
});

const params = new URLSearchParams(location.search);
const id = params.get("id");
const container = document.getElementById("itemDetails");

if (!id) {
  container.textContent = "Invalid item ID.";
}

main();

async function main() {
  try {
    const data = await apiFetch(`/auction/listings/${id}?_bids=true`);

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
      <div class="relative w-full h-64 bg-cover bg-center rounded-xl" style="background-image: url('${media?.[0]?.url || media?.[0] || ""}')">
        <div class="absolute top-2 left-2 bg-white text-black px-3 py-1 rounded-md shadow text-sm font-bold">
          Ends in: ${endsIn}
        </div>
        <div class="absolute top-2 right-2 bg-white text-black px-3 py-1 rounded-md shadow text-sm font-semibold">
          Bids: ${bids.length}
        </div>
      </div>

      <!-- TITLE + CREATOR -->
      <div>
        <h1 class="text-3xl font-bold text-[#915018] mb-1">${title}</h1>
        <p class="text-gray-700 text-md">Listed by: <span class="font-semibold">${seller?.name}</span></p>
      </div>

      <!-- DESCRIPTION + TAGS -->
      <div>
        <p class="text-gray-800 mt-2">${description || "No description provided."}</p>
        <div class="mt-2 flex flex-wrap gap-2">
          ${tags.map((tag) => `<span class="bg-[#983422] text-white px-2 py-1 text-sm rounded">${tag}</span>`).join("")}
        </div>
      </div>

      <!-- CURRENT BID -->
      <div class="mt-4 text-lg font-semibold">
        Current highest bid: <span class="text-green-700">${latestBid} credits</span>
      </div>

      <!-- BID FORM -->
      <form id="bidForm" class="mt-4 flex gap-2 items-center">
        <input type="number" min="1" name="amount" required placeholder="Enter bid" class="border p-2 rounded-md w-32" />
        <button type="submit" class="bg-[#915018] text-white px-4 py-2 rounded-md hover:bg-[#6c3F18]">Place Bid</button>
      </form>

      <!-- LAST UPDATED -->
      <div class="mt-6 text-sm text-gray-500">
        Last updated: ${new Date(updated).toLocaleString()}
      </div>
    `;

    // Add bid form logic
    const bidForm = document.getElementById("bidForm");
    const bidError = document.getElementById("bidError");

    if (new Date(endsAt) < new Date()) {
      bidForm.innerHTML = `<p class="text-red-600">This auction has ended.</p>`;
    } else {
      bidForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const amount = parseFloat(e.target.amount.value);
        bidError.classList.add("hidden");

        try {
          await apiFetch(`/auction/listings/${id}/bids`, {
            method: "POST",
            body: JSON.stringify({ amount }),
          });
          alert("Bid placed!");
          location.reload();
        } catch (err) {
          bidError.textContent = err.message || "Failed to place bid.";
          bidError.classList.remove("hidden");
        }
      });
    }
  } catch (err) {
    container.textContent = `Error loading item: ${err.message}`;
  }
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
