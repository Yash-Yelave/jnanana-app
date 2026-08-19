import asyncio
from functools import lru_cache
from typing import Annotated, Any
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient
from pydantic import BaseModel

from app.config import Settings, get_settings

bearer = HTTPBearer(auto_error=False)


class CurrentUser(BaseModel):
    id: UUID
    is_admin: bool = False


@lru_cache
def jwks_client(url: str) -> PyJWKClient:
    return PyJWKClient(url, cache_keys=True)


def _decode_token(token: str, settings: Settings) -> dict[str, Any]:
    project_url = settings.supabase_url.rstrip("/")
    try:
        algorithm = jwt.get_unverified_header(token).get("alg")
        if algorithm not in {"RS256", "ES256", "EdDSA"}:
            raise jwt.InvalidAlgorithmError
        signing_key = jwks_client(f"{project_url}/auth/v1/.well-known/jwks.json").get_signing_key_from_jwt(token)
        claims: dict[str, Any] = jwt.decode(
            token,
            signing_key.key,
            algorithms=[algorithm],
            audience=settings.supabase_jwt_audience,
            issuer=f"{project_url}/auth/v1",
            options={"require": ["exp", "iat", "sub", "aud"]},
        )
        return claims
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail="invalid access token") from exc


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> CurrentUser:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="authentication required")
    claims = await asyncio.to_thread(_decode_token, credentials.credentials, settings)
    try:
        user_id = UUID(str(claims["sub"]))
    except (KeyError, ValueError) as exc:
        raise HTTPException(status_code=401, detail="invalid token subject") from exc
    app_metadata = claims.get("app_metadata")
    is_admin = isinstance(app_metadata, dict) and app_metadata.get("role") == "admin"
    return CurrentUser(id=user_id, is_admin=is_admin)


def require_admin(user: Annotated[CurrentUser, Depends(get_current_user)]) -> CurrentUser:
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="admin access required")
    return user


async def get_current_user_id(user: Annotated[CurrentUser, Depends(get_current_user)]) -> UUID:
    return user.id

