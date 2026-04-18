# GoatShop - Implementation Plan

## Overview
A premium goat sales website built with Next.js 14 (Pages Router), Tailwind CSS, Supabase, and shadcn/ui. Designed to rival premium WordPress themes with modern visual polish, micro-interactions, and a cohesive design system. Includes comprehensive cache management for data freshness.

## Architecture Diagram

```mermaid
graph TD
    A[Public Pages] --> B[index.jsx - Catalog]
    A --> C[Hero + Tabs + Grid]
    
    D[Admin Pages] --> E[login.jsx]
    D --> F[Dashboard]
    D --> G[Live Goats CRUD]
    D --> H[Cooked Packages CRUD]
    
    B --> I[Supabase DB - SELECT]
    G --> J[Supabase DB - ALL ops]
    H --> J
    G --> K[Supabase Storage - goat-images]
    H --> K
    
    E --> L[Supabase Auth]
    F --> L
```

## Cache Management Diagram

```mermaid
graph LR
    subgraph Admin Action
        A1[Create/Edit/Delete] --> A2[Supabase DB Updated]
        A1 --> A3[Image Replaced in Storage]
    end
    
    subgraph Cache Busting
        A2 --> C1[Refetch with no-cache headers]
        A3 --> C2[New UUID filename = new URL]
        C1 --> C3[Fresh data on catalog]
        C2 --> C4[Fresh image rendered]
    end
    
    subgraph Build Cache
        B1[npm run rebuild] --> B2[Clear .next folder]
        B2 --> B3[Fresh build output]
    end
```

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant V as Visitor
    participant P as Public Page
    participant S as Supabase
    participant A as Admin
    participant St as Storage

    V->>P: Visit catalog
    P->>S: SELECT from live_goats/cooked_packages WHERE is_active=true
    S-->>P: Return products
    P-->>V: Render cards

    V->>P: Click WhatsApp button
    P-->>V: Open wa.me link

    A->>S: signInWithPassword
    S-->>A: Session token
    A->>S: INSERT/UPDATE/DELETE product
    A->>St: Upload image to goat-images bucket
    St-->>A: Public URL
    A->>S: Save image_url to record
```

## Supabase Configuration

```
NEXT_PUBLIC_SUPABASE_URL=https://hjteqnehrndkbgwxuwud.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqdGVxbmVocm5ka2Jnd3h1d3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzI0NzQsImV4cCI6MjA5MTUwODQ3NH0.A7nTantE8-6Q_z5n_haiyZisKbsWRHvqznCok8gkuDc
NEXT_PUBLIC_WHATSAPP_NUMBER_1=6281234567890
NEXT_PUBLIC_WHATSAPP_NUMBER_2=6289876543210
```

## Complete File Structure (with auto-generated files noted)

```
/
├── .env.local                          # Manual
├── .eslintrc.json                      # Auto: create-next-app
├── jsconfig.json                       # Auto: create-next-app (has @/ alias)
├── next.config.mjs                     # Auto: create-next-app (NOTE: .mjs not .js in Next 14)
├── package.json                        # Auto: create-next-app (add custom scripts)
├── postcss.config.mjs                  # Auto: create-next-app
├── tailwind.config.js                  # Auto: create-next-app (we customize)
├── components.json                     # Auto: shadcn init
├── public/
│   └── favicon.ico                     # Replace with custom
├── styles/
│   └── globals.css                     # Auto: create-next-app (has @tailwind directives)
├── components/
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── Layout.jsx
│   ├── ui/
│   │   ├── card.jsx                    # Auto: shadcn add card
│   │   ├── button.jsx                  # Auto: shadcn add button
│   │   ├── badge.jsx                   # Auto: shadcn add badge
│   │   ├── tabs.jsx                    # Auto: shadcn add tabs
│   │   ├── table.jsx                   # Auto: shadcn add table
│   │   ├── form.jsx                    # Auto: shadcn add form
│   │   ├── input.jsx                   # Auto: shadcn add input
│   │   ├── dialog.jsx                  # Auto: shadcn add dialog
│   │   ├── toast.jsx                   # Auto: shadcn add toast
│   │   ├── toaster.jsx                 # Auto: shadcn add toast
│   │   ├── select.jsx                  # Auto: shadcn add select
│   │   ├── checkbox.jsx               # Auto: shadcn add checkbox
│   │   ├── textarea.jsx               # Auto: shadcn add textarea
│   │   ├── label.jsx                   # Auto: shadcn add label
│   │   ├── separator.jsx              # Auto: shadcn add separator
│   │   ├── use-toast.js               # Auto: shadcn add toast
│   │   ├── GoatCard.jsx                # Manual: custom
│   │   ├── CookedCard.jsx              # Manual: custom
│   │   ├── WhatsAppButton.jsx          # Manual: custom
│   │   └── FeaturesSection.jsx         # Manual: custom
│   └── admin/
│       ├── AdminNav.jsx
│       ├── LiveGoatForm.jsx
│       └── CookedPackageForm.jsx
├── lib/
│   ├── supabaseClient.js
│   └── utils.js
├── pages/
│   ├── _app.jsx
│   ├── index.jsx
│   └── admin/
│       ├── index.jsx
│       ├── login.jsx
│       ├── live-goats/
│       │   ├── index.jsx
│       │   ├── new.jsx
│       │   └── edit/[id].jsx
│       └── cooked-packages/
│           ├── index.jsx
│           ├── new.jsx
│           └── edit/[id].jsx
```

---

## Deep Analysis: Issues Found and Fixes

### CRITICAL Issues

**Issue 1: Missing Supabase Storage Policies**
The SQL schema only covers table RLS. Without storage policies, authenticated users CANNOT upload images even to a public bucket. Public buckets allow read but NOT write by default.

**Fix - Add to SQL schema:**
```sql
-- Storage policies for goat-images bucket
CREATE POLICY "Allow public read storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'goat-images');

