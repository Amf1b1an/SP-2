import { setupHeader } from "../utils/header.js";
import { setupHamburgerMenu } from "../utils/header.js";

import { apiFetch } from "../api/http.js";

document.addEventListener("DOMContentLoaded", async () => {
  setupHeader();
  setupHamburgerMenu();
  await loadIndex();
});
