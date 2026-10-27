# Changelog

This fork adds Markdown and LaTeX/KaTeX math rendering plus several reliability fixes on top of [jetxa/zotero-ai-assistant](https://github.com/jetxa/zotero-ai-assistant).

## 1.0.8

- Add `\[...\]` (display) and `\(...\)` (inline) LaTeX math delimiters, in addition to the existing `$...$` and `$$...$$`.

## 1.0.7

- Fix XHTML parsing errors: emit void tags (`<br>`, `<hr>`, `<img>`) self-closed so rendered and streamed content no longer collapses/disappears.

## 1.0.6

- Cache the markdown-it parser instance instead of re-parsing the whole response on every token.
- Keep the in-progress streamed answer visible when Zotero re-renders the item pane mid-stream.

## 1.0.5

- Add Markdown + KaTeX rendering with offline (inlined) fonts.
- Fix SSE streaming truncation by buffering partial JSON lines split across network reads.
- Fix responses being wiped when the item-pane `onRender` callback re-ran.
