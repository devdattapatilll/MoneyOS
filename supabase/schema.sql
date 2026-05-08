-- Supabase SQL Schema for Money OS
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create uploads table
CREATE TABLE IF NOT EXISTS uploads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    filename TEXT NOT NULL,
    filetype TEXT NOT NULL,
    storage_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    upload_id UUID REFERENCES uploads(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT NOT NULL,
    merchant_clean TEXT,
    category TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('debit', 'credit')),
    month TEXT,
    day_of_week TEXT,
    hour INTEGER,
    is_weekend BOOLEAN DEFAULT FALSE,
    is_night BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_upload_id ON transactions(upload_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant_clean);

-- Enable Row Level Security (RLS)
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo/hackathon)
-- NOTE: In production, replace with authenticated user policies
CREATE POLICY "Allow all uploads" ON uploads
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all transactions" ON transactions
    FOR ALL USING (true) WITH CHECK (true);

-- Storage bucket setup (run this in Supabase Storage)
-- Bucket name: statements
-- Make it public for demo purposes
-- In production, restrict to authenticated users
