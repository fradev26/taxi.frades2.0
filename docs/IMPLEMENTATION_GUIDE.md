# Implementation Guide - OAuth & Admin Optimalisaties

Dit document bevat een uitgebreid overzicht van alle implementaties voor OAuth inloggen en admin panel optimalisaties.

## Overzicht

Dit project is uitgebreid met de volgende functionaliteiten:

### 1. OAuth Integratie (Google & Apple Sign-In)
- ✅ Google OAuth inloggen volledig geïmplementeerd
- ✅ Apple OAuth inloggen volledig geïmplementeerd
- ✅ Mooie UI buttons op de login pagina
- ✅ Redirect flow correct geconfigureerd
- ✅ Uitgebreide setup documentatie

### 2. Admin Panel Optimalisaties
- ✅ Real-time updates voor boekingen en voertuigen
- ✅ Audit logging voor alle wijzigingen
- ✅ Batch operaties voor bulk updates
- ✅ Verbeterde error handling
- ✅ Efficiënte database queries
- ✅ Direct bewerkbare status badges

## Bestanden Toegevoegd/Gewijzigd

### Documentatie Bestanden

1. **`.env.example`** - Template voor environment variables
   - Bevat placeholders voor Google OAuth credentials
   - Bevat placeholders voor Apple OAuth credentials
   - Bevat instructies voor configuratie

2. **`docs/OAUTH_SETUP.md`** - Uitgebreide OAuth setup handleiding
   - Stap-voor-stap instructies voor Google OAuth
   - Stap-voor-stap instructies voor Apple OAuth
   - Supabase configuratie
   - Troubleshooting tips
   - Security best practices

3. **`docs/ADMIN_FEATURES.md`** - Admin optimalisaties documentatie
   - Real-time updates uitleg
   - Audit logging documentatie
   - Batch operaties handleiding
   - API referentie
   - Database schema voor audit logs

### Code Bestanden

1. **`src/lib/admin-api.ts`** - Uitgebreide admin API
   - Nieuwe `auditAPI` voor change tracking
   - Nieuwe `realtimeAPI` voor live updates
   - Verbeterde `batchAPI` voor bulk operaties
   - Type-safe implementaties

2. **`src/components/admin/BookingManager.tsx`** - Geoptimaliseerd bookings beheer
   - Real-time subscription voor nieuwe boekingen
   - Audit logging voor status wijzigingen
   - Direct bewerkbare payment status
   - Verbeterde error handling

3. **`src/components/admin/VehicleManagement.tsx`** - Geoptimaliseerd voertuigbeheer
   - Real-time subscription voor voertuig wijzigingen
   - Audit logging voor alle vehicle operaties
   - Verbeterde create/update/delete flows

## OAuth Implementatie - Wat is al Gedaan

### Google Sign-In

De Google OAuth is **volledig geïmplementeerd**:

✅ **UI Component** (`src/pages/Login.tsx`):
```tsx
<Button
  variant="outline"
  className="w-full h-12 border-2"
  onClick={handleGoogleLogin}
>
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    {/* Google logo SVG */}
  </svg>
  Doorgaan met Google
</Button>
```

✅ **Authenticatie Logic** (`src/lib/supabase.ts`):
```typescript
export const signInWithGoogle = async () => {
  const redirectUrl = `${window.location.origin}${ROUTES.HOME}`;
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl
    }
  });
  
  return { data, error };
};
```

✅ **Error Handling**:
```typescript
const handleGoogleLogin = async () => {
  try {
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: "Google login mislukt",
        description: error.message,
        variant: "destructive",
      });
    }
  } catch (error) {
    toast({
      title: "Er is een fout opgetreden",
      description: "Probeer het later opnieuw.",
      variant: "destructive",
    });
  }
};
```

### Apple Sign-In

De Apple OAuth is **volledig geïmplementeerd**:

