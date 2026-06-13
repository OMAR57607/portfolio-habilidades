export function initEffects() {
    // 1. SCROLL PROGRESS INDICATOR BAR
    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        const scrollIndicator = document.getElementById('scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.style.width = scrolled + '%';
        }
    });

    // 2. ANIMACIONES AL HACER SCROLL (INTERSECTION OBSERVER)
    const elementsToAnimate = document.querySelectorAll('.project-card, .glass-panel, .section-header');
    
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        elementsToAnimate.forEach(el => {
            el.classList.add('fade-in-hidden');
            observer.observe(el);
        });
    }

    // 3. EFECTO DE INCLINACIÓN 3D DINÁMICO (3D TILT EFFECT)
    const isTouchDevice = !window.matchMedia('(hover: hover)').matches;
    
    if (!isTouchDevice) {
        const cardsToTilt = document.querySelectorAll('.project-card, .simulator-card, .simulator-results');
        
        cardsToTilt.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((centerY - y) / centerY) * 6;
                const rotateY = ((x - centerX) / centerX) * 6;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.01)`;
                card.style.transition = 'transform 0.08s ease-out';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
                card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            });
        });
    }
}
