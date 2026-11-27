# E2E Tests (Playwright)

## Yêu cầu trước khi chạy

1. Khởi động backend và frontend ở 2 terminal riêng:

```powershell
# Terminal 1
cd backend
npm run start:dev

# Terminal 2
cd frontend
npm run dev
```

## Chạy test TOPIK audio & image

```powershell
$env:TEST_ADMIN_EMAIL="admin@example.com"
$env:TEST_ADMIN_PASSWORD="your-admin-password"
$env:TEST_LEARNER_EMAIL="learner@example.com"
$env:TEST_LEARNER_PASSWORD="your-learner-password"

npm run test:e2e
```

## Tự record test mới bằng chuột (Codegen)

```powershell
npx playwright codegen http://localhost:5173
```
