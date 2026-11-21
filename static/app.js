import { initTheme } from './js/theme.js';
import { initMenu } from './js/menu.js';
import { initSimulator } from './js/simulator.js';
import { initContact } from './js/contact.js';
import { initEffects } from './js/effects.js';

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMenu();
    initSimulator();
    initContact();
    initEffects();
});