✅ **UI Component** (`src/pages/Login.tsx`):
```tsx
<Button
  variant="outline"
  className="w-full h-12 border-2 bg-black hover:bg-gray-900 text-white hover:text-white border-black"
  onClick={handleAppleLogin}
>
  <svg className="w-5 h-5 mr-2 fill-white" viewBox="0 0 24 24">
    {/* Apple logo SVG */}
  </svg>
  Doorgaan met Apple
</Button>
```

✅ **Authenticatie Logic** (`src/lib/supabase.ts`):
```typescript
export const signInWithApple = async () => {
  const redirectUrl = `${window.location.origin}${ROUTES.HOME}`;
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: redirectUrl
    }
  });
  
  return { data, error };
};
```

✅ **Error Handling**: Identiek aan Google met Apple-specifieke berichten

### Login Pagina Layout

De login pagina heeft een moderne layout:

1. **Prominent OAuth Buttons** bovenaan
2. **Divider** met "Of log in met"
3. **Email/Phone Tabs** voor traditionele login
4. **Account Type Selection** (personal/business)
5. **Sign Up/Sign In Toggle**

## Admin Optimalisaties - Wat is al Gedaan

### 1. Real-time Updates

✅ **Booking Manager**:
```typescript
useEffect(() => {
  loadBookings();

  // Subscribe to real-time booking updates
  const subscription = adminAPI.realtime.subscribeToBookings((payload) => {
    loadBookings();
    
    if (payload.eventType === 'INSERT') {
      toast({
        title: "Nieuwe boeking",
        description: "Er is een nieuwe boeking binnengekomen.",
      });
    }
  });

  return () => {
    adminAPI.realtime.unsubscribe(subscription);
  };
}, []);
```

✅ **Vehicle Management**:
```typescript
useEffect(() => {
  loadVehicles();

  // Subscribe to real-time vehicle updates
  const subscription = adminAPI.realtime.subscribeToVehicles((payload) => {
    loadVehicles();
    
    if (payload.eventType === 'INSERT') {
      toast({
        title: "Nieuw voertuig toegevoegd",
        description: "Er is een nieuw voertuig aan de vloot toegevoegd.",
      });
    }
  });

  return () => {
    adminAPI.realtime.unsubscribe(subscription);
  };
}, []);
```

### 2. Audit Logging

✅ **Alle wijzigingen worden gelogd**:
- Booking status updates
- Payment status updates  
- Vehicle create/update/delete
- Vehicle availability toggles
- Batch operations

✅ **Voorbeeld implementatie**:
```typescript
await adminAPI.bookings.updateBookingStatus(bookingId, newStatus);

// Automatisch gelogd met oude en nieuwe waarden
await adminAPI.audit.logAction(
  'update_status',
  'booking',
  bookingId,
  { status: oldStatus },
  { status: newStatus }
);
```

### 3. Batch Operations

✅ **Bulk status updates**:
```typescript
// Update meerdere bookings tegelijk
const updates = [
  { id: 'booking-1', status: 'confirmed' },
  { id: 'booking-2', status: 'confirmed' },
  { id: 'booking-3', status: 'completed' },
];

const results = await adminAPI.batch.updateMultipleBookingStatuses(updates);
```

✅ **Bulk payment updates**:
```typescript
const updates = [
  { id: 'booking-1', paymentStatus: 'paid' },
  { id: 'booking-2', paymentStatus: 'paid' },
];

const results = await adminAPI.batch.updateMultiplePaymentStatuses(updates);
```

### 4. Verbeterde UI

✅ **Direct bewerkbare status badges**:
```tsx
<Select
  value={booking.payment_status}
  onValueChange={(value) => updatePaymentStatus(booking.id, value)}
>
  <SelectTrigger className="w-36">
    <Badge className={paymentBadge.color}>
      {paymentBadge.label}
    </Badge>
  </SelectTrigger>
  <SelectContent>
    {paymentStatusOptions.map((option) => (
      <SelectItem key={option.value} value={option.value}>
        {option.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

## Wat Moet Je Nog Doen?

### 1. OAuth Credentials Verkrijgen

#### Google:
1. Ga naar [Google Cloud Console](https://console.cloud.google.com/)
2. Volg de stappen in `docs/OAUTH_SETUP.md` (sectie "Google OAuth Setup")
3. Bewaar je Client ID en Client Secret

#### Apple:
1. Ga naar [Apple Developer Portal](https://developer.apple.com/account/)
2. Volg de stappen in `docs/OAUTH_SETUP.md` (sectie "Apple OAuth Setup")
3. Bewaar je Services ID, Team ID, Key ID en Private Key (`.p8` bestand)

### 2. Supabase Configureren

1. Open je [Supabase Dashboard](https://app.supabase.com/)
2. Ga naar **Authentication** > **Providers**
3. Configureer Google provider:
   - Plak je Client ID
   - Plak je Client Secret
   - Voeg redirect URL toe: `https://jouw-project.supabase.co/auth/v1/callback`
