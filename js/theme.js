import { state } from './core/state.js';

export function initTheme() {
  setTheme(localStorage.getItem('theme') || 'dark');
}

export function setTheme(themeName) {
  state.theme = themeName;
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('theme', themeName);
}

