// =========================================================================
// MESDAMES A. - THE CHOREOGRAPHY (main.js)
// Vanilla JS. Zero Dependencies.
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {

    /* -------------------------------------------------------------------------
       1. THE RED DOT (Custom Cursor / Guide)
       ------------------------------------------------------------------------- */
    const dot = document.getElementById('red-dot');

    document.addEventListener('mousemove', (e) => {
        dot.style.transform = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
    });

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
       5. BESPOKE LIGHTBOX (Zero dependencies, with navigation)
       ------------------------------------------------------------------------- */
    const initLightbox = () => {
        const lightboxLinks = Array.from(document.querySelectorAll('[data-bespoke-lightbox]'));
        if (lightboxLinks.length === 0) return;

        let currentIndex = 0;
        let overlay = document.getElementById('lightbox-overlay');

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'lightbox-overlay';
            overlay.innerHTML = `
                <div class="lightbox-close">&times;</div>
                <div class="lightbox-prev" title="Précédent (←)">&larr;</div>
                <div class="lightbox-next" title="Suivant (→)">&rarr;</div>
                <img class="lightbox-img" src="" alt="Gallery Image">
            `;
            document.body.appendChild(overlay);

            const style = document.createElement('style');
            style.innerHTML = `
                #lightbox-overlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.95); z-index: 99999;
                    display: none; align-items: center; justify-content: center;
                    cursor: auto;
                }
                .lightbox-img { max-width: 85%; max-height: 85%; border-radius: 4px; box-shadow: 0 0 50px rgba(0,0,0,0.8); transition: opacity 0.3s ease; }
                .lightbox-close { 
                    position: absolute; top: 20px; right: 30px; color: white; 
                    font-size: 50px; cursor: pointer; font-family: sans-serif; opacity: 0.5; z-index: 100001;
                }
                .lightbox-close:hover { opacity: 1; }
                .lightbox-prev, .lightbox-next {
                    position: absolute; top: 50%; transform: translateY(-50%);
                    color: white; font-size: 40px; cursor: pointer; padding: 20px;
                    opacity: 0.3; transition: opacity 0.3s; z-index: 100001;
                    font-family: 'Space Mono', monospace;
                }
                .lightbox-prev:hover, .lightbox-next:hover { opacity: 1; }
                .lightbox-prev { left: 20px; }
                .lightbox-next { right: 20px; }
            `;
            document.head.appendChild(style);

            const showImage = (index) => {
                if (index < 0) index = lightboxLinks.length - 1;
                if (index >= lightboxLinks.length) index = 0;
                currentIndex = index;
                const img = overlay.querySelector('.lightbox-img');
                img.style.opacity = '0';
                setTimeout(() => {
                    const targetLink = lightboxLinks[currentIndex];
                    if (targetLink) {
                        img.src = targetLink.getAttribute('href');
                        img.style.opacity = '1';
                    }
                }, 150);
            };

            overlay.querySelector('.lightbox-close').addEventListener('click', () => {
                overlay.style.display = 'none';
                document.body.style.overflow = '';
            });

            overlay.querySelector('.lightbox-prev').addEventListener('click', (e) => {
                e.stopPropagation();
                showImage(currentIndex - 1);
            });

            overlay.querySelector('.lightbox-next').addEventListener('click', (e) => {
                e.stopPropagation();
                showImage(currentIndex + 1);
            });

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.style.display = 'none';
                    document.body.style.overflow = '';
                }
            });

            document.addEventListener('keydown', (e) => {
                if (overlay && overlay.style.display === 'flex') {
                    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
                    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
                    if (e.key === 'Escape') {
                        overlay.style.display = 'none';
                        document.body.style.overflow = '';
                    }
                }
            });
        }

        // Re-attach listeners to ensure all links (including new ones) work
        lightboxLinks.forEach((link, index) => {
            // Remove old listener if re-initializing
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);

            newLink.addEventListener('click', (e) => {
                e.preventDefault();
                currentIndex = index;
                const overlayImg = overlay.querySelector('.lightbox-img');
                overlayImg.src = newLink.getAttribute('href');
                overlay.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            });
        });
    };

    initLightbox();
});

/* -------------------------------------------------------------------------
   6. REPERTOIRE HOVER BACKGROUNDS
   ------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    const bgLayer = document.getElementById('repertoire-bg-layer');
    const items = document.querySelectorAll('.creation-item');
    if (bgLayer && items.length > 0) {
        items.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const bgSrc = item.getAttribute('data-bg-src');
                if (bgSrc) {
                    bgLayer.style.backgroundImage = `linear-gradient(to right, var(--stage-floor) 20%, rgba(12, 12, 14, 0.4) 100%), url(${bgSrc})`;
                    bgLayer.style.opacity = '0.35';
                }
            });
            item.addEventListener('mouseleave', () => { bgLayer.style.opacity = '0'; });
        });
    }
});
