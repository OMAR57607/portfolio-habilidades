export function initMenu() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (!mobileToggle || !navMenu) return;

    const setOpen = (isOpen) => {
        navMenu.classList.toggle('mobile-open', isOpen);
        mobileToggle.setAttribute('aria-expanded', String(isOpen));
        mobileToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
        // El icono (hamburguesa / X) lo resuelve el CSS a partir de aria-expanded.
    };

    mobileToggle.addEventListener('click', () => {
        setOpen(!navMenu.classList.contains('mobile-open'));
    });

    navMenu.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('mobile-open')) {
            setOpen(false);
            mobileToggle.focus();
        }
    });
}
