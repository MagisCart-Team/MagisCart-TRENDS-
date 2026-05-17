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

  const { id } = req.query;

  // PUT — update a product
  if (req.method === 'PUT') {
    const { name, price, stock } = req.body;
    try {
      const result = await pool.query(
        'UPDATE products SET name=$1, price=$2, stock=$3 WHERE id=$4 AND org_id=$5 RETURNING *',
        [name, price, stock, id, user.org_id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
      res.status(200).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  // DELETE — remove a product
  else if (req.method === 'DELETE') {
    try {
      await pool.query(
        'DELETE FROM products WHERE id=$1 AND org_id=$2',
        [id, user.org_id]
      );
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}