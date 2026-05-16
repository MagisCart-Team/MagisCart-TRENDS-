import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  const hash = await bcrypt.hash('password123', 10);
  res.status(200).json({ hash });
}