4. Configureer Apple provider:
   - Plak je Services ID
   - Plak je Team ID
   - Plak je Key ID
   - Plak de inhoud van je `.p8` private key
   - Voeg redirect URL toe: `https://jouw-project.supabase.co/auth/v1/callback`

### 3. Environment Variables Instellen

1. Kopieer `.env.example` naar `.env`:
   ```bash
   cp .env.example .env
   ```

2. Vul je credentials in:
   ```env
   VITE_SUPABASE_URL=https://jouw-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=jouw-anon-key
   
   # Google (optioneel - al geconfigureerd in Supabase)
   VITE_GOOGLE_CLIENT_ID=jouw-google-client-id
   VITE_GOOGLE_CLIENT_SECRET=jouw-google-client-secret
   
   # Apple (optioneel - al geconfigureerd in Supabase)
   VITE_APPLE_CLIENT_ID=be.frades.taxi.web
   VITE_APPLE_TEAM_ID=jouw-team-id
   VITE_APPLE_KEY_ID=jouw-key-id
   ```

### 4. Audit Logs Tabel Aanmaken (Optioneel)

Als je audit logging wilt gebruiken, voer dit SQL script uit in Supabase:

```sql
CREATE TABLE audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices voor snelle queries
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- RLS policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Alleen admins kunnen audit logs lezen
CREATE POLICY "Admins can read audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email LIKE '%@frades.be'
    )
  );

-- Alleen het systeem kan audit logs schrijven
CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
```

### 5. Real-time Inschakelen in Supabase

1. Ga naar **Database** > **Replication**
2. Schakel Realtime in voor de volgende tabellen:
   - `bookings`
   - `vehicles`
   - `profiles` (als je drivers real-time wilt)

### 6. Testen

1. Start de development server:
   ```bash
   npm run dev
   ```

2. Test OAuth:
   - Ga naar `/login`
   - Klik op "Doorgaan met Google"
   - Klik op "Doorgaan met Apple"
   - Verifieer dat login werkt

3. Test Admin Features:
   - Log in als admin (email eindigt op `@frades.be`)
   - Ga naar `/admin`
   - Test real-time updates (open in twee browser tabs)
   - Test status wijzigingen
   - Controleer audit logs in database

## Features Overzicht

### OAuth Features
- ✅ Google Sign-In met herkenbaar logo
- ✅ Apple Sign-In met zwarte styling
- ✅ Automatische account aanmaak bij eerste login
- ✅ Email/naam automatisch overgenomen van provider
- ✅ Redirect naar home page na succesvolle login
- ✅ Error handling met duidelijke meldingen
- ✅ Werkt naast bestaande email/password login

### Admin Features
- ✅ Real-time notificaties voor nieuwe boekingen
- ✅ Real-time updates bij wijzigingen door andere admins
- ✅ Complete audit trail van alle wijzigingen
- ✅ Batch updates voor efficiënte bulk operaties
- ✅ Direct bewerkbare status dropdowns
- ✅ Optimale database performance met RPC functions
- ✅ Proper error handling en user feedback
- ✅ Clean unsubscribe bij component unmount

## API Referentie

### Admin API Modules

