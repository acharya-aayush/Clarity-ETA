# Clarity - Expense Tracker

This project was built as a coding assignment for a software engineering selection process. The goal was to create a personal expense tracking app—Clarity—that helps users understand and manage their finances better, with a focus on clean code, usability, and a modern UI.

Clarity lets users securely sign up, log in, and manage their income and expenses. You can add, edit, and delete transactions, filter by category, and view a dashboard with analytics and charts. The app is fully responsive, works on both desktop and mobile, and is deployed live on Vercel with a PostgreSQL (Neon) backend.

**What I am Proud Of:**
- **Neumorphic Design System**: A custom-built component library with a cohesive, modern aesthetic using soft shadows and subtle gradients
- **Smart Category Pagination**: Dynamic category filtering that adapts from 4 to 3 items per view for better mobile responsiveness
- **Production-Ready Deployment**: Full stack deployed on Vercel with proper CORS configuration, environment variable handling, and serverless architecture
- **Real Database Integration**: PostgreSQL (Neon) with proper type safety, DECIMAL handling for currency, and user isolation
- **Advanced Features**: CSV export for reports, transaction analytics with charts, responsive design, and case-insensitive login

**If I Had More Time:**
- Implement forgot password mechanism with email reset tokens
- Add budget goals and spending alerts
- Support recurring transactions and recurring bills
- Multi-currency support with real-time exchange rates
- Mobile app using React Native
- Data visualization improvements with more chart types
- **AI-powered Budgeting**: Analyze your income and spending habits to automatically suggest a personalized budget plan, identify unnecessary expenses, and help you save more each month.

## Live Demo

**Frontend**: [https://clarity-eta-frontend.vercel.app](https://clarity-eta-frontend.vercel.app)  
**Backend API**: [https://clarity-eta-backend.vercel.app](https://clarity-eta-backend.vercel.app)

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

Copy `server/.env.example` to `server/.env` and update with your actual values:
```bash
cp server/.env.example server/.env
```

Then edit `server/.env`:
```
DATABASE_URL=postgresql://your_neon_user:your_password@your_neon_host/neondb?sslmode=require
JWT_SECRET=generate_a_random_secret_with_openssl_rand_-base64_32
PORT=5000
```

**Get Neon Database:**
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new database
3. Copy the connection string to `DATABASE_URL`

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
