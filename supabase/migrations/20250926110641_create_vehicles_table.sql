-- Create vehicles table
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER,
    license_plate VARCHAR(20) UNIQUE,
    color VARCHAR(50),
    capacity INTEGER DEFAULT 4,
    vehicle_type VARCHAR(50) DEFAULT 'sedan',
    is_available BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    driver_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_vehicles_driver_id ON public.vehicles(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_available ON public.vehicles(is_available, is_active);

-- Enable RLS
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to view vehicles" ON public.vehicles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow drivers to update their own vehicles" ON public.vehicles
    FOR UPDATE USING (auth.uid() = driver_id);

CREATE POLICY "Allow admins to manage vehicles" ON public.vehicles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR role = 'super_admin')
        )
    );