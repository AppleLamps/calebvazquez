import { state } from '../core/state.js';
import { elements } from '../core/dom.js';
import { pdfjsLib } from '../core/pdfjs.js';
import { applySavedHighlights } from '../highlights/annotate.js';
import { highlightPageText } from '../search/index.js';

export function createPageElement(num) {
  if (document.getElementById(`page-wrapper-${num}`)) return;

  const pageWrapper = document.createElement('div');
  pageWrapper.className = 'page-wrapper';
  pageWrapper.id = `page-wrapper-${num}`;
  pageWrapper.setAttribute('data-page-num', num);

  const canvas = document.createElement('canvas');
  canvas.id = `page-canvas-${num}`;
  pageWrapper.appendChild(canvas);

  const textLayer = document.createElement('div');
  textLayer.className = 'textLayer';
  textLayer.id = `page-text-${num}`;
  pageWrapper.appendChild(textLayer);

  pageWrapper.style.aspectRatio = '16/9';
  elements.pagesContainer.appendChild(pageWrapper);
}

function isStaleRender(num, token) {
  return state.pageRenderToken.get(num) !== token;
}

export async function renderPage(num) {
  const token = (state.pageRenderToken.get(num) ?? 0) + 1;
  state.pageRenderToken.set(num, token);

  state.renderingQueue.get(num)?.cancel();

  const pageWrapper = document.getElementById(`page-wrapper-${num}`);
  if (!pageWrapper) return;

  const canvas = document.getElementById(`page-canvas-${num}`);
  const textLayer = document.getElementById(`page-text-${num}`);
  const ctx = canvas.getContext('2d');

  try {
    const page = await state.pdfDoc.getPage(num);
    if (isStaleRender(num, token)) return;

    const viewport = page.getViewport({ scale: state.zoomScale });

    pageWrapper.style.width = `${viewport.width}px`;
    pageWrapper.style.height = `${viewport.height}px`;
    pageWrapper.style.aspectRatio = `${viewport.width}/${viewport.height}`;
    pageWrapper.style.setProperty('--scale-factor', viewport.scale);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = viewport.width * dpr;
    canvas.height = viewport.height * dpr;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    ctx.scale(dpr, dpr);

    const renderTask = page.render({ canvasContext: ctx, viewport });
    state.renderingQueue.set(num, renderTask);
    await renderTask.promise;
    if (isStaleRender(num, token)) return;

    textLayer.innerHTML = '';
    textLayer.style.width = `${viewport.width}px`;
    textLayer.style.height = `${viewport.height}px`;

    const textContent = await page.getTextContent();
    const textRenderTask = pdfjsLib.renderTextLayer({
      textContent,
      container: textLayer,
      viewport,
      textDivs: []
    });
    await textRenderTask.promise;
    if (isStaleRender(num, token)) return;

    applySavedHighlights(num);
    if (state.searchQuery) highlightPageText(num);
  } catch (error) {
    if (error.name === 'RenderingCancelledException') return;
    console.error(`Error rendering page ${num}:`, error);
  } finally {
    if (!isStaleRender(num, token)) {
      state.renderingQueue.delete(num);
    }
  }
}


