# Learning Management System

A full-stack learning management system with separate React/Vite client and
Express/MongoDB API applications.

The application supports:

- Student and instructor accounts
- JWT-based authentication
- Instructor course creation and publishing
- Course curriculum and media uploads
- Student course discovery and purchase
- PayPal payment creation and capture
- Purchased-course access
- Lecture progress tracking and course completion
- Light/dark theme support

## Project structure

```text
.
├── api/                         Express API
│   ├── controllers/             Request handlers
│   ├── helpers/                 Cloudinary, PayPal, and JWT helpers
│   ├── middleware/              Authentication and request middleware
│   ├── modals/                  Mongoose models
│   ├── routes/                  API route modules
│   ├── connect.js               MongoDB connection
│   ├── index.js                 API entry point
│   └── package.json
├── client/                      React/Vite application
│   ├── public/                  Static assets
│   └── src/
│       ├── api/                 Axios client configuration
│       ├── components/          Shared and feature components
│       ├── config/              Form and course configuration
│       ├── context/             Auth, student, instructor, and theme state
│       ├── pages/               Routed application pages
│       └── services/            API service functions
├── api.md                       API audit notes
├── client.md                    Client audit notes
└── project-flow-architecture.md Application flow documentation
```

The API and client are independent Node.js packages. There is no root
`package.json`, so dependencies and commands must be run from the corresponding
package directory.

## Requirements

- Node.js and npm
- MongoDB database (local or MongoDB Atlas)
- PayPal developer application for payments
- Cloudinary account for media uploads

Use a current Node.js LTS release. The repository does not currently pin a
Node.js version in `package.json`; pin one in your deployment environment if
your hosting platform requires reproducible builds.

## Installation

Clone the repository and install dependencies in both applications:

```powershell
git clone <repository-url>
cd lms

cd api
npm install

cd ..\client
npm install
```

## Environment configuration

Environment files are intentionally ignored by Git. Create the files locally
and never commit real credentials.

### API environment

Copy the example template and fill in the local values:

```powershell
cd api
Copy-Item .env.example .env
```

Then update `api/.env`:

```env
NODE_ENV=development
PORT=8080
CLIENT_URL=http://localhost:5173

MONGO_URL=mongodb://127.0.0.1:27017/lms
JWT_SECRET=replace-with-a-long-random-secret

CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your-paypal-sandbox-client-id
PAYPAL_SECRET_KEY=your-paypal-sandbox-secret

# Optional: override the client callback URLs used by PayPal.
# PAYPAL_RETURN_URL=http://localhost:5173/payment-return
# PAYPAL_CANCEL_URL=http://localhost:5173/cancel-payment
```

The API defaults to port `5000` in code, but the client development
configuration targets `http://localhost:8080`. Set `PORT=8080` locally unless
you also update the client API URL.

`JWT_SECRET` must be present and must be the same value whenever tokens are
created and verified. Use a long random value in any shared or deployed
environment.

### Client environment

For production builds, create `client/.env`:

```env
VITE_BASE_URL=https://your-api-host.example.com
```

During local development, the client uses `http://localhost:8080` by default.
If you need a different development API URL, update the client Axios
configuration or add an environment-based override before running the client.

## Running locally

Start the API in one terminal:

```powershell
cd api
npm run dev
```

Start the client in a second terminal:

```powershell
cd client
npm run dev
```

Open the Vite URL shown in the terminal, normally:

```text
http://localhost:5173
```

The API health check is available at:

```text
http://localhost:8080/health
```

The API starts listening only after the MongoDB connection promise resolves.
If MongoDB is unavailable, fix the connection configuration before testing the
client.

## Available scripts

### API

Run from `api/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API with Nodemon |
| `npm start` | Start the API with Node |
| `npm run build` | No-op compatibility build command |
| `npm test` | Placeholder; automated API tests are not configured yet |

### Client

Run from `client/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite development server with HMR |
| `npm run build` | Create a production build in `client/dist` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Application roles and flows

