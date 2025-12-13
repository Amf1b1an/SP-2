import { setupHeader } from "../utils/header.js";
import { setupHamburgerMenu } from "../utils/header.js";
import { store } from "../state/store.js";
import {
  getProfile,
  getProfilePosts,
  updateProfileMedia,
} from "../api/profiles.js";
import { toUrl } from "../utils/media.js";
import { deleteItem } from "../api/items.js";

document.addEventListener("DOMContentLoaded", () => {
  setupHeader();
});

document.addEventListener("DOMContentLoaded", () => {
  setupHamburgerMenu();
});

if (!store.token()) location.href = "./login.html";

const box = document.getElementById("profileBox");
const postsEl = document.getElementById("userPosts");
const errEl = document.getElementById("profileError");

document.getElementById("backBtn")?.addEventListener("click", () => {
  location.href = "./feed.html";
});

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  store.clear();
  location.href = "./login.html";
});

const meName = store.profile()?.name || "";
const qs = new URLSearchParams(location.search);
const viewing = qs.get("name") || meName;

function showErr(msg) {
  if (errEl) {
    errEl.textContent = msg;
    errEl.classList.remove("hidden");
  } else {
    console.error(msg);
    alert(msg);
  }
}
function hideErr() {
  if (errEl) errEl.classList.add("hidden");
}

if (!viewing) {
  box.innerHTML = "";
  postsEl.innerHTML = "";
  showErr("No profile selected");
} else {
  load();
}

async function load() {
  hideErr();
  box.textContent = "Loading profile...";
  postsEl.textContent = "Loading posts...";

  try {
    const [profile, posts] = await Promise.all([
      getProfile(viewing, true),
      getProfilePosts(viewing, { page: 1, limit: 20 }),
    ]);
    renderProfile(profile);
    renderPosts(posts);
  } catch (e) {
    console.error(e);
    box.innerHTML = "";
    postsEl.innerHTML = "";
    showErr(e.message || "Failed to load profile");
    if (/unauthorized|invalid token/i.test(e.message || "")) {
      store.clear();
      location.href = "./login.html";
    }
  }
}

/**Profile Rendering
 * the structure of the profile view
 *  - banner image
 *  - profile picture and name
 *  - (OWN PROFILE) update profile form
 *
 *
 * @param {profile} p - profile data
 * @returns {void}
 */

function renderProfile(p) {
  box.innerHTML = "";

  //banner
  const bannerUrl = toUrl(p.banner) || "";
  const bannerWrapper = document.createElement("div");
  bannerWrapper.className =
    "relative h-56 w-full mb-4 rounded-md overflow-hidden shadow-md";
  bannerWrapper.style.background = `url('${bannerUrl}') center/cover no-repeat`;

  const overlay = document.createElement("div");
  overlay.className = "absolute inset-0 bg-black/40";
  bannerWrapper.appendChild(overlay);

  const profileRow = document.createElement("div");
  profileRow.className =
    "absolute bottom-4 left-4 flex items-center gap-4 text-white z-10";

  const avatarImg = document.createElement("img");
  const avatarUrl = toUrl(p.avatar);
  if (avatarUrl) avatarImg.src = avatarUrl;
  avatarImg.alt = p.name;
  avatarImg.className =
    "h-20 w-20 rounded-full object-cover border-4 border-white";
  profileRow.appendChild(avatarImg);

  const info = document.createElement("div");

  const h2 = document.createElement("h2");
  h2.className = "text-xl font-semibold";
  h2.textContent = p.name;
  info.appendChild(h2);

  const credits = document.createElement("p");
  credits.className = "text-sm text-gray-100";
  credits.textContent = `Credits: ${p.credits || 0}`;
  info.appendChild(credits);

  if (p.bio) {
    const bio = document.createElement("p");
    bio.className = "text-sm italic text-gray-300";
    bio.textContent = p.bio;
    info.appendChild(bio);
  }

  profileRow.appendChild(info);
  bannerWrapper.appendChild(profileRow);
  box.appendChild(bannerWrapper);

  //update form
  if (viewing === meName) {
    const hr = document.createElement("hr");
    hr.className = "my-4 border-gray-300";
    box.appendChild(hr);

    //edit btn
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit Profile";
    editBtn.className =
      "mb-2 px-4 py-2 bg-[#983422] text-white rounded hover:bg-[#b74d30]";
    box.appendChild(editBtn);

    const form = document.createElement("form");
    form.className = "space-y-4 p-4 bg-white rounded-md shadow-md hidden";

    const avatarInput = document.createElement("input");
    avatarInput.type = "url";
    avatarInput.placeholder = "New Avatar URL";
    avatarInput.className = "w-full border p-2 rounded";
    avatarInput.value = typeof p.avatar === "string" ? p.avatar : "";

    const bannerInput = document.createElement("input");
    bannerInput.type = "url";
    bannerInput.placeholder = "New Banner URL";
    bannerInput.className = "w-full border p-2 rounded";
    bannerInput.value = typeof p.banner === "string" ? p.banner : "";

    const bioInput = document.createElement("textarea");
    bioInput.placeholder = "Write a short bio...";
    bioInput.className = "w-full border p-2 rounded";
    bioInput.value = typeof p.bio === "string" ? p.bio : "";

    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.className =
      "bg-[#983422] text-white px-4 py-2 rounded hover:bg-[#b74d30]";
    submitBtn.textContent = "Update Profile";

    form.appendChild(avatarInput);
    form.appendChild(bannerInput);
    form.appendChild(bioInput);
    form.appendChild(submitBtn);

    editBtn.addEventListener("click", () => {
      form.classList.toggle("hidden");
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        name: meName,
        avatar: avatarInput.value.trim(),
        banner: bannerInput.value.trim(),
        bio: bioInput.value.trim(),
      };
      try {
        await updateProfileMedia(payload);
        await load();
      } catch (err) {
        console.error(err);
        showErr(err.message || "Failed to update profile");
      }
    });

    box.appendChild(form);
  }
}

