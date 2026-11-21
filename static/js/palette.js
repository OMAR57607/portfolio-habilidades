import { THEME_EVENT } from './theme.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const EMAIL = 'desable9@gmail.com';
const WHATSAPP_URL = 'https://wa.me/522227703715';
const GITHUB_URL = 'https://github.com/OMAR57607';

// Búsqueda sin distinguir mayúsculas ni acentos: "ingenieria" encuentra "Ingeniería".
function normalize(text) {
    return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

function goTo(hash) {
    const target = document.querySelector(hash);
    if (!target) return;
    target.scrollIntoView();
    history.replaceState(null, '', hash);
}

function openExternal(url) {
    const win = window.open(url, '_blank');
    if (win) win.opener = null;
}

async function copyEmail() {
    try {
        await navigator.clipboard.writeText(EMAIL);
        return 'Correo copiado';
    } catch (e) {
        // Sin permiso de portapapeles: se abre el cliente de correo.
        window.location.href = `mailto:${EMAIL}`;
        return null;
    }
}

// Las secciones y los proyectos se leen del propio documento: si la página
// cambia, la paleta no se queda con una lista vieja.
function buildCommands() {
    const commands = [];

    document.querySelectorAll('.nav-menu .nav-link').forEach((link) => {
        commands.push({
            group: 'Ir a',
            label: link.textContent.trim(),
            icon: 'arrow-right',
            keywords: 'seccion ir',
            run: () => goTo(link.getAttribute('href')),
        });
    });

    document.querySelectorAll('.project-card').forEach((card) => {
        const title = card.querySelector('.project-title')?.textContent.trim();
        if (!title || !card.id) return;
        const tags = [...card.querySelectorAll('.tag')].map((t) => t.textContent).join(' ');
        commands.push({
            group: 'Proyectos',
            label: title,
            icon: 'code-xml',
            keywords: `proyecto ${tags}`,
            run: () => goTo(`#${card.id}`),
        });
    });

    commands.push(
        { group: 'Contacto', label: 'Escribir por WhatsApp', icon: 'whatsapp', keywords: 'mensaje chat telefono contratar', run: () => openExternal(WHATSAPP_URL) },
        { group: 'Contacto', label: 'Copiar correo', hint: EMAIL, icon: 'copy', keywords: 'email mail', run: copyEmail },
        { group: 'Contacto', label: 'Ver GitHub', icon: 'github', keywords: 'codigo repositorios', run: () => openExternal(GITHUB_URL) },
        { group: 'Preferencias', label: 'Tema claro', icon: 'sun', keywords: 'modo dia light', run: () => document.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: 'light' })) },
        { group: 'Preferencias', label: 'Tema oscuro', icon: 'moon', keywords: 'modo noche dark', run: () => document.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: 'dark' })) },
        { group: 'Preferencias', label: 'Tema del sistema', icon: 'sun-moon', keywords: 'modo automatico', run: () => document.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: 'system' })) },
        { group: 'Preferencias', label: 'Imprimir o guardar como PDF', icon: 'printer', keywords: 'cv curriculum hoja descargar', run: () => window.print() },
    );

    return commands.map((command, index) => ({
        ...command,
        id: `cmdk-opt-${index}`,
        haystack: normalize(`${command.label} ${command.group} ${command.keywords || ''} ${command.hint || ''}`),
    }));
}

function iconNode(name) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS(SVG_NS, 'use');
    use.setAttribute('href', `#i-${name}`);
    svg.appendChild(use);
    return svg;
}

export function initPalette() {
    const dialog = document.getElementById('cmdk');
    const input = document.getElementById('cmdk-input');
    const list = document.getElementById('cmdk-list');
    const empty = document.getElementById('cmdk-empty');
    const trigger = document.getElementById('cmdk-trigger');

    // Sin <dialog> nativo el botón se oculta: la navegación normal sigue ahí.
    if (!dialog || !input || !list || typeof dialog.showModal !== 'function') {
        trigger?.classList.add('hidden');
        return;
    }

    // En Mac el atajo se anuncia con su tecla.
    if (/Mac|iPhone|iPad/.test(navigator.platform)) {
        trigger?.querySelector('.cmdk-kbd')?.replaceChildren('⌘ K');
    }

    let commands = [];
    let visible = [];
    let activeIndex = 0;

    const setActive = (index) => {
        if (!visible.length) return;
        activeIndex = (index + visible.length) % visible.length;
        visible.forEach((command, i) => {
            const el = document.getElementById(command.id);
            const selected = i === activeIndex;
            el.setAttribute('aria-selected', String(selected));
            if (selected) el.scrollIntoView({ block: 'nearest' });
        });
        input.setAttribute('aria-activedescendant', visible[activeIndex].id);
    };

    const render = () => {
        const terms = normalize(input.value).split(/\s+/).filter(Boolean);
        visible = commands.filter((command) => terms.every((term) => command.haystack.includes(term)));

        list.replaceChildren();
        let lastGroup = null;
        visible.forEach((command, index) => {
            if (command.group !== lastGroup) {
                lastGroup = command.group;
                const heading = document.createElement('li');
                heading.className = 'cmdk-group';
                heading.setAttribute('role', 'presentation');
                heading.textContent = command.group;
                list.appendChild(heading);
            }
            const item = document.createElement('li');
            item.className = 'cmdk-item';
            item.id = command.id;
            item.setAttribute('role', 'option');
            item.appendChild(iconNode(command.icon));
            item.appendChild(document.createTextNode(command.label));
            if (command.hint) {
                const hint = document.createElement('span');
                hint.className = 'cmdk-item-hint';
                hint.textContent = command.hint;
                item.appendChild(hint);
            }
            item.addEventListener('click', () => execute(command));
            item.addEventListener('pointermove', () => {
                if (activeIndex !== index) setActive(index);
            });
            list.appendChild(item);
        });

        empty?.classList.toggle('hidden', visible.length > 0);
        if (visible.length) {
            setActive(0);
        } else {
            input.removeAttribute('aria-activedescendant');
        }
    };

    const open = () => {
        if (dialog.open) return;
        commands = buildCommands();
        input.value = '';
        dialog.showModal();
        render();
        input.focus();
    };

    const execute = (command) => {
        dialog.close();
        // Tras cerrar: el diálogo modal bloquearía el scroll hacia la sección.
        Promise.resolve(command.run()).then((message) => {
            if (typeof message === 'string' && trigger) {
                const label = trigger.querySelector('.cmdk-trigger-text');
                if (!label) return;
                const original = label.textContent;
                label.textContent = message;
                setTimeout(() => { label.textContent = original; }, 2200);
            }
        });
    };

    trigger?.addEventListener('click', open);

    document.addEventListener('keydown', (e) => {
        const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '');
        const isShortcut = (e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey);
        // "/" abre la paleta solo si no se está escribiendo en un campo.
        if (isShortcut || (e.key === '/' && !typing && !dialog.open)) {
            e.preventDefault();
            if (dialog.open) dialog.close(); else open();
        }
    });

    input.addEventListener('input', render);

    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive(activeIndex + 1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive(activeIndex - 1);
        } else if (e.key === 'Enter' && visible[activeIndex]) {
            e.preventDefault();
            execute(visible[activeIndex]);
        }
    });

    // Un clic en el fondo (fuera de la caja) cierra la paleta.
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.close();
    });
}
