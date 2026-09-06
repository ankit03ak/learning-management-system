# Learning Management System

A full-stack learning management system with separate React/Vite client and
Node.js/Express API applications.

## Project structure

```text
lms/
├── api/       # Express API, MongoDB models, authentication, media, payments
└── client/    # React/Vite web application
```

## Requirements

- Node.js 18 or newer
- npm
- MongoDB database
- Cloudinary account for course images and lecture videos
- PayPal Sandbox application for payments

## Installation

Open two terminals from the repository root.

### 1. Install API dependencies

```powershell
cd api
npm install
```

### 2. Install client dependencies

```powershell
cd client
npm install
```

## API environment configuration

Create `api/.env` with the following values:

```env
PORT=8080
CLIENT_URL=http://localhost:5173

MONGO_URL=your_mongodb_connection_string

JWT_SECRET=use_a_long_random_secret_at_least_32_characters
JWT_ISSUER=lms-api
JWT_AUDIENCE=lms-client
JWT_EXPIRES_IN=1h

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_SECRET_KEY=your_paypal_sandbox_secret
PAYPAL_RETURN_URL=http://localhost:5173/payment-return
PAYPAL_CANCEL_URL=http://localhost:5173/cancel-payment
```

Never commit real API keys, database credentials, JWT secrets, or PayPal
secrets to source control.

## Client environment configuration

The client uses the API at `http://localhost:8080` during Vite development by
default. To use another API URL, create `client/.env`:

```env
VITE_BASE_URL=http://localhost:8080
```

## Running the application

### Start the API

```powershell
cd api
npm run dev
```

The API runs on `http://localhost:8080` when `PORT=8080` is configured.

### Start the client

```powershell
cd client
npm run dev
```

Open the URL shown by Vite, normally `http://localhost:5173`.

## Main application flows

### Authentication

1. Register as either a `student` or `instructor`.
2. Log in.
3. The client stores the access token and sends it as a Bearer token.
4. Protected API routes validate the token and user role.

### Instructor workflow

1. Open the instructor dashboard.
2. Create a course from **Create A New Course**.
3. Complete the course landing-page fields.
4. Upload a course thumbnail from **Settings**.
5. Add lecture titles and upload lecture videos.
6. Optionally enable **Free Preview** for lectures.
7. Submit the course.
8. Use the dashboard to view courses, enrollment totals, revenue, and student
   enrollment details.

Uploaded media is stored in Cloudinary. Lecture and image assets are tracked
by the API so the instructor can replace or delete owned assets.

### Student workflow

1. Browse published courses.
2. Open a course and use the free-preview videos if available.
3. Select **Buy Now** and complete the PayPal Sandbox checkout.
4. Return to the application after approval.
5. Open **My Courses** to watch purchased lectures.
6. Lecture progress is saved as lectures are viewed.

If the student has not purchased a course, **My Courses** displays
**No courses purchased yet**.

## Useful API areas

| Area | Routes |
| --- | --- |
| Authentication | `/auth/register`, `/auth/login`, `/auth/check-auth` |
| Instructor media | `/media/upload`, `/media/bulk-upload`, `/media/delete/:id` |
| Instructor courses | `/instructor/course/*` |
| Student courses | `/student/course/*` |
| Orders | `/student/order/create`, `/student/order/capture` |
| Course progress | `/student/course-progress/*` |
| Health check | `/health` |

## Validation commands

Run the client lint and production build:

```powershell
cd client
npm run lint
npm run build
```

Check API JavaScript syntax:

```powershell
cd api
Get-ChildItem -Recurse -Filter *.js |
  Where-Object { $_.FullName -notmatch '\\node_modules\\' } |
  ForEach-Object { node --check $_.FullName }
```

The API package currently does not contain an automated test suite.

## Troubleshooting

- **API cannot start:** verify `MONGO_URL` and `JWT_SECRET`.
- **Unauthorized requests:** log in again and confirm the client is using the
  same API URL configured in `VITE_BASE_URL`.
- **Upload failures:** verify Cloudinary credentials and file size/type limits.
- **Payment return fails:** verify PayPal Sandbox credentials and callback URLs.
- **No purchased courses:** complete a successful checkout and return through
  the PayPal callback URL.

