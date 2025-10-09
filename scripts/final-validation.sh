#!/bin/bash

# 🔍 FINAL VALIDATION SCRIPT - TAXI FRADES 2.0
# Comprehensive pre-deployment validation and health check

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="taxi-frades-2.0"
START_TIME=$(date +%s)
VALIDATION_REPORT="reports/final-validation-$(date +%Y%m%d-%H%M%S).md"

# Create reports directory
mkdir -p reports

echo -e "${BLUE}🔍 STARTING FINAL PRE-DEPLOYMENT VALIDATION${NC}"
echo -e "${BLUE}Project: ${PROJECT_NAME}${NC}"
echo -e "${BLUE}Date: $(date)${NC}"
echo "========================================================"

# Function to log with timestamp and status
log_success() {
    echo -e "${GREEN}✅ [$(date '+%H:%M:%S')] $1${NC}"
    echo "✅ $1" >> "$VALIDATION_REPORT"
}

log_error() {
    echo -e "${RED}❌ [$(date '+%H:%M:%S')] $1${NC}"
    echo "❌ $1" >> "$VALIDATION_REPORT"
}

log_warning() {
    echo -e "${YELLOW}⚠️  [$(date '+%H:%M:%S')] $1${NC}"
    echo "⚠️ $1" >> "$VALIDATION_REPORT"
}

log_info() {
    echo -e "${CYAN}ℹ️  [$(date '+%H:%M:%S')] $1${NC}"
    echo "ℹ️ $1" >> "$VALIDATION_REPORT"
}

# Initialize validation report
cat > "$VALIDATION_REPORT" << EOF
# 🔍 FINAL VALIDATION REPORT - TAXI FRADES 2.0

**Date**: $(date)  
**Project**: ${PROJECT_NAME}  
**Branch**: $(git branch --show-current)  
**Commit**: $(git rev-parse HEAD)  

## Validation Results

EOF

VALIDATION_PASSED=true

# 1. GIT & CODE QUALITY CHECKS
echo -e "\n${BLUE}📋 1. GIT & CODE QUALITY VALIDATION${NC}"
echo -e "\n## 1. Git & Code Quality" >> "$VALIDATION_REPORT"

# Check git status
if [[ $(git status --porcelain) ]]; then
    log_error "Git working directory is not clean"
    VALIDATION_PASSED=false
else
    log_success "Git working directory is clean"
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
log_info "Current branch: $CURRENT_BRANCH"

# TypeScript compilation
echo -e "\n${CYAN}Checking TypeScript compilation...${NC}"
if npx tsc --noEmit --skipLibCheck > /dev/null 2>&1; then
    log_success "TypeScript compilation passed"
else
    log_error "TypeScript compilation failed"
    VALIDATION_PASSED=false
fi

# ESLint check
echo -e "\n${CYAN}Running ESLint...${NC}"
if npm run lint > /dev/null 2>&1; then
    log_success "ESLint validation passed"
else
    log_warning "ESLint warnings found (non-blocking)"
fi

# 2. DEPENDENCY & SECURITY CHECKS
echo -e "\n${BLUE}🔒 2. DEPENDENCY & SECURITY VALIDATION${NC}"
echo -e "\n## 2. Dependencies & Security" >> "$VALIDATION_REPORT"

# Check for high-severity vulnerabilities
echo -e "\n${CYAN}Running security audit...${NC}"
if npm audit --audit-level=high > /dev/null 2>&1; then
    log_success "No high-severity vulnerabilities found"
else
    log_error "High-severity vulnerabilities detected"
    VALIDATION_PASSED=false
fi

# Check package.json integrity
if [[ -f "package.json" && -f "package-lock.json" ]]; then
    log_success "Package files are present"
else
    log_error "Missing package.json or package-lock.json"
    VALIDATION_PASSED=false
fi

# 3. BUILD & PERFORMANCE VALIDATION
echo -e "\n${BLUE}🏗️ 3. BUILD & PERFORMANCE VALIDATION${NC}"
echo -e "\n## 3. Build & Performance" >> "$VALIDATION_REPORT"

# Clean previous build
echo -e "\n${CYAN}Cleaning previous build...${NC}"
rm -rf dist/
npm run clean > /dev/null 2>&1 || true

