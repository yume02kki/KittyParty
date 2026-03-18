from dataclasses import dataclass


@dataclass
class PartyParameters:
    guid: str
    start_time: str
    geometry: str  # WKT polygon string, e.g. "POLYGON((x1 y1, x2 y2, ...))"
