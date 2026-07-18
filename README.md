# Jingya Zhang — Personal Portfolio

A responsive personal portfolio built with HTML, CSS, and JavaScript. The site is designed to be published directly with GitHub Pages.

## Project structure

```text
.
├── index.html              # GitHub Pages entry point
├── assets/
│   ├── images/             # Images used by the site
│   ├── style.css           # Site styles
│   └── script.js           # Browser-side behavior
├── data/
│   ├── blog/               # Blog index and Markdown posts
│   ├── gallery/            # Gallery index and Markdown entries
│   ├── projects/           # Portfolio data and downloads
│   └── publications.json   # Publication records
├── templates/              # Reusable HTML fragments
├── scripts/                # Local maintenance tools
└── docs/demo/              # README screenshots
```

## Local preview

The site loads JSON and Markdown with `fetch`, so preview it through a local web server instead of opening `index.html` directly.

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Gallery password helper

Run the helper from the project root to replace the browser-side Gallery password hash:

```bash
./scripts/set-gallery-password.sh
```

This is only a visual access gate. Because GitHub Pages is static hosting, Gallery files remain publicly downloadable and should not contain private information.

## Demo

![Desktop preview](./docs/demo/desktop.png)
![Mobile preview](./docs/demo/mobile.png)

## License

MIT
