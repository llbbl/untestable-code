"""
This example demonstrates the Hard-coded Dependencies anti-pattern:

1. Direct instantiation of dependencies within classes
2. No way to inject mock objects or test doubles
3. Makes unit testing impossible without modifying the code
"""

import requests

class UserService:
    def __init__(self):
        # Hard-coded dependency: directly instantiates requests
        self.session = requests.Session()

    def get_user(self, user_id):
        # Directly uses the hard-coded session
        response = self.session.get(f"https://api.example.com/users/{user_id}")
        if response.status_code == 200:
            return response.json()
        return None

    def create_user(self, user_data):
        # Directly uses the hard-coded session
        response = self.session.post("https://api.example.com/users", json=user_data)
        if response.status_code == 201:
            return response.json()
        return None 