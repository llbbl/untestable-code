"""
This example demonstrates a testable approach to state management:

1. Uses dependency injection for stateful components
2. Maintains state at the instance level
3. Makes tests deterministic and independent
"""

from dataclasses import dataclass
from typing import Dict, Optional


@dataclass
class CacheStats:
    hits: int = 0
    misses: int = 0
    size: int = 0


class Cache:
    def __init__(self):
        # Instance state instead of global state
        self._cache: Dict[str, dict] = {}
        self._stats = CacheStats()

    def get(self, key: str) -> Optional[dict]:
        if key in self._cache:
            self._stats.hits += 1
            return self._cache[key]
        self._stats.misses += 1
        return None

    def set(self, key: str, value: dict) -> None:
        self._cache[key] = value
        self._stats.size = len(self._cache)

    def clear(self) -> None:
        self._cache.clear()
        self._stats = CacheStats()

    def get_stats(self) -> CacheStats:
        return self._stats


class UserService:
    def __init__(self, cache: Optional[Cache] = None):
        # Dependency injection for cache
        self.cache = cache or Cache()

    def get_user(self, user_id: int) -> Optional[dict]:
        # First try to get from cache
        cached_user = self.cache.get(str(user_id))
        if cached_user:
            return cached_user

        # If not in cache, fetch from database
        user_data = self._fetch_from_database(user_id)
        if user_data:
            # Update cache
            self.cache.set(str(user_id), user_data)
        return user_data

    def _fetch_from_database(self, user_id: int) -> Optional[dict]:
        # Simulate database fetch
        return {'id': user_id, 'name': f'User {user_id}'} if user_id > 0 else None


class UserStats:
    def __init__(self, cache: Cache):
        # Dependency injection for cache
        self.cache = cache

    def get_cache_stats(self) -> CacheStats:
        return self.cache.get_stats()

    def is_cache_healthy(self) -> bool:
        stats = self.get_cache_stats()
        # Business logic based on injected cache state
        return stats.hits > stats.misses and stats.size < 1000 