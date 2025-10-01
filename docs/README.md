# Documentation

This directory contains technical documentation for the Taxi Frades 2.0 application.

## Available Documentation

### New Documentation (OAuth & Admin Features) ⭐

- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - **START HERE** - Complete Dutch implementation guide for OAuth and admin features
- **[OAUTH_SETUP.md](./OAUTH_SETUP.md)** - Detailed OAuth setup guide (Google & Apple Sign-In)
- **[ADMIN_FEATURES.md](./ADMIN_FEATURES.md)** - Admin panel optimizations and features reference

### Previous Documentation

- [Admin API Optimization](./ADMIN_API_OPTIMIZATION.md) - Details about database linking optimizations in the admin panel

## Quick Links

### OAuth Integration (New) ⭐

The application now supports social login with:
- **Google Sign-In**: Fully implemented with OAuth 2.0
- **Apple Sign-In**: Fully implemented with proper styling
- **Environment Configuration**: Template provided in `.env.example`
- **Complete Setup Guide**: Step-by-step instructions in [OAUTH_SETUP.md](./OAUTH_SETUP.md)

**What's ready**: All code is implemented. You just need to add your API keys!

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for the complete setup guide.

### Admin Panel Optimizations (Enhanced) ⭐

The admin panel has been further optimized with:
- **Real-time Updates**: Automatic refresh when data changes (bookings & vehicles)
- **Audit Logging**: Track all admin actions with complete history
- **Batch Operations**: Efficient bulk updates for multiple records
- **Direct Editing**: Click-to-edit status badges
- Unified admin API layer for consistent database access
- Optimized RPC functions to reduce database queries
- Real-time booking statistics for vehicles
- Type-safe interfaces and improved error handling

See [ADMIN_FEATURES.md](./ADMIN_FEATURES.md) for detailed information.

## Architecture Overview

```
src/
├── components/
│   ├── admin/              # Admin panel components
│   │   ├── VehicleManagement.tsx
│   │   ├── BookingManager.tsx
│   │   └── DriverManager.tsx
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── admin-api.ts        # Unified admin API layer ⭐
│   └── supabase-typed.ts   # Type-safe Supabase wrapper
├── integrations/
│   └── supabase/
│       ├── client.ts       # Supabase client
│       └── types.ts        # Generated types
└── pages/
    └── Admin.tsx           # Admin panel page

supabase/
└── migrations/
    └── 20251001120000_create_vehicle_management_function.sql ⭐
```

⭐ = New optimized components

## Development

### Running the Application

```bash
npm install
npm run dev
```

### Building for Production

```bash
npm run build
```

### Database Migrations

To apply the new optimizations to your database:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the migration SQL files in your Supabase dashboard
```

## Key Features

### Admin Panel

- **Vehicle Management**: Manage fleet vehicles with real-time booking statistics
- **Booking Management**: View and manage all bookings with detailed information
- **Driver Management**: Manage driver profiles and accounts

### Performance

- Optimized database queries with JOIN-based RPC functions
- Single query per component load (instead of multiple round-trips)
- Real-time statistics without performance overhead

### Developer Experience

- Type-safe API interfaces
- Consistent error handling
- Clean separation of concerns
- Comprehensive documentation

## Contributing

When adding new admin features:

1. Use the `adminAPI` from `@/lib/admin-api.ts`
2. Follow the existing patterns for consistency
3. Add RPC functions for complex joins
4. Update documentation

## Support

For questions or issues, please refer to the documentation or create an issue in the repository.
