"""
Django settings for ikarodjango project.

Generated by 'django-admin startproject' using Django 2.2.2.

For more information on this file, see
https://docs.djangoproject.com/en/2.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.2/ref/settings/
"""

import os

from ikaro.system import (
    PLACEHOLDER_FOR_SECRET,
    load_env_settings,
)

SERVER_ENV = os.getenv('SERVER_ENV', 'DEV').upper()

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO_DIR = os.path.dirname(BASE_DIR)
DATA_DIR = os.path.abspath(os.path.join(REPO_DIR, 'data'))
ENV_DIR = os.path.join(REPO_DIR, 'env')
ENV_SECRETS_FILE = os.path.join(ENV_DIR, 'secrets.env')

GIT_SHA = "someshafornow"

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = PLACEHOLDER_FOR_SECRET

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False
STATIC_URL = '/static/'
MEDIA_URL = '/media/'

ALLOWED_HOSTS = ['*']

IPYTHON_ARGUMENTS = ['--no-confirm-exit', '--no-banner']
ENABLE_DEBUG_TOOLBAR = False

TEMPLATES_DIR = os.path.join(BASE_DIR, 'templates')
STATICFILES_DIR = os.path.join(BASE_DIR, 'static')
MEDIA_ROOT = os.path.join(DATA_DIR, 'media')
STATIC_ROOT = os.path.join(DATA_DIR, 'static')

REDIS_URL = "redis://localhost:6379"

MAP_KEY = PLACEHOLDER_FOR_SECRET

# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
# Load Settings Overrides from Environment Config Files
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

# settings defined above in this file (settings.py)
SETTINGS_DEFAULTS = load_env_settings(env=globals())

# settings set via env/secrets.env
ENV_SECRETS = load_env_settings(
    dotenv_path=ENV_SECRETS_FILE, defaults=globals())
globals().update(ENV_SECRETS)

# settings set via environemtn variables
ENV_OVERRIDES = load_env_settings(env=dict(os.environ), defaults=globals())
globals().update(ENV_OVERRIDES)
SETTINGS_SOURCES = {
    'settings.py': SETTINGS_DEFAULTS,
    ENV_SECRETS_FILE: ENV_SECRETS,
    'os.environ': ENV_OVERRIDES,
}
# To track down where a specific setting is being imported from:
# print('Setting sources: \n{SETTINGS_SOURCES}')
# print(config.system.get_setting_source(SETTING_NAME))


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'channels',
    'django_extensions',

    'ikaro',
    'ui',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'ikaro.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [TEMPLATES_DIR],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [REDIS_URL],
        },
    },
}

DEBUG_TOOLBAR_CONFIG = {
    "SHOW_TOOLBAR_CALLBACK": lambda request:
        request.user.is_authenticated and request.user.debug_toolbar,
}

STATICFILES_DIRS = [STATICFILES_DIR]

# WSGI_APPLICATION = 'ikaro.wsgi.application'
ASGI_APPLICATION = 'ikaro.routing.application'

# Database
# https://docs.djangoproject.com/en/2.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

if ENABLE_DEBUG_TOOLBAR:
    INSTALLED_APPS = ["debug_toolbar", ] + INSTALLED_APPS
    MIDDLEWARE = MIDDLEWARE + [
        "debug_toolbar.middleware.DebugToolbarMiddleware",
    ]


AUTH_USER_MODEL = 'ikaro.User'
# Password validation
# https://docs.djangoproject.com/en/2.2/ref/settings/#auth-password-validators

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

# Internationalization
# https://docs.djangoproject.com/en/2.2/topics/i18n/

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True
INTERNAL_IPS = ['127.0.0.1']