### Authentication

1. A user registers as either a `student` or `instructor`.
2. The API hashes the password with `bcryptjs`.
3. The API returns a JWT that expires after 24 hours.
4. The client stores the access token and user summary in `localStorage`.
5. Authenticated API requests send the token as:

   ```text
   Authorization: Bearer <token>
   ```

6. Route guards use the authenticated user and role to control client pages.

### Instructor flow

1. Register or sign in with the instructor role.
2. Open the instructor dashboard.
3. Create a course with course metadata, pricing, image, and curriculum.
4. Upload media through Cloudinary-backed API endpoints.
5. Publish the course using the course settings.
6. Update the course later from the instructor course editor.

Only published courses appear in the student course catalogue and can be
purchased.

### Student purchase flow

1. A student opens a published course.
2. The client calls the purchase-info endpoint to determine whether the course
   is already owned.
3. Buy Now calls `POST /student/order/create`.
4. The API reads the course and price from MongoDB instead of trusting the
   client price.
5. The API creates a PayPal payment and returns an approval URL.
6. The browser redirects to PayPal.
7. PayPal redirects to `/payment-return` with `paymentId` and `PayerID`.
8. The client calls `POST /student/order/capture`.
9. The API verifies the payment, marks the order paid, and adds the course to
   the student's purchased courses.

If a pending local order already has a valid PayPal payment, the API attempts
to resume it. If the provider payment is no longer usable, a replacement
payment is created and the existing pending order is updated.

### Course progress flow

1. A purchased student opens a course-progress page.
2. The API verifies that the course is present in the student's purchased
   course list.
3. The client loads existing lecture progress.
4. Viewing a lecture records it as viewed.
5. When all curriculum lectures are viewed, the progress record is marked
   complete.
6. Students can reset their progress.

## API reference

All endpoints are relative to the API base URL, for example
`http://localhost:8080`.

### Health and authentication

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Check API health |
| `POST` | `/auth/register` | No | Register a student or instructor |
| `POST` | `/auth/login` | No | Authenticate and receive a JWT |
| `GET` | `/auth/check-auth` | Bearer token | Validate the current session |

### Instructor courses

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/instructor/course/add` | Create a course |
| `GET` | `/instructor/course/get/:instructorId` | List an instructor's courses |
| `GET` | `/instructor/course/get/details/:id` | Get an instructor course |
| `PUT` | `/instructor/course/update/:id` | Update an instructor course |

### Media

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/media/upload` | Upload one file using multipart field `file` |
| `POST` | `/media/bulk-upload` | Upload up to 10 files using multipart field `files` |
| `DELETE` | `/media/delete/:id` | Delete a media asset |

### Student catalogue and ownership

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/student/course/get` | List published courses |
| `GET` | `/student/course/get/details/:id` | Get published course details |
| `GET` | `/student/course/purchase-info/:id/:studentId` | Check course ownership |
| `GET` | `/student/courses-bought/get/:studentId` | List purchased courses |

### Payments

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/student/order/create` | Create or resume a PayPal order |
| `POST` | `/student/order/capture` | Verify and finalize a PayPal payment |

