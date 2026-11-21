// Punto de corte del menú móvil: debe coincidir con header.css.
const DESKTOP_QUERY = '(min-width: 901px)';

export function initMenu() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const header = document.getElementById('header-nav');

    if (!mobileToggle || !navMenu) return;

    const toggleIcon = mobileToggle.querySelector('use');

    const setOpen = (isOpen) => {
        navMenu.classList.toggle('mobile-open', isOpen);
        header?.classList.toggle('is-menu-open', isOpen);
        mobileToggle.setAttribute('aria-expanded', String(isOpen));
        mobileToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
        toggleIcon?.setAttribute('href', isOpen ? '#i-x' : '#i-menu');
    };

    const isOpen = () => navMenu.classList.contains('mobile-open');

    mobileToggle.addEventListener('click', () => setOpen(!isOpen()));

    navMenu.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => setOpen(false));
    });

    // Un toque fuera de la cabecera cierra el menú.
    document.addEventListener('click', (e) => {
        if (isOpen() && header && !header.contains(e.target)) {
            setOpen(false);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen()) {
            setOpen(false);
            mobileToggle.focus();
        }
    });

    // Al pasar a escritorio (rotar, redimensionar) el menú no se queda abierto.
    window.matchMedia(DESKTOP_QUERY).addEventListener('change', (e) => {
        if (e.matches) setOpen(false);
    });
}
