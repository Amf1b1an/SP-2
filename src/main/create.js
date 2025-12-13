import { setupHeader, setupHamburgerMenu } from "../utils/header.js";
import { store } from "../state/store.js"; // Ensure token is available

document.addEventListener("DOMContentLoaded", () => {
  setupHeader();
  setupHamburgerMenu();

  const form = document.getElementById("createForm");
  const errorEl = document.getElementById("createError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.classList.add("hidden");

    const fd = new FormData(form);
    const title = fd.get("title").trim();
    const description = fd.get("description").trim();
    const mediaUrl = fd.get("media").trim();
    const endsAt = fd.get("endsAt");
    const tags = fd
      .get("tags")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (!mediaUrl) {
      return showError("An image URL is required.");
    }

    if (new Date(endsAt) < new Date()) {
      return showError("End time must be in the future.");
    }

    const payload = {
      title,
      description,
      endsAt: new Date(endsAt).toISOString(),
      media: [{ url: mediaUrl }],
    };

    if (tags.length) {
      payload.tags = tags;
    }

    try {
      const res = await fetch("https://v2.api.noroff.dev/auction/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token()}`,
          "X-Noroff-API-Key": store.apiKey(),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const { errors, message } = await res.json();
        throw new Error(message || (errors?.[0]?.message ?? "Unknown error"));
      }

      const data = await res.json();
      alert("Listing created!");
      location.href = `/pages/profile.html`; // Go to profile
    } catch (err) {
      showError(err.message || "Failed to create listing.");
    }
  });

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.remove("hidden");
  }
});
