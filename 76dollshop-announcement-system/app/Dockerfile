FROM python:3.11-slim

WORKDIR /app

# Install uv
RUN pip install --no-cache-dir uv

# Copy project files
COPY pyproject.toml uv.lock ./
COPY app ./app

# Install dependencies
RUN uv sync --frozen

# Copy environment files (optional, better to use env vars in production)
COPY .env.example .env.example

# Expose port
EXPOSE 8080

# Set environment variables
ENV PYTHONPATH=.
ENV PYTHONUNBUFFERED=1

# Start the application
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
