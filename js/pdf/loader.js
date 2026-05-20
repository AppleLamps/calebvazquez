import { PDF_PATH } from '../core/config.js';
import { state } from '../core/state.js';
import { elements } from '../core/dom.js';
import { pdfjsLib } from '../core/pdfjs.js';
import { calculateDefaultZoom } from './zoom.js';
import { setupLayoutMode } from './layout.js';
import { renderThumbnails } from './thumbnails.js';
import { buildSearchIndex } from '../search/index.js';

export async function loadPDF() {
  try {
    const loadingTask = pdfjsLib.getDocument({ url: PDF_PATH, enableLowDigitization: true });

    loadingTask.onProgress = (progressData) => {
      if (progressData.total && progressData.total > 0) {
        const percent = Math.min(100, Math.round((progressData.loaded / progressData.total) * 100));
        elements.loaderProgress.style.width = `${percent}%`;
        elements.loaderPercentage.textContent = `${percent}%`;
      } else {
        const kbLoaded = Math.round(progressData.loaded / 1024);
        elements.loaderPercentage.textContent = `${kbLoaded} KB Loaded`;
        elements.loaderProgress.style.width = '50%';
      }
    };

    state.pdfDoc = await loadingTask.promise;
    state.totalPages = state.pdfDoc.numPages;
    elements.totalPagesText.textContent = state.totalPages;
    elements.currentPageInput.max = state.totalPages;

    try {
      const { info } = await state.pdfDoc.getMetadata();
      let docTitle = info?.Title?.trim() || '';
      if (!docTitle) {
        const fileName = decodeURIComponent(PDF_PATH).replace(/\.[^/.]+$/, '');
        docTitle = fileName.replace(/[_-]/g, ' ');
      }
      elements.mainDocumentTitle.textContent = docTitle;
      document.title = `${docTitle} | Slide Reader`;
    } catch (metaErr) {
      console.warn('Could not retrieve PDF title metadata:', metaErr);
    }

    setTimeout(async () => {
      elements.loadingOverlay.classList.add('fade-out');
      await calculateDefaultZoom();
      setupLayoutMode();
      renderThumbnails();
      buildSearchIndex();
    }, 400);
  } catch (error) {
    console.error('Error loading PDF document: ', error);
    elements.loaderPercentage.textContent = 'Failed to load PDF.';
    elements.loaderPercentage.style.color = 'var(--text-primary)';
    document.querySelector('.loader-subtitle').textContent =
      'Please make sure the PDF file exists in the directory.';
  }
}