CREATE POLICY "Allow authenticated upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'goat-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update storage"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'goat-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete storage"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'goat-images' AND auth.role() = 'authenticated');
```

**Issue 2: Missing `clsx` and `tailwind-merge` in dependencies**
The `cn()` utility in `lib/utils.js` requires these packages. shadcn/ui init installs them, but if init fails or is done manually, they'd be missing.

**Fix - Add to Task 2:**
```bash
npm install @supabase/supabase-js framer-motion react-hook-form @hookform/resolvers zod lucide-react clsx tailwind-merge
```

**Issue 3: Admin content flash before auth redirect**
Using `useEffect` for auth check in `_app.jsx` means the admin page renders briefly before redirect fires. Users see a flash of protected content.

**Fix - Add loading gate in `_app.jsx`:**
```jsx
const [authLoading, setAuthLoading] = useState(true)
// Show full-page spinner on admin routes while checking auth
if (isAdminRoute && !isLoginPage && authLoading) {
  return <LoadingScreen />  // Full page spinner, inline component
}
```

**Issue 4: Login page should redirect if already authenticated**
If a logged-in admin visits `/admin/login`, they should be redirected to `/admin`. Otherwise they see the login form unnecessarily.

**Fix - Add to `pages/admin/login.jsx`:**
```jsx
useEffect(() => {
  const checkSession = async () => {
    const { data } = await supabase.auth.getSession()
    if (data.session) router.replace('/admin')
  }
  checkSession()
}, [])
```

### IMPORTANT Issues

**Issue 5: `next.config.mjs` not `next.config.js`**
Next.js 14 `create-next-app` generates `next.config.mjs` (ESM). The plan references `.js`. This affects how we export the config.

**Fix:** Use ESM syntax in next.config.mjs:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { ... },
  async headers() { ... }
}
export default nextConfig
```

**Issue 6: `globals.css` location**
`create-next-app` puts it in `styles/globals.css`. The plan's `_app.jsx` must import from `@/styles/globals.css`, not just `globals.css`.

**Fix:** Ensure `_app.jsx` imports: `import '@/styles/globals.css'`

**Issue 7: Google Fonts loading strategy**
Using `<link>` tags in Layout for Google Fonts works but causes FOUT (Flash of Unstyled Text). Better approach for Next.js 14:

**Fix:** Use `next/font/google` in `_app.jsx`:
```jsx
import { Playfair_Display, Inter } from 'next/font/google'

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

// Apply in className: <div className={`${playfair.variable} ${inter.variable}`}>
```
Then in `tailwind.config.js`:
```js
fontFamily: {
  serif: ['var(--font-playfair)', 'serif'],
  sans: ['var(--font-inter)', 'sans-serif'],
}
```

**Issue 8: Tab switch re-fetch causes UX jank**
Re-fetching data on every tab switch shows loading skeleton each time, which is jarring.

