-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    vehicle_id UUID REFERENCES public.vehicles(id),
    driver_id UUID REFERENCES auth.users(id),
    pickup_location JSONB NOT NULL,
    dropoff_location JSONB,
    booking_type VARCHAR(20) DEFAULT 'ride' CHECK (booking_type IN ('ride', 'hourly')),
    pickup_time TIMESTAMP WITH TIME ZONE NOT NULL,
    dropoff_time TIMESTAMP WITH TIME ZONE,
    duration_hours INTEGER, -- For hourly bookings
    estimated_distance DECIMAL(10,2),
    estimated_duration INTEGER, -- in minutes
    estimated_price DECIMAL(10,2),
    final_price DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method VARCHAR(50),
    special_requests TEXT,
    passenger_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_driver_id ON public.bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_pickup_time ON public.bookings(pickup_time);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Drivers can view their assigned bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "Users can create their own bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending bookings" ON public.bookings
    FOR UPDATE USING (
        auth.uid() = user_id 
        AND status = 'pending'
    );

CREATE POLICY "Drivers can update their assigned bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = driver_id);

CREATE POLICY "Admins can manage all bookings" ON public.bookings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR role = 'super_admin')
        )
    );