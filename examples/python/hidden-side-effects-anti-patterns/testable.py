"""
This example demonstrates a testable approach to handling side effects:

1. Makes side effects explicit and injectable
2. Separates business logic from side effects
3. Makes behavior verifiable in isolation
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import json
import os


@dataclass
class UserData:
    username: str
    email: str
    created_at: datetime = None

    def to_dict(self) -> Dict:
        return {
            "username": self.username,
            "email": self.email,
            "created_at": str(self.created_at) if self.created_at else None
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'UserData':
        return cls(
            username=data["username"],
            email=data["email"],
            created_at=datetime.fromisoformat(data["created_at"]) if data.get("created_at") else None
        )


class Storage(ABC):
    @abstractmethod
    def save(self, key: str, data: Dict) -> None:
        pass

    @abstractmethod
    def load(self, key: str) -> Optional[Dict]:
        pass

    @abstractmethod
    def delete(self, key: str) -> bool:
        pass

    @abstractmethod
    def exists(self, key: str) -> bool:
        pass


class FileStorage(Storage):
    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)

    def save(self, key: str, data: Dict) -> None:
        file_path = os.path.join(self.data_dir, f"{key}.json")
        with open(file_path, "w") as f:
            json.dump(data, f)

    def load(self, key: str) -> Optional[Dict]:
        file_path = os.path.join(self.data_dir, f"{key}.json")
        if os.path.exists(file_path):
            with open(file_path, "r") as f:
                return json.load(f)
        return None

    def delete(self, key: str) -> bool:
        file_path = os.path.join(self.data_dir, f"{key}.json")
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False

    def exists(self, key: str) -> bool:
        return os.path.exists(os.path.join(self.data_dir, f"{key}.json"))


class Logger(ABC):
    @abstractmethod
    def info(self, message: str) -> None:
        pass

    @abstractmethod
    def warning(self, message: str) -> None:
        pass


class UserManager:
    def __init__(self, storage: Storage, logger: Logger):
        self.storage = storage
        self.logger = logger

    def create_user(self, user_data: UserData) -> UserData:
        self.logger.info(f"Creating user: {user_data.username}")
        
        # Set creation timestamp
        user_data.created_at = datetime.now()
        
        # Save user data
        self.storage.save(user_data.username, user_data.to_dict())
        
        return user_data

    def get_user(self, username: str) -> Optional[UserData]:
        self.logger.info(f"Fetching user: {username}")
        
        data = self.storage.load(username)
        return UserData.from_dict(data) if data else None

    def delete_user(self, username: str) -> bool:
        self.logger.info(f"Deleting user: {username}")
        return self.storage.delete(username)


class UserValidator:
    def __init__(self, logger: Logger):
        self.logger = logger

    def validate_user(self, user_data: UserData) -> Tuple[bool, List[str]]:
        self.logger.info(f"Validating user: {user_data.username}")
        
        errors = []
        if not user_data.username:
            errors.append("Username is required")
        if not user_data.email:
            errors.append("Email is required")
        elif "@" not in user_data.email:
            errors.append("Invalid email format")
            
        if errors:
            self.logger.warning(f"Validation failed: {errors}")
        else:
            self.logger.info("Validation successful")
            
        return len(errors) == 0, errors 