**Fix:** Fetch BOTH datasets on initial page load. Store in separate state. Tab switch just toggles which data is displayed. Add pull-to-refresh button for manual refresh.
```jsx
const [liveGoats, setLiveGoats] = useState([])
const [cookedPackages, setCookedPackages] = useState([])

useEffect(() => {
  fetchLiveGoats()
  fetchCookedPackages()
}, [])
```

### MINOR Issues

**Issue 9: `crypto.randomUUID()` browser support**
Not available in older browsers or some environments. 

**Fix:** Use fallback: `crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9) + Date.now()`

**Issue 10: shadcn/ui `components.json` for Pages Router**
Must explicitly set `rsc: false` (no React Server Components in Pages Router).

**Fix:** During `shadcn init`, ensure:
```json
{
  "style": "default",
  "rsc": false,
  "tsx": false,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "styles/globals.css",
    "baseColor": "neutral"
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

**Issue 11: Tailwind custom color name conflicts**
`text-primary` as a color name conflicts with Tailwind's `text-` prefix utility. Writing `text-text-primary` is redundant and confusing.

**Fix:** The spec requires these names, so keep them but document the usage:
- Use `text-text-primary` for text color: `className="text-text-primary"`
- Use `bg-primary` for backgrounds: `className="bg-primary"`
- This is valid Tailwind; it just looks unusual

**Issue 12: Missing `AbortController` cleanup pattern**
Plan mentions it but doesn't show the pattern clearly.

**Fix:** Standard pattern for all fetch hooks:
```jsx
useEffect(() => {
  const controller = new AbortController()
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('live_goats')
      .select('*')
      .eq('is_active', true)
      .abortSignal(controller.signal)
    if (!error) setGoats(data)
  }
  fetchData()
  return () => controller.abort()
}, [])
```

**Issue 13: Form prop naming consistency**
Plan uses both `defaultValues` and `initialData`. Need one consistent name.

**Fix:** Use `initialData` prop for form components:
```jsx
<LiveGoatForm initialData={goat} onSuccess={() => router.push('/admin/live-goats')} />
```
Form internally maps to React Hook Form's `defaultValues`:
```jsx
const form = useForm({ resolver: zodResolver(schema), defaultValues: initialData || defaults })
```

**Issue 14: Delete old image needs URL parsing**
When replacing an image, we need to extract the storage path from the full public URL to call `storage.remove()`.

**Fix:** Add utility in `lib/utils.js`:
```js
export function getStoragePathFromUrl(url) {
  if (!url) return null
  const match = url.match(/\/storage\/v1\/object\/public\/goat-images\/(.+)/)
  return match ? match[1] : null
}
```

**Issue 15: No `updated_at` column but cache busting uses timestamps**
`created_at` never changes on update. Using it as cache param is fine for initial load but won't bust cache after edits.

**Fix:** Since images always get new UUID filenames on replacement, the URL itself changes. The `created_at` param is just belt-and-suspenders. No schema change needed (spec forbids it). For non-image data freshness, the client-side re-fetch strategy handles it.

---

## Cache Management Strategy (All Cache Types)

### Cache Type 1: Supabase Data Freshness

**Solution in `lib/supabaseClient.js`:**
```js
const supabase = createClient(url, key, {
  global: {
    headers: { 'Cache-Control': 'no-cache' },
  },
})
```

**Solution in `pages/index.jsx`:**
- Client-side fetch on mount (fresh every visit)
- Fetch BOTH tabs on initial load (no re-fetch on tab switch)
- Manual "Muat Ulang" refresh button
- AbortController cleanup on unmount

**Solution in admin list pages:**
- Re-fetch after every mutation
- Re-fetch on every mount via useEffect

### Cache Type 2: Image Cache Busting

- Always new UUID+timestamp filename on upload (never overwrite)
- Delete old image from storage on replacement
- URL changes completely = no cache issue
- `minimumCacheTTL: 60` in next.config.mjs

### Cache Type 3: Next.js Build Cache

```json
"scripts": {
  "clean": "rm -rf .next node_modules/.cache",
  "rebuild": "npm run clean && npm run build"
}
```

Custom headers in `next.config.mjs`:
- Public routes: `s-maxage=60, stale-while-revalidate=300`
- Admin routes: `no-store, no-cache, must-revalidate`

### Cache Type 4: React State Staleness

- Fresh fetch on every component mount
- `key` prop on forms for full re-mount on data change
- AbortController on unmount prevents stale state updates

### Cache Type 5: Browser HTTP Cache

- Admin pages: no-cache meta tags via conditional `<Head>` in Layout
- Public pages: normal caching with short TTL

---

## Visual Design System

### Color Palette

```js
colors: {
  primary: {
    DEFAULT: '#2E5C3E',
    50: '#F0F7F2', 100: '#D4E8DA', 200: '#A8D1B4',
    300: '#7DBA8F', 400: '#51A369', 500: '#2E5C3E',
    600: '#254A32', 700: '#1C3825', 800: '#132619', 900: '#0A140C',
  },
  secondary: {
    DEFAULT: '#E9C46A',
    50: '#FDF8EB', 100: '#F9EDCC', 200: '#F3DB99',
    300: '#EEC966', 400: '#E9C46A', 500: '#D4A843',
    600: '#B8892A', 700: '#8C6920', 800: '#604916', 900: '#34280C',
  },
  background: '#F9F9F6',
  surface: '#FFFFFF',
  'text-primary': '#2C3E2D',
  'text-secondary': '#5B6C5D',
  accent: '#D4583A',
}
```

### Typography (via next/font/google - no FOUT)

```js
fontFamily: {
  serif: ['var(--font-playfair)', 'serif'],
  sans: ['var(--font-inter)', 'sans-serif'],
}
```

### Tailwind Extended Config

```js
extend: {
  keyframes: {
    shimmer: {
      '0%': { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' },
    },
    'pulse-ring': {
      '0%': { transform: 'scale(0.8)', opacity: '1' },
      '100%': { transform: 'scale(2)', opacity: '0' },
    },
  },
  animation: {
    shimmer: 'shimmer 1.5s infinite',
    'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
  boxShadow: {
    card: '0 4px 6px -1px rgba(46,92,62,0.1), 0 2px 4px -2px rgba(46,92,62,0.1)',
    'card-hover': '0 20px 25px -5px rgba(46,92,62,0.15), 0 8px 10px -6px rgba(46,92,62,0.1)',
  },
}
```

---

## Premium Visual Enhancements

### V1: Glassmorphism Header (`Header.jsx`)
`sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-primary-100`, shadow on scroll, animated mobile menu

### V2: Cinematic Hero (`pages/index.jsx`)
Gradient mesh, decorative circles, staggered text, glow CTA, stats bar

### V3: SVG Wave Dividers (`pages/index.jsx`)
Between hero->catalog and catalog->features

### V4: Premium Cards (`GoatCard.jsx`, `CookedCard.jsx`)
Hover lift, gradient overlay, glassmorphism badges

### V5: Animated Tabs (`pages/index.jsx`)
Icon tabs, AnimatePresence crossfade

### V6: Feature Cards (`FeaturesSection.jsx`)
Icon-in-circle, hover fill, staggered animation, decorative title lines

### V7: Floating WhatsApp (`Layout.jsx` inline)
Fixed bottom-right, pulse-ring animation

### V8: Smooth Scroll + Scroll-to-Top (`Layout.jsx`)

### V9: Premium Footer (`Footer.jsx`)
Dark bg-primary-900, wave SVG, gradient line, multi-column

### V10: Elegant Login (`pages/admin/login.jsx`)
Centered card, gradient button, icon inputs, redirect if already logged in

### V11: Data-Rich Dashboard (`pages/admin/index.jsx`)
Gradient border cards, animated count-up

### V12: Micro-interactions (all files)
active:scale-95, focus rings, hover states

### V13: Shimmer Skeletons (catalog + admin lists)
Gradient sweep loading

### V14: Empty State (catalog + admin lists)
Inline SVG with friendly message

---

## Step-by-Step Implementation Tasks

### Task 1: Initialize Next.js project

```bash
npx create-next-app@14 . --js --no-app --tailwind --eslint --no-src-dir --import-alias "@/*"
```

**Post-init checks:**
- Verify `next.config.mjs` exists (not .js) -- use ESM export
- Verify `jsconfig.json` has `"@/*": ["./*"]` path alias
- Verify `styles/globals.css` has Tailwind directives
- Verify `postcss.config.mjs` exists

**Configure `next.config.mjs`:**
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    minimumCacheTTL: 60,
    remotePatterns: [
      { protocol: 'https', hostname: 'hjteqnehrndkbgwxuwud.supabase.co' }
    ]
  },
  async headers() {
    return [
      {
        source: '/',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' }],
      },
      {
        source: '/admin/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' }],
      },
    ]
  },
}
export default nextConfig
```

**Add scripts to `package.json`:**
```json
"clean": "rm -rf .next node_modules/.cache",
"rebuild": "npm run clean && npm run build"
```

### Task 2: Install all dependencies

```bash
npm install @supabase/supabase-js framer-motion react-hook-form @hookform/resolvers zod lucide-react clsx tailwind-merge
```

**Verify all in package.json after install.**

### Task 3: Setup shadcn/ui

Run `npx shadcn@latest init` with these settings:
- Style: default
- Base color: neutral
- CSS file: styles/globals.css
- Tailwind config: tailwind.config.js
- Components alias: @/components
- Utils alias: @/lib/utils
- RSC: false (Pages Router)
- TSX: false (JSX project)

**Add components:**
```bash
npx shadcn@latest add card button badge tabs table form input dialog toast select checkbox textarea label separator
```

**Verify `components.json`** has `"rsc": false` and correct paths.

### Task 4: Configure Tailwind with full design system

- Add extended color palette with all shades
- Add custom keyframes, animations, box-shadows
- Configure font families with CSS variables (for next/font)
- Add accent color
- Ensure `content` paths include all component directories

### Task 5: Create `.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=https://hjteqnehrndkbgwxuwud.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqdGVxbmVocm5ka2Jnd3h1d3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzI0NzQsImV4cCI6MjA5MTUwODQ3NH0.A7nTantE8-6Q_z5n_haiyZisKbsWRHvqznCok8gkuDc
NEXT_PUBLIC_WHATSAPP_NUMBER_1=6281234567890
NEXT_PUBLIC_WHATSAPP_NUMBER_2=6289876543210
```

### Task 6: Create `lib/supabaseClient.js`

```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: { 'Cache-Control': 'no-cache' },
  },
})
```

### Task 7: Create `lib/utils.js`

Functions:
- `cn(...inputs)` - clsx + twMerge
- `formatPrice(number)` - `Rp ${number.toLocaleString('id-ID')}`
- `getWhatsAppUrl(message)` - random number picker + wa.me URL
- `getStoragePathFromUrl(url)` - extracts storage path for deletion
- `generateImageFileName(originalName)` - UUID + timestamp + extension

### Task 8: Create Layout components

**`Header.jsx`**
- Glassmorphism: sticky, backdrop-blur, conditional shadow
- Brand: "GoatShop" in font-serif
- Nav links: Beranda, Katalog (anchor #katalog), Admin (/admin)
- Mobile: hamburger with Framer Motion AnimatePresence slide-in
- Scroll detection via useState + useEffect with scroll listener

**`Footer.jsx`**
- Dark: bg-primary-900 text-white
- Wave SVG divider at top
- Gradient line: h-1 bg-gradient-from-secondary-via-primary-to-secondary
- 3-column grid: Tentang Kami, Kontak (WhatsApp links), Jam Operasional
- Copyright with dynamic year

**`Layout.jsx`**
- Props: `children`, uses `useRouter` for route detection
- Conditional: no Layout wrapper on `/admin/login`
- `<Head>`: title, meta description, OG tags
- Google Fonts via `next/font/google` (Playfair Display + Inter) -- applied as CSS variables
- Floating WhatsApp button (fixed bottom-right, pulse-ring) -- inline JSX, not separate component
- Scroll-to-top button (appears after 500px scroll)
- Conditional no-cache meta tags for admin routes
- Toaster from shadcn

### Task 9: Create `WhatsAppButton.jsx`

- Props: `message` (string, required)
- Random number: `Math.random() > 0.5 ? NUMBER_1 : NUMBER_2`
- URL: `https://wa.me/${number}?text=${encodeURIComponent(message)}`
- Styling: `bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700`
- Active: `active:scale-95 transition-all`
- Icon: MessageCircle from lucide-react
- Text: "Pesan via WhatsApp"
- `target="_blank" rel="noopener noreferrer"`
- Full width in card: `w-full`

