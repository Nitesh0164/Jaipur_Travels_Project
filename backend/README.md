# Jaipur Travel Backend

Production Spring Boot backend for the Complete Jaipur travel planner.

## Quick Start

### Prerequisites
- Java 17+
- Maven 3.8+
- MySQL 8.0+

### 1. Database Setup
```sql
CREATE DATABASE jaipur_travel;
```

### 2. Environment Variables
Set these environment variables (or use defaults for local development):

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_URL` | MySQL JDBC URL | `jdbc:mysql://localhost:3306/jaipur_travel?...` |
| `DB_USERNAME` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | _(empty)_ |
| `JWT_ACCESS_SECRET` | JWT access token signing key | built-in dev default |
| `JWT_REFRESH_SECRET` | JWT refresh token signing key | built-in dev default |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:5173` |
| `HF_CHAT_API_KEY` | HuggingFace Inference API key | _(empty — chat fallback mode)_ |
| `HF_CHAT_BASE_URL` | HuggingFace API base URL | `https://api-inference.huggingface.co/models` |
| `HF_CHAT_MODEL` | HuggingFace model ID | `mistralai/Mistral-7B-Instruct-v0.2` |
| `WEATHER_API_KEY` | OpenWeatherMap API key | _(empty — mock weather mode)_ |
| `WEATHER_API_BASE_URL` | OpenWeatherMap base URL | `https://api.openweathermap.org/data/2.5` |
| `WEATHER_CACHE_MINUTES` | Weather cache TTL | `30` |
| `CHAT_RATE_LIMIT_WINDOW_SECONDS` | Chat rate limit window | `60` |
| `CHAT_RATE_LIMIT_MAX_REQUESTS` | Max chat messages per window | `10` |

### 3. Run
```bash
cd backend
mvn spring-boot:run
```

Flyway automatically runs all migrations (V1–V9) and seeds places + bus routes.

### 4. Access
- **API:** http://localhost:8080
- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **API Docs:** http://localhost:8080/v3/api-docs

---

## Architecture

```
Phase 1 — Auth           | JWT, Spring Security, User/RefreshToken
Phase 2 — Travel Data    | Place, PlaceTag, BusRoute, BusStop, route planner
Phase 3 — Trips/Planner  | Trip CRUD, deterministic itinerary engine
Phase 4 — Chat/Weather   | AI chat with intent routing, weather caching
Phase 5 — Admin/Analytics | Dashboard, audit logs, analytics events
```

### Package Structure
```
com.example.jaipurtravel/
  common/        → ApiResponse wrapper
  config/        → Security, CORS, AppConfig, RateLimiter
  controller/    → REST controllers (10 controllers)
  dto/request/   → Validated request DTOs
  dto/response/  → Response DTOs
  entity/        → JPA entities (14 entities)
  exception/     → Custom exceptions + global handler
  integration/   → HuggingFaceClient, WeatherApiClient
  repository/    → Spring Data repositories (11 repositories)
  security/      → JWT filter, UserDetails, entry points
  service/       → Service interfaces + implementations
  mapper/        → Entity-DTO mappers
```

### Database (MySQL — 9 Flyway migrations)
```
users, refresh_tokens, places, place_tags, bus_routes, bus_stops,
trips, chat_sessions, chat_messages, weather_cache,
admin_logs, analytics_events
```

---

## API Summary (45+ endpoints)

### Authentication (Public)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh JWT |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |

### Places (Public read)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/places` | List all |
| GET | `/api/places/{idOrSlug}` | Get one |
| GET | `/api/places/search?q=` | Search |
| GET | `/api/places/filters` | Filter options |
| GET | `/api/places/featured` | Must-see places |
| GET | `/api/places/by-category/{cat}` | By category |
| GET | `/api/places/by-area/{area}` | By area |
| GET | `/api/places/by-tag/{tag}` | By tag |
| GET | `/api/places/{id}/similar` | Similar places |

### Bus Routes (Public read)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/buses/routes` | List all |
| GET | `/api/buses/routes/{id}` | Get one |
| GET | `/api/buses/routes/by-number/{no}` | By route number |
| GET | `/api/buses/routes/by-category/{cat}` | By category |
| GET | `/api/buses/search?q=` | Search routes |
| GET | `/api/buses/stops/suggest?q=` | Autocomplete stops |
| POST | `/api/buses/plan-route` | Plan route A→B |

### Itinerary Planner (Authenticated)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/planner/generate` | Generate itinerary |
| POST | `/api/planner/refine` | Refine with instruction |

