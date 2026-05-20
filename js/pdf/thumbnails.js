import { THUMBNAIL_SCALE } from '../core/config.js';
import { state } from '../core/state.js';
import { elements } from '../core/dom.js';
import { navigateToPage } from './navigation.js';

const THUMBNAIL_BATCH_SIZE = 2;

function waitForIdle() {
  return new Promise((resolve) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(resolve, { timeout: 500 });
    } else {
      setTimeout(resolve, 0);
    }
  });
}

function createThumbnailShell(num) {
  const thumbItem = document.createElement('div');
  thumbItem.className = `thumbnail-item ${num === state.pageNum ? 'active' : ''}`;
  thumbItem.setAttribute('data-page-num', num);
  thumbItem.id = `thumb-item-${num}`;
  thumbItem.addEventListener('click', () => navigateToPage(num));

  const loadingText = document.createElement('div');
  loadingText.className = 'thumbnail-loading';
  loadingText.textContent = `Slide ${num}`;
  thumbItem.appendChild(loadingText);

  const pageNumLabel = document.createElement('div');
  pageNumLabel.className = 'thumbnail-number';
  pageNumLabel.textContent = num;
  thumbItem.appendChild(pageNumLabel);

  elements.thumbnailContainer.appendChild(thumbItem);
  return { thumbItem, loadingText };
}

export async function renderThumbnails() {
  if (state.thumbnailsStarted || !state.pdfDoc) return;

  state.thumbnailsStarted = true;
  elements.thumbnailContainer.innerHTML = '';

  const shells = new Map();
  for (let i = 1; i <= state.totalPages; i++) {
    shells.set(i, createThumbnailShell(i));
  }

  updateActiveThumbnail();

  const pageOrder = [
    state.pageNum,
    ...Array.from({ length: state.totalPages }, (_, index) => index + 1).filter(
      (pageNum) => pageNum !== state.pageNum
    )
  ];

  for (let i = 0; i < pageOrder.length; i += THUMBNAIL_BATCH_SIZE) {
    await waitForIdle();
    const batch = pageOrder.slice(i, i + THUMBNAIL_BATCH_SIZE);
    await Promise.all(
      batch.map((pageNum) => {
        const shell = shells.get(pageNum);
        return renderSingleThumbnail(pageNum, shell.thumbItem, shell.loadingText);
      })
    );
  }
}

async function renderSingleThumbnail(num, container, loaderEl) {
  if (container.querySelector('canvas')) return;

  try {
    const page = await state.pdfDoc.getPage(num);
    const viewport = page.getViewport({ scale: THUMBNAIL_SCALE });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

    loaderEl.remove();
    container.insertBefore(canvas, container.firstChild);
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
