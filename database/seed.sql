-- Seed data for the lab
INSERT INTO users (name, email) VALUES
  ('Ada Lovelace', 'ada@example.com'),
  ('Alan Turing', 'alan@example.com')
ON CONFLICT (email) DO NOTHING;
