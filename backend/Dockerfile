FROM python:3.12-slim

WORKDIR /app

# Install system dependencies (needed for compilation of some packages like bcrypt/cryptography if wheels aren't used)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Run uvicorn on 0.0.0.0 and bind to the PORT env variable injected by Render/Railway, defaulting to 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
