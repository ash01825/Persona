"""
Document chunker for Persona.

Converts raw scraped text into a list of chunk dicts
that the extraction pipeline (pipeline.py) can process.

Chunking strategy:
- Target: ~800 tokens per chunk (~3200 characters for English text)
- Method: Semantic chunking by paragraph/sentence boundaries
- Overlap: 1 paragraph overlap between consecutive chunks
"""
import re
import structlog

logger = structlog.get_logger()

TARGET_CHUNK_CHARS = 3200
OVERLAP_CHARS = 400
MIN_CHUNK_CHARS = 200


def _make_document_id(person_name: str, title: str) -> str:
    person_slug = person_name.lower().replace(" ", "_")
    title_slug = "".join(
        c if c.isalnum() or c == "_" else "_"
        for c in title.lower().replace(" ", "_")
    )[:40]
    return f"{person_slug}_{title_slug}"


def chunk_document(text: str, title: str, source_type: str, person_name: str) -> list[dict]:
    """
    Split a raw text document into overlapping ~800-token text chunks.

    Each chunk includes a one-paragraph overlap with the next chunk
    to ensure no entity mention at a boundary is missed.

    Args:
        text: The raw text content of the document.
        title: The title of the document.
        source_type: "book", "article", "paper", etc.
        person_name: The mind subject's full name (e.g. "Nikola Tesla").

    Returns:
        List of chunk dicts ready for run_ingestion_pipeline().
    """
    text = re.sub(r"\r\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    paragraphs = [p for p in paragraphs if len(p) > 50]

    if not paragraphs:
        logger.warning("Document had no usable paragraphs", title=title)
        return []

    chunks: list[dict] = []
    current_text = ""
    chunk_index = 0
    para_start_indices: list[int] = []

    for i, para in enumerate(paragraphs):
        if len(current_text) + len(para) + 2 <= TARGET_CHUNK_CHARS:
            current_text += ("\n\n" if current_text else "") + para
            para_start_indices.append(i)
        else:
            if len(current_text) >= MIN_CHUNK_CHARS:
                doc_id = _make_document_id(person_name, title)
                chunks.append({
                    "content": current_text,
                    "source_document_id": doc_id,
                    "source_title": title,
                    "source_type": source_type,
                    "chunk_index": chunk_index,
                    "person_name": person_name,
                })
                chunk_index += 1

            overlap_para = paragraphs[para_start_indices[-1]] if para_start_indices else ""
            current_text = overlap_para + ("\n\n" if overlap_para else "") + para
            para_start_indices = [i]

    if len(current_text) >= MIN_CHUNK_CHARS:
        doc_id = _make_document_id(person_name, title)
        chunks.append({
            "content": current_text,
            "source_document_id": doc_id,
            "source_title": title,
            "source_type": source_type,
            "chunk_index": chunk_index,
            "person_name": person_name,
        })

    logger.info(
        "Document chunked",
        title=title,
        total_chars=len(text),
        chunks=len(chunks),
    )

    return chunks
