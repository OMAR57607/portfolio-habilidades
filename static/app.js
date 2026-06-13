/* ==========================================================================
   LÓGICA DEL PORTFOLIO Y SIMULADOR BDC — OMAR FUENTES
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. MENU MÓVIL (TALLER AUTOMOTRIZ STYLE)
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('mobile-open');
            const isOpen = navMenu.classList.contains('mobile-open');
            mobileToggle.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
        });

        // Cerrar menú al hacer clic en un enlace
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('mobile-open');
                mobileToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
            });
        });
    }

    // 2. FILTRADO DE TECH STACK (HABILIDADES)
    const filterButtons = document.querySelectorAll('.filter-btn');
    const skillCards = document.querySelectorAll('.skill-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Quitar clase activa
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            skillCards.forEach(card => {
                const categories = card.getAttribute('data-category').split(' ');
                
                if (filterValue === 'all' || categories.includes(filterValue)) {
                    card.style.display = 'flex';
                    // Pequeña animación de entrada
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    }, 50);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // 3. MOTOR MATEMÁTICO DEL SIMULADOR BDC (JS RECREATION OF PYTHON LOGIC)
    const btnRunSim = document.getElementById('btn-run-sim');
    if (btnRunSim) {
        btnRunSim.addEventListener('click', () => {
            // Inputs
            const kmActual = parseFloat(document.getElementById('input-km').value) || 0;
            const diasSinVenir = parseInt(document.getElementById('input-days').value) || 0;
            const dertPromedio = parseInt(document.getElementById('input-interval').value) || 180;
            const modelo = document.getElementById('select-model').value;
            const isTdm = document.getElementById('check-tdm').checked;
            const isLocal = document.getElementById('check-local').checked;

            // --- CÁLCULO 1: CERT (Kilometraje Proyectado Hoy) ---
            // Asumimos un uso diario estándar de km basado en el historial: kmActual / 365 días al año
            const kmDiario = kmActual > 0 ? (kmActual / 365) : 0;
            const certKm = Math.round(kmActual + (kmDiario * diasSinVenir));
            
            // --- CÁLCULO 2: Próximo Paquete de Servicio ---
            let proximoServicio = "OFRECER 1ER SERVICIO";
            if (certKm > 0) {
                const paqueteBase = Math.ceil(certKm / 10000) * 10000;
                proximoServicio = `OFRECER PAQUETE DE ${paqueteBase.toLocaleString('es-MX')} KM`;
            }

            // --- CÁLCULO 3: Clasificación CRT ---
            let clasificacionCrt = "";
            const esActivo = diasSinVenir <= 365;
            if (esActivo && isLocal) {
                clasificacionCrt = "1. RETENCIÓN PURA (VENDIDO AQUÍ Y ACTIVO)";
            } else if (esActivo && !isLocal) {
                clasificacionCrt = "2. CONQUISTA (VENDIDO EN OTRA AGENCIA Y ACTIVO)";
            } else if (!esActivo && isLocal) {
                clasificacionCrt = "3. FUGA PURA (VENDIDO AQUÍ Y PERDIDO)";
            } else {
                clasificacionCrt = "4. FUGA CONQUISTA (CLIENTE EXTERNO PERDIDO)";
            }

            // --- CÁLCULO 4: Índice Churn ---
            const churnPct = Math.round((diasSinVenir / dertPromedio) * 100 * 100) / 100;
            let alertaChurn = "4. SANO";
            let churnColorClass = "text-green";
            let progressBarColor = "#10b981"; // Verde

            if (churnPct >= 150) {
                alertaChurn = "1. CHURN CONFIRMADO";
                churnColorClass = "text-red";
                progressBarColor = "#ef4444"; // Rojo
            } else if (churnPct >= 100) {
                alertaChurn = "2. RIESGO CRÍTICO";
                churnColorClass = "text-red";
                progressBarColor = "#f97316"; // Naranja
            } else if (churnPct >= 80) {
                alertaChurn = "3. RIESGO ALTO";
                churnColorClass = "text-yellow";
                progressBarColor = "#eab308"; // Amarillo
            }

            // --- CÁLCULO 5: Estrategia de Llamada (Acción Estratégica) ---
            let estrategia = "4. SEGUIMIENTO REGULAR";
            
            if (isTdm) {
                estrategia = "0. CRÍTICO TDM";
            } else if (!esActivo) {
                estrategia = "5. CAMPAÑA RECUPERACIÓN";
            } else if (modelo === 'Hilux' && certKm >= 35000 && certKm <= 45000) {
                estrategia = "1. OPORTUNIDAD VIP: HILUX 40K";
            } else if (diasSinVenir >= dertPromedio) {
                estrategia = "2. URGENCIA: CICLO VENCIDO";
            } else if (diasSinVenir >= (dertPromedio - 30)) {
                estrategia = "3. PREVENTIVO: PRÓXIMO A VENCER";
            }

            // --- RENDERIZADO DE RESULTADOS CON ANIMACIÓN ---
            const outResults = document.getElementById('sim-results');
            outResults.style.opacity = '0.4';
            outResults.style.transform = 'scale(0.98)';
            
            setTimeout(() => {
                // Escribir valores
                document.getElementById('out-cert').innerText = `${certKm.toLocaleString('es-MX')} KM`;
                document.getElementById('out-service').innerText = proximoServicio;
                document.getElementById('out-crt').innerText = clasificacionCrt;
                
                // Churn Pct y Dial Circular
                document.getElementById('out-churn-pct').innerText = `${churnPct}%`;
                
                const dialFill = document.getElementById('dial-fill');
                const visualWidth = Math.min(churnPct, 100);
                const offset = 100 - visualWidth;
                dialFill.setAttribute('stroke-dashoffset', offset);
                dialFill.style.stroke = progressBarColor;
                dialFill.style.filter = `drop-shadow(0 0 5px ${progressBarColor})`;

                
                const churnAlert = document.getElementById('out-churn-alert');
                churnAlert.innerText = alertaChurn;
                // Quitar clases y poner la correcta
                churnAlert.className = `churn-alert-tag ${churnColorClass}`;

                // Estrategia
                const outStrategy = document.getElementById('out-strategy');
                outStrategy.innerText = estrategia;
                
                // Color dinámico de la tarjeta de estrategia
                if (estrategia.startsWith("0.") || estrategia.startsWith("1.")) {
                    outStrategy.style.borderColor = "var(--primary-color)";
                    outStrategy.style.color = "#ff3e55";
                    outStrategy.style.background = "rgba(235, 10, 30, 0.12)";
                } else if (estrategia.startsWith("2.") || estrategia.startsWith("3.")) {
                    outStrategy.style.borderColor = "#fbbf24";
                    outStrategy.style.color = "#fbbf24";
                    outStrategy.style.background = "rgba(251, 191, 36, 0.1)";
                } else if (estrategia.startsWith("5.")) {
                    outStrategy.style.borderColor = "#8b5cf6";
                    outStrategy.style.color = "#a78bfa";
                    outStrategy.style.background = "rgba(139, 92, 246, 0.1)";
                } else {
                    outStrategy.style.borderColor = "#10b981";
                    outStrategy.style.color = "#34d399";
                    outStrategy.style.background = "rgba(16, 185, 129, 0.1)";
                }

                // Restaurar opacidad
                outResults.style.opacity = '1';
                outResults.style.transform = 'scale(1)';
                outResults.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
            }, 200);
        });
    }

    // 4. FORMULARIO DE CONTACTO SIMULADO
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

    // 5. ANIMACIONES AL HACER SCROLL (INTERSECTION OBSERVER)
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
                    observer.unobserve(entry.target); // Dejar de observar una vez animado
                }
            });
        }, observerOptions);

        elementsToAnimate.forEach(el => {
            el.classList.add('fade-in-hidden');
            observer.observe(el);
        });
    }

    // 6. SCROLL PROGRESS INDICATOR BAR
    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        const scrollIndicator = document.getElementById('scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.style.width = scrolled + '%';
        }
    });

    // 7. EFECTO DE INCLINACIÓN 3D DINÁMICO (3D TILT EFFECT)
    // Solo activado para dispositivos con mouse (hover) para evitar fallas en móviles
    const isTouchDevice = !window.matchMedia('(hover: hover)').matches;
    
    if (!isTouchDevice) {
        const cardsToTilt = document.querySelectorAll('.project-card, .simulator-card, .simulator-results');
        
        cardsToTilt.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left; // posición x dentro del elemento
                const y = e.clientY - rect.top;  // posición y dentro del elemento
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Calculamos la rotación (máximo 6 grados de inclinación para sutileza premium)
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
});

// CSS inyectado para soporte de Intersection Observer Animations
const style = document.createElement('style');
style.innerHTML = `
    .fade-in-hidden {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .fade-in-visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);
