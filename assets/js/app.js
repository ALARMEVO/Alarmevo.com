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

// Configuration formulaire
const CONTACT_ENDPOINT = "/api/contact";
const FALLBACK_EMAIL = "contactalarmevo@gmail.com";
const ENABLE_MAILTO_FALLBACK =
  (document.body?.dataset?.mailtoFallback || "true").toLowerCase() !== "false";

// Soumission du formulaire de contact principal
const contactForms = document.querySelectorAll(".js-contact-form");

async function submitContactForm(form) {
  const statusEl = form.querySelector("[data-form-status]");
  const submitBtn = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);

  // honeypot anti-spam
  if (formData.get("website")) {
    form.reset();
    return;
  }

  const payload = Object.fromEntries(formData.entries());
  payload.source = form.dataset.formSource || "contact-form";
  payload.path = window.location.href;

  const originalText = submitBtn ? submitBtn.textContent : "";
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Envoi...";
  }
  if (statusEl) statusEl.textContent = "";

  try {
    const res = await fetch(CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      const message = data.message || "Envoi impossible pour le moment.";
      throw new Error(message);
    }

    if (statusEl) statusEl.textContent = "Message envoyé ✅";
    const successUrl = form.dataset.successUrl;
    if (successUrl) {
      window.location.href = successUrl;
    } else {
      form.reset();
    }
  } catch (err) {
    if (statusEl) statusEl.textContent = err.message || "Erreur inattendue.";
    if (ENABLE_MAILTO_FALLBACK) {
      const mailBody = [
        `Nom: ${formData.get("name") || ""}`,
        `Téléphone: ${formData.get("phone") || ""}`,
        `Email: ${formData.get("email") || ""}`,
        `Besoin: ${formData.get("need") || formData.get("service") || ""}`,
        `Message: ${formData.get("message") || ""}`,
        `Source: ${payload.source}`,
        `Page: ${payload.path}`
      ].join("%0D%0A");
      window.location.href = `mailto:${FALLBACK_EMAIL}?subject=Demande%20de%20contact%20ALARMEVO&body=${mailBody}`;
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
}

contactForms.forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submitContactForm(form);
  });
});

// Témoignages slider (contact colonne)
const testimonialCard = document.querySelector("[data-testimonial]");
if (testimonialCard) {
  const track = testimonialCard.querySelector(".testimonial-track");
  const items = Array.from(testimonialCard.querySelectorAll(".testimonial"));
  const dots = Array.from(testimonialCard.querySelectorAll("[data-testimonial-dot]"));
  let index = 0;
  let timer;

  const setActive = (i) => {
    items.forEach((item, idx) => item.classList.toggle("active", idx === i));
    dots.forEach((dot, idx) => dot.classList.toggle("active", idx === i));
    index = i;
  };

  const next = () => setActive((index + 1) % items.length);

  const start = () => {
    timer = setInterval(next, 4500);
  };
  const stop = () => {
    if (timer) clearInterval(timer);
  };

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      stop();
      setActive(i);
      start();
    });
  });

  testimonialCard.addEventListener("mouseenter", stop);
  testimonialCard.addEventListener("mouseleave", start);
  setActive(0);
  start();
}
