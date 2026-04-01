# Insanely Fast Whisper & MarkItDown — Lokale Tool-Pipeline

> **Stand:** 28.03.2026  
> **Kontext:** Autarch OS Agentic Infrastructure  
> **Zuständig:** Prometheus (Tech Ops), alle Agents mit File-Zugriff

---

## 1. Insanely Fast Whisper

**Repo:** [Vaibhavs10/insanely-fast-whisper](https://github.com/Vaibhavs10/insanely-fast-whisper)  
**Was:** Lokale Audio-Transkription auf Apple Silicon (MPS) — 150 Min Audio in ~98 Sekunden.  
**Modell:** OpenAI Whisper Large v3 (via Hugging Face Transformers Pipeline)

### Installation

```bash
# pipx (empfohlen — isolierte Python-Umgebung)
brew install pipx && pipx ensurepath
pipx install insanely-fast-whisper --force --pip-args="--ignore-requires-python"
```

### CLI-Nutzung

```bash
# Basis-Transkription (Mac MPS)
insanely-fast-whisper --file-name audio.mp3 --device-id mps

# Performance-Tuning (OOM-Schutz)
insanely-fast-whisper --file-name audio.mp3 --device-id mps --batch-size 4

# Deutsch erzwingen
insanely-fast-whisper --file-name audio.mp3 --device-id mps --language de

# JSON Output
insanely-fast-whisper --file-name audio.mp3 --device-id mps --output-format json -o transcript.json

# Timestamps + Speaker Diarization
insanely-fast-whisper --file-name audio.mp3 --device-id mps --timestamp word
```

### Konfigurationsoptionen

| Flag | Default | Beschreibung |
|------|---------|-------------|
| `--file-name` | - | Pfad zur Audio-Datei (MP3, WAV, M4A etc.) |
| `--device-id` | `0` (CUDA) | `mps` für Mac Apple Silicon |
| `--batch-size` | `24` | Reduzieren bei OOM (4 ist stabil auf Mac) |
| `--language` | auto | ISO-Code: `de`, `en`, `fr` etc. |
| `--model-name` | `openai/whisper-large-v3` | Alternativ: `distil-whisper/distil-large-v3` |
| `--timestamp` | `chunk` | `word` für Wort-Level Timestamps |
| `--output-format` | `json` | `json`, `srt`, `vtt` |
| `-o` | stdout | Output-Datei |

### Performance-Benchmarks (Mac M-Series)

| Hardware | 150 Min Audio | Batch Size |
|----------|--------------|------------|
| M1 Pro (16GB) | ~180s | 4 |
| M2 Max (32GB) | ~120s | 8 |
| M3 Max (64GB) | ~98s | 16 |

### Hermes-Integration

```bash
# Hermes Tool: audio_transcribe
insanely-fast-whisper --file-name $INPUT_FILE --device-id mps --batch-size 4 --language de -o $OUTPUT_FILE
```

Hermes kann dieses Tool über die `terminal`-Toolset nutzen um Audio-Dateien lokal zu transkribieren.

---

## 2. MarkItDown

**Repo:** [microsoft/markitdown](https://github.com/microsoft/markitdown)  
**Was:** Konvertiert jedes Dateiformat in LLM-lesbares Markdown.  
**Sprache:** Python 3.10+

### Installation

```bash
pip install markitdown[all]
```

### CLI-Nutzung

```bash
# PDF → Markdown (stdout)
markitdown report.pdf

# PDF → Markdown (Datei)
markitdown report.pdf -o report.md

# PowerPoint → Markdown
markitdown pitch-deck.pptx -o pitch.md

# Excel → Markdown (Tabellen werden als MD Tables gerendert)
markitdown financials.xlsx -o financials.md

# ZIP → Markdown (iteriert über alle Dateien im Archiv)
markitdown archive.zip -o extracted.md

# Piping
cat document.docx | markitdown --extension docx > output.md
```

### Unterstützte Formate

| Format | Extension | Was wird extrahiert |
|--------|-----------|-------------------|
| PDF | `.pdf` | Text, Layout-Struktur |
| Word | `.docx` | Text, Überschriften, Listen, Tabellen |
| PowerPoint | `.pptx` | Slide-Text, Speaker Notes |
| Excel | `.xlsx` | Tabellen als Markdown Tables |
| HTML | `.html` | Strukturierter Text |
| CSV | `.csv` | Markdown-Tabelle |
| JSON | `.json` | Formatierter Key-Value Output |
| XML | `.xml` | Strukturierter Text |
| ZIP | `.zip` | Iteriert über Inhalt, konvertiert einzeln |
| Images | `.jpg/.png` | EXIF Metadata, OCR (optional) |
| Audio | `.mp3/.wav` | EXIF Metadata |
| EPUB | `.epub` | Strukturierter Buchtext |

### Python API (für Edge Functions)

```python
from markitdown import MarkItDown

md = MarkItDown()
result = md.convert("report.pdf")
print(result.text_content)
```

### Hermes-Integration

```bash
# Hermes Tool: file_to_markdown
markitdown $INPUT_FILE -o $OUTPUT_FILE
```

Hermes kann jede empfangene Datei (PDF, PPTX, XLSX) zuerst durch MarkItDown jagen, bevor er sie analysiert. Das garantiert LLM-lesbaren Input.

---

## 3. Kombinierte Pipeline

```
Audio-Input  →  insanely-fast-whisper  →  transcript.json
                                              ↓
                                        markitdown (optional)
                                              ↓
Document-Input →  markitdown            →  content.md
                                              ↓
                                        Hermes Agent (Analyse)
                                              ↓
                                        Structured Output / Action
```

### Beispiel: Meeting-Protokoll automatisieren

```bash
# 1. Audio transkribieren
insanely-fast-whisper --file-name meeting.m4a --device-id mps --batch-size 4 -o meeting.json

# 2. Begleit-Slides konvertieren
markitdown slides.pptx -o slides.md

# 3. Hermes: "Erstelle ein Meeting-Protokoll aus der Transkription und den Slides"
```

---

## 4. Zuordnung zu Agents

| Agent | Whisper | MarkItDown | Anwendung |
|-------|---------|------------|-----------|
| NOUS (CEO) | ❌ | ✅ | Dokumente lesen (Board Reports, PDFs) |
| Hermes (Marketing) | ✅ | ✅ | Podcast-Transkription, Competitor-PDFs |
| Athena (Research) | ❌ | ✅ | Paper-PDFs, Datensätze |
| Hephaistos (Content) | ✅ | ✅ | Voice Memos → Blog Posts |
| Prometheus (Tech Ops) | ❌ | ✅ | Log-Files, Config-Dumps |
| Iris (Community) | ✅ | ❌ | Voice-Feedback transkribieren |
| Apollo (Data) | ❌ | ✅ | Excel-Reports → Analyse |
