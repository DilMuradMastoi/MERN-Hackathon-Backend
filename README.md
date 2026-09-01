# CivicResolve Complete Backend

## Requirements
- Node.js 18+
- MongoDB Atlas/local MongoDB

## Setup

1. Extract this ZIP.
2. Open a terminal in this folder.
3. Run:
   `npm install`
4. Create `.env` from `.env.example`.
5. Set `PORT`, `MONGO_URI`, and `JWT_SECRET`.
6. Gemini is optional. You can leave `GEMINI_API_KEY` unset.
7. Start:
   `npm start`

Development:
`npm run dev`

Health check:
`GET http://localhost:5000/api/health`

## Complaint status flow

Officer authentication is required for:
`PATCH /api/complaints/:id/status`

Body:
`{"status":"In Progress","officerRemark":"Work has started."}`

Valid statuses:
- Pending
- In Progress
- Resolved

The endpoint saves the status to MongoDB and returns the updated complaint.

## API routes

Auth:
- POST `/api/auth/signup`
- POST `/api/auth/login`

Complaints:
- POST `/api/complaints`
- GET `/api/complaints`
- GET `/api/complaints/mine`
- GET `/api/complaints/:id`
- PATCH `/api/complaints/:id/upvote`
- PATCH `/api/complaints/:id/status`
- PATCH `/api/complaints/:id/feedback`
- GET `/api/complaints/export`

AI:
- POST `/api/ai/officer-summary`

Gemini is optional. If no API key exists, `/api/ai/officer-summary` returns a normal statistics-based briefing instead of failing.