### Trips (Authenticated — user-scoped)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/trips` | List user's trips |
| GET | `/api/trips/{id}` | Get trip |
| POST | `/api/trips` | Save trip |
| PUT | `/api/trips/{id}` | Update trip |
| DELETE | `/api/trips/{id}` | Delete trip |

### Chat (Authenticated — rate limited)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/chat/message` | Send message |
| GET | `/api/chat/sessions` | List sessions |
| GET | `/api/chat/sessions/{id}` | Get session |
| DELETE | `/api/chat/sessions/{id}` | Delete session |

### Weather (Public)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/weather/current?city=` | Current weather |
| GET | `/api/weather/forecast?city=` | 5-day forecast |
| GET | `/api/weather/travel-advice?city=` | Travel advice |

### Admin (ADMIN role required)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/dashboard` | Full dashboard |
| GET | `/api/admin/analytics` | Analytics overview |
| GET | `/api/admin/analytics/events` | Event list |
| GET | `/api/admin/logs` | Audit logs |
| GET | `/api/admin/users` | User list |
| GET | `/api/admin/trips` | Trip list |
| POST | `/api/admin/places` | Create place |
| PUT | `/api/admin/places/{id}` | Update place |
| DELETE | `/api/admin/places/{id}` | Delete place |
| POST | `/api/admin/buses/routes` | Create route |
| PUT | `/api/admin/buses/routes/{id}` | Update route |
| DELETE | `/api/admin/buses/routes/{id}` | Delete route |

---

## Frontend Integration Notes

### Zustand Store → Backend API Mapping

| Frontend Store | Mock Data File | Backend Replacement |
|---------------|----------------|---------------------|
| `usePlacesStore.js` | `mockPlaces.js` | `GET /api/places`, `/api/places/search`, `/api/places/featured` |
| `useBusStore.js` | `mockBusRoutes.js` | `GET /api/buses/routes`, `POST /api/buses/plan-route` |
| `useAuthStore.js` | _(local state)_ | `POST /api/auth/login`, `/api/auth/signup`, `GET /api/auth/me` |
| `useSavedTripsStore.js` | `mockSavedTrips.js` | `GET/POST/PUT/DELETE /api/trips` |
| `useItineraryStore.js` | `mockItinerary.js` | `POST /api/planner/generate`, `POST /api/planner/refine` |
| `useChatStore.js` | `mockChat.js` | `POST /api/chat/message`, `GET /api/chat/sessions` |
| `useTripStore.js` | _(local state)_ | `GET/POST /api/trips` |

### Frontend Pages → Backend Endpoints

| Page | Primary Backend Calls |
|------|----------------------|
| `LandingPage.jsx` | `GET /api/places/featured` |
| `ExplorePage.jsx` | `GET /api/places`, `GET /api/places/filters` |
| `BusRoutesPage.jsx` | `GET /api/buses/routes`, `POST /api/buses/plan-route` |
| `WeatherPage.jsx` | `GET /api/weather/current`, `GET /api/weather/forecast` |
| `ChatPlannerPage.jsx` | `POST /api/chat/message`, `GET /api/chat/sessions` |
| `PlannerSetupPage.jsx` | `POST /api/planner/generate` |
| `ItineraryPage.jsx` | `GET /api/trips/{id}`, planner data |
| `SavedTripsPage.jsx` | `GET /api/trips` |
| `BudgetPage.jsx` | `GET /api/trips` + planner data |
| `LoginPage.jsx` | `POST /api/auth/login` |
| `SignupPage.jsx` | `POST /api/auth/signup` |
| `AdminDashboard.jsx` | `GET /api/admin/dashboard` |
| `AdminPlacesPage.jsx` | `POST/PUT/DELETE /api/admin/places` |
| `AdminBusesPage.jsx` | `POST/PUT/DELETE /api/admin/buses/routes` |

### Integration Recommendations

1. **API Base URL:** Add `VITE_API_BASE_URL=http://localhost:8080` to frontend `.env`
2. **Auth Token:** Store JWT in `localStorage`, attach as `Authorization: Bearer <token>` header
3. **Response Shape:** All backend responses follow `{ success, message, data, timestamp }` — access `response.data.data` from axios
4. **Priority Replacement Order:**
   1. Auth (login/signup) — enables all authenticated features
   2. Places — largest mock dataset, biggest visual impact
   3. Bus routes — complex mock data
   4. Weather — currently mock-only on frontend
   5. Chat — currently mock-only
   6. Trips/planner — requires auth first
5. **CORS:** Backend allows `http://localhost:5173` by default (Vite dev server)
