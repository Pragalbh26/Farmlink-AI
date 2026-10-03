# AgriConnect AI Service - production-style container for service/main.py
# Build:  docker build -f docker/Dockerfile -t agriconnect-ai .
# Run:    docker run -p 8000:8000 --env-file .env agriconnect-ai
FROM python:3.11-slim

WORKDIR /app

# System deps for pillow/opencv-adjacent image work
RUN apt-get update && apt-get install -y --no-install-recommends \
    libjpeg62-turbo-dev zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements/required-now.txt requirements/required-later.txt requirements/
RUN pip install --no-cache-dir -r requirements/required-now.txt \
    && pip install --no-cache-dir -r requirements/required-later.txt

COPY ai/ ai/
COPY service/ service/
COPY data/raw/government_schemes/ data/raw/government_schemes/
# Trained model artifacts + RAG index are build/runtime artifacts, not source -
# mount them as a volume in production rather than baking into the image, so a
# new model doesn't require a rebuild. Dev/demo convenience: bake in what exists
# locally at build time too.
COPY ai/price_prediction/models/ ai/price_prediction/models/
COPY ai/disease_detection/models/ ai/disease_detection/models/
COPY ai/rag/models/ ai/rag/models/

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "service.main:app", "--host", "0.0.0.0", "--port", "8000"]
