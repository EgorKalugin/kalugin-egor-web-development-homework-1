import os
from typing import Optional

import httpx

CATALOG_SERVICE_URL = os.getenv("CATALOG_SERVICE_URL", "http://localhost:3001")

_client: Optional[httpx.AsyncClient] = None


def get_client() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(base_url=CATALOG_SERVICE_URL, timeout=10.0)
    return _client


async def close_client() -> None:
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None


async def get_product(product_id: int) -> Optional[dict]:
    """Fetch a single active product from the catalog service. Returns None if not found."""
    client = get_client()
    resp = await client.get(f"/api/v1/products/{product_id}")
    if resp.status_code == 404:
        return None
    resp.raise_for_status()
    return resp.json()


async def update_product_stock(product_id: int, new_stock: int) -> None:
    """Set product stock_quantity to new_stock via catalog PATCH endpoint."""
    client = get_client()
    resp = await client.patch(
        f"/api/v1/products/{product_id}",
        json={"stock_quantity": new_stock},
    )
    resp.raise_for_status()
