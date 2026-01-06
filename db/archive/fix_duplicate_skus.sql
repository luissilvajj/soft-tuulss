-- 1. Identify duplicates (Preview)
SELECT sku, count(*) 
FROM products 
GROUP BY sku, organization_id 
HAVING count(*) > 1;

-- 2. Delete duplicates (Keep the newest one)
DELETE FROM products a USING (
  SELECT min(ctid) as ctid, sku, organization_id
  FROM products 
  GROUP BY sku, organization_id HAVING count(*) > 1
) b
WHERE a.sku = b.sku 
AND a.organization_id = b.organization_id 
AND a.ctid <> b.ctid;

-- 3. Now try adding the constraint again
ALTER TABLE products 
ADD CONSTRAINT products_sku_organization_id_key UNIQUE (sku, organization_id);
