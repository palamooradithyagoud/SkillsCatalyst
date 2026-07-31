#!/bin/bash
# ====================================================================
# SKILLSCATALYST - Google Cloud Run Deployment Script
# Run this from the project root: bash deploy.sh
# Requirements: gcloud CLI installed and authenticated
# ====================================================================

set -e  # Exit on any error

# ─── CONFIGURE THESE ─────────────────────────────────────────────────────────
PROJECT_ID="YOUR_GCP_PROJECT_ID"          # e.g. skillscatalyst-prod
REGION="asia-south1"                       # Mumbai (closest to Hyderabad/India)
BACKEND_SERVICE="skillscatalyst-backend"
FRONTEND_SERVICE="skillscatalyst-frontend"
REPO="skillscatalyst"                      # Artifact Registry repository name
# ─────────────────────────────────────────────────────────────────────────────

echo "🚀 Starting SkillsCatalyst deployment to Google Cloud Run..."
echo "   Project: $PROJECT_ID | Region: $REGION"

# Set active project
gcloud config set project $PROJECT_ID

# ── Create Artifact Registry repo if not exists ───────────────────────────────
echo "📦 Ensuring Artifact Registry repo exists..."
gcloud artifacts repositories create $REPO \
  --repository-format=docker \
  --location=$REGION \
  --description="SkillsCatalyst Docker images" \
  2>/dev/null || echo "   Repo already exists, continuing..."

REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}"

# ── Build & Push Backend ──────────────────────────────────────────────────────
echo ""
echo "🐍 Building FastAPI Backend Docker image..."
gcloud builds submit \
  --tag "${REGISTRY}/${BACKEND_SERVICE}:latest" \
  --file Dockerfile.backend \
  .

echo "☁️  Deploying Backend to Cloud Run..."
gcloud run deploy $BACKEND_SERVICE \
  --image "${REGISTRY}/${BACKEND_SERVICE}:latest" \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --port 8080 \
  --set-env-vars "SUPABASE_URL=${SUPABASE_URL}" \
  --set-env-vars "SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}" \
  --set-env-vars "SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}" \
  --set-env-vars "GROQ_API_KEY=${GROQ_API_KEY}" \
  --set-env-vars "YOUTUBE_API_KEY=${YOUTUBE_API_KEY}"

# Get the deployed backend URL
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region $REGION --format "value(status.url)")
echo "✅ Backend deployed at: $BACKEND_URL"

# ── Build & Push Frontend ─────────────────────────────────────────────────────
echo ""
echo "⚛️  Building Next.js Frontend Docker image..."
gcloud builds submit \
  --tag "${REGISTRY}/${FRONTEND_SERVICE}:latest" \
  --file Dockerfile.frontend \
  --substitutions "_NEXT_PUBLIC_API_URL=${BACKEND_URL},_NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL},_NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}" \
  .

echo "☁️  Deploying Frontend to Cloud Run..."
gcloud run deploy $FRONTEND_SERVICE \
  --image "${REGISTRY}/${FRONTEND_SERVICE}:latest" \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --port 8080 \
  --set-env-vars "NEXT_PUBLIC_API_URL=${BACKEND_URL}" \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}" \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}"

FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --region $REGION --format "value(status.url)")
echo "✅ Frontend deployed at: $FRONTEND_URL"

echo ""
echo "======================================================================"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================================================================"
echo "   Backend API  : $BACKEND_URL"
echo "   Frontend App : $FRONTEND_URL"
echo ""
echo "📌 NEXT STEP: Update CORS in backend/main.py:"
echo "   allow_origins=[\"$FRONTEND_URL\", \"http://localhost:3000\"]"
echo "======================================================================"
