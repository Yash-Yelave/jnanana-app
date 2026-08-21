"""Seed dedicated test accounts for automated browser testing and QA verification.

Creates:
1. Mentee: test.mentee@jnanana.org / TestMentee123!
2. Mentor: test.mentor@jnanana.org / TestMentor123!
"""

import sys
import httpx
import psycopg

from app.config import get_settings


TEST_ACCOUNTS = [
    {
        "email": "test.mentee@jnanana.org",
        "password": "TestMentee123!",
        "role": "student",
        "first_name": "Test",
        "last_name": "Mentee",
        "balance": 50,
    },
    {
        "email": "test.mentor@jnanana.org",
        "password": "TestMentor123!",
        "role": "mentor",
        "first_name": "Test",
        "last_name": "Mentor",
        "headline": "Senior Tech Lead & Startup Advisor",
        "bio": "Experienced technology mentor guiding students in system design, React, and cloud architecture.",
        "professions": ["Software Engineering", "System Design", "Mentorship"],
        "languages": ["English", "Hindi"],
        "companies": ["Jnanana Tech"],
    },
]


def seed_accounts() -> None:
    settings = get_settings()
    secret_key = settings.supabase_secret_key.get_secret_value() if settings.supabase_secret_key else ""
    url = f"{settings.supabase_url.rstrip('/')}/auth/v1/admin/users"
    headers = {
        "apikey": secret_key,
        "Authorization": f"Bearer {secret_key}",
        "Content-Type": "application/json",
    }

    with httpx.Client() as client:
        for acc in TEST_ACCOUNTS:
            email = acc["email"]
            password = acc["password"]
            role = acc["role"]
            first_name = acc["first_name"]
            last_name = acc["last_name"]

            payload = {
                "email": email,
                "password": password,
                "email_confirm": True,
                "user_metadata": {"first_name": first_name, "last_name": last_name, "name": f"{first_name} {last_name}"},
                "app_metadata": {"role": role},
            }

            user_id = None
            res = client.post(url, headers=headers, json=payload, timeout=30)
            if res.status_code in (200, 201):
                user_id = res.json().get("id")
                print(f"[SUCCESS] Created auth user: {email}")
            elif res.status_code == 422:
                listed = client.get(url, headers=headers, params={"page": 1, "per_page": 200}, timeout=30)
                listed.raise_for_status()
                for u in listed.json().get("users", []):
                    if u.get("email") == email:
                        user_id = u["id"]
                        break
                if user_id:
                    client.put(
                        f"{url}/{user_id}",
                        headers=headers,
                        json={"password": password, "email_confirm": True, "app_metadata": {"role": role}},
                        timeout=30,
                    ).raise_for_status()
                    print(f"[SUCCESS] Updated existing auth user: {email}")

            if not user_id:
                print(f"[WARNING] Could not resolve user_id for {email}")
                continue

            conn_info = settings.database_url.replace("postgresql+psycopg://", "postgresql://")
            with psycopg.connect(conn_info) as conn:
                conn.execute(
                    """
                    insert into public.profiles (id, role, onboarding_status, first_name, last_name)
                    values (%s, %s, 'complete', %s, %s)
                    on conflict (id) do update set role = %s, onboarding_status = 'complete', first_name = %s, last_name = %s
                    """,
                    (user_id, role, first_name, last_name, role, first_name, last_name),
                )

                if role == "mentor":
                    conn.execute(
                        """
                        insert into public.mentor_profiles (profile_id, headline, bio, approval_status, professions, languages, companies)
                        values (%s, %s, %s, 'approved', %s, %s, %s)
                        on conflict (profile_id) do update set approval_status = 'approved', headline = %s, bio = %s
                        """,
                        (
                            user_id,
                            acc.get("headline"),
                            acc.get("bio"),
                            acc.get("professions", []),
                            acc.get("languages", []),
                            acc.get("companies", []),
                            acc.get("headline"),
                            acc.get("bio"),
                        ),
                    )

                if "balance" in acc:
                    conn.execute(
                        """
                        insert into public.jule_wallets (user_id, balance)
                        values (%s, %s)
                        on conflict (user_id) do update set balance = %s
                        """,
                        (user_id, acc["balance"], acc["balance"]),
                    )

                conn.commit()
                print(f"  Profile & details ready for {email} ({user_id})")

    print("\n[SUCCESS] Test account seeding completed successfully!")


if __name__ == "__main__":
    seed_accounts()
