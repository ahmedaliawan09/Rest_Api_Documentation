# Unit Testing Setup Guide

## 🎯 Overview

Unit tests have been added to the Cart API project using **Jest** testing framework. Tests run **BEFORE deployment** in the CI phase.

## 📦 Installation

### Step 1: Install Jest Dependencies

```bash
cd backend
npm install --save-dev jest @jest/globals
```

### Step 2: Verify Installation

```bash
npm test
```

You should see output like:
```
PASS  tests/services/userService.test.js
PASS  tests/services/productService.test.js

Test Suites: 2 passed, 2 total
Tests:       8 passed, 8 total
```

## 🏗️ Project Structure

```
backend/
├── tests/
│   ├── services/
│   │   ├── userService.test.js
│   │   └── productService.test.js
│   ├── setup.js
│   └── README.md
├── package.json (updated with test scripts)
└── ...
```

## 🚀 Running Tests

### Local Development

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### View Coverage Report

After running `npm run test:coverage`:
1. Open `backend/coverage/lcov-report/index.html` in your browser
2. View line-by-line coverage details

## 🔄 CI/CD Pipeline Position

```
GitHub Actions Workflow:
┌────────────────────────────────────┐
│ 1. Unit Tests (Jest)          ← CI │ ✅ YOU ARE HERE
├────────────────────────────────────┤
│ 2. Code Quality (SonarCloud)  ← CI │
├────────────────────────────────────┤
│ 3. Deploy to Inactive Env     ← CD │
├────────────────────────────────────┤
│ 4. Pre-Switch Tests           ← CD │
├────────────────────────────────────┤
│ 5. Switch Traffic             ← CD │
├────────────────────────────────────┤
│ 6. Post-Switch Verification   ← CD │
└────────────────────────────────────┘
```

**Unit tests run FIRST** to catch bugs before deployment!

## 📝 Test Examples

### User Service Tests
- ✅ Get all users
- ✅ Get user by ID
- ✅ Create new user
- ✅ Validate email format

### Product Service Tests
- ✅ Get all products
- ✅ Get product by ID
- ✅ Create new product
- ✅ Validate price and stock

## 🎓 For Your Assignment

You can demonstrate:

1. **Unit Testing Integration** ✅
   - Jest framework configured
   - 8+ unit tests implemented
   - Coverage reporting enabled

2. **CI/CD Best Practices** ✅
   - Tests run before deployment
   - Automatic failure on test errors
   - Coverage metrics tracked

3. **Professional Development** ✅
   - Test-driven approach
   - Quality gates
   - Automated testing pipeline

## 📊 GitHub Actions Integration

The workflow now includes:

```yaml
jobs:
  unit-tests:        # ← NEW! Runs first
    - Install dependencies
    - Run tests
    - Generate coverage

  code-quality:      # ← Depends on unit-tests
    - SonarCloud scan

  blue-green-deploy: # ← Depends on code-quality
    - Deploy to EC2
    - Pre-switch tests
    - Traffic switch
```

## 🐛 Troubleshooting

### Error: Cannot find module '@jest/globals'
**Solution**: Run `npm install --save-dev @jest/globals`

### Error: Test timeout
**Solution**: Tests use simple validation (no async), should complete in <1 second

### Tests pass locally but fail in CI
**Solution**: Check Node.js version (should be 20.x)

## 🔮 Future Enhancements

- [ ] Add controller tests
- [ ] Add middleware tests
- [ ] Add integration tests
- [ ] Increase coverage to 80%+
- [ ] Add mutation testing

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Jest with ES Modules](https://jestjs.io/docs/ecmascript-modules)

## ✅ Checklist

- [x] Jest installed
- [x] Test scripts added to package.json
- [x] Unit tests created (userService, productService)
- [x] Coverage reporting configured
- [x] GitHub Actions workflow updated
- [x] Documentation created

**Status**: ✅ Ready for deployment and demonstration!
