const IMAGES = [
  {
    id: "n1",
    title: "Neon City Rain",
    category: "Devices",
    tags: ["Map", "travel", "street"],
    src: "https://images.unsplash.com/photo-1548345680-f5475ea5df84?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "n2",
    title: "Mountain Glow",
    category: "Nature",
    tags: ["mountain", "sunrise", "peaks"],
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "n3",
    title: "Neon City Rain",
    category: "Urban",
    tags: ["rainy", "minimal", "roads"],
    src: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "n4",
    title: "Studio Portrait",
    category: "People",
    tags: ["portrait", "studio", "mood"],
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "n5",
    title: "Coffee & Notes & Code",
    category: "Lifestyle",
    tags: ["coffee", "desk", "work"],
    src: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "n6",
    title: "Ocean Texture",
    category: "Nature",
    tags: ["sea", "waves", "blue"],
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "n7",
    title: "Golden Alley",
    category: "Urban",
    tags: ["alley", "sun", "travel"],
    src: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "n8",
    title: "Fluffy Dog",
    category: "Animals",
    tags: ["pet", "relaxed", "modern"],
    src: "https://images.unsplash.com/photo-1529429617124-95b109e86bb8?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "n9",
    title: "Creative Workspace",
    category: "Lifestyle",
    tags: ["design", "laptop", "people"],
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "n10",
    title: "The Blue Sea",
    category: "Nature",
    tags: ["water", "boats", "warm"],
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "n11",
    title: "Candid Smile",
    category: "People",
    tags: ["candid", "smile", "street"],
    src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "n12",
    title: "Skyscraper Lines",
    category: "Urban",
    tags: ["drawing", "long exposure", "city"],
    src: "https://images.unsplash.com/photo-1496307653780-42ee777d4833?auto=format&fit=crop&w=1600&q=80",
  },
];

const state = {
  category: "All",
  query: "",
  filtered: [],
  lbOpen: false,
  lbIndex: 0,
  lastFocus: null,
};

const el = {
  pills: document.getElementById("pills"),
  grid: document.getElementById("grid"),
  q: document.getElementById("q"),
  resultCount: document.getElementById("resultCount"),
  activeInfo: document.getElementById("activeInfo"),
  headline: document.getElementById("headline"),
  subline: document.getElementById("subline"),
  // lightbox
  lightbox: document.getElementById("lightbox"),
  lbBackdrop: document.getElementById("lbBackdrop"),
  lbImg: document.getElementById("lbImg"),
  lbName: document.getElementById("lbName"),
  lbMeta: document.getElementById("lbMeta"),
  lbIndex: document.getElementById("lbIndex"),
  btnPrev: document.getElementById("btnPrev"),
  btnNext: document.getElementById("btnNext"),
  btnClose: document.getElementById("btnClose"),
  btnDownload: document.getElementById("btnDownload"),
  lbStage: document.getElementById("lbStage"),
  // filters
  tglGray: document.getElementById("tglGray"),
  tglSepia: document.getElementById("tglSepia"),
};

function uniq(arr) {
  return [...new Set(arr)];
}

function buildCategories() {
  const cats = uniq(IMAGES.map((i) => i.category)).sort((a, b) =>
    a.localeCompare(b)
  );
  const all = ["All", ...cats];
  el.pills.innerHTML = "";
  for (const c of all) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pill" + (c === state.category ? " active" : "");
    btn.dataset.cat = c;
    btn.innerHTML = `<span>${c}</span><span class="count" data-count-for="${c}">0</span>`;
    btn.addEventListener("click", () => {
      state.category = c;
      update();
    });
    el.pills.appendChild(btn);
  }
}

function matchesQuery(img, q) {
  if (!q) return true;
  const hay = [img.title, img.category, ...(img.tags || [])]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

function applyFilter() {
  const q = (state.query || "").trim().toLowerCase();
  let list = IMAGES.filter((img) => matchesQuery(img, q));
  if (state.category !== "All")
    list = list.filter((img) => img.category === state.category);
  state.filtered = list;

  // counts by category respecting query (so pills feel responsive)
  const qList = IMAGES.filter((img) => matchesQuery(img, q));
  const countBy = new Map();
  countBy.set("All", qList.length);
  for (const img of qList) {
    countBy.set(img.category, (countBy.get(img.category) || 0) + 1);
  }
  for (const span of el.pills.querySelectorAll("[data-count-for]")) {
    const c = span.getAttribute("data-count-for");
    span.textContent = String(countBy.get(c) || 0);
  }
}

function renderGrid() {
  el.grid.innerHTML = "";
  const list = state.filtered;

  if (list.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.innerHTML = `<h3>No results</h3><p>Try a different search term, or switch categories.</p>`;
    el.grid.appendChild(empty);
    return;
  }

  list.forEach((img, idx) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card";
    card.setAttribute("aria-label", `Open image: ${img.title}`);
    card.dataset.index = String(idx);
    card.innerHTML = `
          <img class="thumb" loading="lazy" alt="${escapeHtml(
            img.title
          )}" src="${img.src}" />
          <div class="overlay" aria-hidden="true"></div>
          <div class="caption" aria-hidden="true">
            <div class="capText">
              <p class="name">${escapeHtml(img.title)}</p>
              <p class="cat">${escapeHtml(img.category)} • ${escapeHtml(
      (img.tags || []).slice(0, 2).join(", ")
    )}</p>
            </div>
            <div class="chip">
              <span style="opacity:.85">View</span>
              <span aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M10 8l6 4-6 4V8Z" fill="rgba(255,255,255,.9)"/>
                </svg>
              </span>
            </div>
          </div>
        `;
    card.addEventListener("click", () => openLightbox(idx, card));
    el.grid.appendChild(card);
  });
}

