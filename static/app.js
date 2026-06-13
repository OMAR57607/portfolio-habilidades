import { initTheme } from './js/theme.js';
import { initMenu } from './js/menu.js';
import { initSkills } from './js/skills.js';
import { initSimulator } from './js/simulator.js';
import { initContact } from './js/contact.js';
import { initEffects } from './js/effects.js';

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMenu();
    initSkills();
    initSimulator();
    initContact();
    initEffects();
});
