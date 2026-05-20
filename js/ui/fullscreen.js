import { state } from '../core/state.js';
import { elements } from '../core/dom.js';
import { calculateDefaultZoom, triggerZoomChange } from '../pdf/zoom.js';

export function toggleFullscreen() {
  const viewer = elements.viewerViewport;

  if (!document.fullscreenElement) {
    viewer
      .requestFullscreen()
      .then(async () => {
        state.zoomMode = 'fit';
        await calculateDefaultZoom();
        triggerZoomChange();
      })
      .catch((err) => console.warn(`Fullscreen error: ${err.message}`));
  } else {
    document.exitFullscreen();
  }
}

export function setupFullscreenListener() {
  document.addEventListener('fullscreenchange', async () => {
    await calculateDefaultZoom();
    triggerZoomChange();
  });
}