function updateMeta() {
  const count = state.filtered.length;
  el.resultCount.textContent = String(count);

  const q = (state.query || "").trim();
  const cat = state.category;
  el.activeInfo.textContent =
    (cat === "All" ? "All categories" : cat) + (q ? ` • “${q}”` : "");

  el.headline.textContent = q ? `Results for “${q}”` : "Browse the collection";
  el.subline.textContent = q
    ? `Showing ${count} image${count === 1 ? "" : "s"}${
        cat === "All" ? "" : " in " + cat
      }.`
    : "Use filters, search, and the lightbox viewer.";
}

function updatePillActive() {
  el.pills.querySelectorAll(".pill").forEach((p) => {
    const on = p.dataset.cat === state.category;
    p.classList.toggle("active", on);
  });
}

function update() {
  applyFilter();
  updatePillActive();
  renderGrid();
  updateMeta();

  // keep lightbox in sync if open
  if (state.lbOpen) {
    if (state.filtered.length === 0) closeLightbox();
    else {
      state.lbIndex = clamp(state.lbIndex, 0, state.filtered.length - 1);
      renderLightbox();
    }
  }
}

function escapeHtml(str) {
  return String(str).replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[
        m
      ])
  );
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function openLightbox(index, focusEl) {
  if (state.filtered.length === 0) return;
  state.lastFocus = focusEl || document.activeElement;
  state.lbOpen = true;
  state.lbIndex = clamp(index, 0, state.filtered.length - 1);

  el.lightbox.classList.add("open");
  el.lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  renderLightbox();
  // focus close button for accessibility
  setTimeout(() => el.btnClose.focus(), 0);
}

function closeLightbox() {
  state.lbOpen = false;
  el.lightbox.classList.remove("open");
  el.lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  if (state.lastFocus && typeof state.lastFocus.focus === "function") {
    setTimeout(() => state.lastFocus.focus(), 0);
  }
}

function renderLightbox() {
  const img = state.filtered[state.lbIndex];
  if (!img) return;

  el.lbImg.src = img.src;
  el.lbImg.alt = img.title;
  el.lbName.textContent = img.title;
  el.lbMeta.textContent = `${img.category} • ${img.tags.join(" • ")}`;
  el.lbIndex.textContent = `${state.lbIndex + 1} / ${state.filtered.length}`;

  el.btnPrev.disabled = state.filtered.length <= 1;
  el.btnNext.disabled = state.filtered.length <= 1;

  el.btnDownload.onclick = () =>
    window.open(img.src, "_blank", "noopener,noreferrer");
}

function prev() {
  if (state.filtered.length <= 1) return;
  state.lbIndex =
    (state.lbIndex - 1 + state.filtered.length) % state.filtered.length;
  renderLightbox();
}
function next() {
  if (state.filtered.length <= 1) return;
  state.lbIndex = (state.lbIndex + 1) % state.filtered.length;
  renderLightbox();
}

// Search interactions
el.q.addEventListener("input", (e) => {
  state.query = e.target.value;
  update();
});

// Keyboard shortcuts
window.addEventListener("keydown", (e) => {
  if (e.key === "/" && !state.lbOpen) {
    const tag = (
      (document.activeElement && document.activeElement.tagName) ||
      ""
    ).toLowerCase();
    const isTyping =
      tag === "input" ||
      tag === "textarea" ||
      document.activeElement?.isContentEditable;
    if (!isTyping) {
      e.preventDefault();
      el.q.focus();
    }
  }

  if (!state.lbOpen) return;

  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") prev();
  if (e.key === "ArrowRight") next();
});

// Lightbox controls
el.btnClose.addEventListener("click", closeLightbox);
el.lbBackdrop.addEventListener("click", closeLightbox);
el.btnPrev.addEventListener("click", prev);
el.btnNext.addEventListener("click", next);

// Simple swipe (mobile)
(function attachSwipe() {
  let sx = 0,
    sy = 0,
    tracking = false;
  el.lbStage.addEventListener(
    "touchstart",
    (e) => {
      if (!state.lbOpen) return;
      const t = e.touches[0];
      sx = t.clientX;
      sy = t.clientY;
      tracking = true;
    },
    { passive: true }
  );

  el.lbStage.addEventListener(
    "touchend",
    (e) => {
      if (!state.lbOpen || !tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        dx > 0 ? prev() : next();
      }
    },
    { passive: true }
  );
})();

// Filter toggles (mutually exclusive)
function setMode(mode) {
  document.body.classList.toggle("mode-gray", mode === "gray");
  document.body.classList.toggle("mode-sepia", mode === "sepia");
  el.tglGray.checked = mode === "gray";
  el.tglSepia.checked = mode === "sepia";
}
el.tglGray.addEventListener("change", () =>
  setMode(el.tglGray.checked ? "gray" : "none")
);
el.tglSepia.addEventListener("change", () =>
  setMode(el.tglSepia.checked ? "sepia" : "none")
);

// Init
buildCategories();
applyFilter();
updatePillActive();
renderGrid();
updateMeta();

// Ensure initial counts are correct
update();

// Preload first few images for smoother lightbox
(function preload() {
  IMAGES.slice(0, 4).forEach((i) => {
    const img = new Image();
    img.src = i.src;
  });
})();
