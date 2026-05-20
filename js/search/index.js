import { state } from '../core/state.js';
import { elements } from '../core/dom.js';
import { escapeRegExp } from '../utils.js';
import { navigateToPage } from '../pdf/navigation.js';
import { triggerZoomChange } from '../pdf/zoom.js';

function waitForIdle() {
  return new Promise((resolve) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(resolve, { timeout: 500 });
    } else {
      setTimeout(resolve, 0);
    }
  });
}

export async function buildSearchIndex() {
  if (state.searchIndexPromise) return state.searchIndexPromise;

  state.searchIndexPromise = buildSearchIndexPages();
  return state.searchIndexPromise;
}

async function buildSearchIndexPages() {
  state.textIndex = [];
  for (let i = 1; i <= state.totalPages; i++) {
    try {
      const page = await state.pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((item) => item.str).join(' ').toLowerCase();
      state.textIndex.push({ pageNum: i, text });
    } catch (e) {
      console.warn(`Could not index text for page ${i}`, e);
    }
    await waitForIdle();
  }

  state.searchIndexReady = true;
  return state.textIndex;
}

export function warmSearchIndex() {
  if (!state.pdfDoc || state.searchIndexReady || state.searchIndexPromise) return;
  buildSearchIndex();
}

export async function handleSearch(query) {
  state.searchQuery = query.trim().toLowerCase();
  state.searchResults = [];
  state.activeSearchMatchIdx = -1;
  clearSearchHighlights();

  if (!state.searchQuery) {
    elements.searchResultsCount.classList.add('hidden');
    elements.searchNavContainer.classList.add('hidden');
    triggerZoomChange();
    return;
  }

  if (!state.searchIndexReady) {
    elements.searchResultsCount.classList.remove('hidden');
    elements.searchNavContainer.classList.add('hidden');
    elements.searchResultsCount.textContent = 'Indexing...';
    await buildSearchIndex();

    if (state.searchQuery !== elements.searchInput.value.trim().toLowerCase()) {
      return handleSearch(elements.searchInput.value);
    }
  }

  state.textIndex.forEach((pageItem) => {
    let index = 0;
    let occurrences = 0;
    while ((index = pageItem.text.indexOf(state.searchQuery, index)) !== -1) {
      occurrences++;
      index += state.searchQuery.length;
    }
    if (occurrences > 0) {
      for (let m = 0; m < occurrences; m++) {
        state.searchResults.push({ pageNum: pageItem.pageNum, matchIndex: m });
      }
    }
  });

  if (state.searchResults.length > 0) {
    elements.searchResultsCount.classList.remove('hidden');
    elements.searchNavContainer.classList.remove('hidden');
    state.activeSearchMatchIdx = 0;
    updateSearchCountUI();
    navigateToPage(state.searchResults[0].pageNum);
    triggerZoomChange();
  } else {
    elements.searchResultsCount.classList.remove('hidden');
    elements.searchNavContainer.classList.add('hidden');
    elements.searchResultsCount.textContent = 'No matches';
  }
}

export function clearSearchHighlights() {
  document.querySelectorAll('.textLayer').forEach((layer) => {
    layer.querySelectorAll('.highlight').forEach((span) => {
      const parent = span.parentNode;
      parent.replaceChild(document.createTextNode(span.textContent), span);
      parent.normalize();
    });
  });
}

export function highlightPageText(pageNum) {
  const textLayer = document.getElementById(`page-text-${pageNum}`);
  if (!textLayer || !state.searchQuery) return;

  const targetMatch = state.searchResults[state.activeSearchMatchIdx];
  const isMatchOnThisPage = targetMatch?.pageNum === pageNum;
  const spans = textLayer.querySelectorAll('span');
  let currentMatchCount = 0;

  spans.forEach((span) => {
    const textContent = span.textContent;
    if (!textContent.toLowerCase().includes(state.searchQuery)) return;

    const regex = new RegExp(`(${escapeRegExp(state.searchQuery)})`, 'gi');
    let highlightClass = 'highlight';
    if (isMatchOnThisPage && currentMatchCount === targetMatch.matchIndex) {
      highlightClass = 'highlight selected';
    }
    span.innerHTML = textContent.replace(regex, `<span class="${highlightClass}">$1</span>`);
    currentMatchCount++;
  });
}

export function navigateSearch(direction) {
  if (state.searchResults.length === 0) return;

  if (direction === 'next') {
    state.activeSearchMatchIdx = (state.activeSearchMatchIdx + 1) % state.searchResults.length;
  } else {
    state.activeSearchMatchIdx =
      (state.activeSearchMatchIdx - 1 + state.searchResults.length) % state.searchResults.length;
  }

  updateSearchCountUI();
  navigateToPage(state.searchResults[state.activeSearchMatchIdx].pageNum);
  triggerZoomChange();
}

function updateSearchCountUI() {
  elements.searchResultsCount.textContent = `${state.activeSearchMatchIdx + 1}/${state.searchResults.length}`;
}
