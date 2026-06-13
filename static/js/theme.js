export function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeDropdown = document.getElementById('theme-dropdown');
    const dropdownItems = document.querySelectorAll('.theme-dropdown-item');
    
    const applyTheme = (theme) => {
        let activeTheme = theme;
        
        if (theme === 'system') {
            const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
            activeTheme = prefersLight ? 'light' : 'dark';
        }
        
        if (activeTheme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
        
        // Actualizar el icono del botón principal
        if (themeToggleBtn) {
            const mainIcon = themeToggleBtn.querySelector('i');
            if (mainIcon) {
                if (theme === 'light') {
                    mainIcon.className = 'fa-solid fa-sun';
                } else if (theme === 'dark') {
                    mainIcon.className = 'fa-solid fa-moon';
                } else {
                    mainIcon.className = 'fa-solid fa-circle-half-stroke';
                }
            }
        }
        
        // Marcar el item activo en el dropdown
        dropdownItems.forEach(item => {
            if (item.getAttribute('data-theme') === theme) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    };

    // Determinar tema inicial
    const savedTheme = localStorage.getItem('theme') || 'system';
    applyTheme(savedTheme);

    // Toggle dropdown al hacer clic en el botón principal
    if (themeToggleBtn && themeDropdown) {
        themeToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = themeToggleBtn.getAttribute('aria-expanded') === 'true';
            themeToggleBtn.setAttribute('aria-expanded', !isExpanded);
            themeDropdown.classList.toggle('show');
        });
        
        // Cerrar al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!themeToggleBtn.contains(e.target) && !themeDropdown.contains(e.target)) {
                themeDropdown.classList.remove('show');
                themeToggleBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Listener para los items del dropdown
    dropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            const selectedTheme = item.getAttribute('data-theme');
            localStorage.setItem('theme', selectedTheme);
            applyTheme(selectedTheme);
            themeDropdown.classList.remove('show');
            themeToggleBtn.setAttribute('aria-expanded', 'false');
        });
    });

    // Escuchar cambios en la preferencia del sistema en tiempo real
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
        const currentStored = localStorage.getItem('theme') || 'system';
        if (currentStored === 'system') {
            applyTheme('system');
        }
    });
}
