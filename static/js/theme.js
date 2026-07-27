const STORAGE_KEY = 'theme';
const THEME_ICONS = {
    light: 'fa-solid fa-sun',
    dark: 'fa-solid fa-moon',
    system: 'fa-solid fa-circle-half-stroke',
};

const lightMediaQuery = window.matchMedia('(prefers-color-scheme: light)');

function readStoredTheme() {
    try {
        return localStorage.getItem(STORAGE_KEY) || 'system';
    } catch (e) {
        return 'system';
    }
}

function storeTheme(theme) {
    try {
        localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
        /* localStorage bloqueado: el tema solo dura esta sesión */
    }
}

export function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeDropdown = document.getElementById('theme-dropdown');
    const dropdownItems = document.querySelectorAll('.theme-dropdown-item');

    // La clase vive en <html>, igual que en el script del <head> que evita el
    // parpadeo de tema en la primera carga.
    const applyTheme = (theme) => {
        const isLight = theme === 'light' || (theme === 'system' && lightMediaQuery.matches);
        document.documentElement.classList.toggle('light-theme', isLight);

        const mainIcon = themeToggleBtn?.querySelector('i');
        if (mainIcon) {
            mainIcon.className = THEME_ICONS[theme] || THEME_ICONS.system;
        }

        dropdownItems.forEach((item) => {
            const isActive = item.getAttribute('data-theme') === theme;
            item.classList.toggle('active', isActive);
            item.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
    };

    const closeDropdown = () => {
        themeDropdown?.classList.remove('show');
        themeToggleBtn?.setAttribute('aria-expanded', 'false');
    };

    applyTheme(readStoredTheme());

    if (themeToggleBtn && themeDropdown) {
        themeToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = themeToggleBtn.getAttribute('aria-expanded') === 'true';
            themeToggleBtn.setAttribute('aria-expanded', String(!isExpanded));
            themeDropdown.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!themeToggleBtn.contains(e.target) && !themeDropdown.contains(e.target)) {
                closeDropdown();
            }
        });

        // Escape cierra el menú y devuelve el foco al botón que lo abrió.
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && themeDropdown.classList.contains('show')) {
                closeDropdown();
                themeToggleBtn.focus();
            }
        });
    }

    dropdownItems.forEach((item) => {
        item.addEventListener('click', () => {
            storeTheme(item.getAttribute('data-theme'));
            applyTheme(item.getAttribute('data-theme'));
            closeDropdown();
            themeToggleBtn?.focus();
        });
    });

    // Si el usuario dejó "Sistema", seguir los cambios del sistema en vivo.
    lightMediaQuery.addEventListener('change', () => {
        if (readStoredTheme() === 'system') {
            applyTheme('system');
        }
    });
}
