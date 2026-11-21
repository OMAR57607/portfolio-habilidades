// Umbrales del índice de churn (días transcurridos / DERT promedio, en %).
// `levelClass` elige el color en simulator.css, así sigue al tema activo.
const CHURN_LEVELS = [
    { min: 150, label: '1. CHURN CONFIRMADO', levelClass: 'is-danger' },
    { min: 100, label: '2. RIESGO CRÍTICO', levelClass: 'is-orange' },
    { min: 80, label: '3. RIESGO ALTO', levelClass: 'is-warning' },
    { min: -Infinity, label: '4. SANO', levelClass: 'is-healthy' },
];

// Variante visual de la insignia según el prefijo numérico de la estrategia.
const STRATEGY_VARIANTS = {
    '0': 'is-critical',
    '1': 'is-critical',
    '2': 'is-warning',
    '3': 'is-warning',
    '5': 'is-recovery',
};

const DIAS_POR_ANIO = 365;

function classifyChurn(churnPct) {
    return CHURN_LEVELS.find((level) => churnPct >= level.min);
}

function classifyCrt(esActivo, isLocal) {
    if (esActivo && isLocal) return '1. RETENCIÓN PURA (VENDIDO AQUÍ Y ACTIVO)';
    if (esActivo) return '2. CONQUISTA (VENDIDO EN OTRA AGENCIA Y ACTIVO)';
    if (isLocal) return '3. FUGA PURA (VENDIDO AQUÍ Y PERDIDO)';
    return '4. FUGA CONQUISTA (CLIENTE EXTERNO PERDIDO)';
}

function pickStrategy({ isTdm, esActivo, modelo, certKm, diasSinVenir, dertPromedio }) {
    if (isTdm) return '0. CRÍTICO TDM';
    if (!esActivo) return '5. CAMPAÑA RECUPERACIÓN';
    if (modelo === 'Hilux' && certKm >= 35000 && certKm <= 45000) return '1. OPORTUNIDAD VIP: HILUX 40K';
    if (diasSinVenir >= dertPromedio) return '2. URGENCIA: CICLO VENCIDO';
    if (diasSinVenir >= dertPromedio - 30) return '3. PREVENTIVO: PRÓXIMO A VENCER';
    return '4. SEGUIMIENTO REGULAR';
}

function computeKpis({ kmActual, diasSinVenir, dertPromedio, modelo, isTdm, isLocal }) {
    // CERT: proyección del kilometraje a hoy, extrapolando el promedio diario.
    const kmDiario = kmActual > 0 ? kmActual / DIAS_POR_ANIO : 0;
    const certKm = Math.round(kmActual + kmDiario * diasSinVenir);

    const proximoServicio = certKm > 0
        ? `OFRECER PAQUETE DE ${(Math.ceil(certKm / 10000) * 10000).toLocaleString('es-MX')} KM`
        : 'OFRECER 1ER SERVICIO';

    const esActivo = diasSinVenir <= DIAS_POR_ANIO;
    const churnPct = Math.round((diasSinVenir / dertPromedio) * 100 * 100) / 100;

    return {
        certKm,
        proximoServicio,
        clasificacionCrt: classifyCrt(esActivo, isLocal),
        churnPct,
        churn: classifyChurn(churnPct),
        estrategia: pickStrategy({ isTdm, esActivo, modelo, certKm, diasSinVenir, dertPromedio }),
    };
}

function renderResults(results) {
    const outResults = document.getElementById('sim-results');
    if (!outResults) return;

    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    setText('out-cert', `${results.certKm.toLocaleString('es-MX')} KM`);
    setText('out-service', results.proximoServicio);
    setText('out-crt', results.clasificacionCrt);
    setText('out-churn-pct', `${results.churnPct}%`);

    const dialFill = document.getElementById('dial-fill');
    if (dialFill) {
        // El anillo se llena hasta 100% aunque el índice lo supere.
        dialFill.setAttribute('stroke-dashoffset', String(100 - Math.min(results.churnPct, 100)));
    }

    const dial = document.getElementById('churn-dial');
    if (dial) {
        dial.className = `churn-dial-container ${results.churn.levelClass}`;
    }

    const churnAlert = document.getElementById('out-churn-alert');
    if (churnAlert) {
        churnAlert.textContent = results.churn.label;
        churnAlert.className = `churn-alert-tag ${results.churn.levelClass}`;
    }

    const outStrategy = document.getElementById('out-strategy');
    if (outStrategy) {
        outStrategy.textContent = results.estrategia;
        const variant = STRATEGY_VARIANTS[results.estrategia.charAt(0)] || 'is-healthy';
        outStrategy.className = `strategy-badge ${variant}`;
    }
}

// Lee el formulario saneando la entrada: nunca llegan NaN ni negativos al motor.
function readInputs() {
    const number = (id, fallback, min) => {
        const value = parseFloat(document.getElementById(id).value);
        return Number.isFinite(value) ? Math.max(value, min) : fallback;
    };

    return {
        kmActual: number('input-km', 0, 0),
        diasSinVenir: Math.round(number('input-days', 0, 0)),
        dertPromedio: Math.round(number('input-interval', 180, 1)),
        modelo: document.getElementById('select-model').value,
        isTdm: document.getElementById('check-tdm').checked,
        isLocal: document.getElementById('check-local').checked,
    };
}

export function initSimulator() {
    const form = document.getElementById('bdc-sim-form');
    const outResults = document.getElementById('sim-results');
    if (!form) return;

    let flashTimer = null;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const results = computeKpis(readInputs());

        if (!outResults) {
            renderResults(results);
            return;
        }

        // Parpadeo breve del panel para que se note que hubo un recálculo.
        outResults.classList.add('is-recalculating');
        clearTimeout(flashTimer);
        flashTimer = setTimeout(() => {
            renderResults(results);
            outResults.classList.remove('is-recalculating');
        }, 200);
    });

    // Recalcula en vivo al editar cualquier dato, sin esperar al botón.
    form.addEventListener('input', () => renderResults(computeKpis(readInputs())));

    // La salida inicial sale del mismo motor: el HTML nunca se desincroniza.
    renderResults(computeKpis(readInputs()));
}
