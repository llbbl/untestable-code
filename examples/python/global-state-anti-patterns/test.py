"""
This example demonstrates how to test code with proper state management:

1. Tests are independent and deterministic
2. Each test has its own isolated state
3. No shared state between tests
"""

import unittest
from testable import Cache, UserService, UserStats, CacheStats


class TestCache(unittest.TestCase):
    def setUp(self):
        # Each test gets a fresh cache instance
        self.cache = Cache()

    def test_cache_operations(self):
        # Test setting and getting values
        self.cache.set('1', {'id': 1, 'name': 'Test User'})
        self.assertEqual(self.cache.get('1'), {'id': 1, 'name': 'Test User'})
        self.assertIsNone(self.cache.get('2'))

    def test_cache_stats(self):
        # Test cache statistics
        self.cache.get('1')  # Miss
        self.cache.set('1', {'id': 1})
        self.cache.get('1')  # Hit
        self.cache.get('2')  # Miss

        stats = self.cache.get_stats()
        self.assertEqual(stats.hits, 1)
        self.assertEqual(stats.misses, 2)
        self.assertEqual(stats.size, 1)

    def test_cache_clear(self):
        # Test clearing cache
        self.cache.set('1', {'id': 1})
        self.cache.clear()
        self.assertIsNone(self.cache.get('1'))
        stats = self.cache.get_stats()
        self.assertEqual(stats.hits, 0)
        self.assertEqual(stats.misses, 1)
        self.assertEqual(stats.size, 0)


class TestUserService(unittest.TestCase):
    def setUp(self):
        # Each test gets a fresh cache and service
        self.cache = Cache()
        self.service = UserService(cache=self.cache)

    def test_get_user_from_cache(self):
        # Test getting user from cache
        user_data = {'id': 1, 'name': 'Test User'}
        self.cache.set('1', user_data)
        result = self.service.get_user(1)
        self.assertEqual(result, user_data)

    def test_get_user_from_database(self):
        # Test getting user from database
        result = self.service.get_user(1)
        self.assertEqual(result, {'id': 1, 'name': 'User 1'})
        # Verify it was cached
        self.assertEqual(self.cache.get('1'), {'id': 1, 'name': 'User 1'})

    def test_get_invalid_user(self):
        # Test getting invalid user
        result = self.service.get_user(-1)
        self.assertIsNone(result)


class TestUserStats(unittest.TestCase):
    def setUp(self):
        # Each test gets a fresh cache and stats
        self.cache = Cache()
        self.stats = UserStats(cache=self.cache)

    def test_cache_health(self):
        # Test cache health with good stats
        self.cache.set('1', {'id': 1})
        self.cache.get('1')  # Hit
        self.cache.get('1')  # Hit
        self.cache.get('2')  # Miss
        self.assertTrue(self.stats.is_cache_healthy())

    def test_cache_unhealthy(self):
        # Test cache health with bad stats
        self.cache.get('1')  # Miss
        self.cache.get('2')  # Miss
        self.cache.get('3')  # Miss
        self.cache.set('1', {'id': 1})
        self.cache.get('1')  # Hit
        self.assertFalse(self.stats.is_cache_healthy())


if __name__ == '__main__':
    unittest.main() 