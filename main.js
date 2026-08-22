const BUSINESS_WHATSAPP = "";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const loader = document.getElementById("loader");
const loaderBar = document.getElementById("loader-bar");
const navbar = document.getElementById("navbar");
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobile-menu");
const menuClose = document.getElementById("menu-close");
const contactForm = document.getElementById("contact-form");

function setLoaderProgress() {
  if (!loaderBar) return;

  if (window.anime && !prefersReducedMotion) {
    anime({
      targets: loaderBar,
      width: ["0%", "100%"],
      easing: "easeInOutQuad",
      duration: 900
    });
    return;
  }

  loaderBar.style.width = "100%";
}

function hideLoader() {
  setTimeout(() => {
    loader?.classList.add("hidden");
  }, prefersReducedMotion ? 80 : 760);
}

function updateNavbar() {
  navbar?.classList.toggle("scrolled", window.scrollY > 24);
}

function openMobileMenu() {
  mobileMenu?.classList.add("open");
  mobileMenu?.setAttribute("aria-hidden", "false");
  hamburger?.setAttribute("aria-expanded", "true");
  document.body.classList.add("menu-open");
}

function closeMobileMenu() {
  mobileMenu?.classList.remove("open");
  mobileMenu?.setAttribute("aria-hidden", "true");
  hamburger?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

function initMobileMenu() {
  hamburger?.addEventListener("click", () => {
    if (mobileMenu?.classList.contains("open")) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  menuClose?.addEventListener("click", closeMobileMenu);

  mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileMenu();
  });
}

function initReveal() {
  const revealItems = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    revealItems.forEach((item) => item.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function initCounters() {
  const counters = document.querySelectorAll(".stat-num");
  let hasRun = false;

  function animateCounter(counter) {
    const target = Number(counter.dataset.target || 0);
    const prefix = counter.dataset.prefix || "";
    const suffix = counter.dataset.suffix || "";
    const duration = prefersReducedMotion ? 1 : 1300;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      counter.textContent = `${prefix}${value}${suffix}`;

      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function runCounters() {
    if (hasRun) return;
    hasRun = true;
    counters.forEach(animateCounter);
  }

  if (!("IntersectionObserver" in window)) {
    runCounters();
    return;
  }

  const statsBar = document.querySelector(".stats-bar");
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        runCounters();
        observer.disconnect();
      }
    },
    { threshold: 0.35 }
  );

  if (statsBar) observer.observe(statsBar);
}

function initFilters() {
  const filters = document.querySelectorAll(".menu-filter");
  const cards = document.querySelectorAll(".menu-card");

  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const category = filter.dataset.cat;

      filters.forEach((item) => item.classList.toggle("active", item === filter));

      cards.forEach((card) => {
        const shouldShow = category === "all" || card.dataset.cat === category;
        card.classList.toggle("is-hidden", !shouldShow);
      });
    });
  });
}

function initParticles() {
  const container = document.getElementById("hero-particles");
  if (!container || prefersReducedMotion) return;

  const total = window.innerWidth < 720 ? 18 : 34;
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < total; index += 1) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.opacity = String(0.25 + Math.random() * 0.55);
    fragment.appendChild(particle);
  }

  container.appendChild(fragment);

  if (!window.anime) return;

  anime({
    targets: ".particle",
    translateY: () => anime.random(-34, 34),
    translateX: () => anime.random(-22, 22),
    scale: () => anime.random(80, 145) / 100,
    opacity: [
      { value: .18, duration: 900 },
      { value: .72, duration: 1100 }
    ],
    easing: "easeInOutSine",
    direction: "alternate",
    loop: true,
    delay: anime.stagger(80)
  });
}

function initHeroIntro() {
  if (prefersReducedMotion || !window.anime) return;

  anime({
    targets: ".hero-eyebrow, .hero-title .word, .hero-subtitle, .hero-ctas",
    translateY: [30, 0],
    easing: "easeOutExpo",
    duration: 900,
    delay: anime.stagger(90, { start: 320 })
  });
}

function buildQuoteMessage(formData) {
  const nombre = formData.get("nombre") || "";
  const telefono = formData.get("telefono") || "";
  const asunto = formData.get("asunto") || "";
  const mensaje = formData.get("mensaje") || "";

  return [
    "Hola, Carpintería Victor. Quiero solicitar una cotización.",
    "",
    `Nombre: ${nombre}`,
    `Teléfono: ${telefono}`,
    `Proyecto: ${asunto}`,
    `Detalles: ${mensaje}`
  ].join("\n");
}

async function copyMessage(message) {
  if (!navigator.clipboard) return false;

  try {
    await navigator.clipboard.writeText(message);
    return true;
  } catch {
    return false;
  }
}

function initContactForm() {
  contactForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submit = contactForm.querySelector(".form-submit");
    const message = buildQuoteMessage(new FormData(contactForm));

    if (BUSINESS_WHATSAPP) {
      const phone = BUSINESS_WHATSAPP.replace(/\D/g, "");
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
      return;
    }

    const copied = await copyMessage(message);
    const originalText = submit?.textContent;

    if (submit) {
      submit.textContent = copied ? "Mensaje Copiado" : "Mensaje Preparado";
      submit.disabled = true;
    }

    window.setTimeout(() => {
      if (submit) {
        submit.textContent = originalText || "Preparar Mensaje";
        submit.disabled = false;
      }
    }, 2200);
  });
}

window.addEventListener("load", () => {
  setLoaderProgress();
  hideLoader();
  initHeroIntro();
});

window.addEventListener("scroll", updateNavbar, { passive: true });

updateNavbar();
initMobileMenu();
initReveal();
initCounters();
initFilters();
initParticles();
initContactForm();
