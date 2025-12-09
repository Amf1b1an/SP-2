import { setupHeader } from "../utils/header.js";
import { setupHamburgerMenu } from "../utils/header.js";
import { store } from "../state/store.js";
import {
  getProfile,
  getProfilePosts,
  toggleFollow,
  updateProfileMedia,
} from "../api/profiles.js";
import { toUrl } from "../utils/media.js";

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
function fmt(n) {
  return typeof n === "number" ? n : 0;
}
function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso || "";
  }
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
 *  - three counters for followers following, and post counts
 *  - (OWN PROFILE) update profile form
 *  - (OTHER PROFILES) Follow and unfollow buttons
 *
 *
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

  const counts = document.createElement("p");
  counts.className = "text-sm text-gray-200";
  const fwers = p._count?.followers ?? p.followers?.length ?? 0;
  const fwing = p._count?.following ?? p.following?.length ?? 0;
  const postCount =
    p._count?.posts ?? (Array.isArray(p.posts) ? p.posts.length : 0);
  counts.textContent = `${fmt(fwers)} followers • ${fmt(fwing)} following • ${fmt(postCount)} posts`;
  info.appendChild(counts);

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

  //follow/Unfollow button
  if (viewing && meName && viewing !== meName) {
    const youFollow = !!(p.followers || []).find((f) => f.name === meName);
    const btn = document.createElement("button");
    btn.className =
      "mt-2 ml-4 px-4 py-2 rounded-md bg-[#983422] text-white hover:bg-[#b74d30]";
    btn.textContent = youFollow ? "Unfollow" : "Follow";
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      try {
        await toggleFollow(p.name, youFollow ? "unfollow" : "follow");
        await load();
      } catch (e) {
        console.error(e);
        showErr(e.message || "Failed to update follow");
        btn.disabled = false;
      }
    });
    box.appendChild(btn);
  }

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
    card.className = "post";

    const a = document.createElement("a");
    a.href = `./post.html?id=${encodeURIComponent(post.id)}`;
    const h3 = document.createElement("h3");
    h3.textContent = post.title;
    a.appendChild(h3);
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
      img.style = "max-width:100%;border-radius:12px;margin:6px 0";
      card.appendChild(img);
    }

    if (post.body) {
      const body = document.createElement("p");
      body.textContent = post.body;
      card.appendChild(body);
    }

    postsEl.appendChild(card);
  }
}
