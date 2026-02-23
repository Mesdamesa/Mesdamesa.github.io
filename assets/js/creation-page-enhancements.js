(() => {
  const CREATION_PAGES = [
    { slug: "cromwell", label: "Cromwell", href: "../cromwell/index.html" },
    { slug: "commencement", label: "Le Commencement", href: "../commencement/index.html" },
    { slug: "SPECTATEURS", label: "Spectateur(s)", href: "../SPECTATEURS/index.html" },
    { slug: "dragons", label: "La Cité des Dragons", href: "../dragons/index.html" },
    { slug: "monologue", label: "Le Monologue d'une Tueuse", href: "../monologue/index.html" },
    { slug: "satyre", label: "Le Satyre", href: "../satyre/index.html" },
    { slug: "voyages", label: "Voyages dans le temps", href: "../voyages/index.html" },
  ];

  const IMAGE_EXT_RE = /\.(avif|jpe?g|png|gif|webp|svg)(?:$|[?#])/i;

  function getCreationSlug() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const creationsIndex = parts.lastIndexOf("creations");
    if (creationsIndex === -1 || !parts[creationsIndex + 1]) {
      return null;
    }
    return parts[creationsIndex + 1];
  }

  function createNodeFromHtml(html) {
    const tpl = document.createElement("template");
    tpl.innerHTML = html.trim();
    return tpl.content.firstElementChild;
  }

  function renderHeader(current, previous, next) {
    const prevMarkup = previous
      ? `<a class="creation-sibling-link creation-sibling-link-prev" href="${previous.href}" aria-label="Création précédente">
          <span aria-hidden="true">←</span> Précédente
        </a>`
      : `<span class="creation-sibling-link creation-sibling-link-prev is-disabled" aria-hidden="true">
          <span aria-hidden="true">←</span> Précédente
        </span>`;

    const nextMarkup = next
      ? `<a class="creation-sibling-link creation-sibling-link-next" href="${next.href}" aria-label="Création suivante">
          Suivante <span aria-hidden="true">→</span>
        </a>`
      : `<span class="creation-sibling-link creation-sibling-link-next is-disabled" aria-hidden="true">
          Suivante <span aria-hidden="true">→</span>
        </span>`;

    return createNodeFromHtml(`
      <section class="nav-back nav-back--component">
        <div class="container-xl">
          <div class="creation-topbar">
            <a class="creation-back-link link-creation" href="../../index.html#creations">
              <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>&nbsp;&nbsp;Retour aux créations
            </a>
            <nav class="creation-sibling-nav" aria-label="Navigation entre créations">
              ${prevMarkup}
              <span class="creation-current-label">${current.label}</span>
              ${nextMarkup}
            </nav>
          </div>
        </div>
      </section>
    `);
  }

  function renderFooter() {
    return createNodeFromHtml(`
      <footer class="creation-footer">
        <div class="logo-contact">
          <ul class="social-network social-circle">
            <li><a href="http://www.facebook.com/Compagnie-Mesdames-a-161213841387/" class="icoFacebook" title="Facebook"><i class="fab fa-facebook-f"></i></a></li>
            <li><a href="https://twitter.com/Mesdames_A" class="icoTwitter" title="Twitter"><i class="fab fa-twitter"></i></a></li>
          </ul>
        </div>
        <div class="adresse-internet">
          <p class="text-center">
            <a class="link-creation" href="https://mesdames-a.fr">www.mesdames-a.fr</a>
          </p>
        </div>
      </footer>
    `);
  }

  function normalizeLayout(slug) {
    const index = CREATION_PAGES.findIndex((item) => item.slug === slug);
    const current = index >= 0 ? CREATION_PAGES[index] : { slug, label: "", href: "#" };
    const previous = index > 0 ? CREATION_PAGES[index - 1] : null;
    const next = index >= 0 && index < CREATION_PAGES.length - 1 ? CREATION_PAGES[index + 1] : null;

    const legacyHeader = document.querySelector("section.nav-back");
    const newHeader = renderHeader(current, previous, next);
    if (legacyHeader) {
      legacyHeader.replaceWith(newHeader);
    } else {
      const beforeNode = document.querySelector("#home-creation");
      if (beforeNode) {
        beforeNode.parentNode.insertBefore(newHeader, beforeNode);
      } else {
        document.body.prepend(newHeader);
      }
    }

    document.querySelectorAll("footer, section#contact").forEach((node) => node.remove());
    document.querySelectorAll("#home-creation .logo-contact, #home-creation .adresse-internet").forEach((node) => node.remove());

    if (!document.querySelector(".creation-footer")) {
      document.body.appendChild(renderFooter());
    }
  }

  function cleanupSatyreVideoLeak(slug) {
    if (slug === "satyre") {
      return;
    }

    document
      .querySelectorAll('a[href*="player.vimeo.com/video/182463716"], iframe[src*="player.vimeo.com/video/182463716"]')
      .forEach((node) => {
        const removable = node.closest("a, .embed-responsive, .ratio, .hidden");
        if (removable) {
          removable.remove();
        } else {
          node.remove();
        }
      });
  }

  function setupCurtainAnimation() {
    const preOpenDelayMs = 180;
    const openDurationMs = 1200;
    const holdAfterOpenMs = 260;
    const curtain = document.createElement("div");
    curtain.className = "creation-curtain";
    curtain.innerHTML = `
      <span class="creation-curtain-panel creation-curtain-left"></span>
      <span class="creation-curtain-panel creation-curtain-right"></span>
    `;
    curtain.style.setProperty("--creation-curtain-duration", `${openDurationMs}ms`);
    document.body.appendChild(curtain);
    window.setTimeout(() => {
      requestAnimationFrame(() => curtain.classList.add("is-open"));
    }, preOpenDelayMs);
    window.setTimeout(() => curtain.remove(), preOpenDelayMs + openDurationMs + holdAfterOpenMs);
  }

  function setupImageLightbox() {
    const candidates = [
      ...document.querySelectorAll('[id^="gal"] a[href]'),
      ...document.querySelectorAll("a[data-gallery][href]"),
    ];

    const uniqueCandidates = [];
    const seen = new Set();
    for (const candidate of candidates) {
      if (!seen.has(candidate)) {
        seen.add(candidate);
        uniqueCandidates.push(candidate);
      }
    }

    const groups = new Map();
    uniqueCandidates.forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (!IMAGE_EXT_RE.test(href)) {
        return;
      }

      const key = link.getAttribute("data-gallery") || link.closest("[id]")?.id || "default";
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      const items = groups.get(key);
      items.push(link);
      link.dataset.maLightboxGroup = key;
      link.dataset.maLightboxIndex = String(items.length - 1);
    });

    if (!groups.size) {
      return;
    }

    const lightbox = createNodeFromHtml(`
      <div class="ma-lightbox" hidden>
        <button class="ma-lightbox-close" type="button" aria-label="Fermer">×</button>
        <button class="ma-lightbox-nav ma-lightbox-prev" type="button" aria-label="Image précédente">‹</button>
        <figure class="ma-lightbox-figure">
          <img class="ma-lightbox-image" alt="">
          <figcaption class="ma-lightbox-caption"></figcaption>
        </figure>
        <button class="ma-lightbox-nav ma-lightbox-next" type="button" aria-label="Image suivante">›</button>
      </div>
    `);
    document.body.appendChild(lightbox);

    const imageNode = lightbox.querySelector(".ma-lightbox-image");
    const captionNode = lightbox.querySelector(".ma-lightbox-caption");
    const prevButton = lightbox.querySelector(".ma-lightbox-prev");
    const nextButton = lightbox.querySelector(".ma-lightbox-next");
    const closeButton = lightbox.querySelector(".ma-lightbox-close");

    let activeGroup = null;
    let activeIndex = 0;

    const update = () => {
      const items = groups.get(activeGroup) || [];
      const item = items[activeIndex];
      if (!item) {
        return;
      }

      imageNode.src = item.href;
      imageNode.alt = item.querySelector("img")?.alt || item.getAttribute("title") || "";
      captionNode.textContent = item.getAttribute("title") || item.querySelector("img")?.alt || "";

      const hasMultiple = items.length > 1;
      prevButton.disabled = !hasMultiple;
      nextButton.disabled = !hasMultiple;
      prevButton.classList.toggle("is-hidden", !hasMultiple);
      nextButton.classList.toggle("is-hidden", !hasMultiple);
    };

    const open = (group, index) => {
      activeGroup = group;
      activeIndex = index;
      update();
      lightbox.hidden = false;
      requestAnimationFrame(() => lightbox.classList.add("is-open"));
      document.body.classList.add("ma-lightbox-open");
    };

    const close = () => {
      lightbox.classList.remove("is-open");
      document.body.classList.remove("ma-lightbox-open");
      window.setTimeout(() => {
        lightbox.hidden = true;
        imageNode.removeAttribute("src");
      }, 180);
    };

    const move = (delta) => {
      const items = groups.get(activeGroup) || [];
      if (items.length < 2) {
        return;
      }
      activeIndex = (activeIndex + delta + items.length) % items.length;
      update();
    };

    document.addEventListener(
      "click",
      (event) => {
        const link = event.target.closest("a[data-ma-lightbox-group]");
        if (!link) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        const group = link.dataset.maLightboxGroup;
        const index = Number.parseInt(link.dataset.maLightboxIndex || "0", 10);
        open(group, Number.isNaN(index) ? 0 : index);
      },
      true
    );

    closeButton.addEventListener("click", close);
    prevButton.addEventListener("click", () => move(-1));
    nextButton.addEventListener("click", () => move(1));
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        close();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (lightbox.hidden) {
        return;
      }
      if (event.key === "Escape") {
        close();
      } else if (event.key === "ArrowLeft") {
        move(-1);
      } else if (event.key === "ArrowRight") {
        move(1);
      }
    });
  }

  const slug = getCreationSlug();
  if (!slug) {
    return;
  }

  document.body.classList.add("creation-page");
  document.body.setAttribute("data-creation-page", "true");
  document.body.setAttribute("data-creation-slug", slug);

  cleanupSatyreVideoLeak(slug);
  normalizeLayout(slug);
  setupImageLightbox();
  setupCurtainAnimation();
})();