### Progress

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/student/course-progress/get/:userId/:courseId` | Get course progress |
| `POST` | `/student/course-progress/mark-lecture-viewed` | Mark a lecture viewed |
| `POST` | `/student/course-progress/reset-progress` | Reset course progress |

Use a valid bearer token for endpoints that explicitly require authentication,
including `/auth/check-auth` and the student order routes. Before exposing
additional instructor, media, catalogue, purchased-course, or progress
endpoints publicly, verify that their route modules mount the authentication
and role middleware required by the deployment. Controllers contain ownership
and identifier checks in several flows, but route-level middleware should be
the primary access boundary.

## Data model overview

The API uses Mongoose models for:

- `User`: account identity, email, password hash, and role
- `Course`: instructor-owned course metadata, curriculum, pricing, publication
  status, and enrolled students
- `Order`: one pending or completed purchase per user/course pair
- `StudentCourses`: a student's purchased course summaries
- `CourseProgress`: lecture viewing state and completion information
- `MediaAsset`: uploaded media ownership and provider metadata

Course and user identifiers are MongoDB ObjectIds represented as strings in
several application-level fields. Keep this convention consistent when adding
new endpoints.

## Deployment notes

### API deployment

Configure the API host with:

- A reachable MongoDB URI
- A strong `JWT_SECRET`
- Production Cloudinary credentials
- PayPal live credentials and `PAYPAL_MODE=live`
- `CLIENT_URL` set to the deployed client origin
- A public `PORT` supplied by the hosting provider, if required

Set the PayPal return and cancel URLs to the deployed client routes:

```text
https://your-client.example.com/payment-return
https://your-client.example.com/cancel-payment
```

Do not use sandbox credentials in production.

### Client deployment

Build the client:

```powershell
cd client
npm run build
```

Deploy the contents of `client/dist` to a static host. The included
`client/vercel.json` rewrites routes to `index.html`, which is needed for the
client-side router when deployed to Vercel. Set `VITE_BASE_URL` to the public
API URL before building.

## Troubleshooting

### `401 Unauthorized`

- Confirm the user is logged in.
- Confirm `accessToken` exists in browser `localStorage`.
- Confirm the API request includes `Authorization: Bearer <token>`.
- Confirm the token was signed with the current `JWT_SECRET`.
- Log in again after changing the API secret or restarting with a different
  secret.

### `Course not found` while purchasing

Check the course document in MongoDB:

```json
{
  "_id": "<course-id>",
  "isPublished": true
}
```

The course must exist, have a valid identifier, and be published. An existing
but unpublished course returns a separate “not available for purchase” response.

### Payment does not redirect

- Confirm `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET_KEY` are configured.
- Confirm `PAYPAL_MODE=sandbox` while using sandbox credentials.
- Confirm the API can reach PayPal.
- Confirm the course is published and has a valid numeric price.
- Inspect the API log for PayPal provider errors.
- Retry Buy Now after an expired pending order; the API should create or resume
  a usable approval URL.

Never log PayPal secrets, JWTs, or complete authorization headers.

### MongoDB connection failure

- Verify `MONGO_URL`.
- Confirm the MongoDB server or Atlas cluster is running.
- Confirm the current IP is allowed by Atlas network access rules.
- Confirm the database credentials are valid and URL-encoded if necessary.

### Client works but requests use the wrong API URL

Local development uses `http://localhost:8080`. Production builds use
`VITE_BASE_URL`. Set the API `PORT` and client base URL to matching values.

## Validation status

The client currently has working lint and production build commands:

```powershell
cd client
npm run lint
npm run build
```

The API has syntax and startup scripts, but `npm test` is still a placeholder
and does not execute an automated test suite. Payment, MongoDB, Cloudinary, and
deployment integrations require valid external credentials and were not
reproducibly testable from a clean checkout without those services.

## Security and operational guidance

- Keep `.env` files out of version control.
- Use strong, unique secrets outside local development.
- Use PayPal sandbox accounts for local testing.
- Restrict CORS to known client origins.
- Mount authentication and role middleware on every non-public route before
  production deployment.
- Do not trust client-supplied prices, roles, ownership, or payment status.
- Rotate credentials if they have ever been exposed.
- Add automated API tests before making production changes to authentication,
  payments, ownership, or progress behavior.
- Consider replacing the legacy `paypal-rest-sdk` integration with a currently
  supported PayPal SDK in a dedicated migration.

## Further documentation

- [API audit](./api.md)
- [Client audit](./client.md)
- [Project flow architecture](./project-flow-architecture.md)
