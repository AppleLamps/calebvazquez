import { state } from '../core/state.js';
import { elements } from '../core/dom.js';
import { calculateDefaultZoom, triggerZoomChange } from '../pdf/zoom.js';

export function toggleSidebar() {
  state.sidebarCollapsed = !state.sidebarCollapsed;
  elements.sidebar.classList.toggle('collapsed', state.sidebarCollapsed);

  setTimeout(async () => {
    await calculateDefaultZoom();
    triggerZoomChange();
  }, parseInt(getComputedStyle(document.documentElement).getPropertyValue('--transition-speed')) * 1000);
}
