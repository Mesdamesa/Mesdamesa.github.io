(() => {
  function unique(nodes) {
    return Array.from(new Set(nodes.filter(Boolean)));
  }

  function markRevealTargets() {
    const body = document.body;
    const isCreation = body.classList.contains("creation-page") || body.dataset.creationPage === "true";

    const homeTargets = unique([
      ...document.querySelectorAll(".home-page section > .container-fluid"),
      ...document.querySelectorAll(".home-page .deck-of-cards-creations .col"),
      ...document.querySelectorAll(".home-page #compagnie .col-6, .home-page #compagnie .col-sm-4, .home-page #compagnie .col-xl-3"),
    ]);

    const creationTargets = isCreation
      ? unique([
          document.querySelector(".creation-topbar"),
          ...document.querySelectorAll(".creation-page #home-creation h1, .creation-page #home-creation h2, .creation-page #home-creation .ratio, .creation-page #home-creation video"),
          ...document.querySelectorAll(".creation-page #home-creation [id^='gal']"),
          ...document.querySelectorAll(".creation-page #home-creation .dates-passees ul"),
        ])
      : [];

    const targets = unique([...homeTargets, ...creationTargets]);
    targets.forEach((node) => node.classList.add("reveal-on-scroll"));
    return targets;
  }

  function setupRevealObserver(targets) {
    if (!targets.length) {
      return;
    }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !("IntersectionObserver" in window)) {
      targets.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.12,
      }
    );

    targets.forEach((node) => observer.observe(node));
  }

  function normalizeCreationBlocks() {
    if (!document.body.classList.contains("creation-page") && document.body.dataset.creationPage !== "true") {
      return;
    }

    const mainColumn =
      document.querySelector("#home-creation .col-10.mx-auto") ||
      document.querySelector("#home-creation .col-10.offset-1.col-lg-8.offset-lg-2") ||
      document.querySelector("#home-creation .col-10.offset-1");

    if (mainColumn) {
      mainColumn.classList.add("creation-main-column");
    }

    document.querySelectorAll("#home-creation [id^='gal']").forEach((gallery) => {
      gallery.classList.add("creation-gallery-grid");
    });
  }

  const targets = markRevealTargets();
  normalizeCreationBlocks();
  setupRevealObserver(targets);
})();
