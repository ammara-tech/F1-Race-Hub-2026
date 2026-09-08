// =====================================
// JOIN THE GRID — standalone fan sign-up widget
// Self-contained: own storage key, own DOM lookups.
// Safe to delete this file (and its <script> tag) without
// affecting the rest of the site.
// =====================================

(function () {
  const STORAGE_KEY = "f1FansJoined";

  const form = document.getElementById("fanJoinForm");
  const nameInput = document.getElementById("fanName");
  const emailInput = document.getElementById("fanEmail");
  const teamInput = document.getElementById("fanTeam");
  const messageEl = document.getElementById("fanJoinMessage");
  const listEl = document.getElementById("fanList");
  const countEl = document.getElementById("fanCount");

  if (!form) return; // widget not present on this page

  function getFans() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (err) {
      console.error("Could not read fan list:", err);
      return [];
    }
  }

  function saveFans(fans) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fans));
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function showMessage(text, isError) {
    messageEl.textContent = text;
    messageEl.classList.toggle("fan-join-message--error", !!isError);
  }

  function renderFans() {
    const fans = getFans();
    countEl.textContent = fans.length;

    if (!fans.length) {
      listEl.innerHTML = `<p class="fan-empty">No fans have joined on this device yet — be the first!</p>`;
      return;
    }

    listEl.innerHTML = fans
      .slice()
      .reverse()
      .map(
        fan => `
          <div class="fan-chip">
            <span class="fan-chip-name">${escapeHtml(fan.name)}</span>
            <span class="fan-chip-team">${escapeHtml(fan.team)}</span>
            <button type="button" class="fan-chip-remove" data-email="${escapeHtml(fan.email)}" aria-label="Remove ${escapeHtml(fan.name)}">✕</button>
          </div>
        `
      )
      .join("");
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function handleSubmit(event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const team = teamInput.value;

    if (!name || !email || !team) {
      showMessage("Please fill in your name, email and favourite team.", true);
      return;
    }

    if (!isValidEmail(email)) {
      showMessage("That doesn't look like a valid email address.", true);
      return;
    }

    const fans = getFans();

    if (fans.some(f => f.email.toLowerCase() === email.toLowerCase())) {
      showMessage("You're already on the grid with that email!", true);
      return;
    }

    fans.push({ name, email, team, joinedAt: new Date().toISOString() });
    saveFans(fans);
    renderFans();

    form.reset();
    showMessage(`Welcome to the grid, ${name}! `, false);
  }

  function handleListClick(event) {
    const btn = event.target.closest(".fan-chip-remove");
    if (!btn) return;

    const email = btn.dataset.email;
    const fans = getFans().filter(f => f.email !== email);
    saveFans(fans);
    renderFans();
  }

  form.addEventListener("submit", handleSubmit);
  listEl.addEventListener("click", handleListClick);

  renderFans();
})();
