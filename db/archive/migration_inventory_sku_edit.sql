-- Add unique constraint to products table to prevent duplicate SKUs within an organization
ALTER TABLE products 
ADD CONSTRAINT products_sku_organization_id_key UNIQUE (sku, organization_id);
