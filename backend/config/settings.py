from pathlib import Path
import os
from dotenv import load_dotenv
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

DEPLOYMENT_ENV = os.getenv("DEPLOYMENT_ENV", "development").lower()


def env_bool(name, default):
    return os.getenv(name, str(default)).lower() in {"1", "true", "yes", "on"}


def env_list(name, default):
    return [item.strip() for item in os.getenv(name, default).split(",") if item.strip()]


DEBUG = env_bool("DEBUG", DEPLOYMENT_ENV != "production")
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    if DEPLOYMENT_ENV == "production":
        raise ImproperlyConfigured("SECRET_KEY must be configured in production.")
    SECRET_KEY = "django-insecure-relay-local-development-only"

ALLOWED_HOSTS = [
    *env_list(
        "ALLOWED_HOSTS",
        "localhost,127.0.0.1" if DEPLOYMENT_ENV != "production" else "",
    ),
]
CSRF_TRUSTED_ORIGINS = env_list(
    "CSRF_TRUSTED_ORIGINS",
    "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001"
    if DEPLOYMENT_ENV != "production"
    else "",
)
CORS_ALLOWED_ORIGINS = env_list(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001"
    if DEPLOYMENT_ENV != "production"
    else "",
)
CORS_ALLOW_CREDENTIALS = True

DB_NAME = os.getenv("DB_NAME", "relay")
DB_USER = os.getenv("DB_USER", "relay")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "5434")
if DEPLOYMENT_ENV == "production" and not all(
    [DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT]
):
    raise ImproperlyConfigured("DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, and DB_PORT are required in production.")

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'api',
    'cases',
    'agents',
    'documents',
    'approvals',
    'outcomes',
    'integrations',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": DB_NAME,
        "USER": DB_USER,
        "PASSWORD": DB_PASSWORD,
        "HOST": DB_HOST,
        "PORT": DB_PORT,
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

SESSION_COOKIE_AGE = int(os.getenv("SESSION_COOKIE_AGE", str(14 * 24 * 60 * 60)))
SESSION_EXPIRE_AT_BROWSER_CLOSE = False
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SECURE = env_bool("SESSION_COOKIE_SECURE", DEPLOYMENT_ENV == "production")
CSRF_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SECURE = env_bool("CSRF_COOKIE_SECURE", DEPLOYMENT_ENV == "production")
SECURE_SSL_REDIRECT = env_bool("SECURE_SSL_REDIRECT", DEPLOYMENT_ENV == "production")
SECURE_HSTS_SECONDS = int(os.getenv("SECURE_HSTS_SECONDS", "31536000" if DEPLOYMENT_ENV == "production" else "0"))
SECURE_HSTS_INCLUDE_SUBDOMAINS = env_bool("SECURE_HSTS_INCLUDE_SUBDOMAINS", DEPLOYMENT_ENV == "production")
SECURE_HSTS_PRELOAD = env_bool("SECURE_HSTS_PRELOAD", DEPLOYMENT_ENV == "production")
SECURE_CONTENT_TYPE_NOSNIFF = True
