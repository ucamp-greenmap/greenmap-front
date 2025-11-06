# Green Map - AI Coding Agent Instructions

## Project Overview

Green Map is a PWA-based eco-friendly facility finder service. Users can discover recycling centers, EV charging stations, zero-waste stores, and Seoul bike stations based on their location using Kakao Maps.

**Tech Stack**: React 19 + Vite + Redux Toolkit + Tailwind CSS + Kakao Map API + PWA

## Architecture Patterns

### State Management (Redux Toolkit + Redux Persist)

-   **8 Redux Slices**: `app`, `user`, `point`, `facility`, `cert`, `challenge`, `ranking`, `badge`
-   **Persistence**: All slices except `app` and `ranking` are persisted via `redux-persist`
-   **Pattern**: Use Redux for global state, local state for UI-only concerns
-   **Example**: See `src/store/slices/pointSlice.js` for async thunks with `createAsyncThunk`

### Routing & Navigation (React Router v7)

-   **Dual Navigation System**: React Router handles URL routing, Redux `activeTab` syncs with route
-   **Pattern**: Routes defined in `App.jsx`, each screen receives `onNavigate(tab)` prop
-   **Important**: Scroll to top on route change is handled in `AppContent` component
-   **Tab-to-Path mapping**: Defined in `TAB_TO_PATH` object in `App.jsx`

### API Architecture

-   **Base Instance**: `src/api/axios.js` - Pre-configured with JWT interceptors
-   **Auth Flow**: JWT token stored in localStorage, auto-injected via request interceptor
-   **Error Handling**: Response interceptor handles 401/403/404/500 globally
-   **Backend URL**: Set via `VITE_APP_SERVER_URL` env var (default: `http://localhost:8080`)

### Kakao Map Integration

-   **Custom Hook**: `useKakaoMap.js` handles SDK loading, map initialization, and cleanup
-   **Pattern**: Script injection with deduplication check, lazy initialization
-   **Key Props**: Map instance stored in ref, click events handled via listener registration
-   **Location**: `useCurrentLocation.js` manages geolocation with loading/error states

## Critical Conventions

### Component Structure

```
src/components/
  ├── screens/     → Full-page views (e.g., MapScreen, CertificationScreen)
  ├── map/         → Map-specific components (FilterBar, BottomSheet, FacilityDetail)
  └── common/      → Shared UI (BottomNavigation, OfflineBanner, UpdatePrompt)
```

### Styling Patterns

-   **Tailwind-First**: Use Tailwind utility classes, extend theme in `tailwind.config.cjs`
-   **Custom Colors**: `primary` (#4CAF50), `lightgreen`, `brandblue`, `gold` defined in theme
-   **Responsive**: Mobile-first design, use `lg:` and `xl:` prefixes for larger screens
-   **Animations**: Use `framer-motion` for complex animations, Tailwind transitions for simple ones

### Environment Variables

Required `.env` variables:

```env
VITE_KAKAO_MAP_KEY=<kakao_map_app_key>        # REQUIRED for map functionality
VITE_APP_SERVER_URL=<backend_api_url>         # Default: http://localhost:8080
VITE_SEOUL_API_KEY=<seoul_opendata_key>       # OPTIONAL for bike station data
```

## Developer Workflows

### Local Development

```bash
npm install              # Install dependencies (auto-runs postinstall script)
npm run dev              # Start Vite dev server on http://localhost:5173
npm run build            # Production build to dist/
npm run preview          # Preview production build locally
```

### Important Scripts

-   **postinstall**: Runs `scripts/postinstall.js` to handle sharp dependency issues
-   **Proxy**: Backend API proxied in development (see commented vite.config.js for setup)

### Deployment (Netlify)

-   **Auto-deploy**: Push to `main` or `feat/kakao-map` triggers GitHub Actions workflow
-   **Functions**: Netlify Functions in `functions/` directory (e.g., `bike-proxy.js` for CORS bypass)
-   **Redirects**: SPA fallback configured in `netlify.toml` (`/* → /index.html`)

## Data Flow Examples

### Point System

1. **Fetch**: `dispatch(fetchPointShop())` → API call → Updates `point` slice
2. **Usage**: Components use `usePointShop()` hook from `src/hooks/usePointApi.js`
3. **Transform**: Backend voucher data → Frontend gifticon format via `convertVoucherToGifticon()`

### Certification Flow

1. **OCR**: Image → Tesseract.js → Extract text from receipt
2. **Validation**: Check keywords, amounts, merchant names
3. **Submission**: POST to `/verification/certification` → Update `cert` slice
4. **History**: Fetch via `useVerificationHistory()` hook

### Map Markers

1. **Data Source**: Facilities from Redux `facility` slice or live API
2. **Rendering**: `useMarkers.js` creates Kakao marker instances with custom icons
3. **Interaction**: Click marker → Show `FacilityDetail` in `BottomSheet` component

## Common Pitfalls & Solutions

### Kakao Map Not Loading

-   **Check**: SDK script loaded? Use `mapLoaded` state from `useKakaoMap`
-   **Fix**: Ensure `VITE_KAKAO_MAP_KEY` is set in `.env`
-   **Debug**: Open console for "[Kakao Map] Failed to load SDK script" errors

### Redux Persist Hydration Issues

-   **Pattern**: Wrap app with `<PersistGate loading={null} persistor={persistor}>`
-   **Reset**: Clear localStorage if state structure changed: `localStorage.removeItem('persist:greenmap')`

### PWA Service Worker Conflicts

-   **Development**: SW disabled in dev mode (`devOptions.enabled: false`)
-   **Update**: Use `UpdatePrompt` component to show update notification
-   **Register**: SW registration happens in `main.jsx` via `serviceWorkerRegistration.js`

## Key Files Reference

| File                                   | Purpose                                                 |
| -------------------------------------- | ------------------------------------------------------- |
| `src/App.jsx`                          | Routing logic, tab synchronization, scroll-to-top       |
| `src/store/index.js`                   | Redux store config, persist whitelist                   |
| `src/api/axios.js`                     | Axios instance with JWT auth interceptors               |
| `src/hooks/useKakaoMap.js`             | Kakao Map SDK initialization pattern                    |
| `src/components/screens/MapScreen.jsx` | Main map screen with filters, markers, facility details |
| `src/components/map/BottomSheet.jsx`   | Draggable sheet UI pattern (Framer Motion)              |
| `netlify.toml`                         | SPA routing, cache headers, functions config            |

## Testing & Debugging

### Common Debug Commands

```bash
# Check build output
npm run build && ls -lh dist/

# Test PWA locally (requires HTTPS or localhost)
npm run preview

# Clear all cached data
localStorage.clear(); sessionStorage.clear(); location.reload();
```

### API Testing

-   Use browser DevTools Network tab to inspect API calls
-   Check `Authorization: Bearer <token>` header in requests
-   Backend errors logged by axios interceptor in console

---

**Last Updated**: 2025-11-06  
**Note**: This project uses React 19 with new hooks patterns. Avoid legacy lifecycle methods.
