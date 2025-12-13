import { setupHeader, setupHamburgerMenu } from "../utils/header.js";
import { getItem, updateItem } from "../api/items.js";
import { store } from "../state/store.js";

document.addEventListener("DOMContentLoaded", () => {
  setupHeader();
  setupHamburgerMenu();

  const form = document.getElementById("editForm");
  const formError = document.getElementById("formError");
  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  async function loadForm() {
    if (!id) {
      form.innerHTML = "<p class='text-red-600'>Invalid listing ID.</p>";
      return;
    }

    try {
      const item = await getItem(id);
      const currentUser = store.profile()?.name;

      if (item.seller?.name !== currentUser) {
        form.innerHTML =
          "<p class='text-red-600'>Unauthorized: You can only edit your own listings.</p>";
        return;
      }

      document.getElementById("title").value = item.title || "";
      document.getElementById("description").value = item.description || "";
      document.getElementById("media").value = item.media?.[0]?.url || "";
      document.getElementById("tags").value = (item.tags || []).join(", ");
      document.getElementById("endsAt").value = new Date(item.endsAt)
        .toISOString()
        .slice(0, 16);
    } catch (err) {
      form.innerHTML = `<p class='text-red-600'>Failed to load item: ${err.message}</p>`;
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    formError.classList.add("hidden");

    const title = form.title.value.trim();
    const description = form.description.value.trim();
    const mediaUrl = form.media.value.trim();
    const tags = form.tags.value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const endsAt = new Date(form.endsAt.value).toISOString();

    try {
      const updated = await updateItem(id, {
        title,
        description,
        tags,
        media: [{ url: mediaUrl }],
        endsAt,
      });

      alert("Listing updated!");
      location.href = `/pages/profile.html`;
    } catch (err) {
      formError.textContent = err.message || "Failed to update listing.";
      formError.classList.remove("hidden");
    }
  });

  loadForm();
});
