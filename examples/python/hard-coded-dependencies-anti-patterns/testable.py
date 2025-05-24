"""
This example demonstrates a testable approach to dependencies:

1. Uses dependency injection for the session
2. Allows easy mocking and replacement in tests
3. Makes unit testing possible without modifying the code
"""

import requests

class UserService:
    def __init__(self, session=None):
        # Dependency injection: session is passed in or defaults to a new requests.Session
        self.session = session or requests.Session()

    def get_user(self, user_id):
        response = self.session.get(f"https://api.example.com/users/{user_id}")
        if response.status_code == 200:
            return response.json()
        return None

    def create_user(self, user_data):
        response = self.session.post("https://api.example.com/users", json=user_data)
        if response.status_code == 201:
            return response.json()
        return None 