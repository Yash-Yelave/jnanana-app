"""Bootstrap an admin account.

Credentials come from the environment — never hard-code them here. Set
ADMIN_EMAIL and ADMIN_PASSWORD (see .env.example) before running:

    uv run python create_admin_user.py
"""

import os
import sys

import httpx
import psycopg

from app.config import get_settings


def setup_admin() -> None:
    email = os.environ.get("ADMIN_EMAIL")
    password = os.environ.get("ADMIN_PASSWORD")
    if not email or not password:
        sys.exit("ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment.")

    settings = get_settings()
    secret_key = settings.supabase_secret_key.get_secret_value()
    url = f"{settings.supabase_url.rstrip('/')}/auth/v1/admin/users"
    headers = {
        "apikey": secret_key,
        "Authorization": f"Bearer {secret_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "email": email,
        "password": password,
        "email_confirm": True,
        "user_metadata": {"first_name": "admin", "last_name": "admin", "name": "admin"},
        "app_metadata": {"role": "admin"},
    }

    user_id = None
    with httpx.Client() as client:
        response = client.post(url, headers=headers, json=payload, timeout=30)
        if response.status_code in (200, 201):
            user_id = response.json().get("id")
            print(f"Created admin auth user {email}")
        elif response.status_code == 422:
            listed = client.get(url, headers=headers, params={"page": 1, "per_page": 200}, timeout=30)
            listed.raise_for_status()
            for user in listed.json().get("users", []):
                if user.get("email") == email:
                    user_id = user["id"]
                    break
            if user_id:
                client.put(
                    f"{url}/{user_id}",
                    headers=headers,
                    json={"app_metadata": {"role": "admin"}},
                    timeout=30,
                ).raise_for_status()
                print(f"Promoted existing user {email} to admin")
        else:
            response.raise_for_status()

    if not user_id:
        sys.exit("Could not resolve the admin user id.")

    with psycopg.connect(settings.database_url.replace("+asyncpg", "")) as conn:
        conn.execute(
            """
            insert into public.profiles (id, role, onboarding_status, first_name, last_name)
            values (%s, 'admin', 'complete', 'Admin', 'User')
            on conflict (id) do update set role = 'admin', onboarding_status = 'complete'
            """,
            (user_id,),
        )
        conn.commit()

    print(f"Admin profile ready: {user_id}")


if __name__ == "__main__":
    setup_admin()
