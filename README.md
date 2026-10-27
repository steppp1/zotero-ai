# AI Assistant (Markdown) for Zotero

AI chat assistant for Zotero with Markdown and LaTeX (KaTeX) math rendering.

## Supported

- **Chat with an LLM** using the paper's title, abstract, selected text, or full text as context.
- **Markdown rendering** for responses: headings, bold/italic, lists, tables, code blocks, links, and blockquotes.
- **LaTeX math** rendered with KaTeX, fully offline (fonts are inlined). Supported delimiters:
  - `$...$` — inline math
  - `\(...\)` — inline math
  - `$$...$$` — display math
  - `\[...\]` — display math
- **AI Translate** and **AI Explain** buttons in the PDF reader.
- **Per-item chat sessions**, saved automatically.

## Configure

In the plugin's preferences (via Zotero's Tools menu), set the API URL, API key, and model — any OpenAI-compatible chat endpoint works.

## Install

1. Download the latest `.xpi` from [Releases](../../releases).
2. In Zotero: `Tools → Plugins → ⚙ → Install Plugin From File…` and select the `.xpi`.

## Build the XPI yourself

```sh
cd zotero-ai-assistant-improved
zip -r -X ../ai-assistant.xpi manifest.json bootstrap.js prefs.js content locale
```

## Reusing this repo

If you fork this project, change the addon id/name to your own to avoid install conflicts:

- `manifest.json` → `applications.zotero.id`, `homepage_url`, and `name`
- `content/scripts/ai-assistant.js` → the `addonID` (and `addonName`) in the `config` object

## License

AGPL-3.0. Based on [jetxa/zotero-ai-assistant](https://github.com/jetxa/zotero-ai-assistant) (AGPL-3.0), © jetxa. See [`LICENSE`](LICENSE).

Bundled third-party libraries (MIT — see [`licenses/`](licenses/)):

- [markdown-it](https://github.com/markdown-it/markdown-it) — © 2014 Vitaly Puzrin, Alex Kocharin.
- [KaTeX](https://github.com/KaTeX/KaTeX) — © 2013–2020 Khan Academy and other contributors.
- [markdown-it-katex](https://github.com/waylonflinn/markdown-it-katex) — © 2016 Waylon Flinn.

See [CHANGELOG.md](CHANGELOG.md) for the change history.
