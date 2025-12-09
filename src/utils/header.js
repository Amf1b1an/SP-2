import { store } from "../state/store.js";
import { getProfile } from "../api/profiles.js";

/**
 * HEADER SETUP
 * - Builds nav links based on login state
 * - Updates profile icon link
 * - Displays credits under the icon (if logged in)
 */
export async function setupHeader() {
  const navEl = document.getElementById("mobile-menu");
  const profileLink = document.getElementById("profile-link");
  const creditEl = document.getElementById("header-credits"); // new credit element
  const isLoggedIn = !!store.token();

  // Build menu links
  navEl.innerHTML = isLoggedIn
    ? `
      <a href="../index.html">Home</a>
      <a href="pages/profile.html">My Profile</a>
      <a href="pages/feed.html">Catalogue</a>
      <a href="pages/create.html">New Auction</a>
      <a href="#" id="logout">Log Out</a>
    `
    : `
      <a href="../pages/login.html">Login</a>
      <a href="../pages/register.html">Register</a>
    `;

  // LOGOUT BUTTON
  if (isLoggedIn) {
    document.getElementById("logout")?.addEventListener("click", () => {
      store.clear();
      location.href = "/index.html";
    });
  }

  // PROFILE LINK + CREDITS
  if (!profileLink) return;

  if (isLoggedIn) {
    const user = store.profile();

    // Profile link
    profileLink.href = `/pages/profile.html?name=${encodeURIComponent(
      user.name
    )}`;

    // Fetch fresh profile data including credits
    try {
      const resp = await getProfile(user.name, false);
      const credits = resp?.credits ?? 0;

      if (creditEl) {
        creditEl.textContent = `${credits} credits`;
        creditEl.classList.remove("hidden");
      }
    } catch (err) {
      console.error("Failed to load credits:", err);
    }
  } else {
    profileLink.href = "/pages/login.html";

    if (creditEl) {
      creditEl.classList.add("hidden");
    }
  }
}

/**
 * HAMBURGER MENU
 */
export function setupHamburgerMenu(
  toggleId = "menu-toggle",
  menuId = "mobile-menu"
) {
  const btn = document.getElementById(toggleId);
  const menu = document.getElementById(menuId);

  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    menu.classList.toggle("hidden");
    const expanded = menu.classList.contains("hidden") ? "false" : "true";
    btn.setAttribute("aria-expanded", expanded);
  });
}
