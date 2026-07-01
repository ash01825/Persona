"""Abstract base class for source providers."""
from abc import ABC, abstractmethod


class BaseSourceProvider(ABC):
    """Abstract base for source providers (Gutenberg, Patents, YouTube, etc.)."""

    @abstractmethod
    async def search(self, query: str) -> list[dict]:
        """Search for sources related to a person."""
        ...

    @abstractmethod
    async def fetch(self, source_id: str) -> dict:
        """Fetch a specific source's content."""
        ...
