# ==========================================
# STAGE 1: Build Frontend Assets
# ==========================================
FROM node:18-alpine AS frontend-builder
WORKDIR /frontend

# Copy dependencies manifest and install
COPY frontend/package.json ./
RUN npm install

# Copy source code and compile static build
COPY frontend/ ./
RUN npm run build

# ==========================================
# STAGE 2: Package Backend & Serve Unified Application
# ==========================================
FROM python:3.11-slim AS production-server
WORKDIR /workspace

# Install system dependencies needed for python packages (C compiler, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code and machine learning model
COPY backend/app/ ./app/
COPY backend/model/ ./model/

# Copy compiled frontend assets from Stage 1 into the expected directory
COPY --from=frontend-builder /frontend/dist ./frontend/dist

# Expose unified application port
EXPOSE 8000

# Set environment defaults
ENV HOST=0.0.0.0
ENV PORT=8000
ENV DATABASE_URL=sqlite:///./predictions.db
ENV MODEL_PATH=model/nvda_model.pkl

# Run the FastAPI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
