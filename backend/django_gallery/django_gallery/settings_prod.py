"""
Django settings for django_gallery project.

Generated by 'django-admin startproject' using Django 5.0.6.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.0/ref/settings/
"""

import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!

SECRET_KEY = os.getenv('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG_IS_ON') == 'True'

ALLOWED_HOSTS = ['localhost',
                 '127.0.0.1',
                 os.getenv('HOSTING_IP'),
                 os.getenv('HOSTING_DOMAIN')]


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'albums.apps.AlbumsConfig',
    'images.apps.ImagesConfig',
    'site_config.apps.SiteConfigConfig',
    'admin_site.apps.AdminSiteConfig',
    'core.apps.CoreConfig',
    'static_site.apps.StaticSiteConfig',
    'django.forms',
    'django_cleanup.apps.CleanupConfig'
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

ROOT_URLCONF = 'django_gallery.urls'
FORM_RENDERER = 'django.forms.renderers.TemplatesSetting'
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates/',],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'core.context_processors.site_appearance',
                'static_site.context_processors.contacts',
                'albums.context_processors.sections',
                'albums.context_processors.best_albums',
            ],
        },
    },
]

WSGI_APPLICATION = 'django_gallery.wsgi_prod.application'


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB', 'django'),
        'USER': os.getenv('POSTGRES_USER', 'django'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD', ''),
        'HOST': os.getenv('DB_HOST', ''),
        'PORT': os.getenv('DB_PORT', 5432)
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

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
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'collected_static')
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static'),]

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / "media"
# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# APPERANCE SITE SETTINGS

SITE_TITLE = os.getenv('SITE_TITLE', 'My Site')

VK_LINK = os.getenv('VK_LINK', None)
INSTAGRAM_LINK = os.getenv('INSTAGRAM_LINK', None)
TELEGRAM_LINK = os.getenv('TELEGRAM_LINK', None)


COPYRIGHT = os.getenv('COPYRIGHT', None)


# HTTPS connection

CSRF_COOKIE_SECURE = True
hosting_domain = str(os.getenv('HOSTING_DOMAIN'))
hosting_adress = str(os.getenv('HOSTING_IP'))
trusted_domain = os.getenv('TRUSTED_DOMAIN', ('https://' + hosting_domain))
trusted_adress = os.getenv('TRUSTED_ADRESS', ('https://' + hosting_domain))
CSRF_TRUSTED_ORIGINS = [trusted_domain, trusted_adress ]

# WATERMARK
WATERMARK_TEXT = os.getenv('WATERMARK_TEXT')

DATA_UPLOAD_MAX_NUMBER_FIELDS = 10240
