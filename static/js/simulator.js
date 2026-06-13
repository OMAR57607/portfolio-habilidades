export function initSimulator() {
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
                if (dialFill) {
                    const visualWidth = Math.min(churnPct, 100);
                    const offset = 100 - visualWidth;
                    dialFill.setAttribute('stroke-dashoffset', offset);
                    dialFill.style.stroke = progressBarColor;
                    dialFill.style.filter = `drop-shadow(0 0 5px ${progressBarColor})`;
                }
                
                const churnAlert = document.getElementById('out-churn-alert');
                if (churnAlert) {
                    churnAlert.innerText = alertaChurn;
                    churnAlert.className = `churn-alert-tag ${churnColorClass}`;
                }

                // Estrategia
                const outStrategy = document.getElementById('out-strategy');
                if (outStrategy) {
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
                }

                // Restaurar opacidad
                outResults.style.opacity = '1';
                outResults.style.transform = 'scale(1)';
                outResults.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
            }, 200);
        });
    }
}
