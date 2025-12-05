import { store } from "../state/store.js";

export function setupHeader() {
  const navEl = document.getElementById("mobile-menu");
  const isLoggedIn = !!store.token();

  navEl.innerHTML = isLoggedIn
    ? `<a href="/profile.html">My Profile</a> <a href="/listings/create.html">New Auction</a> <a href="#" id="logout">Log Out</a>`
    : `<a href="../pages/login.html">Login</a> <a href="../pages/register.html">Register</a>`;

  if (isLoggedIn) {
    document.getElementById("logout")?.addEventListener("click", () => {
      store.clear();
      location.href = "/index.html";
    });
  }
}

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
