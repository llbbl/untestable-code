"""
This example demonstrates the Global State anti-pattern:

1. Shared mutable state across multiple components
2. Static variables and singletons that maintain state
3. Makes tests non-deterministic and dependent on execution order
"""

class UserCache:
    # Global state: shared cache across all instances
    _cache = {}
    _hit_count = 0
    _miss_count = 0

    @classmethod
    def get(cls, user_id):
        if user_id in cls._cache:
            cls._hit_count += 1
            return cls._cache[user_id]
        cls._miss_count += 1
        return None

    @classmethod
    def set(cls, user_id, user_data):
        cls._cache[user_id] = user_data

    @classmethod
    def clear(cls):
        cls._cache.clear()
        cls._hit_count = 0
        cls._miss_count = 0

    @classmethod
    def get_stats(cls):
        return {
            'hits': cls._hit_count,
            'misses': cls._miss_count,
            'size': len(cls._cache)
        }


class UserService:
    def __init__(self):
        # Depends on global state
        self.cache = UserCache()

    def get_user(self, user_id):
        # First try to get from global cache
        cached_user = self.cache.get(user_id)
        if cached_user:
            return cached_user

        # If not in cache, fetch from database
        # In a real application, this would be a database call
        user_data = self._fetch_from_database(user_id)
        if user_data:
            # Update global cache
            self.cache.set(user_id, user_data)
        return user_data

    def _fetch_from_database(self, user_id):
        # Simulate database fetch
        return {'id': user_id, 'name': f'User {user_id}'} if user_id > 0 else None


class UserStats:
    def __init__(self):
        # Depends on global state
        self.cache = UserCache()

    def get_cache_stats(self):
        # Returns stats from global state
        return self.cache.get_stats()

    def is_cache_healthy(self):
        stats = self.get_cache_stats()
        # Arbitrary business logic based on global state
        return stats['hits'] > stats['misses'] and stats['size'] < 1000 