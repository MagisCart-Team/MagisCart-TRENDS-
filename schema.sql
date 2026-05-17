CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  store_code VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  org_id INT REFERENCES organizations(id)
);

CREATE TABLE products (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(255) NOT NULL,
  price     NUMERIC(10,2) NOT NULL,
  stock     INTEGER NOT NULL DEFAULT 0,
  category  VARCHAR(100),
  description TEXT,
  product_status VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (product_status IN ('active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);