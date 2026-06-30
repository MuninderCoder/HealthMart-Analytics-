import os
import json
from ..utils.auth import hash_password, verify_password

USERS_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "users.json")

class UserService:
    @staticmethod
    def initialize():
        # Ensure uploads folder exists
        os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)
        if not os.path.exists(USERS_FILE):
            # Seed default accounts
            default_users = {
                "admin": {
                    "username": "admin",
                    "password": hash_password("AdminPassword123!"),
                    "role": "admin"
                },
                "analyst": {
                    "username": "analyst",
                    "password": hash_password("AnalystPassword123!"),
                    "role": "analyst"
                },
                "viewer": {
                    "username": "viewer",
                    "password": hash_password("ViewerPassword123!"),
                    "role": "viewer"
                }
            }
            UserService._save_users(default_users)

    @staticmethod
    def _load_users() -> dict:
        try:
            if not os.path.exists(USERS_FILE):
                return {}
            with open(USERS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return {}

    @staticmethod
    def _save_users(users: dict):
        with open(USERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(users, f, indent=2, ensure_ascii=False)

    @staticmethod
    def get_user(username: str) -> dict:
        users = UserService._load_users()
        return users.get(username)

    @staticmethod
    def authenticate_user(username: str, password: str) -> dict:
        user = UserService.get_user(username)
        if not user:
            return None
        if verify_password(password, user["password"]):
            return {
                "username": user["username"],
                "role": user["role"]
            }
        return None

    @staticmethod
    def create_user(username: str, password: str, role: str = "viewer") -> bool:
        users = UserService._load_users()
        if username in users:
            return False
            
        users[username] = {
            "username": username,
            "password": hash_password(password),
            "role": role
        }
        UserService._save_users(users)
        return True

    @staticmethod
    def get_all_users() -> list:
        users = UserService._load_users()
        return [
            {"username": u["username"], "role": u["role"]}
            for u in users.values()
        ]
