import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const products = await sql`SELECT * FROM products ORDER BY created_at DESC`;
      return res.status(200).json(products);
    }

    if (req.method === 'POST') {
      const { name, price, stock, category, description } = req.body;
      if (!name || price == null || stock == null) {
        return res.status(400).json({ error: 'name, price, and stock are required' });
      }
      const [product] = await sql`
        INSERT INTO products (name, price, stock, category, description)
        VALUES (${name}, ${price}, ${stock}, ${category ?? null}, ${description ?? null})
        RETURNING *
      `;
      return res.status(201).json(product);
    }

    if (req.method === 'PUT') {
      const { id, name, price, stock } = req.body;
      const [product] = await sql`
        UPDATE products
        SET name=${name}, price=${price}, stock=${stock}
        WHERE id=${id}
        RETURNING *
      `;
      return res.status(200).json(product);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      await sql`DELETE FROM products WHERE id=${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error' });
  }
}