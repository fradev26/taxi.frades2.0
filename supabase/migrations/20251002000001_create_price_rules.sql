-- Create price_rules table for managing pricing formulas
CREATE TABLE IF NOT EXISTS price_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_type TEXT NOT NULL,
  rule_name TEXT NOT NULL,
  base_fare NUMERIC(10, 2) NOT NULL DEFAULT 0,
  per_km_rate NUMERIC(10, 2) NOT NULL DEFAULT 0,
  per_hour_rate NUMERIC(10, 2) NOT NULL DEFAULT 0,
  night_surcharge NUMERIC(10, 2) NOT NULL DEFAULT 0,
  min_fare NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on vehicle_type for faster queries
CREATE INDEX IF NOT EXISTS idx_price_rules_vehicle_type ON price_rules(vehicle_type);

-- Enable RLS
ALTER TABLE price_rules ENABLE ROW LEVEL SECURITY;

-- Create policies for price_rules
-- Only admins can modify price rules
CREATE POLICY "Admins can view price rules" ON price_rules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert price rules" ON price_rules
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update price rules" ON price_rules
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete price rules" ON price_rules
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert default price rules
INSERT INTO price_rules (vehicle_type, rule_name, base_fare, per_km_rate, per_hour_rate, night_surcharge, min_fare)
VALUES
  ('standard', 'Standard Tarief', 5.00, 2.50, 45.00, 1.25, 10.00),
  ('luxury', 'Luxe Tarief', 10.00, 3.50, 75.00, 2.00, 20.00),
  ('van', 'Van Tarief', 7.50, 2.75, 55.00, 1.50, 15.00)
ON CONFLICT DO NOTHING;
