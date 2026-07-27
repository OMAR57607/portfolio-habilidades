export function initSkills() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const skillCards = document.querySelectorAll('.skill-card');

    if (!filterButtons.length || !skillCards.length) return;

    const applyFilter = (filterValue) => {
        skillCards.forEach((card) => {
            const categories = (card.getAttribute('data-category') || '').split(' ');
            const matches = filterValue === 'all' || categories.includes(filterValue);
            // `hidden` saca la tarjeta del árbol de accesibilidad, no solo de la vista.
            card.hidden = !matches;
            card.classList.toggle('is-entering', matches);
        });

        // Reinicia la animación de entrada en el siguiente frame.
        requestAnimationFrame(() => {
            skillCards.forEach((card) => card.classList.remove('is-entering'));
        });
    };

    filterButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            filterButtons.forEach((b) => {
                const isActive = b === btn;
                b.classList.toggle('active', isActive);
                b.setAttribute('aria-pressed', String(isActive));
            });

            applyFilter(btn.getAttribute('data-filter'));
        });
    });
}
