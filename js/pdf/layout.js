import { state } from '../core/state.js';
import { elements } from '../core/dom.js';
import { createPageElement, renderPage } from './page.js';
import { updateControls } from './navigation.js';
import { updateActiveThumbnail } from './thumbnails.js';

export async function setupLayoutMode() {
  elements.pagesContainer.innerHTML = '';
  state.renderingQueue.forEach((task) => task.cancel());
  state.renderingQueue.clear();
  state.pageRenderToken.clear();

  if (state.layoutMode === 'presentation') {
    elements.viewerViewport.classList.remove('scroll-mode');
    elements.viewerViewport.classList.add('presentation-mode');
    createPageElement(state.pageNum);
    await renderPage(state.pageNum);
  } else {
    elements.viewerViewport.classList.remove('presentation-mode');
    elements.viewerViewport.classList.add('scroll-mode');
    for (let i = 1; i <= state.totalPages; i++) createPageElement(i);
    setupScrollObserver();
    handleScrollRendering();
  }

  updateControls();
}

export function setupScrollObserver() {
  if (state.observer) state.observer.disconnect();

  state.observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const pageNum = parseInt(entry.target.getAttribute('data-page-num'), 10);
        if (entry.isIntersecting) renderPage(pageNum);
      });
    },
    {
      root: elements.viewerViewport,
      rootMargin: '100px 0px 100px 0px',
      threshold: [0.1, 0.5]
    }
  );

  document.querySelectorAll('.page-wrapper').forEach((el) => state.observer.observe(el));
  elements.viewerViewport.addEventListener('scroll', handleScrollRendering);
}

export function handleScrollRendering() {
  if (state.layoutMode !== 'scroll') return;

  const viewportRect = elements.viewerViewport.getBoundingClientRect();
  let maxVisiblePage = state.pageNum;
  let maxVisibleArea = 0;

  document.querySelectorAll('.page-wrapper').forEach((wrapper) => {
    const rect = wrapper.getBoundingClientRect();
    const top = Math.max(viewportRect.top, rect.top);
    const bottom = Math.min(viewportRect.bottom, rect.bottom);

    if (top < bottom) {
      const visibleArea = (bottom - top) * rect.width;
      if (visibleArea > maxVisibleArea) {
        maxVisibleArea = visibleArea;
        maxVisiblePage = parseInt(wrapper.getAttribute('data-page-num'), 10);
      }
    }
  });

  if (maxVisiblePage !== state.pageNum) {
    state.pageNum = maxVisiblePage;
    elements.currentPageInput.value = state.pageNum;
    updateActiveThumbnail();
  }
}