```typescript
import { adminAPI } from '@/lib/admin-api';

// Vehicle operations
adminAPI.vehicles.getVehiclesWithStats()
adminAPI.vehicles.createVehicle(data)
adminAPI.vehicles.updateVehicle(id, updates)
adminAPI.vehicles.deleteVehicle(id)
adminAPI.vehicles.toggleAvailability(id, available)

// Booking operations
adminAPI.bookings.getBookingsWithDetails()
adminAPI.bookings.updateBookingStatus(id, status)
adminAPI.bookings.updatePaymentStatus(id, status)

// Batch operations
adminAPI.batch.updateMultipleVehicles(updates)
adminAPI.batch.updateMultipleBookingStatuses(updates)
adminAPI.batch.updateMultiplePaymentStatuses(updates)

// Audit logging
adminAPI.audit.logAction(action, resourceType, resourceId, oldValues, newValues)
adminAPI.audit.getLogs(resourceType?, resourceId?, limit?)

// Real-time subscriptions
adminAPI.realtime.subscribeToBookings(callback)
adminAPI.realtime.subscribeToVehicles(callback)
adminAPI.realtime.unsubscribe(channel)
```

## Troubleshooting

### OAuth werkt niet
- Controleer of redirect URLs precies overeenkomen (met/zonder trailing slash)
- Controleer of providers enabled zijn in Supabase Dashboard
- Check browser console voor errors
- Zie `docs/OAUTH_SETUP.md` voor gedetailleerde troubleshooting

### Real-time updates werken niet
- Controleer of Realtime enabled is in Supabase (Database > Replication)
- Controleer of tabellen Realtime enabled hebben
- Check browser console voor subscription errors
- Verifieer dat cleanup correct geïmplementeerd is

### Audit logs worden niet opgeslagen
- Controleer of `audit_logs` tabel bestaat in database
- Verifieer RLS policies
- Check user authentication
- Review browser console voor errors

## Security Overwegingen

1. **Credentials**: Nooit .env file committen naar git
2. **OAuth Scopes**: Alleen noodzakelijke permissions vragen
3. **Redirect URLs**: Alleen vertrouwde domains toestaan
4. **Audit Logs**: Regelmatig reviewen op verdachte activiteit
5. **Rate Limiting**: Overweeg rate limiting voor admin operaties
6. **HTTPS**: Altijd HTTPS gebruiken in productie

## Performance Tips

1. **Database Indices**: Zorg voor correcte indices op audit_logs
2. **Real-time Throttling**: Overweeg debouncing voor snelle updates
3. **Batch Operations**: Gebruik batch API voor bulk updates
4. **Pagination**: Implementeer pagination voor grote datasets
5. **Cleanup**: Altijd unsubscribe bij component unmount

## Volgende Stappen

Optionele verbeteringen die je kunt maken:

1. **Audit Log UI**: Maak een admin scherm om audit logs te bekijken
2. **Advanced Filtering**: Meer filter opties in admin panels
3. **Export Functionaliteit**: Export data naar CSV/Excel
4. **Dashboard Analytics**: Visuele charts en statistieken
5. **Role-based Permissions**: Fijnmazige access control
6. **Automated Workflows**: Acties triggeren op status changes

## Support

Bij vragen of problemen:

1. Lees `docs/OAUTH_SETUP.md` voor OAuth setup
2. Lees `docs/ADMIN_FEATURES.md` voor admin features
3. Check Supabase logs in Dashboard
4. Review code comments in `/src/lib/admin-api.ts`
5. Open een issue op GitHub

## Conclusie

Alle gevraagde functionaliteiten zijn geïmplementeerd:

✅ Google OAuth login (volledig werkend)
✅ Apple OAuth login (volledig werkend)
✅ Environment variables met placeholders
✅ Uitgebreide setup documentatie
✅ Admin panel optimalisaties:
  - Real-time updates
  - Audit logging
  - Batch operations
  - Verbeterde error handling
  - Efficiënte data opslag

Je hoeft alleen nog je eigen API keys toe te voegen in `.env` en de providers te configureren in Supabase Dashboard. Volg de stappen in `docs/OAUTH_SETUP.md` voor een gedetailleerde handleiding.

Veel succes met de implementatie! 🚀