### Task 10: Create `GoatCard.jsx`

- Exact spec implementation with enhancements:
- Card: `rounded-xl border border-primary-100/50 hover:-translate-y-2 hover:shadow-card-hover transition-all duration-300`
- Image: `aspect-[4/3]` with gradient overlay, hover:scale-105
- Badge: `bg-primary/90 backdrop-blur-sm`
- Fallback image: inline SVG data URI (goat silhouette)
- Price: `text-2xl font-bold text-secondary`
- Framer Motion: `whileInView` fadeInUp
- Import from `@/components/ui/card` (shadcn), `@/components/ui/badge`, etc.

### Task 11: Create `CookedCard.jsx`

- Same structure as GoatCard, adapted fields:
- Show `menu_items` as small badges: `bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full`
- Max 3 visible, "+N lainnya" for overflow
- WhatsApp message: includes type, weight, price, and menu items
- Same hover/animation effects

### Task 12: Create `FeaturesSection.jsx`

- Section title with side lines: flex + h-px gradients
- Title: "Fasilitas Gratis" in font-serif
- 4-item grid: 1 col mobile, 2 md, 4 lg
- Features:
  1. Gratis Pengiriman (Truck icon)
  2. Gratis Pemotongan (Scissors icon)
  3. Gratis Pengemasan (Package icon)
  4. Gratis Pemasakan (Flame icon)
