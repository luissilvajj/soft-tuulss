-- Add cost column to products table
ALTER TABLE products ADD COLUMN cost NUMERIC(10, 2) DEFAULT 0;
