"""
Multi-format image embedding (PNG, JPEG, GIF, WEBP, SVG) for the Surface's
top-down coordinate system.

Raster formats are handled by reportlab's `ImageReader`, which delegates to
Pillow — Pillow's standard wheels include WEBP support, so no conversion step
is needed there. SVG is embedded as true vector paths via `svglib`, so logos
stay crisp rather than being rasterized.
"""
import os
from io import BytesIO
from typing import Optional, Union

ImageSource = Union[str, bytes, bytearray, BytesIO]


def _detect_from_bytes(head: bytes) -> str:
    if head.startswith(b'\x89PNG'):
        return 'png'
    if head.startswith(b'\xff\xd8\xff'):
        return 'jpeg'
    if head.startswith(b'GIF8'):
        return 'gif'
    if head[:4] == b'RIFF' and head[8:12] == b'WEBP':
        return 'webp'
    stripped = head.lstrip()
    if stripped.startswith(b'<svg') or stripped.startswith(b'<?xml'):
        return 'svg'
    return 'unknown'


def detect_format(source: ImageSource) -> str:
    if isinstance(source, str):
        ext = os.path.splitext(source)[1].lower()
        by_ext = {'.png': 'png', '.jpg': 'jpeg', '.jpeg': 'jpeg', '.webp': 'webp', '.gif': 'gif', '.svg': 'svg'}.get(ext)
        if by_ext:
            return by_ext
        with open(source, 'rb') as f:
            return _detect_from_bytes(f.read(512))

    if isinstance(source, (bytes, bytearray)):
        return _detect_from_bytes(bytes(source[:512]))

    # file-like object
    pos = source.tell()
    head = source.read(512)
    source.seek(pos)
    return _detect_from_bytes(head)


def _as_readable(source: ImageSource):
    """Normalizes str/bytes/file-like into something reportlab/svglib can open."""
    if isinstance(source, (bytes, bytearray)):
        return BytesIO(source)
    return source


def _draw_raster(surface, x: float, y_top: float, source: ImageSource, width: Optional[float], height: Optional[float]) -> None:
    from reportlab.lib.utils import ImageReader

    reader = ImageReader(_as_readable(source))
    if width is None or height is None:
        iw, ih = reader.getSize()
        width = width or iw
        height = height or ih

    canvas_y = surface.page_height - y_top - height
    surface.canvas.drawImage(reader, x, canvas_y, width=width, height=height, mask='auto')


def _draw_svg(surface, x: float, y_top: float, source: ImageSource, width: Optional[float], height: Optional[float]) -> None:
    from svglib.svglib import svg2rlg
    from reportlab.graphics import renderPDF

    drawing = svg2rlg(_as_readable(source))
    if drawing is None:
        raise ValueError('Could not parse SVG image')

    scale_x = (width / drawing.width) if width else None
    scale_y = (height / drawing.height) if height else None
    if scale_x is None and scale_y is None:
        scale_x = scale_y = 1.0
    elif scale_x is None:
        scale_x = scale_y
    elif scale_y is None:
        scale_y = scale_x

    drawing.scale(scale_x, scale_y)
    final_width = drawing.width * scale_x
    final_height = drawing.height * scale_y

    canvas_y = surface.page_height - y_top - final_height
    renderPDF.draw(drawing, surface.canvas, x, canvas_y)


def draw_image(surface, x: float, y_top: float, source: ImageSource, width: Optional[float] = None, height: Optional[float] = None) -> None:
    """Draws PNG/JPEG/GIF/WEBP/SVG at the given top-down (x, y_top) position."""
    fmt = detect_format(source)
    if fmt == 'svg':
        _draw_svg(surface, x, y_top, source, width, height)
    else:
        _draw_raster(surface, x, y_top, source, width, height)
