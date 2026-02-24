(() => {
  function unique(nodes) {
    return Array.from(new Set(nodes.filter(Boolean)));
  }

  function slugify(text) {
    return (text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
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

  function setupQuickNav(links, containerClass) {
    if (links.length < 2) {
      return;
    }

    const nav = document.createElement("nav");
    nav.className = containerClass;
    nav.setAttribute("aria-label", "Navigation de sections");

    links.forEach((link) => {
      const a = document.createElement("a");
      a.href = `#${link.id}`;
      a.textContent = link.label;
      a.setAttribute("data-section-link", link.id);
      nav.appendChild(a);
    });

    document.body.appendChild(nav);

    const anchors = Array.from(nav.querySelectorAll("a[data-section-link]"));
    const activate = (id) => {
      anchors.forEach((anchor) => {
        anchor.classList.toggle("is-active", anchor.dataset.sectionLink === id);
      });
    };

    const sectionNodes = links
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);

    if (!("IntersectionObserver" in window)) {
      activate(links[0].id);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length) {
          activate(visible[0].target.id);
        }
      },
      {
        root: null,
        threshold: [0.2, 0.45, 0.75],
        rootMargin: "-14% 0px -55% 0px",
      }
    );

    sectionNodes.forEach((node) => observer.observe(node));
    activate(links[0].id);
  }

  function buildHomeQuickNav() {
    if (!document.body.classList.contains("home-page")) {
      return;
    }

    const candidates = [
      { id: "home", label: "Accueil" },
      { id: "creations", label: "Creations" },
      { id: "compagnie", label: "Compagnie" },
      { id: "contact", label: "Contact" },
    ];

    const links = candidates.filter((item) => document.getElementById(item.id));
    setupQuickNav(links, "ma-quicknav");
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

  function buildCreationSectionNav() {
    if (!document.body.classList.contains("creation-page") && document.body.dataset.creationPage !== "true") {
      return;
    }

    const homeCreation = document.getElementById("home-creation");
    if (!homeCreation) {
      return;
    }

    const headingNodes = Array.from(homeCreation.querySelectorAll("h2"));
    if (headingNodes.length < 2) {
      return;
    }

    const usedIds = new Set(Array.from(homeCreation.querySelectorAll("[id]")).map((node) => node.id));
    const links = headingNodes
      .map((node, index) => {
        const label = node.textContent.trim();
        if (!label) {
          return null;
        }

        let id = node.id;
        if (!id) {
          const base = slugify(label) || `section-${index + 1}`;
          id = base;
          let attempt = 2;
          while (usedIds.has(id)) {
            id = `${base}-${attempt}`;
            attempt += 1;
          }
          node.id = id;
        }
        usedIds.add(id);

        return {
          id,
          label,
        };
      })
      .filter(Boolean)
      .slice(0, 8);

    if (links.length < 2) {
      return;
    }

    const targetContainer =
      homeCreation.querySelector(".creation-main-column") ||
      homeCreation.querySelector(".col-10.mx-auto") ||
      homeCreation.querySelector(".col-10.offset-1.col-lg-8.offset-lg-2") ||
      homeCreation.querySelector(".col-10.offset-1");

    if (!targetContainer) {
      return;
    }

    const nav = document.createElement("nav");
    nav.className = "ma-section-nav";
    nav.setAttribute("aria-label", "Sur cette page");

    links.forEach((item) => {
      const a = document.createElement("a");
      a.href = `#${item.id}`;
      a.textContent = item.label;
      a.setAttribute("data-section-link", item.id);
      nav.appendChild(a);
    });

    targetContainer.prepend(nav);

    const anchors = Array.from(nav.querySelectorAll("a[data-section-link]"));
    const activate = (id) => {
      anchors.forEach((anchor) => {
        anchor.classList.toggle("is-active", anchor.dataset.sectionLink === id);
      });
    };

    const sections = links
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);

    if (!("IntersectionObserver" in window)) {
      activate(links[0].id);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length) {
          activate(visible[0].target.id);
        }
      },
      {
        root: null,
        threshold: [0.2, 0.45, 0.75],
        rootMargin: "-18% 0px -58% 0px",
      }
    );

    sections.forEach((node) => observer.observe(node));
    activate(links[0].id);
  }

  function markRevealTargets() {
    const body = document.body;
    const isCreation = body.classList.contains("creation-page") || body.dataset.creationPage === "true";

    const homeTargets = unique([
      ...document.querySelectorAll(".home-page .hero-banner, .home-page section > .container-fluid"),
      ...document.querySelectorAll(".home-page .deck-of-cards-creations .col"),
      ...document.querySelectorAll(".home-page #compagnie .col-6, .home-page #compagnie .col-sm-4, .home-page #compagnie .col-xl-3"),
    ]);

    const creationTargets = isCreation
      ? unique([
          document.querySelector(".creation-topbar"),
          document.querySelector(".creation-main-column"),
          ...document.querySelectorAll(".creation-page #home-creation h1, .creation-page #home-creation h2, .creation-page #home-creation .ratio, .creation-page #home-creation video"),
          ...document.querySelectorAll(".creation-page #home-creation [id^='gal']"),
          ...document.querySelectorAll(".creation-page #home-creation .dates-passees ul"),
        ])
      : [];

    const targets = unique([...homeTargets, ...creationTargets]);
    targets.forEach((node) => node.classList.add("reveal-on-scroll"));
    return targets;
  }

  normalizeCreationBlocks();
  buildHomeQuickNav();
  buildCreationSectionNav();
  const targets = markRevealTargets();
  setupRevealObserver(targets);
})();
