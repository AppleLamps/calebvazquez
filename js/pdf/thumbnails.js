import { THUMBNAIL_SCALE } from '../core/config.js';
import { state } from '../core/state.js';
import { elements } from '../core/dom.js';
import { navigateToPage } from './navigation.js';

export async function renderThumbnails() {
  elements.thumbnailContainer.innerHTML = '';

  for (let i = 1; i <= state.totalPages; i++) {
    const thumbItem = document.createElement('div');
    thumbItem.className = `thumbnail-item ${i === state.pageNum ? 'active' : ''}`;
    thumbItem.setAttribute('data-page-num', i);
    thumbItem.id = `thumb-item-${i}`;

    const loadingText = document.createElement('div');
    loadingText.className = 'thumbnail-loading';
    loadingText.textContent = `Slide ${i}`;
    thumbItem.appendChild(loadingText);

    const pageNumLabel = document.createElement('div');
    pageNumLabel.className = 'thumbnail-number';
    pageNumLabel.textContent = i;
    thumbItem.appendChild(pageNumLabel);

    elements.thumbnailContainer.appendChild(thumbItem);
    renderSingleThumbnail(i, thumbItem, loadingText);
  }
}

async function renderSingleThumbnail(num, container, loaderEl) {
  try {
    const page = await state.pdfDoc.getPage(num);
    const viewport = page.getViewport({ scale: THUMBNAIL_SCALE });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

    loaderEl.remove();
    container.insertBefore(canvas, container.firstChild);
    container.addEventListener('click', () => navigateToPage(num));
  } catch (error) {
    console.error(`Error rendering thumbnail for page ${num}:`, error);
  }
}

export function updateActiveThumbnail() {
  document.querySelectorAll('.thumbnail-item').forEach((item) => item.classList.remove('active'));
  const activeThumb = document.getElementById(`thumb-item-${state.pageNum}`);
  if (activeThumb) {
    activeThumb.classList.add('active');
    activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

