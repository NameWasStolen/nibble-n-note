# API Routing Table
Last Updated: 08/06/2026

## Notes

- Protected routes require `Authorization: Bearer <token>`.
- `GET /ping` is a public health check endpoint.
- API routes are prefixed with `/api`.
- IDs refer to MongoDB `_id` values.
- Review containers use `userId` OR `groupId`, never both.
- Entries always belong to a `userId`.

---

## General

| Method | Route | Auth | Purpose | Parameters | Success Response | Notes | Implemented? |
|----------|----------|----------|----------|----------|----------|----------|----------|
| GET | `/ping` | No | Check server health | None | `200 pong` | Used for deployment/testing | ☑ |

---

## Auth

| Method | Route | Auth | Purpose | Parameters | Success Response | Notes | Implemented? |
|----------|----------|----------|----------|----------|----------|----------|----------|
| POST | `/api/auth/googleLogin` | No | Verify Google token and issue JWT | Google credential token | `200 { token, user }` | Creates user if first login | ☑ |

---

## User

| Method | Route | Auth | Purpose | Parameters | Success Response | Notes | Implemented? |
|----------|----------|----------|----------|----------|----------|----------|----------|
| GET | `/api/user/me` | Yes | Get current authenticated user | None | `200 User` | Uses JWT identity | ☑ |

---

## Locations

| Method | Route | Auth | Purpose | Parameters | Success Response | Notes | Implemented? |
|----------|----------|----------|----------|----------|----------|----------|----------|
| POST | `/api/locations` | Yes | Find or create location | `placeId, name, address, businessStatus, price, lat, lng` | `200 Location` | Uses `createOrUpdateLocation()` service | ☑ |
| GET | `/api/locations/:id` | Yes | Get location by ID | `id` | `200 Location` | Useful for location details page | ☑ |

---

## Restaurant Reviews

| Method | Route | Auth | Purpose | Parameters | Success Response | Notes | Implemented? |
|----------|----------|----------|----------|----------|----------|----------|----------|
| POST | `/api/restaurant-reviews` | Yes | Create restaurant review container | `locationId, groupId?, consensusRating, consensusSource, consensusUpdatedAt, consensusUpdatedBy, tagIds?` | `201 RestaurantReview` | Personal if no groupId | ☑ |
| GET | `/api/restaurant-reviews/:id` | Yes | Get restaurant review | `id` | `200 RestaurantReview` | Access control required | ☑ |
| PATCH | `/api/restaurant-reviews/:id` | Yes | Update review container | `consensusRating?, consensusSource, tagIds?` | `200 RestaurantReview` | Owner/Admin permissions | ☑ |
| DELETE | `/api/restaurant-reviews/:id` | Yes | Delete review container | `id` | `204 No Content` | Decide cascade delete behaviour | ☑ |

---

## Restaurant Review Entries

| Method | Route | Auth | Purpose | Parameters | Success Response | Notes | Implemented? |
|----------|----------|----------|----------|----------|----------|----------|----------|
| POST | `/api/restaurant-review-entries` | Yes | Create review entry | `restaurantReviewId, userRating, images?` | `201 RestaurantReviewEntry` | One entry per user | ☑ |
| PATCH | `/api/restaurant-review-entries/:id` | Yes | Update own entry | `userRating?, images?` | `200 RestaurantReviewEntry` | Entry owner only | ☑ |
| DELETE | `/api/restaurant-review-entries/:id` | Yes | Delete own entry | `id` | `204 No Content` | Entry owner only | ☑ |

---

## Dish Reviews

| Method | Route | Auth | Purpose | Parameters | Success Response | Notes | Implemented? |
|----------|----------|----------|----------|----------|----------|----------|----------|
| POST | `/api/dish-reviews` | Yes | Create dish review container | `locationId, groupId?, dishName, consensusRating, tagIds?` | `201 DishReview` | Generates normalised dish name | [ ] |
| GET | `/api/dish-reviews/:id` | Yes | Get dish review | `id` | `200 DishReview` | Access control required | [ ] |
| PATCH | `/api/dish-reviews/:id` | Yes | Update dish review | `dishName?, consensusRating?, tagIds?` | `200 DishReview` | Rebuilds normalised name | [ ] |
| DELETE | `/api/dish-reviews/:id` | Yes | Delete dish review | `id` | `204 No Content` | Decide cascade delete behaviour | [ ] |

---

## Dish Review Entries

| Method | Route | Auth | Purpose | Parameters | Success Response | Notes | Implemented? |
|----------|----------|----------|----------|----------|----------|----------|----------|
| POST | `/api/dish-review-entries` | Yes | Create dish review entry | `dishReviewId, userRating, images?` | `201 DishReviewEntry` | One entry per user | [ ] |
| PATCH | `/api/dish-review-entries/:id` | Yes | Update own entry | `userRating?, images?` | `200 DishReviewEntry` | Entry owner only | [ ] |
| DELETE | `/api/dish-review-entries/:id` | Yes | Delete own entry | `id` | `204 No Content` | Entry owner only | [ ] |

---

## Tags

| Method | Route | Auth | Purpose | Parameters | Success Response | Notes | Implemented? |
|----------|----------|----------|----------|----------|----------|----------|----------|
| POST | `/api/tags` | Yes | Create tag | `groupId?, name, colour?, category` | `201 Tag` | Personal or group tag | [ ] |
| GET | `/api/tags` | Yes | List tags | Query parameters | `200 Tag[]` | Filter by category/group | [ ] |
| PATCH | `/api/tags/:id` | Yes | Update tag | `name?, colour?, category?` | `200 Tag` | Ownership required | [ ] |
| DELETE | `/api/tags/:id` | Yes | Delete tag | `id` | `204 No Content` | Review references need consideration | [ ] |

---

## Groups

| Method | Route | Auth | Purpose | Parameters | Success Response | Notes | Implemented? |
|----------|----------|----------|----------|----------|----------|----------|----------|
| POST | `/api/groups` | Yes | Create group | `name` | `201 Group` | Also creates owner membership | ☑ |
| GET | `/api/groups` | Yes | List user groups | None | `200 Group[]` | Uses GroupMember records | ☑ |
| GET | `/api/groups/:id` | Yes | Get group details | `id` | `200 Group` | Must be group member | ☑ |
| PATCH | `/api/groups/:id` | Yes | Update group | `name` | `200 Group` | Owner/Admin only | ☑ |
| DELETE | `/api/groups/:id` | Yes | Delete group | `id` | `204 No Content` | Owner only | ☑ |

---

## Group Members

| Method | Route | Auth | Purpose | Parameters | Success Response | Notes | Implemented? |
|----------|----------|----------|----------|----------|----------|----------|----------|
| POST | `/api/groups/:groupId/members` | Yes | Add member | `userId, role?` | `201 GroupMember` | Owner/Admin only | ☑ |
| GET | `/api/groups/:groupId/members` | Yes | Get all group members | `id` | `200 GroupMember[]` | Member of that group only | ☑ |
| PATCH | `/api/groups/:groupId/members/:userId` | Yes | Update member role | `role` | `200 GroupMember` | Owner only | ☑ |
| DELETE | `/api/groups/:groupId/members/:userId` | Yes | Remove member | `groupId, userId` | `204 No Content` | Owner/Admin rules | [ ] |