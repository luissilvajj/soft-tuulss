-- Add identity_document to clients
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS identity_document text;

-- Add index for faster searching by identity
CREATE INDEX IF NOT EXISTS idx_clients_identity ON public.clients(identity_document);
