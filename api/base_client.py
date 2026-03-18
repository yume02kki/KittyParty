from abc import ABC, abstractmethod


class BaseApiClient(ABC):
    @abstractmethod
    def fetch(self, query: str) -> list[dict]:
        """Fetch a list of PartyParameters-shaped dicts based on a query string."""
