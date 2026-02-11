import express from 'express';
import cors from 'cors';
import pool from './db';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// JWT Auth Middleware 
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
const newTransaction = await pool.query(
  `INSERT INTO transactions (user_id, amount, type, category, description, date) 
   VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
  [userId, amount, type, category, description, date]
);

    res.json(newTransaction.rows[0]);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send('Server Error');
  }
});

app.get('/transactions', auth, async (req, res) => {
  try {
    const allTransactions = await pool.query('SELECT * FROM transactions');
    res.json(allTransactions.rows);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send('Server Error');
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
//Delete Transaction
app.delete('/transactions/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM transactions WHERE id=$1`, [id]);
    res.json({ message: 'Transaction deleted' });
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
    const { username, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await pool.query(
      `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *`,
      [username, hashed]
    );
    res.json(user.rows[0]);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send('Server Error');
  }
});
//login Route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await pool.query(
      `SELECT * FROM users WHERE username=$1`,
      [username]
    );
    if (!user.rows.length) return res.status(400).send('Invalid credentials');
    const valid = await bcrypt.compare(password, user.rows[0].password);
    if (!valid) return res.status(400).send('Invalid credentials');
    const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET as string);
    res.json({ token });
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send('Server Error');
  }
});