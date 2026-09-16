# Azure IAM

Azure IAM is a role-based access control sample application built with a React single-page application and an Express API. Authentication is handled by Microsoft Entra ID through the Microsoft Authentication Library (MSAL). The API validates access tokens and restricts endpoints using application roles.

## What This Project Demonstrates

- Microsoft Entra ID authentication in a React SPA.
- Popup and redirect sign-in flows.
- Popup and redirect sign-out flows.
- Access-token acquisition for a protected API.
- Server-side JWT validation using Microsoft signing keys.
- Role-based authorization with `ADMIN` and `MANAGER` app roles.
- Independent frontend requests to role-protected backend endpoints.
- Clear success and forbidden responses in the dashboard.

## Project Structure

```text
Azure--IAM/
|-- Backend/
|   |-- middleware/
|   |   |-- ValidateRole.js       # Checks required app roles
|   |   |-- ValidateToken.js      # Validates Entra access tokens
|   |-- package.json
|   |-- server.js                # Express API and protected routes
|-- SPA/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |   |-- Dashboard.jsx
|   |   |   |-- PageLayout.jsx
|   |   |   |-- ProfileData.jsx
|   |   |   |-- SignInButton.jsx
|   |   |   |-- SignOutButton.jsx
|   |   |   |-- ...
|   |   |   |-- config/
|   |   |       |-- authConfig.js
|   |   |       |-- graphConfig.js
|   |   |-- App.jsx
|   |   |-- index.css
|   |   |-- main.jsx
|   |   |-- ...
|   |   |-- redirect.html        # MSAL redirect bridge page
|   |   |-- package.json
|-- README.md
```

## Architecture

```text
Browser
  |
  |  Sign in with MSAL
  v
Microsoft Entra ID
  |
  |  Access token with app roles
  v
React SPA (Vite, localhost:5173)
  |
  |  Authorization: Bearer <access token>
  v
Express API (localhost:3000)
  |
  |  Validate signature, issuer, audience, and expiration
  |  Check required role
  v
Protected response or HTTP 403
```

The SPA uses the ID token claims to display the user's assigned roles. The backend does not trust that UI display for authorization. It validates the access token and checks the `roles` claim independently before returning protected data.

## Technology Stack

### Frontend

- React 19
- Vite
- `@azure/msal-browser`
- `@azure/msal-react`
- React Bootstrap components
- ESLint

### Backend

- Node.js
- Express 5
- JSON Web Token (`jsonwebtoken`)
- JSON Web Key Set retrieval (`jwks-rsa`)
- CORS
- dotenv

## Prerequisites

Install the following before running the project:

- Node.js 18 or newer. Node.js 20 or newer is recommended.
- npm.
- An Entra ID tenant where you can create app registrations and app roles.
- A browser that allows the local development origin used by the SPA.

## Microsoft Entra ID Setup

The current SPA configuration uses these application values:

- Tenant ID: `<your tenant id here>`
- Client/application ID: `<your application id here>`
- API scope: `api://<your application id here>/<scope here>`

For another tenant or application, update the SPA and backend configuration consistently.

### 1. Register the application

Create or use an Entra app registration and record:

- Directory (tenant) ID.
- Application (client) ID.

The client ID is used by the SPA and as the expected API audience by the backend.

### 2. Configure SPA redirect URIs

Add the local SPA origins and redirect page to the app registration as appropriate for the selected MSAL flow:

- `http://localhost:5173`
- `http://localhost:5173/redirect.html`

The Vite build treats `redirect.html` as a separate entry point so it can be used by the MSAL redirect bridge.

### 3. Expose an API scope

In the API app registration, expose a delegated scope with a value such as:

```text
access_as_user
```

The resulting scope used by this project is:

```text
api://<API_CLIENT_ID>/access_as_user
```

The value in `SPA/src/config/authConfig.js` must match the exposed API scope exactly.

### 4. Create application roles

Create these application roles on the API app registration:

