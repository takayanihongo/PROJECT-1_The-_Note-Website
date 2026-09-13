/* ============================================================
   Ledger — shared frontend interactions
   No backend, no data layer: everything works on the DOM
   that's already rendered in the HTML (dummy data).
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initMobileDrawer();
  initNotesSearch();
  initNewNoteButton();
  initNewNoteForm();
  initNotePage();
  initCodeCopy();
});

/* ---- Mobile drawer navigation ---- */
function initMobileDrawer() {
  const openBtn = document.querySelector("[data-drawer-open]");
  const closeBtn = document.querySelector("[data-drawer-close]");
  const overlay = document.querySelector(".drawer-overlay");
  const body = document.body;

  if (!openBtn) return;

  const open = () => body.classList.add("drawer-open");
  const close = () => body.classList.remove("drawer-open");

  openBtn.addEventListener("click", open);
  if (closeBtn) closeBtn.addEventListener("click", close);
  if (overlay) overlay.addEventListener("click", close);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

/* ---- Notes search + category filter (notes.html) ---- */
function initNotesSearch() {
  renderStoredNotes();
  const searchInput = document.querySelector("[data-note-search]");
  const chips = document.querySelectorAll("[data-filter-chip]");
  const rows = document.querySelectorAll("[data-note-row]");
  const resultsCount = document.querySelector("[data-results-count]");
  const emptyState = document.querySelector("[data-empty-state]");

  if (!searchInput && chips.length === 0) return;

  let activeCategory = "all";

  function applyFilters() {
    const query = (searchInput ? searchInput.value : "").trim().toLowerCase();
    let visibleCount = 0;

    rows.forEach((row) => {
      const title = (row.dataset.title || "").toLowerCase();
      const tags = (row.dataset.tags || "").toLowerCase();
      const category = row.dataset.category || "";

      const matchesQuery = !query || title.includes(query) || tags.includes(query);
      const matchesCategory = activeCategory === "all" || category === activeCategory;
      const visible = matchesQuery && matchesCategory;

      row.style.display = visible ? "" : "none";
      if (visible) visibleCount += 1;
    });

    if (resultsCount) {
      resultsCount.textContent =
        visibleCount === 1 ? "1 note" : `${visibleCount} notes`;
    }

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visibleCount === 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      activeCategory = chip.dataset.filterChip;
      applyFilters();
    });
  });

  applyFilters();
}

function renderStoredNotes() {
  const list = document.querySelector(".note-list");
  if (!list || !document.querySelector("[data-note-search]")) return;

  const savedNotes = JSON.parse(localStorage.getItem("ledger-notes") || "[]");
  savedNotes.forEach((note) => {
    const row = document.createElement("a");
    row.href = `note.html?note=${encodeURIComponent(note.id)}`;
    row.className = "note-row note-tags-visible";
    row.dataset.noteRow = "";
    row.dataset.title = note.title;
    row.dataset.category = note.category;
    row.dataset.tags = note.tags;

    const main = document.createElement("div");
    main.className = "note-row-main";
    main.innerHTML = `<div class="note-row-top"><span class="category-tag"></span><h3 class="note-title"></h3></div><p class="note-excerpt"></p>`;
    main.querySelector(".category-tag").textContent = note.categoryLabel;
    main.querySelector(".note-title").textContent = note.title;
    main.querySelector(".note-excerpt").textContent = note.body;

    const tags = document.createElement("div");
    tags.className = "note-row-tags";
    note.tags.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 2).forEach((tag) => {
      const pill = document.createElement("span");
      pill.className = "tag-pill";
      pill.textContent = tag;
      tags.appendChild(pill);
    });

    const meta = document.createElement("div");
    meta.className = "note-row-meta";
    meta.innerHTML = '<span class="updated-date">Baru saja</span>';
    row.append(main, tags, meta);
    list.prepend(row);
  });
}

function initNewNoteButton() {
  document.querySelectorAll("[data-new-note]").forEach((button) => {
    button.addEventListener("click", () => {
      window.location.href = "new-note.html";
    });
  });
}

function initNewNoteForm() {
  const form = document.querySelector("[data-new-note-form]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const title = String(formData.get("title") || "").trim();
    const body = String(formData.get("body") || "").trim();
    if (!title || !body) return;

    const category = String(formData.get("category") || "javascript");
    const categoryLabels = { javascript: "JavaScript", python: "Python", networking: "Networking", linux: "Linux", git: "Git" };
    const note = {
      id: `custom-${Date.now()}`,
      title,
      body,
      category,
      categoryLabel: categoryLabels[category] || category,
      tags: String(formData.get("tags") || "").trim()
    };
    const savedNotes = JSON.parse(localStorage.getItem("ledger-notes") || "[]");
    savedNotes.unshift(note);
    localStorage.setItem("ledger-notes", JSON.stringify(savedNotes));
    window.location.href = `note.html?note=${encodeURIComponent(note.id)}`;
  });
}

