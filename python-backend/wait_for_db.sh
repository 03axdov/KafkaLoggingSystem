#!/bin/sh

until python manage.py migrate; do
  echo "Postgres not ready yet..."
  sleep 2
done

python manage.py runserver 0.0.0.0:8000