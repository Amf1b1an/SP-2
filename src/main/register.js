import { apiFetch } from "../api/http.js";
import { store } from "../state/store.js";

const form = document.getElementById("registerForm");
const errorEl = document.getElementById("registerError");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.classList.add("hidden");

  const fd = new FormData(form);
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  const avatar = form.avatar.value.trim();

  const payload = { name, email, password, ...(avatar ? { avatar } : {}) };
  console.log("Register payload actually sent:", payload);

  try {
    // 1. Register user
    const res = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    // 2. Login immediately to get accessToken
    const login = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    store.setToken(login.accessToken);
    store.setProfile({ name: login.name });

    // 3. Set credits to 1000 (only once here)
    await apiFetch(`/social/profiles/${login.name}`, {
      method: "PUT",
      body: JSON.stringify({ credits: 1000 }),
    });

    alert(`Registration successful! Welcome, ${login.name}.`);
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
