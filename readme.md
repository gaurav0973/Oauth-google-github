# Full Stack OAuth Authentication System

A complete authentication system built from scratch using **Node.js, Express, MongoDB, and React**, supporting:

* Google OAuth
* GitHub OAuth
* Account linking
* JWT-based authentication
* Refresh token system (with rotation)
* Secure session management


## 🚀 Features

### Authentication

* Google OAuth 2.0 login
* GitHub OAuth login
* Secure login flow using PKCE (Google)

### Account Linking

* Automatically links multiple providers (Google + GitHub) to the same user (based on email)

### JWT-Based Auth

* Short-lived **Access Token**
* Long-lived **Refresh Token**
* Tokens stored in HTTP-only cookies

### Refresh Token System

* Refresh tokens stored in MongoDB
* Token rotation implemented
* Reuse detection (security enhancement)

### Logout

* Clears cookies
* Revokes refresh token from DB

### Protected Routes

* Middleware-based authentication
* Example: `/me` route


## Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* Arctic (OAuth library)
* JSON Web Tokens (JWT)

### Frontend

* React (Vite + Bun)

---

## 📁 Project Structure

```
server/
├── src/
│   ├── common/
│   │   ├── config/
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── oauthAccount.model.js
│   │   │   └── refreshToken.model.js
│   │   ├── middleware/
│   │   └── utils/
│   │       └── jwt.js
│   ├── module/
│   │   ├── google/
│   │   ├── github/
│   │   └── auth/
│   └── index.js
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root:

```
PORT=5000
MONGO_URI=your_mongodb_uri

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret

FRONTEND_ORIGIN=http://localhost:5173
```

---

## Authentication Flow

### Login

```
Frontend → /google or /github →
OAuth Provider →
/callback →
User created / linked →
JWT tokens issued →
Cookies set →
Redirect to frontend
```

---

### Session Handling

```
Request →
Access Token valid → success
Access Token expired →
    Refresh Token used →
    New Access Token issued
```

---

### Refresh Token Rotation

```
Refresh request →
Old refresh token revoked →
New refresh token issued →
Stored in DB
```

---

### Logout

```
Delete refresh token from DB →
Clear cookies →
User logged out
```

---

## 🔐 Security Features

* HTTP-only cookies (prevents XSS attacks)
* Refresh token rotation
* Token reuse detection
* Server-side session validation
* CSRF protection via OAuth state

---

## 🧪 API Endpoints

| Route              | Description          |
| ------------------ | -------------------- |
| `/google`          | Google login         |
| `/google/callback` | Google callback      |
| `/github`          | GitHub login         |
| `/github/callback` | GitHub callback      |
| `/me`              | Get current user     |
| `/refresh`         | Refresh access token |
| `/logout`          | Logout user          |

---

## Frontend Flow

* Login via Google/GitHub
* Redirect to `/profile`
* Fetch `/me` for user data
* Auto refresh when token expires
* Logout clears session

---

##  What This Project Demonstrates

* OAuth implementation from scratch
* Secure authentication architecture
* Token lifecycle management
* Account linking across providers
* Backend + frontend integration

---

## Future Improvements

* Role-based access control (RBAC)
* Multi-device session management
* Refresh token rotation per device
* Provider unlinking UI
* Production deployment (HTTPS cookies)

---

## Author

Built as a learning + production-grade authentication system project.

---