| Display name | Value | Allowed member types |
| --- | --- | --- |
| Administrator | `ADMIN` | Users/Groups, or the member type required by your tenant |
| Manager | `MANAGER` | Users/Groups, or the member type required by your tenant |

The role **Value** is important. It must be exactly `ADMIN` or `MANAGER` because the backend compares those values in the token `roles` claim.

### 5. Grant API permissions to the SPA

On the SPA app registration, add delegated permission for the API scope:

```text
api://<API_CLIENT_ID>/access_as_user
```

Grant admin consent if required by the tenant.

### 6. Assign users or groups to roles

From the enterprise application associated with the API app registration:

1. Open **Users and groups**.
2. Add a user or group.
3. Assign `ADMIN`, `MANAGER`, or both.
4. Sign out and sign in again after changing assignments so a new token is issued.

A user with neither role can authenticate but receives `403` responses from both protected endpoints.

## Backend Configuration

Create `Backend/.env`:

```env
PORT=3000
TENANT_ID=<your-tenant-id>
CLIENT_ID=<your-api-application-client-id>
```

`ValidateToken.js` uses these values to:

- Retrieve Microsoft signing keys from the tenant JWKS endpoint.
- Validate the token issuer.
- Validate the token audience.
- Reject invalid, expired, or incorrectly targeted tokens.
- Reject Microsoft Graph tokens sent to this API.

Do not commit `Backend/.env` or any client secret to source control. This backend validates bearer tokens and does not require a client secret for the current flow.

## Install Dependencies

Install dependencies separately for each application:

```powershell
cd Backend
npm install

cd ..\SPA
npm install
```

The backend `dev` script uses `nodemon`. If `nodemon` is not installed or available globally, run the server with `node server.js`, or install it as a development dependency before using `npm run dev`.

## Run Locally

Open two terminals from the repository root.

### Terminal 1: Backend

```powershell
cd Backend
node server.js
```

The API starts at:

```text
http://localhost:3000
```

The development script is also available when `nodemon` is installed:

```powershell
cd Backend
npm run dev
```

### Terminal 2: SPA

```powershell
cd SPA
npm run dev
```

Open the Vite URL shown in the terminal, normally:

```text
http://localhost:5173
```

The SPA currently defaults API requests to `http://localhost:3000`. To use another API origin, create `SPA/.env.local`:

```env
VITE_API_URL=http://localhost:3000
```

`VITE_API_URL` should contain the origin only. The dashboard appends the endpoint path.

## Available API Routes

### Health check

```http
GET /
```

Response:

```text
Hello, World!
```

### Admin endpoint

```http
GET /api/admin-data
Authorization: Bearer <entra-access-token>
```

Required app role: `ADMIN`

Successful response:

```json
{
  "message": "Admin endpoint access granted!",
  "endpoint": "/api/admin-data",
  "user": "Example User"
}
```

### Manager endpoint

```http
GET /api/manager-data
Authorization: Bearer <entra-access-token>
```

Required app role: `MANAGER`

Successful response:

```json
{
  "message": "Manager endpoint access granted!",
  "endpoint": "/api/manager-data",
  "user": "Example User"
}
```

### Expected authorization failures

Missing bearer token:

```http
401 Unauthorized
```

Missing or invalid token:

```http
401 Unauthorized
```

Valid token without the required role:

```http
403 Forbidden
```

Response:

```json
{
  "error": "Forbidden: Missing required role"
}
```

## Dashboard Behavior

After authentication, the dashboard displays:

- The signed-in user's name.
- The signed-in user's username.
- Roles found in the ID token claims.
- A placeholder for future workspace functionality.
- An independent request card for `/api/admin-data`.
- An independent request card for `/api/manager-data`.

Each request obtains an access token using the API scope, sends it as a bearer token, and displays the returned JSON. If the user lacks the required role, the backend's rejection is displayed on that endpoint's card.

## Authentication Flows

The login menu provides:

- **Popup:** Uses `instance.loginPopup()`.
- **Redirect:** Uses `instance.loginRedirect()`.