- Each: icon in w-16 h-16 rounded-2xl circle, hover fills primary
- Framer Motion: stagger 0.15s, whileInView, viewport once

### Task 13: Create `pages/_app.jsx`

```jsx
import { Playfair_Display, Inter } from 'next/font/google'
import '@/styles/globals.css'
import Layout from '@/components/layout/Layout'
import { Toaster } from '@/components/ui/toaster'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
```

**Key logic:**
- Font CSS variables applied to root div
- Auth state: `useState` for session + loading
- `onAuthStateChange` listener in useEffect (cleanup on unmount)
- Admin guard: if admin route (not login) and no session and not loading -> redirect
- Loading gate: show spinner on admin routes while checking auth
- Login redirect: if session exists and on login page -> redirect to /admin
- No Layout on `/admin/login` (check pathname)
- Toaster rendered globally

### Task 14: Create `pages/index.jsx`

**Data fetching:**
```jsx
const [liveGoats, setLiveGoats] = useState([])
const [cookedPackages, setCookedPackages] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  const controller = new AbortController()
  const fetchAll = async () => {
    setLoading(true)
    const [goatsRes, packagesRes] = await Promise.all([
      supabase.from('live_goats').select('*').eq('is_active', true).order('type').abortSignal(controller.signal),
      supabase.from('cooked_packages').select('*').eq('is_active', true).order('type').abortSignal(controller.signal),
    ])
    if (goatsRes.data) setLiveGoats(goatsRes.data)
    if (packagesRes.data) setCookedPackages(packagesRes.data)
    if (goatsRes.error || packagesRes.error) setError('Gagal memuat data')
    setLoading(false)
  }
  fetchAll()
  return () => controller.abort()
}, [])
```

