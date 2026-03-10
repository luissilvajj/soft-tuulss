-- Migration: Stock Alerts
-- Description: Adds min_stock column to products table for configurable low-stock alerts.

-- 1. Add min_stock column (default 5 units)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT 5;
