// Année footer
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Menu mobile
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");

function setNav(open) {
  if (!nav || !navToggle) return;
  nav.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", String(open));
}

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    setNav(!nav.classList.contains("open"));
  });

  // Ferme quand on clique un lien
  nav.addEventListener("click", (e) => {
    const target = e.target;
    if (target && target.matches(".nav-link")) setNav(false);
  });

  // Ferme si clic dehors
  document.addEventListener("click", (e) => {
    const isOpen = nav.classList.contains("open");
    if (!isOpen) return;
    if (nav.contains(e.target) || navToggle.contains(e.target)) return;
    setNav(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 900) setNav(false);
  });
}

// Filtre Réalisations
const chips = document.querySelectorAll("[data-filter]");
const projectGrid = document.getElementById("projects");

function applyFilter(filter) {
  if (!projectGrid) return;
  const cards = projectGrid.querySelectorAll(".project-card");
  cards.forEach((card) => {
    const cat = card.getAttribute("data-category");
    const show = filter === "all" || cat === filter;
    card.style.display = show ? "" : "none";
  });
}

if (chips.length && projectGrid) {
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      applyFilter(chip.getAttribute("data-filter"));
    });
  });
}

// Lien actif (scrollspy léger)
const navLinks = document.querySelectorAll(".nav-link[data-section]");
const sections = Array.from(navLinks)
  .map((a) => document.getElementById(a.getAttribute("href").replace("#", "")))
  .filter(Boolean);

function setActive(id) {
  navLinks.forEach((a) => {
    const match = a.getAttribute("href") === `#${id}`;
    a.classList.toggle("active", match);
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    // prend la section la plus visible
    const visible = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible?.target?.id) setActive(visible.target.id);
  },
  { root: null, threshold: [0.25, 0.4, 0.6] }
);

sections.forEach((sec) => observer.observe(sec));
