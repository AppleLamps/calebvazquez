import { MAX_SCALE, MIN_SCALE, SCALE_STEP } from '../core/config.js';
import { state } from '../core/state.js';
import { elements } from '../core/dom.js';
import { renderPage } from './page.js';
import { setupLayoutMode } from './layout.js';

export async function calculateDefaultZoom() {
  if (!state.pdfDoc) return;

  const page = await state.pdfDoc.getPage(1);
  const originalViewport = page.getViewport({ scale: 1 });
  const viewportStyles = getComputedStyle(elements.viewerViewport);
  const horizontalPadding =
    parseFloat(viewportStyles.paddingLeft) + parseFloat(viewportStyles.paddingRight);
  const verticalPadding =
    parseFloat(viewportStyles.paddingTop) + parseFloat(viewportStyles.paddingBottom);
  const viewerWidth = elements.viewerViewport.clientWidth - horizontalPadding;
  const viewerHeight = elements.viewerViewport.clientHeight - verticalPadding;

  if (state.zoomMode === 'fit') {
    const widthScale = viewerWidth / originalViewport.width;
    const heightScale = viewerHeight / originalViewport.height;
    state.zoomScale = Math.min(widthScale, heightScale);
  } else if (state.zoomMode === 'width') {
    state.zoomScale = viewerWidth / originalViewport.width;
  }

  state.zoomScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, state.zoomScale));
  elements.zoomValueLabel.textContent = `${Math.round(state.zoomScale * 100)}%`;
}

export function triggerZoomChange() {
  elements.zoomValueLabel.textContent = `${Math.round(state.zoomScale * 100)}%`;

  state.renderingQueue.forEach((task) => task.cancel());
  state.renderingQueue.clear();

  if (state.layoutMode === 'presentation') {
    renderPage(state.pageNum);
  } else {
    setupLayoutMode();
  }
}

export function handleZoomIn() {
  state.zoomMode = 'custom';
  state.zoomScale = Math.min(MAX_SCALE, state.zoomScale + SCALE_STEP);
  triggerZoomChange();
}

export function handleZoomOut() {
  state.zoomMode = 'custom';
  state.zoomScale = Math.max(MIN_SCALE, state.zoomScale - SCALE_STEP);
  triggerZoomChange();
}

export async function handleZoomFit() {
  state.zoomMode = state.zoomMode === 'fit' ? 'width' : 'fit';
  await calculateDefaultZoom();
  triggerZoomChange();
}

