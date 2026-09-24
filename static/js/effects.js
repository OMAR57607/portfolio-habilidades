const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Grado máximo de inclinación del efecto 3D.
const TILT_DEG = 6;

function initScrollProgress() {
    const scrollIndicator = document.getElementById('scroll-indicator');
    if (!scrollIndicator) return;

    let ticking = false;

    const update = () => {
        const scrollable = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
        scrollIndicator.style.width = `${scrolled}%`;
        ticking = false;
    };

    // Un solo cálculo por frame: el evento de scroll se dispara muchas más veces.
    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }, { passive: true });

    update();
}

function initScrollReveal() {
    const elementsToAnimate = document.querySelectorAll('.project-card, .glass-panel, .section-header');

    // Sin IntersectionObserver o con movimiento reducido, el contenido se
    // muestra tal cual: nunca se queda invisible.
    if (!('IntersectionObserver' in window) || reducedMotion.matches) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    elementsToAnimate.forEach((el) => {
        el.classList.add('fade-in-hidden');
        observer.observe(el);
    });
}

function initTilt() {
    const supportsHover = window.matchMedia('(hover: hover)').matches;
    if (!supportsHover || reducedMotion.matches) return;

    document.querySelectorAll('.project-card, .simulator-card, .simulator-results').forEach((card) => {
        let frame = null;

        card.addEventListener('mousemove', (e) => {
            if (frame) return;
            frame = requestAnimationFrame(() => {
                frame = null;
                const rect = card.getBoundingClientRect();
                const rotateX = ((rect.height / 2 - (e.clientY - rect.top)) / (rect.height / 2)) * TILT_DEG;
                const rotateY = (((e.clientX - rect.left) - rect.width / 2) / (rect.width / 2)) * TILT_DEG;

                card.style.transition = 'transform 0.08s ease-out';
                card.style.transform =
                    `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.01)`;
            });
        });

        card.addEventListener('mouseleave', () => {
            if (frame) {
                cancelAnimationFrame(frame);
                frame = null;
            }
            card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
        });
    });
}

function initActiveSection() {
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = new Map();
    document.querySelectorAll('.nav-menu .nav-link').forEach((link) => {
        navLinks.set(link.getAttribute('href'), link);
    });

    if (!sections.length || !navLinks.size || !('IntersectionObserver' in window)) return;

    // Marca en la barra de navegación la sección que se está leyendo.
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const link = navLinks.get(`#${entry.target.id}`);
            if (!link) return;
            link.classList.toggle('is-current', entry.isIntersecting);
            if (entry.isIntersecting) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach((section) => observer.observe(section));
}

function initFloatingCta() {
    const cta = document.getElementById('floating-cta');
    const hero = document.getElementById('inicio');
    const contact = document.getElementById('contacto');
    if (!cta || !hero || !('IntersectionObserver' in window)) return;

    // Solo aparece cuando los CTA del hero ya no se ven y aún no se llega a
    // Contacto, donde duplicaría el formulario.
    const visible = new Set();
    const update = () => {
        const show = !visible.has(hero) && !visible.has(contact);
        cta.classList.toggle('is-visible', show);
        // Oculto también para lectores de pantalla y teclado mientras no se muestra.
        cta.setAttribute('aria-hidden', String(!show));
        cta.tabIndex = show ? 0 : -1;
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                visible.add(entry.target);
            } else {
                visible.delete(entry.target);
            }
        });
        update();
    }, { threshold: 0.1 });

    observer.observe(hero);
    if (contact) observer.observe(contact);
}

export function initEffects() {
    initScrollProgress();
    initScrollReveal();
    initTilt();
    initActiveSection();
    initFloatingCta();
}
