import { store } from "../state/store.js";

export function setupHeader() {
  const navEl = document.getElementById("main-nav");
  const isLoggedIn = !!store.getToken();
  navEl.innerHTML = isLoggedIn
    ? `<a href="/profile.html">My Profile</a> <a href="/listings/create.html">New Auction</a> <a href="#" id="logout">Log Out</a>`
    : `<a href="/login.html">Login</a> <a href="/register.html">Register</a>`;

  if (isLoggedIn) {
    document.getElementById("logout")?.addEventListener("click", () => {
      store.clear();
      location.href = "/index.html";
    });
  }
}