**Sections:**
1. Hero (min-h-[90vh], gradient, decorative elements, staggered text, CTA, stats)
2. SVG wave divider
3. Catalog (id="katalog", Tabs with icons, grid, loading/error/empty states)
4. SVG wave divider
5. FeaturesSection

### Task 15: Create `pages/admin/login.jsx`

- Check session on mount -> redirect if already logged in
- Centered card: `min-h-screen flex items-center justify-center bg-background`
- Card: `max-w-md w-full rounded-2xl shadow-2xl p-8`
- Form fields: email (Mail icon), password (Lock icon + show/hide toggle)
- Submit: gradient button with loading spinner
- Error: toast with "Email atau password salah"
- Success: `router.replace('/admin')`
- NO Layout wrapper (standalone page)

### Task 16: Create `pages/admin/index.jsx`

- AdminNav at top
- Title: "Dashboard Admin"
- Stats grid (2 cols):
  - Card 1: Live goats count, green left border, animated count-up
  - Card 2: Cooked packages count, secondary left border, animated count-up
- Quick action cards: links to manage sections with arrow icons
- Fetch counts: `supabase.from('live_goats').select('id', { count: 'exact' }).eq('is_active', true)`

### Task 17: Create `AdminNav.jsx`

- Horizontal bar: `bg-white border-b shadow-sm`
- Brand: "GoatShop Admin"
- Links: Dashboard (/admin), Kambing Hidup (/admin/live-goats), Paket Masak (/admin/cooked-packages)
- Active: `text-primary font-semibold border-b-2 border-primary`
- Logout: red button, calls `supabase.auth.signOut()`, toast "Berhasil keluar", redirect
- Mobile: horizontally scrollable or compact layout

### Task 18: Live Goats CRUD pages

