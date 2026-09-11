# ShopSphere – SEN371 Milestone 3 (API Integration)

MERN e-commerce application. This milestone completed the **data-handling** layer for
orders and reviews, plus a database seed that populates **every** collection.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Data layer: Mongoose/MongoDB (MVC + Service + Repository layering)

## Architecture
- **Model layer** – Mongoose schemas (`src/models`)
- **Repository layer** – isolated database access (`src/repositories`)
- **Service layer** – business rules, validation, totals (`src/services`)
- **Controller layer** – HTTP request/response handling (`src/controllers`)
- **Route layer** – endpoint definitions (`src/routes`)

## Database collections (MongoDB)
| Collection | Contents | Key relationships |
| ---------- | -------- | ----------------- |
| `users` | Customers + admins, bcrypt-hashed passwords | role: `customer` / `admin` |
| `categories` | Product categories | unique slug |
| `products` | Catalog items | `category` → `categories` |
| `carts` | One cart per user | `owner` → `users`, `items.product` → `products` |
| `orders` | Orders from checkout with price snapshots | `owner` → `users`, `items.product` → `products` |
| `reviews` | Product reviews | `product` → `products`, `user` → `users` (unique per pair) |

Data integrity rules enforced in the database:
- One active cart per user (`owner` unique in `carts`).
- One review per product per user (compound unique index in `reviews`).
- Unique order numbers and order status transitions (`pending → processing → shipped → completed | cancelled`).

## Data-handling endpoints added
| Method | Endpoint | Access | Purpose |
| ------ | -------- | ------ | ------- |
| `GET` | `/api/orders` | JWT | Current user's orders (admin: `?all=true`) |
| `POST` | `/api/orders` | JWT | Checkout – converts cart to order, decrements stock, clears cart |
| `GET` | `/api/orders/:id` | JWT (owner/admin) | Single order |
| `PATCH` | `/api/orders/:id/cancel` | JWT (owner/admin) | Cancel pending order (restores stock) |
| `PATCH` | `/api/orders/:id/status` | Admin | Update order status |
| `GET` | `/api/reviews/product/:productId` | Public | Reviews for a product |
| `POST` | `/api/reviews/products/:productId` | JWT | Add a review |
| `PUT` | `/api/reviews/:id` | JWT (owner/admin) | Update a review |
| `DELETE` | `/api/reviews/:id` | JWT (owner/admin) | Delete a review |

## Run
To run the program, run the following programs in TWO separate Terminals.

### Backend
```bash
cd backend
npm install
npm run seed      # populate users, categories, products, carts, orders, reviews
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend expects the API at `http://localhost:5000/api`.

### Environment
Create `backend/.env` with:
```env
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=use-a-random-secret-at-least-32-characters-long
JWT_EXPIRES_IN=1d
CLIENT_ORIGIN=http://localhost:5173
PORT=5000
```