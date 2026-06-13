// Número de WhatsApp destino (código de país + número, sin "+" ni espacios)
const WHATSAPP_NUMBER = '522227703715';

export function initContact() {
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');
    const feedbackText = document.getElementById('form-feedback-text');

    if (contactForm && formFeedback) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('form-name').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const message = document.getElementById('form-msg').value.trim();

            const text = `Hola Omar, soy ${name}.\n\n${message}\n\nMi correo de contacto: ${email}\n— Enviado desde tu portfolio web`;
            const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

            // Abrir WhatsApp (app o Web); si el navegador bloquea la pestaña, navegar directo.
            // Nota: no usar el feature 'noopener' aquí porque window.open retornaría null
            // siempre y el fallback navegaría la pestaña actual ademas de abrir la nueva.
            const win = window.open(url, '_blank');
            if (win) {
                win.opener = null;
            } else {
                window.location.href = url;
            }

            if (feedbackText) {
                feedbackText.textContent = 'Abriendo WhatsApp con tu mensaje listo para enviar...';
            }
            formFeedback.classList.remove('hidden');
            contactForm.reset();

            setTimeout(() => {
                formFeedback.classList.add('hidden');
            }, 6000);
        });
    }
}