**`pages/admin/live-goats/index.jsx`**
- AdminNav
- Header: "Kambing Hidup" + "Tambah Baru" button (link to /new)
- Table: Gambar (48x48 thumbnail) | Tipe | Berat | Harga | Status (Badge) | Aksi (Edit/Delete)
- Delete: Dialog with "Hapus Kambing Tipe X?" + item details
- On delete: also delete image from storage using `getStoragePathFromUrl()`
- Toast on success/error
- Fetch with AbortController, loading skeleton, empty state
- Re-fetch after delete

**`pages/admin/live-goats/new.jsx`**
- AdminNav, breadcrumb
- `<LiveGoatForm onSuccess={() => { toast; router.push('/admin/live-goats') }} />`

**`pages/admin/live-goats/edit/[id].jsx`**
- AdminNav, breadcrumb
- Fetch by `router.query.id` (guard `router.isReady`)
- Loading state, error state if not found
- `<LiveGoatForm initialData={goat} onSuccess={() => { toast; router.push('/admin/live-goats') }} />`
- Key prop: `key={goat.id}` for clean re-mount

### Task 19: Create `LiveGoatForm.jsx`

**Props:** `initialData` (optional), `onSuccess` (callback)

**Zod Schema:**
```js
const liveGoatSchema = z.object({
  type: z.enum(['A', 'B', 'C', 'D', 'E'], { required_error: 'Pilih tipe kambing' }),
  weight_range: z.string().min(1, 'Berat harus diisi'),
  price: z.coerce.number().positive('Harga harus lebih dari 0'),
  description: z.string().optional().default(''),
  is_active: z.boolean().default(true),
})
```

**Form fields (2-col desktop, 1-col mobile):**
- Type: shadcn Select (A-E options)
- Weight Range: Input, placeholder "21-25 kg"
- Price: Input type number, formatted preview
- Description: Textarea, 3 rows
- Is Active: Checkbox
- Image: drop zone (dashed border) with click-to-browse
  - Accept: jpg/png/webp, max 5MB
  - Client-side validation before upload
  - UUID+timestamp filename
  - Upload to goat-images bucket
  - Show progress
  - Show preview
  - On edit: show existing image, allow replace, delete old on replace

**Submit logic:**
- Disabled during submission + spinner
- If initialData: `supabase.from('live_goats').update(data).eq('id', initialData.id)`
- Else: `supabase.from('live_goats').insert(data)`
- Call `onSuccess` on success, toast on error

### Task 20: Cooked Packages CRUD pages

Same pattern as Task 18 with:
- Table adds "Menu" column (truncated, max 3 items shown as text)
- All labels say "Paket Masak"
- Uses CookedPackageForm
- Table: `cooked_packages`

### Task 21: Create `CookedPackageForm.jsx`

Same as LiveGoatForm plus:
- **Menu Items field:** Input with placeholder "Rendang, Gulai, Sate"
- Instruction text: "Pisahkan dengan koma"
- Live preview: badges rendered below input as user types
- On submit: split by comma, trim, filter empty -> array
- On edit load: join array with ", " for input value
- Zod: `menu_items: z.string().min(1, 'Menu harus diisi')` (string in form, converted to array before DB)

### Task 22: Image upload (shared logic in both forms)

```js
const uploadImage = async (file) => {
  // 1. Validate type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) throw new Error('Format harus JPG, PNG, atau WebP')
  
  // 2. Validate size
  if (file.size > 5 * 1024 * 1024) throw new Error('Ukuran maksimal 5MB')
  
  // 3. Generate unique filename
  const ext = file.name.split('.').pop()
  const fileName = `${crypto.randomUUID?.() || Date.now()}-${Date.now()}.${ext}`
  
  // 4. Upload
  const { error } = await supabase.storage.from('goat-images').upload(fileName, file)
  if (error) throw error
  
  // 5. Get public URL
  const { data } = supabase.storage.from('goat-images').getPublicUrl(fileName)
  return data.publicUrl
}

// Delete old image when replacing
const deleteOldImage = async (url) => {
  const path = getStoragePathFromUrl(url)
  if (path) await supabase.storage.from('goat-images').remove([path])
}
```

### Task 23: Framer Motion animations

**Variants:**
```js
const fadeInUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } }
const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } }
const staggerItem = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }
```

**Applied to:**
- Hero text: staggered reveal
- Card grid: staggerContainer + staggerItem
- FeaturesSection: stagger 0.15s
- Section titles: fadeInUp
- Tab content: AnimatePresence mode="wait" with fade
- All: `whileInView`, `viewport={{ once: true }}`

