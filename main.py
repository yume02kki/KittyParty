import pandas as pd

from api.mock_client import MockApiClient
from models.party_parameters import PartyParameters
from parsing.wkt_parser import WktParser
from transform.linear_transformer import LinearTransformer
from visualization.graph_renderer import GraphRenderer


# Identity basis vectors — no transformation applied.
# Swap these to project into a rotated/scaled coordinate system.
VECTOR_X: tuple[float, float] = (1.0, 0.0)
VECTOR_Y: tuple[float, float] = (0.0, 1.0)


def fetch_parties(query: str) -> list[PartyParameters]:
    client = MockApiClient()
    raw: list[dict] = client.fetch(query)
    df = pd.DataFrame(raw)
    return [PartyParameters(**row) for row in df.to_dict(orient="records")]


def build_renderer(parties: list[PartyParameters]) -> GraphRenderer:
    """Compute the bounding box over all polygons and initialise the renderer."""
    all_coords: list[tuple[float, float]] = []
    parsed: list[list[tuple[float, float]]] = []

    for party in parties:
        coords = WktParser.parse_polygon(party.geometry)
        transformed = LinearTransformer.transform_polygon(coords, VECTOR_X, VECTOR_Y)
        parsed.append(transformed)
        all_coords.extend(transformed)

    if all_coords:
        xs = [c[0] for c in all_coords]
        ys = [c[1] for c in all_coords]
        margin = max((max(xs) - min(xs)), (max(ys) - min(ys))) * 0.1 or 1
        x_min, x_max = min(xs) - margin, max(xs) + margin
        y_min, y_max = min(ys) - margin, max(ys) + margin
    else:
        x_min, x_max, y_min, y_max = 0, 10, 0, 10

    renderer = GraphRenderer(grid_size=100)
    renderer.set_extent(x_min, x_max, y_min, y_max)
    renderer.draw_heatmap()

    for party, coords in zip(parties, parsed):
        renderer.draw_polygon(coords, label=party.guid)

    renderer.set_title("KittyParty — Party Zones")
    return renderer


def main(query: str = "") -> None:
    parties = fetch_parties(query)
    renderer = build_renderer(parties)
    renderer.show()


if __name__ == "__main__":
    main(query="")
