import logging
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

# Set up clean logging
logger = logging.getLogger("cache")
logger.setLevel(logging.INFO)

class InMemoryCache:
    def __init__(self):
        # We store entries as: { key: { "value": Any, "expires_at": datetime } }
        self._cache: Dict[str, Dict[str, Any]] = {}
        print("\n=== [CACHE] Custom In-Memory Cache Initialized ===")

    async def get(self, key: str) -> Optional[Any]:
        """
        Retrieve a value from the cache.
        If the key is expired, it performs 'lazy eviction' (deletes the key) and returns None.
        """
        if key not in self._cache:
            print(f"\033[93m[CACHE MISS]\033[0m Key '{key}' not found in cache.")
            return None

        entry = self._cache[key]
        now = datetime.utcnow()

        if now > entry["expires_at"]:
            # Lazy Eviction: The key is expired, so delete it and return None
            print(f"\033[91m[CACHE EXPIRED (Lazy Eviction)]\033[0m Key '{key}' has expired. Evicting...")
            del self._cache[key]
            return None

        print(f"\033[92m[CACHE HIT]\033[0m Key '{key}' retrieved successfully.")
        return entry["value"]

    async def set(self, key: str, value: Any, ttl_seconds: int = 300) -> None:
        """
        Store a value in the cache with a specific TTL (Time-To-Live) in seconds.
        """
        expires_at = datetime.utcnow() + timedelta(seconds=ttl_seconds)
        self._cache[key] = {
            "value": value,
            "expires_at": expires_at
        }
        print(f"\033[96m[CACHE SET]\033[0m Key '{key}' saved. TTL: {ttl_seconds}s (Expires at {expires_at.strftime('%H:%M:%S')} UTC)")

    async def delete(self, key: str) -> None:
        """
        Manually delete a key from the cache (Cache Invalidation).
        """
        if key in self._cache:
            del self._cache[key]
            print(f"\033[95m[CACHE INVALIDATE]\033[0m Key '{key}' cleared manually.")
        else:
            print(f"\033[90m[CACHE INVALIDATE]\033[0m Key '{key}' was not in cache, nothing to clear.")

    async def clear(self) -> None:
        """
        Clear all items from the cache.
        """
        self._cache.clear()
        print("\033[95m[CACHE CLEAR]\033[0m Entire cache wiped.")

# Singleton instance of the cache to be imported across the application
cache = InMemoryCache()
