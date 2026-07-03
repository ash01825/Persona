"""Abstract base class for source providers."""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class SourceDocument:
    """A document found by a source provider, ready for chunking and ingestion."""

    title: str
    author: str
    source_type: str  # "book" | "patent" | "paper" | "letter" | "speech" | "transcript"
    source_provider: str  # "gutenberg" | "internet_archive" | "patents" | "youtube"
    source_id: str  # Unique ID within the provider
    content: str
    url: str = ""
    year: int = 0


class BaseSourceProvider(ABC):
    """Abstract base for source providers (Gutenberg, Patents, YouTube, etc.)."""

    @abstractmethod
    async def search(self, person_name: str, max_results: int = 5) -> list[SourceDocument]:
        """Search for sources related to a person."""
        ...

    @abstractmethod
    async def fetch(self, source_id: str) -> SourceDocument:
        """Fetch a specific source's content."""
        ...
