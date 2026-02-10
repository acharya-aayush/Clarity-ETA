import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes

app.post('/transactions', async (req, res) => {
  try {
    const { user_id, amount, type, category, description, date } = req.body;
    
    // RAW SQL INSERT
    const newTransaction = await pool.query(
      `INSERT INTO transactions (user_id, amount, type, category, description, date) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, amount, type, category, description, date]
    );

    res.json(newTransaction.rows[0]);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send('Server Error');
  }
});

app.get('/transactions', async (req, res) => {
  try {
    const allTransactions = await pool.query('SELECT * FROM transactions');
    res.json(allTransactions.rows);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send('Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});