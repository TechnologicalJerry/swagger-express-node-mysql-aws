# Swagger Express Node MySQL AWS

Fully typed Express 5 backend featuring:

- JWT authentication with register, login, profile, forgot password, and reset flows
- Role-based user and product CRUD powered by MySQL (`mysql2` pool + auto migrations)
- Request validation with `express-validator` and centralized error handling
- Swagger UI documentation at `/api-docs`

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create an `.env` file:
   ```bash
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=app_db
   JWT_SECRET=supersecret
   JWT_EXPIRES_IN=1h
   RESET_TOKEN_EXPIRY_MINUTES=15
   CORS_ORIGIN=http://localhost:3000
   PORT=4000
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

The API boots at `http://localhost:4000` by default. Swagger UI is available at `http://localhost:4000/api-docs`.

## Database

First launch runs lightweight migrations to create:

- `users` (with roles and hashed passwords)
- `products` (referencing creator)
- `password_reset_tokens` (expiry + usage tracking)

## Scripts

- `npm run dev` – start watcher with Nodemon
- `npm run build` – compile TypeScript to `dist/`
- `npm start` – run the compiled app

## Testing the API

- Health check: `GET /health`
- Auth flow: `POST /api/v1/auth/register` → `POST /api/v1/auth/login` → use JWT in `Authorization: Bearer <token>`
- Users CRUD: `GET /api/v1/users` (admin)
- Products CRUD: `GET /api/v1/products`

Forgot/reset password endpoints respond with the reset token in development so you can complete the flow without email infrastructure.