function initNotePage() {
  const article = document.querySelector(".article-body");
  if (!article) return;

  const noteId = new URLSearchParams(window.location.search).get("note") || "closures";
  const savedNotes = JSON.parse(localStorage.getItem("ledger-notes") || "[]");
  const savedNote = savedNotes.find((note) => note.id === noteId);
  const note = savedNote || noteLibrary[noteId] || noteLibrary.closures;

  document.title = `${note.title} — Ledger`;
  document.querySelector(".article-header h1").textContent = note.title;
  document.querySelector(".breadcrumb span:last-child").textContent = note.title;
  document.querySelector(".article-header .category-tag").textContent = note.categoryLabel;
  document.querySelector(".breadcrumb a:last-of-type").textContent = note.categoryLabel;
  document.querySelectorAll(".article-header .tag-pill").forEach((tag, index) => {
    tag.textContent = (note.tags || "catatan, belajar, ringkasan").split(",")[index] || "catatan";
  });
  article.innerHTML = "";

  const intro = document.createElement("p");
  intro.textContent = note.body;
  const heading = document.createElement("h2");
  heading.textContent = "Ringkasan";
  const detail = document.createElement("p");
  detail.textContent = note.detail || "Catatan ini dapat dikembangkan lagi dengan contoh, praktik, dan referensi tambahan.";
  article.append(intro, heading, detail);

  if (note.code) {
    const codeBlock = document.createElement("div");
    codeBlock.className = "code-block";
    codeBlock.innerHTML = '<div class="code-block-head"><span>javascript</span><button class="code-block-copy" data-copy-code>Copy</button></div><pre><code></code></pre>';
    codeBlock.querySelector("pre code").textContent = note.code;
    article.append(codeBlock);
  }
}

const noteLibrary = {
  closures: { title: "Closures dan Lexical Scope", categoryLabel: "JavaScript", tags: "closure, scope, function", body: "Closure membuat fungsi tetap mengingat variabel dari scope tempat fungsi itu dibuat.", detail: "Konsep ini berguna untuk membuat state privat, event handler, dan fungsi pembungkus.", code: "function buatCounter() {\n  let count = 0;\n  return () => ++count;\n}" },
  "event-loop": { title: "Event Loop dan Microtask Queue", categoryLabel: "JavaScript", body: "Event loop mengatur kapan callback masuk ke call stack setelah pekerjaan sinkron selesai.", detail: "Promise masuk ke microtask queue dan biasanya diproses sebelum callback dari macrotask seperti setTimeout." },
  subnetting: { title: "Subnetting VLSM Cepat", categoryLabel: "Networking", body: "VLSM membagi jaringan menjadi subnet dengan ukuran berbeda sesuai kebutuhan host.", detail: "Mulailah dari kebutuhan host terbesar, lalu lanjutkan ke subnet yang lebih kecil agar alamat IP tidak boros." },
  "git-rebase": { title: "Git Rebase vs Merge", categoryLabel: "Git", body: "Rebase memindahkan rangkaian commit ke basis baru, sedangkan merge menggabungkan dua riwayat.", detail: "Gunakan rebase untuk riwayat lokal yang rapi dan merge saat ingin mempertahankan konteks percabangan bersama." },
  permissions: { title: "Permission dan Ownership File", categoryLabel: "Linux", body: "Permission Linux mengatur hak baca, tulis, dan eksekusi untuk owner, group, dan user lain.", detail: "Perintah chmod mengubah permission, sedangkan chown mengubah ownership file." },
  "list-comprehension": { title: "List Comprehension Secara Mendalam", categoryLabel: "Python", body: "List comprehension membuat list baru dari iterable dengan sintaks yang ringkas.", detail: "Gunakan loop biasa ketika logikanya panjang agar kode tetap mudah dibaca." },
  "static-routing": { title: "Static Routing vs Dynamic Routing", categoryLabel: "Networking", body: "Static routing dikonfigurasi manual, sedangkan dynamic routing mempelajari rute melalui protokol.", detail: "Static routing cocok untuk jaringan kecil dan stabil; dynamic routing lebih fleksibel untuk jaringan besar." },
  "git-stash": { title: "Git Stash untuk Konteks Cepat", categoryLabel: "Git", body: "Git stash menyimpan perubahan sementara tanpa membuat commit.", detail: "Setelah berpindah pekerjaan, gunakan git stash pop untuk mengembalikan perubahan tersebut." },
  virtualenv: { title: "Virtual Environment di Python", categoryLabel: "Python", body: "Virtual environment memisahkan dependency setiap project Python.", detail: "Buat dengan python -m venv .venv dan aktifkan sebelum memasang package project." },
  "this-keyword": { title: "this Keyword dan Cara Kerjanya", categoryLabel: "JavaScript", body: "Nilai this ditentukan oleh cara sebuah fungsi dipanggil.", detail: "Arrow function tidak memiliki this sendiri dan mewarisi this dari scope di sekitarnya." }
};

/* ---- Copy button on code blocks (note.html) ---- */
function initCodeCopy() {
  document.querySelectorAll("[data-copy-code]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const block = btn.closest(".code-block");
      const code = block ? block.querySelector("pre code") : null;
      if (!code) return;

      try {
        await navigator.clipboard.writeText(code.textContent);
        const original = btn.textContent;
        btn.textContent = "Copied";
        setTimeout(() => (btn.textContent = original), 1600);
      } catch (err) {
        btn.textContent = "Press ⌘/Ctrl+C";
      }
    });
  });
}
