#!/bin/bash

# YAML Editor Setup Test Script
# Tests if all dependencies and components are properly configured

echo "🧪 YAML Editor Setup Test"
echo "========================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_TOTAL=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    echo -n "Testing $test_name... "
    
    if eval "$test_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        return 1
    fi
}

# Test system requirements
echo -e "${BLUE}🔍 System Requirements${NC}"
run_test "Python 3" "python3 --version"
run_test "Node.js" "node --version"
run_test "npm" "npm --version"
run_test "Git" "git --version"

# Test project structure
echo -e "\n${BLUE}📁 Project Structure${NC}"
run_test "Backend directory" "[ -d 'backend' ]"
run_test "Frontend directory" "[ -d 'frontend' ]"
run_test "Backend main.py" "[ -f 'backend/main.py' ]"
run_test "Frontend package.json" "[ -f 'frontend/package.json' ]"
run_test "Start script" "[ -x 'start.sh' ]"

# Test configuration files
echo -e "\n${BLUE}⚙️ Configuration Files${NC}"
run_test "Backend requirements.txt" "[ -f 'backend/requirements.txt' ]"
run_test "Frontend tsconfig.json" "[ -f 'frontend/tsconfig.json' ]"
run_test "Backend imports" "cd backend && python3 -c 'import fastapi, pydantic, yaml'"

# Test YAML files access
echo -e "\n${BLUE}📄 YAML Files Access${NC}"
run_test "Parent directory readable" "[ -r '../../' ]"
run_test "nursing_config.yaml exists" "[ -f '../../nursing_config.yaml' ]"
run_test "nursing_rules.yaml exists" "[ -f '../../nursing_rules.yaml' ]"

# Summary
echo -e "\n${BLUE}📊 Test Summary${NC}"
echo "==================="

if [ $TESTS_PASSED -eq $TESTS_TOTAL ]; then
    echo -e "${GREEN}✅ All tests passed! ($TESTS_PASSED/$TESTS_TOTAL)${NC}"
    echo -e "${GREEN}🎉 Your YAML Editor is ready to run!${NC}"
    echo ""
    echo -e "${YELLOW}To start the application:${NC}"
    echo -e "${BLUE}./start.sh${NC}"
    exit 0
else
    TESTS_FAILED=$((TESTS_TOTAL - TESTS_PASSED))
    echo -e "${RED}❌ $TESTS_FAILED test(s) failed ($TESTS_PASSED/$TESTS_TOTAL passed)${NC}"
    echo ""
    echo -e "${YELLOW}Please fix the failing tests before running the application.${NC}"
    exit 1
fi
