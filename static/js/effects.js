const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Scroll a partir del cual la cabecera gana fondo translúcido.
const HEADER_SCROLL_THRESHOLD = 12;

// Elementos que aparecen al entrar en pantalla.
const REVEAL_SELECTOR = [
    '.section-header',
    '.marquee',
    '.about-story',
    '.about-highlight-item',
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

// Tarjetas que reciben la luz que sigue al cursor (estilos en effects.css).
const SPOT_SELECTOR = [
    '.project-card',
    '.about-story',
    '.about-highlight-item',
    '.service-card',
    '.pattern-card',
    '.skill-group',
    '.cert-card',
    '.simulator-card',
    '.simulator-results',
    '.contact-info',
    '.contact-form-container',
].join(', ');

// Duración del conteo animado de las cifras de la portada.
const COUNT_MS = 1400;

function initSpotlight() {
    // Solo con puntero fino: en pantallas táctiles no hay cursor que seguir.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    document.querySelectorAll(SPOT_SELECTOR).forEach((card) => {
        card.classList.add('spot');
        let frame = null;

        card.addEventListener('pointermove', (e) => {
            if (frame) return;
            frame = requestAnimationFrame(() => {
                frame = null;
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
                card.style.setProperty('--my', `${e.clientY - rect.top}px`);
            });
        }, { passive: true });
    });
}

function initCountUp() {
    const counters = document.querySelectorAll('[data-count]');
    // El HTML ya trae la cifra final: sin animación, el dato sigue siendo correcto.
    if (!counters.length || reducedMotion.matches || !('IntersectionObserver' in window)) return;

    const format = new Intl.NumberFormat('es-MX');

    const run = (el) => {
        const target = Number(el.dataset.count);
        if (!Number.isFinite(target)) return;
        const start = performance.now();

        const tick = (now) => {
            const t = Math.min((now - start) / COUNT_MS, 1);
            // Desaceleración cúbica: arranca rápido y se asienta en la cifra.
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = format.format(Math.round(target * eased));
            if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                run(entry.target);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.6 });

    counters.forEach((el) => observer.observe(el));
}

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
    initSpotlight();
    initCountUp();
}
