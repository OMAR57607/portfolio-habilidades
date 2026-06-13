export function initContact() {
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');

    if (contactForm && formFeedback) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Simular carga de envío
            const btnSubmit = contactForm.querySelector('button[type="submit"]');
            const originalHTML = btnSubmit.innerHTML;
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

            setTimeout(() => {
                // Restaurar botón
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = originalHTML;
                
                // Mostrar feedback
                formFeedback.classList.remove('hidden');
                contactForm.reset();

                // Ocultar feedback a los 5 segundos
                setTimeout(() => {
                    formFeedback.classList.add('hidden');
                }, 5000);
            }, 1200);
        });
    }
}
