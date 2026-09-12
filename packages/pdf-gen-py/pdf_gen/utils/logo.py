from typing import Any, Dict, Optional, Union

from .image import ImageSource, draw_image

LogoInput = Union[str, bytes, bytearray, Dict[str, Any]]


def resolve_logo(logo: Optional[LogoInput], default_size: float) -> Optional[Dict[str, Any]]:
    """Normalizes a template's `logo` field (bare path/bytes, or {src, width, height})."""
    if not logo:
        return None
    if isinstance(logo, dict):
        return {
            'src': logo['src'],
            'width': logo.get('width', default_size),
            'height': logo.get('height', default_size),
        }
    return {'src': logo, 'width': default_size, 'height': default_size}


__all__ = ['LogoInput', 'resolve_logo', 'draw_image', 'ImageSource']
