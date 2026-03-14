FROM python:3.11-slim

WORKDIR /app

# OS deps for WeasyPrint (cairo/pango/gobject) and common build tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libpango-1.0-0 libpangoft2-1.0-0 libcairo2 libgdk-pixbuf-2.0-0 \
        libffi8 libssl3 libxml2 libxslt1.1 libharfbuzz0b libfribidi0 \
        fonts-dejavu-core wget curl gnupg && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app /app/app
COPY backend/alembic /app/alembic
COPY backend/alembic.ini /app/alembic.ini
COPY backend/api_server.py /app/backend_api_server.py
COPY data /app/data

ENV PYTHONPATH=/app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
