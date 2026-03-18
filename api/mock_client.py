from api.base_client import BaseApiClient


_MOCK_DATA = [
    {
        "guid": "a1b2c3d4-0001",
        "start_time": "2024-01-01T10:00:00",
        "geometry": "POLYGON((0 0, 4 0, 4 3, 0 3, 0 0))",
    },
    {
        "guid": "a1b2c3d4-0002",
        "start_time": "2024-01-02T12:00:00",
        "geometry": "POLYGON((5 5, 9 5, 9 8, 5 8, 5 5))",
    },
    {
        "guid": "a1b2c3d4-0003",
        "start_time": "2024-01-03T14:00:00",
        "geometry": "POLYGON((1 6, 3 4, 5 6, 3 8, 1 6))",
    },
]


class MockApiClient(BaseApiClient):
    def fetch(self, query: str) -> list[dict]:
        """Returns mock party data. In production, replace with a real HTTP call."""
        return [record for record in _MOCK_DATA if query.lower() in record["guid"].lower() or not query]
