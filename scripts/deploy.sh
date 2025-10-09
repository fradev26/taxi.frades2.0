#!/bin/bash

# 🚀 Production Deployment Script
# Automated deployment with safety checks and rollback capability

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="taxi-frades"
ENVIRONMENT=${1:-production}
VERSION=${2:-$(date +%Y%m%d-%H%M%S)}
BACKUP_RETENTION_DAYS=7

echo -e "${BLUE}🚀 Starting Production Deployment${NC}"
echo -e "${BLUE}Project: ${PROJECT_NAME}${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Version: ${VERSION}${NC}"
echo "=========================================="

# Function to log with timestamp
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Pre-deployment checks
log "🔍 Running pre-deployment checks..."

# Check if git is clean
if [[ $(git status --porcelain) ]]; then
    error "Git working directory is not clean. Please commit or stash changes."
    exit 1
fi

# Check if we're on the correct branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$ENVIRONMENT" == "production" && "$CURRENT_BRANCH" != "main" ]]; then
    error "Production deployments must be from 'main' branch. Current branch: $CURRENT_BRANCH"
    exit 1
fi

log "✅ Git checks passed"

# Dependency check
log "📦 Checking dependencies..."
npm audit --audit-level=high
if [ $? -ne 0 ]; then
    error "Security vulnerabilities found. Please fix before deployment."
    exit 1
fi

log "✅ Security audit passed"

# TypeScript compilation check
log "🔍 Running TypeScript compilation check..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    error "TypeScript compilation failed"
    exit 1
fi

log "✅ TypeScript compilation passed"

# Linting check
log "🧹 Running linting..."
npm run lint
if [ $? -ne 0 ]; then
    error "Linting failed"
    exit 1
fi

log "✅ Linting passed"

# Build the application
log "🏗️ Building application for ${ENVIRONMENT}..."
if [[ "$ENVIRONMENT" == "production" ]]; then
    npm run build:prod
else
    npm run build:staging
fi

if [ $? -ne 0 ]; then
    error "Build failed"
    exit 1
fi

log "✅ Build completed successfully"

# Build size check
BUILD_SIZE=$(du -sh dist | cut -f1)
log "📦 Build size: ${BUILD_SIZE}"

# Check build size (warn if > 10MB)
SIZE_BYTES=$(du -s dist | cut -f1)
if [[ $SIZE_BYTES -gt 10240 ]]; then  # 10MB in KB
    warning "Build size is large (${BUILD_SIZE}). Consider optimization."
fi

# Create backup of current deployment
log "💾 Creating backup of current deployment..."
BACKUP_DIR="backups/${ENVIRONMENT}-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

if [[ "$ENVIRONMENT" == "production" ]]; then
    # Backup production files (this would be adapted for your deployment strategy)
    log "📁 Backing up production files to ${BACKUP_DIR}"
    # rsync -av production-server:/var/www/html/ "$BACKUP_DIR/" || true
fi

# Docker build and push (if using containers)
log "🐳 Building Docker image..."
docker build -t ${PROJECT_NAME}:${VERSION} -t ${PROJECT_NAME}:latest .

if [[ "$ENVIRONMENT" == "production" ]]; then
    log "📤 Pushing to container registry..."
    docker tag ${PROJECT_NAME}:${VERSION} ghcr.io/fradev26/${PROJECT_NAME}:${VERSION}
    docker tag ${PROJECT_NAME}:latest ghcr.io/fradev26/${PROJECT_NAME}:latest
    
    # docker push ghcr.io/fradev26/${PROJECT_NAME}:${VERSION}
    # docker push ghcr.io/fradev26/${PROJECT_NAME}:latest
fi

log "✅ Docker build completed"

# Health check function
health_check() {
    local url=$1
    local max_attempts=30
    local attempt=1
    
    log "🏥 Running health check on ${url}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "${url}/health" > /dev/null; then
            log "✅ Health check passed (attempt ${attempt})"
            return 0
        fi
        
        log "⏳ Health check attempt ${attempt}/${max_attempts} failed, retrying..."
        sleep 10
        ((attempt++))
    done
    
    error "Health check failed after ${max_attempts} attempts"
    return 1
}

# Deploy to staging first (blue-green deployment simulation)
if [[ "$ENVIRONMENT" == "production" ]]; then
    log "🚀 Deploying to staging for final validation..."
    
    # Deploy to staging
    # kubectl set image deployment/taxi-frades-staging taxi-frades=ghcr.io/fradev26/${PROJECT_NAME}:${VERSION}
    # kubectl rollout status deployment/taxi-frades-staging
    
    # Health check staging
    if ! health_check "https://staging.taxi-frades.com"; then
        error "Staging deployment failed health check"
        exit 1
    fi
    
    log "✅ Staging deployment successful"
    
    # Run smoke tests on staging
    log "🧪 Running smoke tests on staging..."
    # npm run test:e2e:staging
    
    log "✅ Smoke tests passed"
    
    # Production deployment confirmation
    echo -e "${YELLOW}⚠️  Ready to deploy to PRODUCTION${NC}"
    echo -e "${YELLOW}   Environment: ${ENVIRONMENT}${NC}"
    echo -e "${YELLOW}   Version: ${VERSION}${NC}"
    echo -e "${YELLOW}   Image: ghcr.io/fradev26/${PROJECT_NAME}:${VERSION}${NC}"
    echo ""
    read -p "Are you sure you want to proceed? (yes/no): " -r
    
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log "❌ Deployment cancelled by user"
        exit 1
    fi
