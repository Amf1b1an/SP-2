import { setupHeader } from "../utils/header.js";
import { setupHamburgerMenu } from "../utils/header.js";

import { apiFetch } from "../api/http.js";

document.addEventListener("DOMContentLoaded", async () => {
  setupHeader();
  setupHamburgerMenu();
  await loadIndex();
});

async function loadIndex() {
  const res = await apiFetch("/auction/listings"); // check
  const items = res.data || [];

  if (items.length === 0) {
    document.getElementById("carousel-core").textContent = "No items yet.";
    return;
  }

  const sorted = items.sort(
    (a, b) => new Date(b.created) - new Date(a.created)
  );

  buildCarousel(items.slice(0, 5)); //should be the 5 newest
  buildHottest(items);
}

function buildCarousel(items) {
  const core = document.getElementById("carousel-core");
  core.innerHTML = "";

  items.forEach((it, idx) => {
    const mediaUrl = it.media?.[0]?.url || it.media?.[0] || "";

    const slideLink = document.createElement("a");
    slideLink.href = `./pages/item.html?id=${encodeURIComponent(it.id)}`;
    slideLink.className = `absolute inset-0 block transition-opacity duration-1000 
      ${idx === 0 ? "opacity-100" : "opacity-0"}`;

    // Background container
    const bg = document.createElement("div");
    bg.className = "w-full h-full relative";
    bg.style.background = `url('${mediaUrl}') center/cover no-repeat`;

    // Overlay
    const overlay = document.createElement("div");
    overlay.className = "absolute inset-0 bg-black/30 flex items-end p-4 ";

    const title = document.createElement("h3");
    title.className = "text-white text-xl sm:text-3xl font-bold";
    title.textContent = it.title || "untitled";

    overlay.appendChild(title);
    bg.appendChild(overlay);
    slideLink.appendChild(bg);

    core.appendChild(slideLink);
  });

  // Carousel animation
  let current = 0;
  setInterval(() => {
    const slides = core.children;
    slides[current].classList.replace("opacity-100", "opacity-0");
    current = (current + 1) % slides.length;
    slides[current].classList.replace("opacity-0", "opacity-100");
  }, 10000);
}

function buildHottest(items) {
  const hottestSection = document.getElementById("hottest");
  hottestSection.innerHTML = "";

  const hottest = items.reduce((prev, curr) => {
    const prevCount = (prev.bids || []).length;
    const currCount = (curr.bids || []).length;
    return currCount > prevCount ? curr : prev;
  }, items[0]);

  if (!hottest) {
    hottestSection.textContent = "No items available.";
    return;
  }

  const link = document.createElement("a");
  link.href = `./pages/item.html?id=${encodeURIComponent(hottest.id)}`;
  link.className = "block hover:shadow-xl transition-shadow duration-300";

  const card = document.createElement("div");
  card.className = "bg-white rounded-xl shadow-md overflow-hidden";

  const img = document.createElement("div");
  img.className = "w-full h-64 bg-cover bg-center";
  img.style.backgroundImage = `url('${hottest.media?.[0]?.url || ""}')`;
  card.appendChild(img);

  const body = document.createElement("div");
  body.className = "p-4 ";

  const title = document.createElement("h2");
  title.className = "text-2xl font-semibold mb-2";
  title.textContent = hottest.title || "untitled";
  body.appendChild(title);

  const bids = document.createElement("p");
  bids.className = "text.gray-600";
  bids.textContent = `${(hottest.bids || []).length} bids`;
  body.appendChild(bids);

  const desc = document.createElement("p");
  desc.className = "mt-2 text-gray-800";
  desc.textContent = hottest.body?.slice(0, 100) + "...";
  body.appendChild(desc);

  card.appendChild(body);
  link.appendChild(card);
  hottestSection.appendChild(link);
}
