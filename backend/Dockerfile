FROM python:3.13-slim

WORKDIR /app

# Install system dependencies if required by some python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    python -m spacy download en_core_web_sm

# Inject .cognee_system into the cognee package directory where it natively looks for LanceDB
COPY .cognee_system /usr/local/lib/python3.13/site-packages/cognee/.cognee_system

# Copy application files
COPY . .

# Expose port
EXPOSE 8000

# Run uvicorn
CMD ["uvicorn", "main:socket_app", "--host", "0.0.0.0", "--port", "8000"]