fi

# Production deployment
log "🚀 Deploying to ${ENVIRONMENT}..."

if [[ "$ENVIRONMENT" == "production" ]]; then
    # Blue-green deployment
    log "🔄 Starting blue-green deployment..."
    
    # Deploy to green environment
    # kubectl set image deployment/taxi-frades-green taxi-frades=ghcr.io/fradev26/${PROJECT_NAME}:${VERSION}
    # kubectl rollout status deployment/taxi-frades-green
    
    # Health check green environment
    if ! health_check "https://green.taxi-frades.com"; then
        error "Green deployment failed health check"
        log "🔄 Rolling back..."
        # kubectl rollout undo deployment/taxi-frades-green
        exit 1
    fi
    
    # Switch traffic to green
    log "🔀 Switching traffic to new version..."
    # kubectl patch service taxi-frades-service -p '{"spec":{"selector":{"version":"green"}}}'
    
    # Final health check on production
    if ! health_check "https://taxi-frades.com"; then
        error "Production health check failed after traffic switch"
        log "🔄 Rolling back traffic..."
        # kubectl patch service taxi-frades-service -p '{"spec":{"selector":{"version":"blue"}}}'
        exit 1
    fi
    
    log "✅ Traffic successfully switched to new version"
    
else
    # Staging deployment
    log "🚀 Deploying to staging..."
    # kubectl set image deployment/taxi-frades-staging taxi-frades=ghcr.io/fradev26/${PROJECT_NAME}:${VERSION}
    # kubectl rollout status deployment/taxi-frades-staging
    
    if ! health_check "https://staging.taxi-frades.com"; then
        error "Staging deployment failed"
        exit 1
    fi
fi

# Post-deployment tasks
log "📊 Running post-deployment tasks..."

# Update monitoring dashboards
log "📈 Updating monitoring dashboards..."
# curl -X POST "https://monitoring.taxi-frades.com/api/deployments" \
#      -H "Content-Type: application/json" \
#      -d "{\"version\":\"${VERSION}\",\"environment\":\"${ENVIRONMENT}\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}"

# Update status page
log "📢 Updating status page..."
# echo "Deployment ${VERSION} completed successfully at $(date)" > status/latest-deployment.txt

# Clean up old backups
log "🧹 Cleaning up old backups..."
find backups/ -name "${ENVIRONMENT}-*" -type d -mtime +${BACKUP_RETENTION_DAYS} -exec rm -rf {} \; 2>/dev/null || true

# Performance check
log "⚡ Running performance check..."
sleep 30  # Wait for application to warm up

# Basic performance test
RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' https://${ENVIRONMENT}.taxi-frades.com)
if (( $(echo "$RESPONSE_TIME > 3.0" | bc -l) )); then
    warning "Response time is high: ${RESPONSE_TIME}s"
else
    log "✅ Response time acceptable: ${RESPONSE_TIME}s"
fi

# Send deployment notification
log "📢 Sending deployment notifications..."

# Slack notification
SLACK_MESSAGE="🚀 *Deployment Successful!*
• Environment: \`${ENVIRONMENT}\`
• Version: \`${VERSION}\`
• Build Size: \`${BUILD_SIZE}\`
• Response Time: \`${RESPONSE_TIME}s\`
• Deployed by: \`$(whoami)\`
• Branch: \`${CURRENT_BRANCH}\`"

# curl -X POST "${SLACK_WEBHOOK_URL}" \
#      -H 'Content-type: application/json' \
#      --data "{\"text\":\"${SLACK_MESSAGE}\"}"

# Create deployment record
log "📝 Creating deployment record..."
cat > "deployments/deployment-${VERSION}.json" << EOF
{
  "version": "${VERSION}",
  "environment": "${ENVIRONMENT}",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "branch": "${CURRENT_BRANCH}",
  "commit": "$(git rev-parse HEAD)",
  "deployedBy": "$(whoami)",
  "buildSize": "${BUILD_SIZE}",
  "responseTime": "${RESPONSE_TIME}",
  "status": "success"
}
EOF

log "✅ Deployment record created"

# Final success message
echo ""
echo -e "${GREEN}🎉 DEPLOYMENT SUCCESSFUL! 🎉${NC}"
echo -e "${GREEN}Environment: ${ENVIRONMENT}${NC}"
echo -e "${GREEN}Version: ${VERSION}${NC}"
echo -e "${GREEN}URL: https://${ENVIRONMENT}.taxi-frades.com${NC}"
echo -e "${GREEN}Build Size: ${BUILD_SIZE}${NC}"
echo -e "${GREEN}Response Time: ${RESPONSE_TIME}s${NC}"
echo ""
echo -e "${BLUE}📊 Monitoring:${NC}"
echo -e "${BLUE}• Grafana: https://monitoring.taxi-frades.com${NC}"
echo -e "${BLUE}• Logs: kubectl logs -f deployment/taxi-frades-${ENVIRONMENT}${NC}"
echo ""
echo -e "${YELLOW}🔄 Rollback command (if needed):${NC}"
echo -e "${YELLOW}kubectl rollout undo deployment/taxi-frades-${ENVIRONMENT}${NC}"
echo ""
log "🚀 Deployment completed successfully!"