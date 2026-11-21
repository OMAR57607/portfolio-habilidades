// Umbrales del índice de churn (días transcurridos / DERT promedio, en %).
// Los mismos cortes que el motor real; solo cambian las palabras con que se
// muestran, para que se entiendan sin conocer el vocabulario de BDC.
// `levelClass` elige el color en simulator.css, así sigue al tema activo.
const CHURN_LEVELS = [
    { min: 150, label: 'Crítico', levelClass: 'is-danger' },
    { min: 100, label: 'Muy alto', levelClass: 'is-orange' },
    { min: 80, label: 'Alto', levelClass: 'is-warning' },
    { min: -Infinity, label: 'Bajo', levelClass: 'is-healthy' },
];

const DIAS_POR_ANIO = 365;

function classifyChurn(churnPct) {
    return CHURN_LEVELS.find((level) => churnPct >= level.min);
}

// Clasificación CRT: retención pura, conquista, fuga pura y fuga conquista.
function classifyCrt(esActivo, isLocal) {
    if (esActivo && isLocal) return 'Cliente fiel (compró aquí y sigue viniendo)';
    if (esActivo) return 'Cliente ganado (compró en otra agencia y viene aquí)';
    if (isLocal) return 'Cliente perdido (compró aquí y ya no viene)';
    return 'Cliente externo que ya no viene';
}

// El orden de las reglas es el del motor real: la primera que se cumple decide.
// `variant` elige el color de la insignia en simulator.css.
function pickStrategy({ isTdm, esActivo, modelo, certKm, diasSinVenir, dertPromedio }) {
    if (isTdm) return { label: 'Llamar hoy para agendar su mantenimiento', variant: 'is-critical' };
    if (!esActivo) return { label: 'Invitarlo a regresar con una promoción', variant: 'is-recovery' };
    if (modelo === 'Hilux' && certKm >= 35000 && certKm <= 45000) {
        return { label: 'Ofrecerle el servicio de 40,000 km', variant: 'is-critical' };
    }
    if (diasSinVenir >= dertPromedio) return { label: 'Llamar pronto: ya le tocaba servicio', variant: 'is-warning' };
    if (diasSinVenir >= dertPromedio - 30) return { label: 'Recordarle que pronto le toca servicio', variant: 'is-warning' };
    return { label: 'Seguimiento normal', variant: 'is-healthy' };
}

function computeKpis({ kmActual, diasSinVenir, dertPromedio, modelo, isTdm, isLocal }) {
    // CERT: proyección del kilometraje a hoy, extrapolando el promedio diario.
    const kmDiario = kmActual > 0 ? kmActual / DIAS_POR_ANIO : 0;
    const certKm = Math.round(kmActual + kmDiario * diasSinVenir);

    const proximoServicio = certKm > 0
        ? `Servicio de ${(Math.ceil(certKm / 10000) * 10000).toLocaleString('es-MX')} km`
        : 'Primer servicio';

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

    setText('out-cert', `${results.certKm.toLocaleString('es-MX')} km`);
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
        outStrategy.textContent = results.estrategia.label;
        outStrategy.className = `strategy-badge ${results.estrategia.variant}`;
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
