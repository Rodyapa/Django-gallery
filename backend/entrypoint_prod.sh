
cd django-gallery/
python manage.py makemigrations --no-input
python manage.py migrate --no-input
python manage.py create_default_superuser
python manage.py create_initial_secret_key
python manage.py collectstatic --no-input
cp -r /app/photo-restoration/collected_static/. /backend_static/static/
gunicorn django_gallery.wsgi_prod:application --bind 0.0.0.0:8000