-- Create price_rules table for custom pricing formulas
CREATE TABLE IF NOT EXISTS public.price_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    vehicle_type VARCHAR(50) NOT NULL, -- 'standard', 'luxe', 'van', or 'all'
    rule_type VARCHAR(50) NOT NULL DEFAULT 'surcharge', -- 'surcharge', 'discount', 'fixed_rate'
    base_fare DECIMAL(10,2),
    per_km_rate DECIMAL(10,2),
    hourly_rate DECIMAL(10,2),
    night_surcharge DECIMAL(10,2),
    percentage_modifier DECIMAL(5,2), -- For percentage-based rules
    conditions JSONB, -- Store conditions like time ranges, days of week, etc.
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0, -- Higher priority rules apply first
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create business_tax_profiles table for business clients
CREATE TABLE IF NOT EXISTS public.business_tax_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    btw_number VARCHAR(50),
    kvk_number VARCHAR(50),
    contact_person VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    postal_code VARCHAR(20),
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Netherlands',
    phone VARCHAR(50),
    email VARCHAR(255),
    billing_email VARCHAR(255),
    payment_terms INTEGER DEFAULT 30, -- Days (7, 14, 30, 60)
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_price_rules_vehicle_type ON public.price_rules(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_price_rules_is_active ON public.price_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_price_rules_priority ON public.price_rules(priority DESC);
CREATE INDEX IF NOT EXISTS idx_business_tax_profiles_user_id ON public.business_tax_profiles(user_id);

-- Enable RLS
ALTER TABLE public.price_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_tax_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for price_rules (admin only)
CREATE POLICY "Only admins can manage price rules" ON public.price_rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for business_tax_profiles
CREATE POLICY "Users can view their own business tax profile" ON public.business_tax_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own business tax profile" ON public.business_tax_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business tax profile" ON public.business_tax_profiles
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all business tax profiles" ON public.business_tax_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_price_rules_updated_at BEFORE UPDATE ON public.price_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_tax_profiles_updated_at BEFORE UPDATE ON public.business_tax_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default price rules
INSERT INTO public.price_rules (name, description, vehicle_type, rule_type, base_fare, per_km_rate, hourly_rate, night_surcharge, is_active, priority) VALUES
('Standard Weekend Tariff', 'Weekend surcharge for all vehicles', 'all', 'surcharge', 0.00, 0.50, 5.00, 0.00, true, 10),
('Airport Surcharge', 'Additional charge for airport pickups/dropoffs', 'all', 'surcharge', 5.00, 0.00, 0.00, 0.00, true, 20),
('Luxury Premium', 'Premium rates for luxury vehicles', 'luxe', 'surcharge', 5.00, 1.00, 10.00, 2.00, true, 5);