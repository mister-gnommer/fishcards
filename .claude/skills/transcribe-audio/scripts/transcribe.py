# /// script
# requires-python = ">=3.9"
# dependencies = [
#     "faster-whisper==1.2.1",
#     # faster-whisper 1.2.1 passes an argument PyAV 19 no longer accepts.
#     "av==16.0.1",
# ]
# ///
"""Transcribe an audio or video file to text with faster-whisper.

Docs: https://github.com/SYSTRAN/faster-whisper
Run with: uv run transcribe.py <file> [options]
"""

import argparse
import sys
import time
from pathlib import Path

from faster_whisper import WhisperModel

FORMATS = ("txt", "srt", "vtt")

# Third-party models pinned to an exact Hugging Face commit so the downloaded
# weights cannot change underneath us. Other names go to faster-whisper as-is.
PINNED_MODELS = {
    # CTranslate2 conversion of openai/whisper-large-v3-turbo, MIT license.
    # Formerly mobiuslabsgmbh/faster-whisper-large-v3-turbo.
    # https://huggingface.co/dropbox-dash/faster-whisper-large-v3-turbo
    "turbo": (
        "dropbox-dash/faster-whisper-large-v3-turbo",
        "0a363e9161cbc7ed1431c9597a8ceaf0c4f78fcf",
    ),
}
PINNED_MODELS["large-v3-turbo"] = PINNED_MODELS["turbo"]


def format_timestamp(seconds: float, separator: str) -> str:
    millis = round(seconds * 1000)
    hours, millis = divmod(millis, 3_600_000)
    minutes, millis = divmod(millis, 60_000)
    secs, millis = divmod(millis, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}{separator}{millis:03d}"


def render(segments: list, fmt: str) -> str:
    if fmt == "txt":
        return "\n".join(s.text.strip() for s in segments) + "\n"

    separator = "," if fmt == "srt" else "."
    blocks = []
    for index, s in enumerate(segments, start=1):
        start = format_timestamp(s.start, separator)
        end = format_timestamp(s.end, separator)
        cue = f"{start} --> {end}\n{s.text.strip()}"
        blocks.append(f"{index}\n{cue}" if fmt == "srt" else cue)

    body = "\n\n".join(blocks) + "\n"
    return f"WEBVTT\n\n{body}" if fmt == "vtt" else body


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="Audio or video file")
    parser.add_argument(
        "--model",
        default="turbo",
        help="Model name (default: turbo). Best quality: large-v3. Fastest: small.",
    )
    parser.add_argument(
        "--language",
        default=None,
        help="Language code, e.g. en, pl. Auto-detected when omitted.",
    )
    parser.add_argument(
        "--format",
        default="txt",
        help=f"Comma-separated output formats from {', '.join(FORMATS)} (default: txt).",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=None,
        help="Directory for output files (default: next to the input file).",
    )
    args = parser.parse_args()

    source: Path = args.input.expanduser().resolve()
    if not source.is_file():
        print(f"error: file not found: {source}", file=sys.stderr)
        return 1

    formats = [f.strip() for f in args.format.split(",") if f.strip()]
    unknown = [f for f in formats if f not in FORMATS]
    if unknown:
        print(f"error: unsupported format(s): {', '.join(unknown)}", file=sys.stderr)
        return 1

    output_dir: Path = (args.output_dir or source.parent).expanduser().resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Loading model '{args.model}' (downloaded on first use)...", file=sys.stderr)
    # int8 on CPU per the faster-whisper README; "auto" picks CUDA when available.
    model_id, revision = PINNED_MODELS.get(args.model, (args.model, None))
    model = WhisperModel(model_id, device="auto", compute_type="int8", revision=revision)

    started = time.monotonic()
    segments_iter, info = model.transcribe(
        str(source),
        language=args.language,
        vad_filter=True,
    )
    print(
        f"Language: {info.language} (p={info.language_probability:.2f}), "
        f"duration: {format_timestamp(info.duration, '.')}",
        file=sys.stderr,
    )

    # Segments are generated lazily; transcription happens while iterating.
    segments = []
    for segment in segments_iter:
        segments.append(segment)
        percent = min(100.0, segment.end / info.duration * 100) if info.duration else 0.0
        print(f"\r{percent:5.1f}%", end="", file=sys.stderr, flush=True)
    print(file=sys.stderr)

    for fmt in formats:
        target = output_dir / f"{source.stem}.{fmt}"
        target.write_text(render(segments, fmt), encoding="utf-8")
        print(target)

    elapsed = time.monotonic() - started
    print(f"Done in {elapsed:.0f}s, {len(segments)} segments.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