The logout menu provides:

- **Popup:** Uses `instance.logoutPopup()`.
- **Redirect:** Uses `instance.logoutRedirect()`.

The redirect page is `SPA/redirect.html`. It uses the MSAL redirect bridge to broadcast the authentication response back to the main window.

## Frontend Commands

Run these from `SPA`:

```powershell
npm run dev      # Start the Vite development server
npm run lint     # Run ESLint
npm run build    # Create the production build
npm run preview  # Preview the production build locally
```

The production build includes both:

- `index.html` for the main SPA.
- `redirect.html` for the MSAL redirect flow.

## Backend Commands

Run these from `Backend`:

```powershell
npm run dev      # Start with nodemon, when available
node server.js   # Start directly with Node.js
```

## Troubleshooting

### The API returns 401

Check the following:

- The `Authorization` header starts with `Bearer `.
- The SPA is requesting the API scope, not only `User.Read`.
- `TENANT_ID` and `CLIENT_ID` are set in `Backend/.env`.
- The token audience matches the backend API application.
- The access token has not expired.
- The browser is calling the correct API origin.

### The API returns 403

The token is valid, but it does not contain the required role. Verify:

- The user or group is assigned to the `ADMIN` or `MANAGER` application role.
- The role value matches exactly, including capitalization.
- The user signed out and back in after role assignment.
- The request is sent to the endpoint intended for that role.

### The role appears in the dashboard but the API rejects the request

The dashboard reads roles from the ID token for display, while the API authorizes using the access token. Confirm that:

- The API exposes the expected application roles.
- The SPA requested an access token for the API scope.
- The API access token contains the expected `roles` claim.
- The API application registration is the audience for the token.

### CORS or connection errors

- Start the backend before sending dashboard requests.
- Confirm the API is listening on port `3000`, or set `VITE_API_URL` to the correct origin.
- Confirm the browser origin is registered in Entra ID.
- The backend currently enables CORS globally with Express middleware.

### Redirect sign-in does not complete

- Register `http://localhost:5173/redirect.html` in the SPA app registration.
- Confirm `redirect.html` is included in the Vite build.
- Avoid opening the redirect page directly; it is intended to be used by MSAL.
- Clear the browser session and start a new sign-in flow.

### The sign-in menu looks unstyled

The project intentionally defines the required dropdown styles in `SPA/src/index.css`. The SPA does not import the full Bootstrap stylesheet. Confirm that the Vite development server is serving the latest CSS and refresh the browser after rebuilding.

## Security Notes

- Never trust roles rendered by the frontend for authorization decisions.
- Always validate bearer tokens at the API boundary.
- Do not commit secrets, certificates, private keys, or `.env` files.
- Use HTTPS outside local development.
- Restrict CORS to known frontend origins in production instead of allowing all origins.
- Avoid logging full access tokens. The current development logging includes token claim diagnostics; review and reduce logging before production use.
- Rotate or replace application identifiers when publishing this sample for another tenant.
- Use least-privilege API scopes and role assignments.

## Current Configuration Notes

The SPA currently stores the tenant authority, client ID, and API scope directly in `SPA/src/config/authConfig.js`. These are identifiers, not secrets, but production applications should use environment-specific configuration and avoid hardcoding deployment-specific values.

The backend reads `TENANT_ID`, `CLIENT_ID`, and `PORT` from `.env`, with port `3000` as the fallback.

## Extending the Project

To add another protected role endpoint:

1. Create an application role in Entra ID.
2. Assign the role to users or groups.
3. Add a route in `Backend/server.js` using `validateEntraToken` and `checkRole('ROLE_VALUE')`.
4. Add a request card in `SPA/src/components/Dashboard.jsx`.
5. Keep the access token scope targeted at the API.
6. Test both an authorized user and a user without the role.

## License

The repository currently uses the ISC license metadata declared in `Backend/package.json`. Add or update a root license file if this project is distributed publicly.
