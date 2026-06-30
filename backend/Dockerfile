FROM python:3.11-slim

# Install system dependencies including g++ and make for C++ compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy all source files
COPY . .

# Compile the C++ mining engine for Linux environment
RUN make -C backend/algorithm/cpp mining_engine

EXPOSE 8000

# Run uvicorn from workspace root for imports to resolve correctly
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
