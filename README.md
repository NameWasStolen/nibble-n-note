# Nibble n Notes
> Ever had a craving for Carbonara but couldn't remember the restaurant you tried that made it best?\
> Or struggled to remember what dishes you tried in that Thai joint all that time ago?
> 
> Nibble & Notes is your personal food diary - log restaurants, rate dishes,
> and see what your friends thought too.

This is a project currently in active development, with the backend API being built first before the frontend application.

## Why I built this
My partner and I are foodies, and we love trying out different dishes and restaurants.\
However, we kept losing track of the restaurants we'd visit and dishes we loved.\
Existing apps felt like they supported noting down locations or logging restaurant & dish reviews, but never both.\
We also wanted an easy way to identify our favourite restaurants and dishes, filtered and categorised to our preferences.

This is my attempt to build exactly all of that: A personal restaurant & dish review-logging journal with group support!

---

## Project Status

**Current phase:** Backend API development

Implemented so far:

- Google authentication flow
- User profile retrieval
- Location creation and lookup
- Restaurant reviews
- Consensus restaurant ratings
- Group creation and management
- Group member management
- Role-based group permissions
- Shared constants and enums layer

Planned next:

- Tag APIs
- Restaurant review filtering by tags
- Frontend application
- Dish-level reviews
- Image upload support

---

## Features
- **Restaurant logging** - track visits with location and date
- **Dish-level reviews** - rate and comment on individual dishes
- **1–10 ratings** - separate scores for food, value, and overall
- **Groups** - invite friends and see combined review feeds
- **Tags** - organise reviews by cuisine, occasion, or custom categories
- **Photo support** *(planned)* - attach images to restaurants and dishes

---

## Tech Stack
### Backend
- Node.js + Express.js
- MongoDB Atlas + Mongoose
- JWT + Google OAuth
### Testing
- Postman
### Frontend *(planned)*
- React + Vite + Tailwind CSS

---
## Documentation
- [`/docs/DataModel.pdf`](./docs/DataModel.pdf) — Entity relationship diagram with design notes
- [`/docs/RoutingTable.md`](./docs/RoutingTable.md) — Full API reference with implementation status

---

## Getting Started
### 1. Clone and install
```bash
git clone https://github.com/your-username/nibble-n-note.git
cd nibble-n-notes && npm install
```

### 2. Configure environment
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Run
```bash
npm run dev
```

Health check: `GET /ping`

---

## Roadmap
### Backend
- Complete tag APIs
- Add tag filtering for restaurant reviews
- Add dish review APIs
- Add image upload support
- Improve query endpoints for frontend views
- Add more advanced group permissions if required
### Frontend
- Build React frontend
- Implement Google Sign-In
- Create restaurant logging flow
- Create review and rating screens
- Add group review screens
- Add tag-based filtering and sorting
### Deployment
- Deploy backend API
- Deploy frontend application
- Configure production environment variables
- Connect deployed frontend to deployed backend