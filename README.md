# Caleb Vazquez Manifesto - Archive Reader

An interactive static web viewer for reading a PDF presentation as slides. Built with vanilla JavaScript, [PDF.js](https://mozilla.github.io/pdf.js/), and a modular codebase. No build step is required.

## Features

### Slide viewing

- **Presentation mode** - One slide at a time, centered in the viewport with optional left/right overlay controls.
- **Scroll mode** - Continuous vertical scroll through all slides; pages load lazily as you scroll.
- **Thumbnail sidebar** (left) - Quick jump to any slide; the active slide is highlighted.
- **Zoom** - Zoom in/out, fit to screen, or fit to width from the bottom control bar.
- **Fullscreen** - Presentation-style fullscreen on the viewer area.

### Search

- Search across all slide text from the header search box.
- Match counter and previous/next navigation between results.
- In-document highlighting of matches (yellow/orange).

### Text highlights

- Select text on any slide, then click **Highlight** in the floating toolbar.
- Highlights are saved in your browser **localStorage** and persist after refresh.
- Highlighted text appears in archive amber on the PDF.
- **Highlights panel** (right sidebar) - Lists all saved highlights grouped by slide; click an entry to jump to that slide and flash the mark.
- Remove a highlight with the **x** on its list item.
- **Clear all** removes every saved highlight for this document.

### Appearance

- **Dark / light theme** - Toggle from the header; preference is remembered in localStorage.

### Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Right Arrow` / `Space` / `Page Down` | Next slide |
| `Left Arrow` / `Page Up` | Previous slide |
| `Home` / `End` | First / last slide |
| `Ctrl` + `+` / `Ctrl` + `-` | Zoom in / out |
| `Ctrl` + `0` | Toggle fit between screen and width |
| `Ctrl` + `F` / `Alt` + `F` | Fullscreen |

Shortcuts are ignored while focus is in the search box or page number input.

### Privacy note

The PDF is rendered in the browser for viewing only. There is no download button in the UI. Highlights and theme settings stay on your device in localStorage.

## Requirements

- A modern browser with JavaScript enabled.
- The PDF file **`Caleb Vazquez Manifesto.pdf`** in the project root (same folder as `index.html`). The filename is configured in `js/core/config.js` if you need to change it.

## Run locally

ES modules require a local HTTP server (opening `index.html` directly via `file://` will not work).

```bash
npx serve .
```

Then open **http://localhost:3000** (or the URL shown in the terminal).

Other static servers work too, for example:

```bash
python -m http.server 8000
```

## Deploy on Vercel

This project is ready for Vercel as a static site.

- Framework preset: **Other**.
- Build command: leave blank.
- Output directory: leave blank or use the project root.
- Install command: leave blank.

`vercel.json` is included for static hosting behavior:

- `cleanUrls` is enabled.
- The PDF gets long-lived immutable caching.
- JavaScript, CSS, font, image, and SVG assets get cache headers suitable for static hosting.

## Project structure

```
website-mani/
|-- index.html              # App shell
|-- styles.css              # Imports CSS partials
|-- css/                    # Styles split by area
|-- js/
|   |-- main.js             # Entry point
|   |-- core/               # Config, state, DOM refs, PDF.js setup
|   |-- pdf/                # Load, render, zoom, navigation, thumbnails
|   |-- search/             # Full-document search
|   |-- highlights/         # Save/load highlights, sidebar, selection UI
|   `-- ui/                 # Events, sidebars, fullscreen
`-- Caleb Vazquez Manifesto.pdf
```

## Tech stack

- **PDF.js** - PDF rendering and text layer for selection/search.
- **Font Awesome** - Icons.
- **Google Fonts** - Source Serif 4 (document title) and IBM Plex Sans (interface).

No npm install is required to run the site; dependencies are loaded from CDNs in `index.html`.

## License

Content rights for the manifesto PDF belong to its author/publisher. This viewer code is provided as-is for hosting and reading that document.
