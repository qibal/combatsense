# CombatSense

Aplikasi monitoring latihan tempur untuk prajurit TNI.

## Setup Environment Variables

Buat file `.env.local` di root directory dengan variabel berikut:

```env
# Database
DATABASE_URL="your_database_url_here"

# JWT Secret
JWT_SECRET="your_jwt_secret_here"

# Mapbox Token (untuk peta interaktif)
NEXT_PUBLIC_MAPBOX_TOKEN="your_mapbox_token_here"
```

### Cara Mendapatkan Mapbox Token:

1. Daftar di [Mapbox](https://www.mapbox.com/)
2. Buat access token baru
3. Copy token dan paste ke `NEXT_PUBLIC_MAPBOX_TOKEN`

## Fitur

- **Admin**: Kelola lokasi latihan dengan peta interaktif
- **Komandan**: Monitoring real-time prajurit
- **Prajurit**: Dashboard dengan statistik latihan
- **Medis**: Pencatatan riwayat medis

## Tech Stack

- Next.js 15
- React 19
- Drizzle ORM
- Mapbox GL JS
- Tailwind CSS
- Shadcn/ui

npx drizzle-kit generate

npx drizzle-kit push
