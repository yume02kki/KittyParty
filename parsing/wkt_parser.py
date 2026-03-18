import re


class WktParser:
    _POLYGON_PATTERN = re.compile(r"POLYGON\s*\(\s*\(([^)]+)\)\s*\)", re.IGNORECASE)

    @staticmethod
    def parse_polygon(wkt: str) -> list[tuple[float, float]]:
        """
        Parse a WKT POLYGON string into a list of (x, y) coordinate tuples.

        Example input:  "POLYGON((0 0, 4 0, 4 3, 0 3, 0 0))"
        Example output: [(0.0, 0.0), (4.0, 0.0), (4.0, 3.0), (0.0, 3.0), (0.0, 0.0)]
        """
        match = WktParser._POLYGON_PATTERN.search(wkt)
        if not match:
            raise ValueError(f"Cannot parse WKT polygon: {wkt!r}")

        coords_str = match.group(1)
        coords = []
        for pair in coords_str.split(","):
            parts = pair.strip().split()
            if len(parts) != 2:
                raise ValueError(f"Unexpected coordinate pair: {pair!r}")
            coords.append((float(parts[0]), float(parts[1])))

        return coords
