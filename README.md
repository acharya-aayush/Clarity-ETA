# Clarity - Expense Tracker

A modern expense tracking application with authentication and analytics.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database (Neon recommended)

## Setup Instructions

**1. Clone the repository**
```bash
git clone https://github.com/acharya-aayush/Clarity-ETA.git
cd Clarity-ETA
```

**2. Install dependencies**
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

**3. Database setup**

Create these tables in your PostgreSQL database:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**4. Configure environment variables**

Create `server/.env`:
```
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

**5. Run the application**

Start backend (in `server` folder):
```bash
npx ts-node src/index.ts
```

Start frontend (in `client` folder):
```bash
npm run dev
```

The app will run at `http://localhost:3001`

## Tech Stack

Frontend: React, TypeScript, Tailwind CSS, Vite  
Backend: Node.js, Express, PostgreSQL  
Authentication: JWT with bcrypt

## License

MIT
