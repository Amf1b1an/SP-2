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