# Production build
echo -e "\n${CYAN}Running production build...${NC}"
BUILD_START=$(date +%s)
if npm run build > build.log 2>&1; then
    BUILD_END=$(date +%s)
    BUILD_TIME=$((BUILD_END - BUILD_START))
    log_success "Production build completed in ${BUILD_TIME}s"
    
    # Check build output
    if [[ -d "dist" && -f "dist/index.html" ]]; then
        log_success "Build artifacts generated successfully"
        
        # Calculate build size
        BUILD_SIZE=$(du -hs dist/ | cut -f1)
        log_info "Build size: $BUILD_SIZE"
        
        # Check if build size is reasonable (< 10MB)
        SIZE_BYTES=$(du -s dist | cut -f1)
        if [[ $SIZE_BYTES -lt 10240 ]]; then  # 10MB in KB
            log_success "Build size is within acceptable limits"
        else
            log_warning "Build size is large: $BUILD_SIZE"
        fi
    else
        log_error "Build artifacts not found"
        VALIDATION_PASSED=false
    fi
else
    log_error "Production build failed"
    cat build.log
    VALIDATION_PASSED=false
fi

# 4. FILE STRUCTURE VALIDATION
echo -e "\n${BLUE}📁 4. FILE STRUCTURE VALIDATION${NC}"
echo -e "\n## 4. File Structure" >> "$VALIDATION_REPORT"

# Check critical files
CRITICAL_FILES=(
    "package.json"
    "src/App.tsx"
    "src/main.tsx"
    "src/index.css"
    "public/index.html"
    "Dockerfile"
    ".env.production"
    "nginx.prod.conf"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        log_success "Critical file exists: $file"
    else
        log_error "Missing critical file: $file"
        VALIDATION_PASSED=false
    fi
done

# Check component structure
COMPONENT_DIRS=(
    "src/components"
    "src/pages"
    "src/hooks"
    "src/services"
    "src/lib"
    "src/utils"
)

for dir in "${COMPONENT_DIRS[@]}"; do
    if [[ -d "$dir" ]]; then
        COMPONENT_COUNT=$(find "$dir" -name "*.tsx" -o -name "*.ts" | wc -l)
        log_success "Directory $dir exists with $COMPONENT_COUNT files"
    else
        log_error "Missing directory: $dir"
        VALIDATION_PASSED=false
    fi
done

# 5. ENVIRONMENT & CONFIGURATION VALIDATION
echo -e "\n${BLUE}⚙️ 5. ENVIRONMENT & CONFIGURATION VALIDATION${NC}"
echo -e "\n## 5. Environment & Configuration" >> "$VALIDATION_REPORT"

# Check environment files
ENV_FILES=(
    ".env.production"
    "vite.config.ts"
    "vite.config.production.ts"
    "tailwind.config.ts"
    "tsconfig.json"
)

for env_file in "${ENV_FILES[@]}"; do
    if [[ -f "$env_file" ]]; then
        log_success "Configuration file exists: $env_file"
    else
        log_warning "Missing configuration file: $env_file"
    fi
done

# Check Docker configuration
if [[ -f "Dockerfile" ]]; then
    log_success "Dockerfile is present"
    
    # Validate Dockerfile syntax
    if docker build -t validation-test . > /dev/null 2>&1; then
        log_success "Dockerfile builds successfully"
        docker rmi validation-test > /dev/null 2>&1 || true
    else
        log_error "Dockerfile build failed"
        VALIDATION_PASSED=false
    fi
else
    log_error "Dockerfile is missing"
    VALIDATION_PASSED=false
fi

# 6. FEATURE FUNCTIONALITY VALIDATION
echo -e "\n${BLUE}🧪 6. FEATURE FUNCTIONALITY VALIDATION${NC}"
echo -e "\n## 6. Feature Functionality" >> "$VALIDATION_REPORT"

# Start development server for testing
echo -e "\n${CYAN}Starting development server for testing...${NC}"
npm run dev > server.log 2>&1 &
SERVER_PID=$!
sleep 10

# Test if server is running
if curl -f http://localhost:8080 > /dev/null 2>&1; then
    log_success "Development server is running"
    
    # Test critical endpoints
    ENDPOINTS=(
        "/"
        "/booking"
        "/trips"
        "/wallet"
        "/account"
    )
    
    for endpoint in "${ENDPOINTS[@]}"; do
        if curl -f -s "http://localhost:8080$endpoint" > /dev/null; then
            log_success "Endpoint accessible: $endpoint"
        else
            log_warning "Endpoint issue: $endpoint"
        fi
    done
    
else
    log_error "Development server failed to start"
    VALIDATION_PASSED=false
fi

# Stop development server
kill $SERVER_PID > /dev/null 2>&1 || true
sleep 2

# 7. PERFORMANCE BENCHMARKS
echo -e "\n${BLUE}⚡ 7. PERFORMANCE BENCHMARKS${NC}"
echo -e "\n## 7. Performance Benchmarks" >> "$VALIDATION_REPORT"

# Bundle analysis
if [[ -f "dist/index.html" ]]; then
    # Count JavaScript files
    JS_FILES=$(find dist/assets -name "*.js" | wc -l)
    CSS_FILES=$(find dist/assets -name "*.css" | wc -l)
    
    log_info "JavaScript chunks: $JS_FILES"
    log_info "CSS files: $CSS_FILES"
    
    # Find largest bundle
    LARGEST_JS=$(find dist/assets -name "*.js" -exec ls -la {} \; | sort -k5 -nr | head -1 | awk '{print $9, $5}')
    log_info "Largest JS bundle: $LARGEST_JS"
    
    # Check for source maps (should not exist in production)
    SOURCE_MAPS=$(find dist -name "*.map" | wc -l)
    if [[ $SOURCE_MAPS -eq 0 ]]; then
        log_success "No source maps in production build"
    else
        log_warning "Source maps found in production build: $SOURCE_MAPS"
    fi
fi

# 8. DEPLOYMENT READINESS CHECK
echo -e "\n${BLUE}🚀 8. DEPLOYMENT READINESS CHECK${NC}"
echo -e "\n## 8. Deployment Readiness" >> "$VALIDATION_REPORT"

# Check deployment scripts
DEPLOYMENT_SCRIPTS=(
    "scripts/deploy.sh"
    "scripts/load-test.sh"
    ".github/workflows/deploy.yml"
)

for script in "${DEPLOYMENT_SCRIPTS[@]}"; do
    if [[ -f "$script" ]]; then
        log_success "Deployment script exists: $script"
        
        # Check if script is executable
        if [[ -x "$script" ]]; then
            log_success "Script is executable: $script"
        else
            log_warning "Script is not executable: $script"
        fi
    else
        log_error "Missing deployment script: $script"
        VALIDATION_PASSED=false
    fi
done

# Check Docker Compose
if [[ -f "docker-compose.prod.yml" ]]; then
    log_success "Docker Compose production config exists"
    
    # Validate Docker Compose syntax
    if docker-compose -f docker-compose.prod.yml config > /dev/null 2>&1; then
        log_success "Docker Compose configuration is valid"
    else
        log_error "Docker Compose configuration is invalid"
        VALIDATION_PASSED=false
    fi
else
    log_warning "Docker Compose production config missing"
fi

# 9. FINAL VALIDATION SUMMARY
echo -e "\n${BLUE}📊 9. FINAL VALIDATION SUMMARY${NC}"
echo -e "\n## 9. Validation Summary" >> "$VALIDATION_REPORT"

END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))

