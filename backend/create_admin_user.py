import httpx
import psycopg
from app.config import get_settings

def setup_admin():
    settings = get_settings()
    secret_key = settings.supabase_secret_key.get_secret_value() if settings.supabase_secret_key else ""
    admin_email = settings.admin_email or "admin@jnanana.org"
    admin_password = settings.admin_password.get_secret_value() if settings.admin_password else "Jarvisyash1@1"

    url = f"{settings.supabase_url.rstrip('/')}/auth/v1/admin/users"
    headers = {
        "apikey": secret_key,
        "Authorization": f"Bearer {secret_key}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "email": admin_email,
        "password": admin_password,
        "email_confirm": True,
        "user_metadata": {
            "first_name": "admin",
            "last_name": "admin",
            "name": "admin"
        },
        "app_metadata": {
            "role": "admin"
        }
    }
    
    user_id = None
    with httpx.Client() as client:
        res = client.get(url, headers=headers)
        if res.status_code == 200:
            users_data = res.json()
            users = users_data.get("users", []) if isinstance(users_data, dict) else users_data
            for u in users:
                if u.get("email") == admin_email:
                    user_id = u.get("id")
                    break
        
        if user_id:
            print(f"Updating admin user {user_id}...")
            update_url = f"{url}/{user_id}"
            update_payload = {
                "password": admin_password,
                "email_confirm": True,
                "user_metadata": {
                    "first_name": "admin",
                    "last_name": "admin",
                    "name": "admin"
                },
                "app_metadata": {
                    "role": "admin"
                }
            }
            res = client.put(update_url, headers=headers, json=update_payload)
            print("PUT update status:", res.status_code)
        else:
            print("Creating new admin user...")
            res = client.post(url, headers=headers, json=payload)
            print("POST create status:", res.status_code)
            if res.status_code in (200, 201):
                user_id = res.json().get("id")

    if user_id:
        db_url = settings.database_url.replace("postgresql+psycopg://", "postgresql://")
        print("Ensuring public.profiles row exists in database...")
        with psycopg.connect(db_url) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO public.profiles (id, role, onboarding_status, first_name, last_name, username)
                    VALUES (%s, 'student', 'complete', 'admin', 'admin', 'admin_rostopedia')
                    ON CONFLICT (id) DO UPDATE SET
                      role = EXCLUDED.role,
                      onboarding_status = 'complete',
                      first_name = EXCLUDED.first_name,
                      last_name = EXCLUDED.last_name;
                    """,
                    (user_id,)
                )
                conn.commit()
                print("Public profile row verified successfully!")

    print("\nTesting authentication and admin claims...")
    token_url = f"{settings.supabase_url.rstrip('/')}/auth/v1/token?grant_type=password"
    token_headers = {
        "apikey": settings.supabase_publishable_key,
        "Content-Type": "application/json",
    }
    login_body = {
        "email": admin_email,
        "password": admin_password
    }
    with httpx.Client() as client:
        res = client.post(token_url, headers=token_headers, json=login_body)
        print("Login status:", res.status_code)
        if res.status_code == 200:
            token_data = res.json()
            user_data = token_data.get("user", {})
            app_meta = user_data.get("app_metadata", {})
            print("Authentication successful!")
            print("User ID:", user_data.get("id"))
            print("Email:", user_data.get("email"))
            print("App Metadata Role:", app_meta.get("role"))
            print("Confirmed At:", user_data.get("email_confirmed_at"))
        else:
            print("Login error:", res.text)

if __name__ == "__main__":
    setup_admin()
