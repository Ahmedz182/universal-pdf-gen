from datetime import datetime, date
from typing import Any, Dict, List, Union

DateLike = Union[datetime, date, str]


def require_fields(data: Dict[str, Any], fields: List[str], template_name: str) -> None:
    missing = [f for f in fields if data.get(f) in (None, '')]
    if missing:
        raise ValueError(
            f'Missing required field(s) for "{template_name}" template: {", ".join(missing)}'
        )


def to_date(value: DateLike, fallback: datetime = None) -> datetime:
    if isinstance(value, datetime):
        return value
    if isinstance(value, date):
        return datetime(value.year, value.month, value.day)
    if isinstance(value, str):
        for fmt in ('%Y-%m-%d', '%Y-%m-%dT%H:%M:%S', '%Y-%m-%d %H:%M', '%m/%d/%Y'):
            try:
                return datetime.strptime(value, fmt)
            except ValueError:
                continue
    return fallback or datetime.now()


def format_date(value: DateLike) -> str:
    return to_date(value).strftime('%B %d, %Y')


def format_currency(amount: float, currency: str = 'USD') -> str:
    symbols = {'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹', 'PKR': 'Rs '}
    symbol = symbols.get(currency, currency + ' ')
    return f'{symbol}{amount:,.2f}'