### Task 24: Toast notifications

| Action | Message | Variant |
|--------|---------|---------|
| Login success | "Selamat datang!" | default |
| Login error | "Email atau password salah" | destructive |
| Create success | "Data berhasil ditambahkan" | default |
| Update success | "Data berhasil diperbarui" | default |
| Delete success | "Data berhasil dihapus" | default |
| Upload success | "Gambar berhasil diupload" | default |
| Any error | "Terjadi kesalahan: {message}" | destructive |
| Logout | "Berhasil keluar" | default |
| Session expired | "Sesi berakhir, silakan login kembali" | destructive |
| File too large | "Ukuran file maksimal 5MB" | destructive |
| Invalid file type | "Format harus JPG, PNG, atau WebP" | destructive |

### Task 25: Responsiveness

**Mobile < 640px:** Single column, full-width buttons, hamburger nav, table horizontal scroll, stacked forms
**Tablet 640-1024px:** 2-col grids, increased padding
**Desktop > 1024px:** 3-col catalog, 4-col features, hover effects, spacious

### Task 26: SQL Schema (manual - Supabase SQL Editor)

```sql
-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: live_goats
CREATE TABLE live_goats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  type TEXT NOT NULL CHECK (type IN ('A', 'B', 'C', 'D', 'E')),
  weight_range TEXT NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Table: cooked_packages
CREATE TABLE cooked_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  type TEXT NOT NULL CHECK (type IN ('A', 'B', 'C', 'D', 'E')),
  weight_range TEXT NOT NULL,
  price INTEGER NOT NULL,
  menu_items TEXT[],
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE live_goats ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooked_packages ENABLE ROW LEVEL SECURITY;

-- Table policies
CREATE POLICY "Allow public read" ON live_goats FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON cooked_packages FOR SELECT USING (true);
CREATE POLICY "Allow authenticated all" ON live_goats FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all" ON cooked_packages FOR ALL USING (auth.role() = 'authenticated');

-- Storage policies for goat-images bucket
-- (Run AFTER creating the goat-images bucket in Dashboard)
CREATE POLICY "Allow public read storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'goat-images');

CREATE POLICY "Allow authenticated upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'goat-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update storage"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'goat-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete storage"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'goat-images' AND auth.role() = 'authenticated');
```

**Manual steps in Supabase Dashboard:**
1. Create `goat-images` storage bucket (set as Public)
2. Run the SQL above in SQL Editor
3. Create an admin user via Authentication > Users > Invite User

### Task 27: Git commit and push

```bash
git checkout -b feat/goat-shop-initial
git add .
git commit -m 'feat: initial goat shop implementation'
git push origin HEAD:feat/goat-shop-initial
gh pr create --repo targetingsmart-droid/Jual-kambing --head feat/goat-shop-initial --title 'feat: GoatShop initial implementation' --body 'Complete goat sales website with public catalog, admin CRUD, Supabase integration, and premium UI'
```

---

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Client-side fetch, no SSR | Fresh data every visit; admin changes reflected immediately |
| Fetch both tabs on mount | Avoid loading jank on tab switch |
| next/font/google | No FOUT; fonts optimized by Next.js |
| Cache-Control no-cache on Supabase | Prevents CDN/proxy caching of API responses |
| UUID+timestamp image filenames | Never overwrites; complete cache bypass |
| Delete old image on replace | No storage bloat from orphaned files |
| Auth loading gate | No flash of admin content before redirect |
| AbortController cleanup | No state updates on unmounted components |
| next.config.mjs ESM format | Matches Next.js 14 default output |
| Storage RLS policies | Required even for public buckets (write access) |

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| shadcn/ui Pages Router compat | components.json: rsc=false, tsx=false, correct paths |
| Stale data after admin edit | Client-side fetch + no-cache + re-fetch on mount |
| Cached images | New filename per upload; old file deleted |
| Build cache | clean/rebuild scripts |
| Storage upload blocked | Explicit storage RLS policies for authenticated users |
| Admin content flash | Loading gate in _app.jsx shows spinner |
| Font loading flash | next/font/google instead of link tags |
| crypto.randomUUID missing | Fallback to Date.now() based ID |
| Concurrent admin edits | Re-fetch list after every mutation |
| text-text-primary confusion | Documented; valid Tailwind, just unusual naming |
