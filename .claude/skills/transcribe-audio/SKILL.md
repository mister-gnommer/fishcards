---
name: transcribe-audio
ver: 2
description: Transcribe a local audio or video file (mp3, m4a, wav, ogg, flac, mp4, mov, webm, ...) to text, fully offline, using faster-whisper. Use when the user points at a recording and asks to transcribe it, get a transcript, subtitles (srt/vtt), or "what is said in this file". Works on macOS and Linux.
---

# Transcribe audio

Transcribes a local file on the user's machine with [faster-whisper](https://github.com/SYSTRAN/faster-whisper) (MIT, by SYSTRAN). Nothing is sent to any cloud service; the only network access is downloading the Python packages and the model once.

All work goes through `scripts/transcribe.py` in this skill's directory. Do not install other transcription tools, do not search package indexes, and do not improvise alternative packages.

## Steps

### 1. Resolve the input

- Get the file path from the user. Expand `~` and confirm the file exists.
- If the user asked for a specific language, note its code (`en`, `pl`, `de`, ...). Otherwise leave it to auto-detection.
- If the user asked for subtitles, use `--format srt` (or `vtt`). Default is `txt`.

### 2. Make sure `uv` is available

Run `uv --version`. `uv` runs the script in an isolated, cached environment with pinned dependencies, so nothing is installed globally.

If it is missing, **ask the user before installing**. Offer:

- macOS: `brew install uv`
- Fedora: `sudo dnf install uv`
- Either, if the above is unavailable: the official installer from https://docs.astral.sh/uv/getting-started/installation/

Do not install anything without explicit confirmation.

### 3. Warn about the first run

On the first run, `uv` downloads `faster-whisper` and its dependencies (`ctranslate2`, `av`, `onnxruntime`, `tokenizers`, `huggingface-hub`), and the selected model is downloaded from Hugging Face (default `turbo` is about 1.6 GB; `large-v3` about 3 GB). Tell the user this before starting. Later runs reuse the cache.

### 4. Run

```bash
uv run <skill-dir>/scripts/transcribe.py "<file>" [--language pl] [--format txt,srt] [--model turbo] [--output-dir <dir>]
```

Pick the model from what the user asked for:

| User intent | `--model` |
|---|---|
| Nothing specific (default) | `turbo` (omit the flag) |
| "Best / highest quality", "accuracy matters", difficult audio | `large-v3` |
| "As fast as possible", "rough draft is fine" | `small` |

Do not use any other model unless the user names it. `large-v3` and `small` come from `Systran` on Hugging Face; `turbo` is OpenAI's `large-v3-turbo` converted by Mobius Labs (now `dropbox-dash`), pinned in the script to a fixed commit.

- Output files are written next to the input as `<name>.txt` / `.srt` / `.vtt` unless `--output-dir` is given. Their paths are printed to stdout; progress goes to stderr.
- Transcription runs on CPU and can take a while for long recordings, especially on `large-v3`. Run it in the background if the harness supports that, and let the user know it is working.

### 5. Report

- Give the output path(s), the detected language, and the duration.
- Do not paste the full transcript into the conversation unless asked. Offer to summarize it or answer questions about it instead.

## Troubleshooting

- **Unsupported/corrupt file**: the audio is decoded with PyAV (bundled ffmpeg). If decoding fails, tell the user; if system `ffmpeg` exists, you may offer to convert it with `ffmpeg -i "<file>" -ar 16000 -ac 1 "<file>.wav"` and retry.
- **Wrong language detected**: rerun with `--language <code>`.
- **Out of memory**: rerun with a smaller `--model`.
- **"unauthenticated requests to the HF Hub" warning**: harmless; public models download without a token.
