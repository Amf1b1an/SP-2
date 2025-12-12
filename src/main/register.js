import { apiFetch } from "../api/http.js";
import { store } from "../state/store.js";

const form = document.getElementById("registerForm");
const errorEl = document.getElementById("registerError");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.classList.add("hidden");

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  const avatar = form.avatar.value.trim();

  const payload = { name, email, password, ...(avatar ? { avatar } : {}) };

  try {
    // 1. Register
    await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    // 2. Login
    const login = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const accessToken = login.data.accessToken;
    const username = login.data.name;

    store.setToken(accessToken);
    store.setProfile({ name: username });

    // 3. Create API key (must be after setting token!)
    const keyRes = await apiFetch("/auth/create-api-key", {
      method: "POST",
      body: JSON.stringify({ name: "FED" }),
    });

    store.setApiKey(keyRes.data.key);

    // 4. Set initial credits
    await apiFetch(`/social/profiles/${username}`, {
      method: "PUT",
      body: JSON.stringify({ credits: 1000 }),
    });

    console.log("Credits set to 1000 for", username);

    alert(`Registration successful! Welcome, ${username}.`);
    location.href = "./login.html";
  } catch (err) {
    const msg = /Profile already exists/i.test(err.message)
      ? "That username is taken. Please choose another."
      : err.message || "Registration failed.";
    showErr(msg);
  }
});

function showErr(msg) {
  errorEl.textContent = msg;
  errorEl.classList.remove("hidden");
}