# Add summary to report
cat >> "$VALIDATION_REPORT" << EOF

## Summary

**Total Validation Time**: ${TOTAL_TIME} seconds  
**Build Size**: ${BUILD_SIZE:-"Unknown"}  
**Build Time**: ${BUILD_TIME:-0} seconds  

EOF

if [[ "$VALIDATION_PASSED" == true ]]; then
    echo -e "\n${GREEN}🎉 VALIDATION SUCCESSFUL! 🎉${NC}"
    echo -e "${GREEN}✅ All critical checks passed${NC}"
    echo -e "${GREEN}✅ Application is ready for deployment${NC}"
    echo -e "${GREEN}✅ Build completed successfully${NC}"
    echo -e "${GREEN}✅ No critical issues found${NC}"
    
    cat >> "$VALIDATION_REPORT" << EOF
**Status**: ✅ **PASSED**  
**Recommendation**: **APPROVED FOR DEPLOYMENT**

### Next Steps
1. Execute staging deployment
2. Run load tests
3. Perform final UAT
4. Proceed with production deployment

EOF
    
    echo -e "\n${CYAN}📄 Validation report saved: $VALIDATION_REPORT${NC}"
    echo -e "${CYAN}🚀 Ready to proceed with deployment!${NC}"
    
    exit 0
else
    echo -e "\n${RED}❌ VALIDATION FAILED! ❌${NC}"
    echo -e "${RED}🚫 Critical issues found${NC}"
    echo -e "${RED}🔧 Please fix issues before deployment${NC}"
    
    cat >> "$VALIDATION_REPORT" << EOF
**Status**: ❌ **FAILED**  
**Recommendation**: **FIX ISSUES BEFORE DEPLOYMENT**

### Issues Found
- Check the validation log above for specific issues
- Address all critical errors before proceeding
- Re-run validation after fixes

EOF
    
    echo -e "\n${CYAN}📄 Validation report saved: $VALIDATION_REPORT${NC}"
    echo -e "${RED}🛑 Deployment blocked until issues are resolved${NC}"
    
    exit 1
fi
