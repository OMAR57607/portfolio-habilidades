const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Scroll a partir del cual la cabecera gana fondo translúcido.
const HEADER_SCROLL_THRESHOLD = 12;

// Elementos que aparecen al entrar en pantalla.
const REVEAL_SELECTOR = [
    '.section-header',
    '.about-story',
    '.about-highlights',
    '.project-card',
    '.sim-glossary',
    '.simulator-card',
    '.simulator-results',
    '.patterns-grid',
    '.skills-grid',
    '.services-grid',
    '.services-cta',
    '.contact-info',
    '.contact-form-container',
].join(', ');

function initScrollProgress() {
    const scrollIndicator = document.getElementById('scroll-indicator');
    const header = document.getElementById('header-nav');
    if (!scrollIndicator && !header) return;

    let ticking = false;

    const update = () => {
        const scrollable = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
        // transform en vez de width: se compone en GPU y no provoca reflow.
        if (scrollIndicator) scrollIndicator.style.transform = `scaleX(${progress})`;
        header?.classList.toggle('is-scrolled', window.scrollY > HEADER_SCROLL_THRESHOLD);
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
    const elementsToAnimate = document.querySelectorAll(REVEAL_SELECTOR);

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
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    elementsToAnimate.forEach((el) => {
        el.classList.add('fade-in-hidden');
        observer.observe(el);
    });

    // Al imprimir no hay scroll: todo debe estar visible.
    window.addEventListener('beforeprint', () => {
        elementsToAnimate.forEach((el) => el.classList.add('fade-in-visible'));
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

export function initEffects() {
    initScrollProgress();
    initScrollReveal();
    initActiveSection();
}
