-- Enable uuid generation function
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create Category table
CREATE TABLE IF NOT EXISTS "Category" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL UNIQUE
);

-- Create Product table
CREATE TABLE IF NOT EXISTS "Product" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "price" numeric(10,2) NOT NULL,
  "tags" text[] NOT NULL DEFAULT '{}',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "category_id" uuid NULL REFERENCES "Category"("id") ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_products_created_at" ON "Product"("created_at");
CREATE INDEX IF NOT EXISTS "idx_products_price" ON "Product"("price");
CREATE INDEX IF NOT EXISTS "idx_products_category_id" ON "Product"("category_id");
