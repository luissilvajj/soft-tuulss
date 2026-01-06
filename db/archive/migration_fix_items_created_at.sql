-- 1. Add created_at column if it does not exist (using current time as default)
ALTER TABLE transaction_items 
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- 2. Populate null created_at values using the parent transaction date (Validation)
UPDATE transaction_items
SET created_at = transactions.created_at
FROM transactions
WHERE transaction_items.transaction_id = transactions.id
AND transaction_items.created_at = timezone('utc'::text, now()); -- Only update the ones we just created (simplistic heuristic, or just update all is safer for consistency)

-- Better approach: exact sync with parent transaction for sorting consistency
UPDATE transaction_items ti
SET created_at = t.created_at
FROM transactions t
WHERE ti.transaction_id = t.id;

-- 3. Enforce Not Null if desired (Optional, safer to leave nullable if data is messy)
-- ALTER TABLE transaction_items ALTER COLUMN created_at SET NOT NULL;
