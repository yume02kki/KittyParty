class LinearTransformer:
    @staticmethod
    def transform(
        x: float,
        y: float,
        vector_x: tuple[float, float],
        vector_y: tuple[float, float],
    ) -> tuple[float, float]:
        """
        Apply a basis-vector linear transformation to point (x, y).

        vector_x and vector_y are the new basis vectors that define the coordinate
        system in which (x, y) are expressed. The result is the equivalent point
        in standard screen/graph coordinates.

        Math:
            screen_x = x * vector_x[0] + y * vector_y[0]
            screen_y = x * vector_x[1] + y * vector_y[1]

        Args:
            x:        Coordinate along the vector_x axis.
            y:        Coordinate along the vector_y axis.
            vector_x: 2D basis vector for the x-axis, e.g. (1.0, 0.0).
            vector_y: 2D basis vector for the y-axis, e.g. (0.0, 1.0).

        Returns:
            (screen_x, screen_y) in standard coordinates.
        """
        screen_x = x * vector_x[0] + y * vector_y[0]
        screen_y = x * vector_x[1] + y * vector_y[1]
        return screen_x, screen_y

    @staticmethod
    def transform_polygon(
        coords: list[tuple[float, float]],
        vector_x: tuple[float, float],
        vector_y: tuple[float, float],
    ) -> list[tuple[float, float]]:
        """Apply the basis-vector transform to every vertex of a polygon."""
        return [
            LinearTransformer.transform(x, y, vector_x, vector_y)
            for x, y in coords
        ]
