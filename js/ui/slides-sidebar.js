import { state } from '../core/state.js';
import { elements } from '../core/dom.js';
import { calculateDefaultZoom, triggerZoomChange } from '../pdf/zoom.js';
import { renderThumbnails } from '../pdf/thumbnails.js';

export function toggleSidebar() {
  state.sidebarCollapsed = !state.sidebarCollapsed;
  elements.sidebar.classList.toggle('collapsed', state.sidebarCollapsed);

  if (!state.sidebarCollapsed) {
    renderThumbnails();
  }

  setTimeout(async () => {
    await calculateDefaultZoom();
    triggerZoomChange();
  }, parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--transition-speed')) * 1000);
}
