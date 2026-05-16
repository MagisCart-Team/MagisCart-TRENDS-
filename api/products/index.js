import jwt from 'jsonwebtoken';
import pool from '../db.js';

function verifyToken(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const token = auth.split(' ')[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  const user = verifyToken(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // GET — fetch all products for this org
  if (req.method === 'GET') {
    try {
      const result = await pool.query(
        'SELECT * FROM products WHERE org_id = $1 ORDER BY name',
        [user.org_id]
      );
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  // POST — add a new product
  else if (req.method === 'POST') {
    const { name, price, stock } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO products (name, price, stock, org_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, price, stock, user.org_id]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}