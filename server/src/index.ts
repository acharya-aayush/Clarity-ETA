import express from 'express';
import cors from 'cors';
import pool from './db';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'https://clarity-eta-frontend.vercel.app/',
    'https://clarity-eta-frontend-93onz2fpq-memestar2k4-6131s-projects.vercel.app',
    'http://localhost:3001',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());

// JWT Auth Middleware s
interface AuthenticatedRequest extends express.Request {
  user?: { userId: number };
}

const auth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send('No token');
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
    (req as AuthenticatedRequest).user = payload;
    next();
  } catch {
    res.status(401).send('Invalid token');
  }
};

// Routes

app.post('/transactions', auth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.userId;
    const { amount, type, category, description, date } = req.body;
    
    // Validation
    if (!userId) {
      return res.status(401).send('User not authenticated');
    }
    if (!amount || !type || !category) {
      return res.status(400).send('Missing required fields');
    }
    
    const transactionDate = date || new Date().toISOString().split('T')[0];
    
    const newTransaction = await pool.query(
      `INSERT INTO transactions (user_id, amount, type, category, description, date) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, amount, type, category, description || '', transactionDate]
    );

    res.json(newTransaction.rows[0]);
  } catch (err) {
    console.error('Error adding transaction:', err);
    res.status(500).json({ error: 'Failed to add transaction', details: (err as Error).message });
  }
});

// GET: Only get MY transactions
app.get('/transactions', auth, async (req, res) => {
    try {
      const userId = (req as AuthenticatedRequest).user?.userId;
      const allTransactions = await pool.query(
        'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC',
        [userId]
      );
      res.json(allTransactions.rows);
    } catch (err) {
      console.error((err as Error).message);
      res.status(500).send('Server Error');
    }
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//CRUD Endpoints:
//Update Transaction
app.put('/transactions/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user?.userId;
    const { amount, type, category, description, date } = req.body;
    const updated = await pool.query(
      `UPDATE transactions SET amount=$1, type=$2, category=$3, description=$4, date=$5 WHERE id=$6 AND user_id=$7 RETURNING *`,
      [amount, type, category, description, date, id, userId]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send('Server Error');
  }
});
// DELETE: Delete only MY transaction
app.delete('/transactions/:id', auth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req as AuthenticatedRequest).user?.userId;
      await pool.query(`DELETE FROM transactions WHERE id=$1 AND user_id=$2`, [id, userId]);
      res.json({ message: 'Transaction deleted' });
    } catch (err) {
      console.error((err as Error).message);
      res.status(500).send('Server Error');
    }
  });

//Signup Route
app.post('/signup', async (req, res) => {
  try {
    const { username, password, full_name } = req.body;
    
    // Validation
    if (!username || !password || !full_name) {
      return res.status(400).json({ error: 'Missing required fields: username, password, full_name' });
    }
    
    // Store username in lowercase for case-insensitive login
    const normalizedUsername = username.toLowerCase().trim();
    
    const hashed = await bcrypt.hash(password, 10);
    const user = await pool.query(
      `INSERT INTO users (username, password, full_name) VALUES ($1, $2, $3) RETURNING id, username, full_name, created_at`,
      [normalizedUsername, hashed, full_name]
    );
    
    // Generate token like login does
    const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET as string);
    const { password: _, ...userWithoutPassword } = user.rows[0];
    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error((err as Error).message);
    if ((err as any).code === '23505') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Server Error' });
  }
});
//login Route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    // Normalize username to lowercase for case-insensitive comparison
    const normalizedUsername = username.toLowerCase().trim();
    const user = await pool.query(
      `SELECT * FROM users WHERE LOWER(username)=$1`,
      [normalizedUsername]
    );
    if (!user.rows.length) return res.status(400).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.rows[0].password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET as string);
    
    // Return token and user info (without password)
    const { password: _, ...userWithoutPassword } = user.rows[0];
    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get current user info
app.get('/user/me', auth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.userId;
    const user = await pool.query(
      `SELECT id, username, full_name, created_at FROM users WHERE id=$1`,
      [userId]
    );
    if (!user.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(user.rows[0]);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: 'Server Error' });
  }
});