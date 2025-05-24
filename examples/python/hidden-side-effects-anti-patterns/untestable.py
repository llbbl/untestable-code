"""
This example demonstrates the Hidden Side Effects anti-pattern:

1. Methods that modify state without clear indication
2. Unexpected interactions with external systems
3. Makes it difficult to verify behavior in isolation
"""

import os
import json
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class UserManager:
    def __init__(self):
        # Hidden side effect: Creates directory on instantiation
        self.data_dir = "user_data"
        os.makedirs(self.data_dir, exist_ok=True)
        
        # Hidden side effect: Initializes file with timestamp
        self._initialize_data_file()

    def _initialize_data_file(self):
        # Hidden side effect: Creates and writes to file
        with open(os.path.join(self.data_dir, "users.json"), "w") as f:
            json.dump({"last_updated": str(datetime.now())}, f)

    def create_user(self, user_data):
        # Hidden side effect: Logs operation
        logger.info(f"Creating user: {user_data.get('username')}")
        
        # Hidden side effect: Modifies file system
        user_file = os.path.join(self.data_dir, f"{user_data['username']}.json")
        with open(user_file, "w") as f:
            json.dump(user_data, f)
        
        # Hidden side effect: Updates metadata file
        self._update_metadata()
        
        return user_data

    def _update_metadata(self):
        # Hidden side effect: Reads and writes to file
        metadata_file = os.path.join(self.data_dir, "users.json")
        with open(metadata_file, "r") as f:
            metadata = json.load(f)
        metadata["last_updated"] = str(datetime.now())
        with open(metadata_file, "w") as f:
            json.dump(metadata, f)

    def get_user(self, username):
        # Hidden side effect: Logs operation
        logger.info(f"Fetching user: {username}")
        
        # Hidden side effect: Reads from file system
        user_file = os.path.join(self.data_dir, f"{username}.json")
        if os.path.exists(user_file):
            with open(user_file, "r") as f:
                return json.load(f)
        return None

    def delete_user(self, username):
        # Hidden side effect: Logs operation
        logger.info(f"Deleting user: {username}")
        
        # Hidden side effect: Modifies file system
        user_file = os.path.join(self.data_dir, f"{username}.json")
        if os.path.exists(user_file):
            os.remove(user_file)
            # Hidden side effect: Updates metadata
            self._update_metadata()
            return True
        return False


class UserValidator:
    def __init__(self):
        # Hidden side effect: Configures logging
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)

    def validate_user(self, user_data):
        # Hidden side effect: Logs validation
        self.logger.info(f"Validating user: {user_data.get('username')}")
        
        errors = []
        if not user_data.get("username"):
            errors.append("Username is required")
        if not user_data.get("email"):
            errors.append("Email is required")
        elif "@" not in user_data["email"]:
            errors.append("Invalid email format")
            
        # Hidden side effect: Logs validation result
        if errors:
            self.logger.warning(f"Validation failed: {errors}")
        else:
            self.logger.info("Validation successful")
            
        return len(errors) == 0, errors 