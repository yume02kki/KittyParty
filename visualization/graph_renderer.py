import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import Polygon as MplPolygon
from matplotlib.collections import PatchCollection


class GraphRenderer:
    def __init__(self, grid_size: int = 100, figsize: tuple[int, int] = (8, 8)):
        """
        Args:
            grid_size: Resolution of the heatmap grid (NxN cells).
            figsize:   Matplotlib figure size in inches.
        """
        self._grid_size = grid_size
        self._heat_grid = np.zeros((grid_size, grid_size), dtype=float)

        self._fig, self._ax = plt.subplots(figsize=figsize)
        self._ax.set_aspect("equal")
        self._ax.set_facecolor("white")

        self._heatmap_image = None
        self._extent: list[float] | None = None

    # ------------------------------------------------------------------
    # Heatmap
    # ------------------------------------------------------------------

    def set_extent(self, x_min: float, x_max: float, y_min: float, y_max: float) -> None:
        """Set the real-world bounding box the heatmap covers."""
        self._extent = [x_min, x_max, y_min, y_max]

    def set_heat(self, grid_x: int, grid_y: int, value: float) -> None:
        """
        Set a heat value at a specific grid cell.

        Args:
            grid_x: Column index (0 .. grid_size-1).
            grid_y: Row index   (0 .. grid_size-1).
            value:  Heat intensity in [0, 1]. 0 = white (invisible), 1 = black.
        """
        value = max(0.0, min(1.0, value))
        self._heat_grid[grid_y, grid_x] = value
        if self._heatmap_image is not None:
            self._heatmap_image.set_data(self._heat_grid)

    def draw_heatmap(self) -> None:
        """
        Render the heatmap as the graph background.

        Uses a white-to-black ('Greys') colormap.  At zero fill the background
        is pure white and visually indistinguishable from an empty canvas.
        Call set_heat() to add intensity before calling show().
        """
        extent = self._extent or [0, self._grid_size, 0, self._grid_size]
        self._heatmap_image = self._ax.imshow(
            self._heat_grid,
            cmap="Greys",
            vmin=0,
            vmax=1,
            origin="lower",
            extent=extent,
            aspect="auto",
            alpha=0.5,
            zorder=0,
        )

    # ------------------------------------------------------------------
    # Polygon drawing
    # ------------------------------------------------------------------

    def draw_polygon(
        self,
        coords: list[tuple[float, float]],
        label: str = "",
        edge_color: str = "#1f77b4",
        fill_color: str = "#aec7e8",
        alpha: float = 0.5,
    ) -> None:
        """
        Draw a filled polygon on the graph.

        Args:
            coords:     List of (x, y) vertices.
            label:      Legend label (uses the guid by default).
            edge_color: Outline colour.
            fill_color: Fill colour.
            alpha:      Fill transparency.
        """
        if not coords:
            return

        xs = [c[0] for c in coords]
        ys = [c[1] for c in coords]

        self._ax.fill(xs, ys, color=fill_color, alpha=alpha, zorder=1)
        self._ax.plot(xs, ys, color=edge_color, linewidth=1.5, zorder=2)

        if label:
            cx = sum(xs) / len(xs)
            cy = sum(ys) / len(ys)
            self._ax.text(cx, cy, label, ha="center", va="center", fontsize=7, zorder=3)

    # ------------------------------------------------------------------
    # Display
    # ------------------------------------------------------------------

    def set_title(self, title: str) -> None:
        self._ax.set_title(title)

    def show(self) -> None:
        plt.tight_layout()
        plt.show()
