// =========================================================================
// MESDAMES A. - THE CHOREOGRAPHY (main.js)
// Vanilla JS. Zero Dependencies.
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {

    /* -------------------------------------------------------------------------
       0. HERO BACKGROUND (per-page, resolved from HTML document path)
       data-hero-bg is set on <body> in each creation page.
       We apply it via JS to avoid CSS custom property URL resolution issues.
       ------------------------------------------------------------------------- */
    const heroBg = document.body.getAttribute('data-hero-bg');
    const heroSection = document.getElementById('creation-hero');
    if (heroBg && heroSection) {
        heroSection.style.backgroundImage = `linear-gradient(to bottom, transparent 50%, var(--void-black) 100%), url('${heroBg}')`;
        heroSection.style.backgroundSize = 'auto, cover';
        heroSection.style.backgroundPosition = 'center, center';
        heroSection.style.backgroundRepeat = 'no-repeat, no-repeat';
    }

    /* -------------------------------------------------------------------------
       1. THE RED DOT (Custom Cursor / Guide)
       ------------------------------------------------------------------------- */
    const dot = document.getElementById('red-dot');
    const trailDots = [];
    const trailLength = 10; // Number of trailing segments

    // Initialize trail pieces
    for (let i = 0; i < trailLength; i++) {
        const t = document.createElement('div');
        t.className = 'dot-trail';
        document.body.appendChild(t);
        trailDots.push({ el: t, x: 0, y: 0 });
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        const deltaY = window.scrollY - lastScrollY;
        // Add vertical inertia: dots stay slightly behind as the content moves
        dotY -= deltaY * 0.8;
        trailDots.forEach((t, i) => {
            t.y -= deltaY * (0.8 - (i * 0.05));
        });
        lastScrollY = window.scrollY;
    }, { passive: true });

    const animateTrail = () => {
        // Leader dot easing (smooth follow)
        dotX += (mouseX - dotX) * 0.25;
        dotY += (mouseY - dotY) * 0.25;
        dot.style.transform = `translate(calc(${dotX}px - 50%), calc(${dotY}px - 50%))`;

        let lastX = dotX;
        let lastY = dotY;

        // Animate each trail segment to follow the one before it
        trailDots.forEach((t, i) => {
            t.x += (lastX - t.x) * 0.35;
            t.y += (lastY - t.y) * 0.35;

            const sizeScale = (1 - (i / trailLength)) * 0.8;
            const opScale = (1 - (i / trailLength)) * 0.4;

            t.el.style.transform = `translate(calc(${t.x}px - 50%), calc(${t.y}px - 50%)) scale(${sizeScale})`;
            t.el.style.opacity = opScale;

            lastX = t.x;
            lastY = t.y;
        });

        requestAnimationFrame(animateTrail);
    };
    animateTrail();

    const updateInteractables = () => {
        const interactables = document.querySelectorAll('a, button, .hover-glow, .creation-item, [data-bespoke-lightbox], summary, .btn-support');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => dot.classList.add('hover-active'));
            el.addEventListener('mouseleave', () => dot.classList.remove('hover-active'));
        });
    };
    updateInteractables();

    /* -------------------------------------------------------------------------
       2. CLICKABLE CREATION ITEMS (Landing Page)
       ------------------------------------------------------------------------- */
    document.querySelectorAll('.creation-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.tagName.toLowerCase() === 'a' || e.target.closest('a')) return;
            const link = item.querySelector('.bespoke-link');
            if (link) window.location.href = link.getAttribute('href');
        });
    });

    /* -------------------------------------------------------------------------
       3. SCROLL REVEALS ("Out of the Dark")
       ------------------------------------------------------------------------- */
    const revealElements = document.querySelectorAll('.reveal-me, .creation-item, .team-member, .bio-focus, .contact-card, .socials');
    const observeReveals = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px 0px -15% 0px', threshold: 0.1 });

    revealElements.forEach(el => observeReveals.observe(el));
    setTimeout(() => { revealElements.forEach(el => el.classList.add('visible')); }, 2000);

    /* -------------------------------------------------------------------------
       4. NAVIGATION LOGIC
       ------------------------------------------------------------------------- */
    const nav = document.getElementById('main-nav');
    const menuToggle = document.getElementById('menu-toggle');
    const navDrawer = document.getElementById('nav-drawer');

    if (nav) {
        window.addEventListener('scroll', () => {
            nav.style.opacity = window.scrollY > 200 ? '0.7' : '1';
        }, { passive: true });
    }

    if (menuToggle && navDrawer) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navDrawer.classList.toggle('active');
            document.body.style.overflow = navDrawer.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking a link
        navDrawer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navDrawer.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    /* -------------------------------------------------------------------------
       5. BESPOKE LIGHTBOX (Simple, Robust)
       ------------------------------------------------------------------------- */
    const initLightbox = () => {
        const links = Array.from(document.querySelectorAll('[data-bespoke-lightbox]'));
        if (links.length === 0) return;

        let currentIndex = 0;
        let overlay = document.getElementById('lightbox-overlay');

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'lightbox-overlay';
            overlay.innerHTML = `
                <div class="lightbox-close">&times;</div>
                <div class="lightbox-prev" title="Précédent (←)">&larr;</div>
                <div class="lightbox-next" title="Suivant (→)">&rarr;</div>
                <div class="lightbox-content">
                    <img class="lightbox-img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="">
                    <div class="lightbox-caption mono-text"></div>
                </div>
            `;
            document.body.appendChild(overlay);

            const style = document.createElement('style');
            style.innerHTML = `
                #lightbox-overlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.98); z-index: 99999;
                    display: none; align-items: center; justify-content: center;
                }
                .lightbox-content {
                    position: relative; max-width: 90%; max-height: 90%;
                    display: flex; flex-direction: column; align-items: center;
                }
                .lightbox-img { 
                    max-width: 100%; max-height: 80vh; border-radius: 4px; 
                    box-shadow: 0 0 50px rgba(0,0,0,0.8); transition: opacity 0.2s ease-in-out;
                    opacity: 0;
                }
                .lightbox-caption {
                    margin-top: 20px; color: rgba(255,255,255,0.7); font-size: 0.9rem;
                    text-align: center; max-width: 600px; line-height: 1.4; opacity: 0; 
                    transition: opacity 0.2s;
                }
                .lightbox-caption .credit-label {
                    color: var(--red-dot); font-weight: 700; margin-right: 5px;
                    text-transform: uppercase; font-size: 0.75rem;
                }
                .lightbox-close { 
                    position: absolute; top: 20px; right: 30px; color: white; 
                    font-size: 50px; cursor: pointer; opacity: 0.5; z-index: 100001;
                }
                .lightbox-prev, .lightbox-next {
                    position: absolute; top: 50%; transform: translateY(-50%);
                    color: white; font-size: 40px; cursor: pointer; padding: 20px;
                    opacity: 0.3; transition: opacity 0.3s; z-index: 100001;
                }
                .lightbox-prev:hover, .lightbox-next:hover, .lightbox-close:hover { opacity: 1; }
                .lightbox-prev { left: 10px; }
                .lightbox-next { right: 10px; }
            `;
            document.head.appendChild(style);
        }

        const img = overlay.querySelector('.lightbox-img');
        const caption = overlay.querySelector('.lightbox-caption');

        const updateContent = (index) => {
            if (index < 0) index = links.length - 1;
            if (index >= links.length) index = 0;
            currentIndex = index;

            const target = links[currentIndex];
            if (!target) return;

            const targetUrl = target.getAttribute('href');
            const thumb = target.querySelector('img');
            let meta = target.getAttribute('title') || (thumb ? (thumb.getAttribute('alt') || thumb.getAttribute('title')) : '');

            // Immediate hide to prevent ghost images
            img.style.opacity = '0';
            caption.style.opacity = '0';

            setTimeout(() => {
                // Metadata logic
                if (meta) {
                    if (meta.includes('Crédit :')) {
                        const parts = meta.split('Crédit :');
                        caption.innerHTML = `${parts[0].trim()} <br> <span class="credit-label">Crédit :</span> ${parts[1].trim()}`;
                    } else {
                        caption.textContent = meta;
                    }
                } else {
                    caption.innerHTML = '';
                }

                // Reliability check: Clean source change
                img.onload = () => {
                    img.style.opacity = '1';
                    caption.style.opacity = '1';
                };
                img.onerror = () => {
                    caption.innerHTML = '<span class="credit-label">Notice</span> Fichier non trouvé';
                    caption.style.opacity = '1';
                };

                img.src = targetUrl;

                // Sync check for instant cached display
                if (img.complete && img.naturalWidth > 0) {
                    img.style.opacity = '1';
                    caption.style.opacity = '1';
                }
            }, 50);
        };

        // Navigation (overwriting previous listeners)
        overlay.querySelector('.lightbox-prev').onclick = (e) => { e.stopPropagation(); updateContent(currentIndex - 1); };
        overlay.querySelector('.lightbox-next').onclick = (e) => { e.stopPropagation(); updateContent(currentIndex + 1); };

        overlay.onclick = (e) => {
            if (e.target === overlay || e.target.classList.contains('lightbox-close')) {
                overlay.style.display = 'none';
                document.body.style.overflow = '';
            }
        };

        // Links
        links.forEach((link, idx) => {
            link.onclick = (e) => {
                e.preventDefault();
                overlay.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                updateContent(idx);
            };
        });

        // Keydown
        document.onkeydown = (e) => {
            if (overlay && overlay.style.display === 'flex') {
                if (e.key === 'ArrowLeft') updateContent(currentIndex - 1);
                if (e.key === 'ArrowRight') updateContent(currentIndex + 1);
                if (e.key === 'Escape') {
                    overlay.style.display = 'none';
                    document.body.style.overflow = '';
                }
            }
        };
    };

    initLightbox();
});

/* -------------------------------------------------------------------------
   6. REPERTOIRE HOVER BACKGROUNDS
   ------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    const bgLayer = document.getElementById('creations-bg-layer');
    const items = document.querySelectorAll('.creation-item');
    if (bgLayer && items.length > 0) {
        items.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const bgSrc = item.getAttribute('data-bg-src');
                if (bgSrc) {
                    bgLayer.style.backgroundImage = `linear-gradient(to right, var(--stage-floor) 0%, rgba(12, 12, 14, 0.4) 100%), url(${bgSrc})`;
                    bgLayer.style.opacity = '0.35';
                }
            });
            item.addEventListener('mouseleave', () => { bgLayer.style.opacity = '0'; });
        });
    }
});
