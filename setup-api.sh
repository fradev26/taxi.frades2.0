#!/bin/bash

# FRADES Taxi API Setup Script
# This script helps set up the development environment with all necessary API configurations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_section() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Check if .env file exists
check_env_file() {
    if [ -f ".env" ]; then
        print_warning ".env file already exists. Do you want to create a backup? (y/n)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
            print_status "Backup created: .env.backup.$(date +%Y%m%d_%H%M%S)"
        fi
    fi
}

# Create .env file from template
create_env_file() {
    print_section "Creating Environment Configuration"
    
    if [ ! -f ".env.example" ]; then
        print_error ".env.example file not found!"
        exit 1
    fi
    
    cp .env.example .env
    print_status ".env file created from template"
    
    print_warning "Please edit the .env file and add your actual API keys:"
    echo "  - VITE_SUPABASE_URL"
    echo "  - VITE_SUPABASE_ANON_KEY"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    echo "  - VITE_STRIPE_PUBLISHABLE_KEY"
    echo "  - STRIPE_SECRET_KEY"
    echo "  - VITE_GOOGLE_MAPS_API_KEY"
}

# Install dependencies
install_dependencies() {
    print_section "Installing Dependencies"
    
    if command -v npm &> /dev/null; then
        print_status "Installing npm dependencies..."
        npm install
    elif command -v yarn &> /dev/null; then
        print_status "Installing yarn dependencies..."
        yarn install
    elif command -v pnpm &> /dev/null; then
        print_status "Installing pnpm dependencies..."
        pnpm install
    else
        print_error "No package manager found (npm, yarn, or pnpm)"
        exit 1
    fi
}

# Create docs directory if it doesn't exist
setup_docs() {
    print_section "Setting Up Documentation"
    
    if [ ! -d "docs" ]; then
        mkdir -p docs
        print_status "Created docs directory"
    fi
    
    if [ ! -f "docs/api-keys.md" ]; then
        print_warning "API documentation not found. Please ensure docs/api-keys.md exists."
    else
        print_status "API documentation found"
    fi
}

# Validate TypeScript compilation
validate_typescript() {
    print_section "Validating TypeScript"
    
    if command -v npx &> /dev/null; then
        print_status "Checking TypeScript compilation..."
        if npx tsc --noEmit; then
            print_status "TypeScript compilation successful"
        else
            print_warning "TypeScript compilation has errors. Please fix them before proceeding."
        fi
    else
        print_warning "npx not found, skipping TypeScript validation"
    fi
}

# Run database tests
test_database() {
    print_section "Testing Database Connection"
    
    if [ -f "test-db.ts" ]; then
        print_status "Running database tests..."
        if npx tsx test-db.ts; then
            print_status "Database tests completed"
        else
            print_warning "Database tests failed. Check your Supabase configuration."
        fi
    else
        print_warning "Database test file not found"
    fi
}

# Create gitignore entries
setup_gitignore() {
    print_section "Setting Up Git Ignore"
    
    if [ ! -f ".gitignore" ]; then
        touch .gitignore
    fi
    
    # Check if .env is already in gitignore
    if ! grep -q "^\.env$" .gitignore; then
        echo ".env" >> .gitignore
        print_status "Added .env to .gitignore"
    fi
    
    # Add other important entries
    entries=(
        ".env.local"
        ".env.production"
        ".env.staging"
        "*.log"
        "dist/"
        "build/"
        ".DS_Store"
        "node_modules/"
    )
    
    for entry in "${entries[@]}"; do
        if ! grep -q "^${entry}$" .gitignore; then
            echo "$entry" >> .gitignore
        fi
    done
    
    print_status "Updated .gitignore with important entries"
}

# Display next steps
show_next_steps() {
    print_section "Setup Complete!"
    
    echo -e "\n${GREEN}Next Steps:${NC}"
    echo "1. Edit the .env file with your actual API keys"
    echo "2. Follow the integration guides in the admin dashboard"
    echo "3. Test your API configurations using the validator"
    echo "4. Start the development server: npm run dev"
    echo ""
    echo -e "${BLUE}Useful Commands:${NC}"
    echo "  npm run dev          - Start development server"
    echo "  npm run build        - Build for production"
    echo "  npx tsx test-db.ts   - Test database connection"
    echo ""
    echo -e "${YELLOW}Documentation:${NC}"
    echo "  docs/api-keys.md     - API setup documentation"
    echo "  Admin Dashboard      - http://localhost:8080/admin (API tab)"
    echo ""
    echo -e "${GREEN}Happy coding! 🚗${NC}"
}

# Main execution
main() {
    print_section "FRADES Taxi API Setup"
    echo "This script will help you set up your development environment"
    echo ""
    
    # Confirm execution
    echo "Do you want to continue? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_status "Setup cancelled"
        exit 0
    fi
    
    check_env_file
    create_env_file
    install_dependencies
    setup_docs
    setup_gitignore
    validate_typescript
    test_database
    show_next_steps
}

# Run main function
main "$@"