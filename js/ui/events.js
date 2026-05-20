import { state } from '../core/state.js';
import { elements } from '../core/dom.js';
import { navigateToPage } from '../pdf/navigation.js';
import { setupLayoutMode } from '../pdf/layout.js';
import { handleZoomIn, handleZoomOut, handleZoomFit, calculateDefaultZoom, triggerZoomChange } from '../pdf/zoom.js';
import { handleSearch, navigateSearch } from '../search/index.js';
import { setTheme } from '../theme.js';
import { toggleSidebar } from './slides-sidebar.js';
import { toggleFullscreen } from './fullscreen.js';
import { toggleHighlightsSidebar } from '../highlights/sidebar.js';
import { clearAllHighlights } from '../highlights/actions.js';

export function setupEventListeners() {
  elements.toggleSidebarBtn?.addEventListener('click', toggleSidebar);
  elements.closeSidebarBtn?.addEventListener('click', toggleSidebar);

  elements.toggleHighlightsSidebarBtn?.addEventListener('click', toggleHighlightsSidebar);
  elements.closeHighlightsSidebarBtn?.addEventListener('click', toggleHighlightsSidebar);
  elements.clearHighlightsBtn?.addEventListener('click', clearAllHighlights);

  elements.firstPageBtn?.addEventListener('click', () => navigateToPage(1));
  elements.prevPageBtn?.addEventListener('click', () => navigateToPage(state.pageNum - 1));
  elements.nextPageBtn?.addEventListener('click', () => navigateToPage(state.pageNum + 1));
  elements.lastPageBtn?.addEventListener('click', () => navigateToPage(state.totalPages));

  elements.prevSlideOverlay?.addEventListener('click', () => navigateToPage(state.pageNum - 1));
  elements.nextSlideOverlay?.addEventListener('click', () => navigateToPage(state.pageNum + 1));

  elements.currentPageInput?.addEventListener('change', (e) => {
    let targetNum = parseInt(e.target.value, 10);
    if (isNaN(targetNum)) {
      e.target.value = state.pageNum;
      return;
    }
    navigateToPage(Math.max(1, Math.min(state.totalPages, targetNum)));
  });

  elements.btnModePresentation?.addEventListener('click', () => {
    if (state.layoutMode === 'presentation') return;
    state.layoutMode = 'presentation';
    elements.btnModePresentation.classList.add('active');
    elements.btnModeScroll.classList.remove('active');
    setupLayoutMode();
  });

  elements.btnModeScroll?.addEventListener('click', () => {
    if (state.layoutMode === 'scroll') return;
    state.layoutMode = 'scroll';
    elements.btnModeScroll.classList.add('active');
    elements.btnModePresentation.classList.remove('active');
    setupLayoutMode();
  });

  elements.zoomInBtn?.addEventListener('click', handleZoomIn);
  elements.zoomOutBtn?.addEventListener('click', handleZoomOut);
  elements.zoomFitBtn?.addEventListener('click', handleZoomFit);
  elements.presentationModeBtn?.addEventListener('click', toggleFullscreen);

  elements.searchInput?.addEventListener('input', (e) => handleSearch(e.target.value));
  elements.searchPrevBtn?.addEventListener('click', () => navigateSearch('prev'));
  elements.searchNextBtn?.addEventListener('click', () => navigateSearch('next'));

  elements.themeToggleBtn?.addEventListener('click', () => {
    setTheme(state.theme === 'dark' ? 'light' : 'dark');
  });

  window.addEventListener('keydown', handleKeyboardShortcuts);
  window.addEventListener('resize', handleWindowResize);
}

function handleWindowResize() {
  clearTimeout(state.resizeTimeout);
  state.resizeTimeout = setTimeout(async () => {
    await calculateDefaultZoom();
    triggerZoomChange();
  }, 150);
}

function handleKeyboardShortcuts(e) {
  if (
    document.activeElement === elements.searchInput ||
    document.activeElement === elements.currentPageInput
  ) {
    return;
  }

  switch (e.key) {
    case 'ArrowRight':
    case ' ':
    case 'PageDown':
      e.preventDefault();
      navigateToPage(state.pageNum + 1);
      break;
    case 'ArrowLeft':
    case 'PageUp':
      e.preventDefault();
      navigateToPage(state.pageNum - 1);
      break;
    case 'Home':
      e.preventDefault();
      navigateToPage(1);
      break;
    case 'End':
      e.preventDefault();
      navigateToPage(state.totalPages);
      break;
    case '=':
    case '+':
      if (e.ctrlKey) {
        e.preventDefault();
        handleZoomIn();
      }
      break;
    case '-':
    case '_':
      if (e.ctrlKey) {
        e.preventDefault();
        handleZoomOut();
      }
      break;
    case '0':
      if (e.ctrlKey) {
        e.preventDefault();
        handleZoomFit();
      }
      break;
    case 'f':
    case 'F':
      if (e.ctrlKey || e.altKey) {
        e.preventDefault();
        toggleFullscreen();
      }
      break;
    default:
      break;
  }
}
