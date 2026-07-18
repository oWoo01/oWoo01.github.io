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
│   ├── gallery.enc.json    # Encrypted Gallery bundle (generated)
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

## Encrypted Gallery

Plaintext Gallery files live in the ignored `private-gallery/` directory and must never be committed. To create or refresh the encrypted public bundle, run:

```bash
./scripts/encrypt-gallery.sh
```

The command accepts a four-digit PIN, prompts without echoing it, and writes `data/gallery.enc.json`. This PIN is intended only to prevent casual access: because the encrypted bundle is public, four digits do not provide strong protection against automated guessing. Run the command again whenever Gallery content or the PIN changes.

Place private Gallery images inside `private-gallery/images/` and reference them from Markdown as `images/example.jpg`. They will be packed into the encrypted bundle and exposed only after successful decryption.

## Demo

![Desktop preview](./docs/demo/desktop.png)
![Mobile preview](./docs/demo/mobile.png)

## License

MIT
