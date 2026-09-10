from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.http import HttpRequest
from django.middleware.csrf import get_token
from ninja import Router, Schema
from ninja.errors import HttpError


class CredentialsIn(Schema):
    email: str
    password: str


class RegistrationIn(CredentialsIn):
    confirm_password: str


class UserOut(Schema):
    id: int
    username: str
    email: str


class CsrfOut(Schema):
    csrf_token: str


User = get_user_model()
router = Router(tags=["auth"])


def serialize_user(user: User) -> dict:
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
    }


@router.get("/csrf", response=CsrfOut)
def csrf_token(request: HttpRequest):
    return {"csrf_token": get_token(request)}


@router.post("/register", response={201: UserOut})
def register(request: HttpRequest, payload: RegistrationIn):
    email = payload.email.strip().lower()
    if not email or "@" not in email:
        raise HttpError(400, "Enter a valid email address.")
    if payload.password != payload.confirm_password:
        raise HttpError(400, "Passwords do not match.")
    if User.objects.filter(email__iexact=email).exists():
        raise HttpError(400, "An account with that email already exists.")

    user = User(username=email, email=email)
    try:
        validate_password(payload.password, user)
    except ValidationError as exc:
        raise HttpError(400, " ".join(exc.messages)) from exc

    user.set_password(payload.password)
    user.save()
    login(request, user)
    return 201, serialize_user(user)


@router.post("/login", response=UserOut)
def login_view(request: HttpRequest, payload: CredentialsIn):
    email = payload.email.strip().lower()
    user = authenticate(request, username=email, password=payload.password)
    if user is None:
        raise HttpError(401, "Invalid email or password.")
    login(request, user)
    return serialize_user(user)


@router.post("/logout")
def logout_view(request: HttpRequest):
    logout(request)
    return {"detail": "Signed out."}


@router.get("/me", response=UserOut)
def current_user(request: HttpRequest):
    if not request.user.is_authenticated:
        raise HttpError(401, "Authentication required.")
    return serialize_user(request.user)