function renderPosts(items) {
  postsEl.innerHTML = "";

  if (!items.length) {
    const p = document.createElement("p");
    p.textContent = "No posts yet.";
    postsEl.appendChild(p);
    return;
  }

  for (const post of items) {
    const card = document.createElement("div");
    card.className =
      "bg-[#983422] rounded shadow p-4 mb-4 max-w-36 sm:max-w-48 md:max-w-64 w-full max-h-full";

    const a = document.createElement("a");
    a.href = `./item.html?id=${encodeURIComponent(post.id)}`;
    a.className = "text-xl font-bold text-white  hover:underline";
    a.textContent = post.title;
    card.appendChild(a);

    let mediaUrl = "";
    if (Array.isArray(post.media) && post.media.length) {
      mediaUrl = toUrl(post.media[0]);
    } else {
      mediaUrl = toUrl(post.media);
    }

    if (mediaUrl) {
      const img = document.createElement("img");
      img.src = mediaUrl;
      img.alt = "";
      img.className = "max-w-full max-h-58 mt-2 rounded";
      card.appendChild(img);
    }

    if (post.description) {
      const desc = document.createElement("p");
      desc.className =
        "mt-2 w-full text-white border border-[#983422] shadow rounded";
      desc.textContent = post.description;
      card.appendChild(desc);
    }

    const meta = document.createElement("p");
    meta.className = "text-sm text-white mt-1 ";
    meta.textContent = `Bids: ${post.bids?.length || 0} | Ends: ${new Date(post.endsAt).toLocaleString()}`;
    card.appendChild(meta);

    // Only show Edit/Delete if this is the user's own profile
    if (viewing === meName) {
      const btnRow = document.createElement("div");
      btnRow.className = "mt-3 flex gap-2";

      const editBtn = document.createElement("a");
      editBtn.href = `./edit.html?id=${post.id}`;
      editBtn.textContent = "Edit";
      editBtn.className =
        "px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600";

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.className =
        "px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700";

      delBtn.addEventListener("click", async () => {
        if (confirm("Are you sure you want to delete this listing?")) {
          try {
            await deleteItem(post.id);
            await load();
          } catch (err) {
            showErr(err.message || "Failed to delete listing");
          }
        }
      });

      btnRow.appendChild(editBtn);
      btnRow.appendChild(delBtn);
      card.appendChild(btnRow);
    }

    postsEl.appendChild(card);
  }
}
