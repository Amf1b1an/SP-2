import { setupHeader } from "../utils/header.js";
import { setupHamburgerMenu } from "../utils/header.js";
import { getItems } from "../api/items.js";

document.addEventListener("DOMContentLoaded", async () => {
  setupHeader();
  setupHamburgerMenu();
  await loadIndex();
});

async function loadIndex() {
  const { items } = await getItems({
    limit: 100,
    active: true,
  }); // Fetch more to get accurate sorting
  console.log("All listings from API:", items);

  if (!items.length) {
    document.getElementById("carousel-core").textContent = "No items yet.";
    return;
  }

  const sorted = items
    .slice()
    .sort((a, b) => new Date(b.created) - new Date(a.created)); // Sort newest first

  console.log("🕓 Sorted by created date (newest first):");
  sorted.forEach((item) => {
    console.log(item.created, "→", item.title);
  });

  const newestFive = sorted.slice(0, 5);
  buildCarousel(newestFive);
  buildHottest(sorted);
}

function buildCarousel(items) {
  const core = document.getElementById("carousel-core");
  core.innerHTML = "";

  items.forEach((it, idx) => {
    const mediaUrl =
      Array.isArray(it.media) && it.media.length
        ? it.media[0]?.url || it.media[0]
        : "https://via.placeholder.com/600x400?text=No+Image";

    const slideLink = document.createElement("a");
    slideLink.href = `./pages/item.html?id=${encodeURIComponent(it.id)}`;
    slideLink.className = "block w-full h-full";

    const bg = document.createElement("div");
    bg.className = "w-full h-full relative";
    bg.style.background = `url('${mediaUrl}') center/cover no-repeat`;

    const overlay = document.createElement("div");
    overlay.className = "absolute inset-0 bg-black/30 flex items-end p-4";

    const title = document.createElement("h3");
    title.className = "text-white text-xl sm:text-3xl font-bold";
    title.textContent = it.title || "untitled";

    overlay.appendChild(title);
    bg.appendChild(overlay);
    slideLink.appendChild(bg);

    const wrapper = document.createElement("div");
    wrapper.className = `absolute inset-0 transition-opacity duration-1000 ${idx === 0 ? "opacity-100 z-10" : "opacity-0 z-0"}`;
    wrapper.appendChild(slideLink);
    core.appendChild(wrapper);
  });

  // Carousel animation
  let current = 0;
  const slides = core.children;

  setInterval(() => {
    slides[current].classList.replace("opacity-100", "opacity-0");
    slides[current].classList.remove("z-10");
    slides[current].classList.add("z-0");

    current = (current + 1) % slides.length;

    slides[current].classList.replace("opacity-0", "opacity-100");
    slides[current].classList.remove("z-0");
    slides[current].classList.add("z-10");
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
  card.className = "bg-[#983422] shadow-md overflow-hidden rounded-md";

  const img = document.createElement("div");
  img.className = "w-full h-64 bg-cover bg-center";
  img.style.backgroundImage = `url('${hottest.media?.[0]?.url || "https://via.placeholder.com/600x400?text=No+Image"}')`;
  card.appendChild(img);

  const body = document.createElement("div");
  body.className = "p-4";

  const title = document.createElement("h2");
  title.className = "text-2xl font-semibold mb-2 text-white";
  title.textContent = hottest.title || "untitled";
  body.appendChild(title);

  const bids = document.createElement("p");
  bids.className = "text-white";
  bids.textContent = `${(hottest.bids || []).length} bids`;
  body.appendChild(bids);

  const desc = document.createElement("p");
  desc.className = "mt-2 text-gray-200";
  desc.textContent = (hottest.description || "").slice(0, 100) + "...";
  body.appendChild(desc);

  card.appendChild(body);
  link.appendChild(card);
  hottestSection.appendChild(link);
}
