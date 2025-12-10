# FL Festival - Flutter Mobile App Development Plan

## 1. PROJECT ANALYSIS SUMMARY

### 1.1 Current Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript 5 |
| **UI** | Tailwind CSS 4, shadcn/ui, Radix UI |
| **Backend API** | Express.js 4.21 (separate server on port 3001) |
| **Database** | Supabase (PostgreSQL) |
| **Storage** | Supabase Storage (gallery, tickets PDFs) |
| **Payment** | MAIB (Moldova International Bank) |
| **Email** | Resend |
| **i18n** | Romanian (ro), Russian (ru) |

### 1.2 Current Backend API Endpoints

#### Public Endpoints (для мобильного приложения)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/checkout/create-order` | Create order and get payment URL |
| `GET` | `/api/checkout/status/:orderNumber` | Get order status |
| `GET` | `/api/checkout/tickets/:orderNumber` | Get order tickets |
| `GET` | `/api/checkout/tickets/:orderNumber/download` | Download tickets ZIP |
| `POST` | `/api/promo/validate` | Validate promo code |
| `POST` | `/api/b2b/calculate-discount` | Calculate B2B discount |
| `POST` | `/api/b2b/create-order` | Create B2B order |
| `GET` | `/api/b2b/discount-tiers` | Get discount tiers |

#### Admin Endpoints (для админ-части приложения)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/orders/:id/resend-tickets` | Resend tickets email |
| `POST` | `/api/admin/orders/:id/refund` | Process refund |
| `POST` | `/api/admin/invitations` | Create free invitation |

### 1.3 Database Tables

```
tickets              - Ticket types (Day Pass, Weekend, Camping, etc.)
ticket_options       - Ticket options (Tent, Parking, Camper spots)
orders               - B2C customer orders
order_items          - Individual tickets in orders
b2b_orders           - Corporate bulk orders
b2b_order_items      - Items in B2B orders
promo_codes          - Discount codes
gallery              - Festival photos metadata
artists              - Lineup artists
news                 - News articles
partners             - Festival partners
activities           - Festival activities
program              - Event schedule
contacts             - Department contacts
site_contacts        - General site info
```

---

## 2. FLUTTER APP ARCHITECTURE

### 2.1 Recommended Architecture: Clean Architecture + BLoC

```
lib/
├── core/
│   ├── constants/
│   │   ├── api_constants.dart
│   │   ├── app_colors.dart
│   │   ├── app_strings.dart
│   │   └── asset_paths.dart
│   ├── errors/
│   │   ├── exceptions.dart
│   │   └── failures.dart
│   ├── network/
│   │   ├── api_client.dart
│   │   ├── api_interceptors.dart
│   │   └── network_info.dart
│   ├── utils/
│   │   ├── validators.dart
│   │   ├── formatters.dart
│   │   └── helpers.dart
│   └── theme/
│       ├── app_theme.dart
│       ├── dark_theme.dart
│       └── light_theme.dart
│
├── data/
│   ├── datasources/
│   │   ├── remote/
│   │   │   ├── tickets_remote_datasource.dart
│   │   │   ├── orders_remote_datasource.dart
│   │   │   ├── news_remote_datasource.dart
│   │   │   ├── gallery_remote_datasource.dart
│   │   │   └── auth_remote_datasource.dart
│   │   └── local/
│   │       ├── cart_local_datasource.dart
│   │       ├── settings_local_datasource.dart
│   │       └── cache_datasource.dart
│   ├── models/
│   │   ├── ticket_model.dart
│   │   ├── order_model.dart
│   │   ├── cart_item_model.dart
│   │   ├── news_model.dart
│   │   ├── artist_model.dart
│   │   ├── gallery_model.dart
│   │   └── user_model.dart
│   └── repositories/
│       ├── tickets_repository_impl.dart
│       ├── orders_repository_impl.dart
│       ├── cart_repository_impl.dart
│       ├── news_repository_impl.dart
│       └── gallery_repository_impl.dart
│
├── domain/
│   ├── entities/
│   │   ├── ticket.dart
│   │   ├── ticket_option.dart
│   │   ├── order.dart
│   │   ├── cart_item.dart
│   │   ├── news_article.dart
│   │   ├── artist.dart
│   │   └── gallery_image.dart
│   ├── repositories/
│   │   ├── tickets_repository.dart
│   │   ├── orders_repository.dart
│   │   ├── cart_repository.dart
│   │   └── news_repository.dart
│   └── usecases/
│       ├── tickets/
│       │   ├── get_tickets.dart
│       │   └── get_ticket_options.dart
│       ├── orders/
│       │   ├── create_order.dart
│       │   ├── get_order_status.dart
│       │   ├── get_order_tickets.dart
│       │   └── validate_promo_code.dart
│       ├── cart/
│       │   ├── add_to_cart.dart
│       │   ├── remove_from_cart.dart
│       │   └── clear_cart.dart
│       └── news/
│           ├── get_news_list.dart
│           └── get_news_detail.dart
│
├── presentation/
│   ├── bloc/
│   │   ├── tickets/
│   │   │   ├── tickets_bloc.dart
│   │   │   ├── tickets_event.dart
│   │   │   └── tickets_state.dart
│   │   ├── cart/
│   │   │   ├── cart_bloc.dart
│   │   │   ├── cart_event.dart
│   │   │   └── cart_state.dart
│   │   ├── checkout/
│   │   │   ├── checkout_bloc.dart
│   │   │   ├── checkout_event.dart
│   │   │   └── checkout_state.dart
│   │   ├── orders/
│   │   │   ├── orders_bloc.dart
│   │   │   ├── orders_event.dart
│   │   │   └── orders_state.dart
│   │   ├── news/
│   │   │   └── ...
│   │   ├── gallery/
│   │   │   └── ...
│   │   ├── lineup/
│   │   │   └── ...
│   │   └── settings/
│   │       └── ...
│   ├── pages/
│   │   ├── splash/
│   │   │   └── splash_page.dart
│   │   ├── onboarding/
│   │   │   └── onboarding_page.dart
│   │   ├── home/
│   │   │   ├── home_page.dart
│   │   │   └── widgets/
│   │   ├── tickets/
│   │   │   ├── tickets_page.dart
│   │   │   ├── ticket_detail_page.dart
│   │   │   └── widgets/
│   │   ├── cart/
│   │   │   ├── cart_page.dart
│   │   │   └── widgets/
│   │   ├── checkout/
│   │   │   ├── checkout_page.dart
│   │   │   ├── checkout_success_page.dart
│   │   │   ├── checkout_failed_page.dart
│   │   │   └── widgets/
│   │   ├── orders/
│   │   │   ├── orders_page.dart
│   │   │   ├── order_detail_page.dart
│   │   │   └── widgets/
│   │   ├── news/
│   │   │   ├── news_page.dart
│   │   │   ├── news_detail_page.dart
│   │   │   └── widgets/
│   │   ├── lineup/
│   │   │   ├── lineup_page.dart
│   │   │   └── widgets/
│   │   ├── gallery/
│   │   │   ├── gallery_page.dart
│   │   │   ├── gallery_viewer_page.dart
│   │   │   └── widgets/
│   │   ├── program/
│   │   │   ├── program_page.dart
│   │   │   └── widgets/
│   │   ├── map/
│   │   │   ├── festival_map_page.dart
│   │   │   └── widgets/
│   │   ├── profile/
│   │   │   ├── profile_page.dart
│   │   │   └── widgets/
│   │   └── settings/
│   │       ├── settings_page.dart
│   │       └── widgets/
│   └── widgets/
│       ├── common/
│       │   ├── app_button.dart
│       │   ├── app_text_field.dart
│       │   ├── loading_indicator.dart
│       │   ├── error_widget.dart
│       │   └── cached_image.dart
│       ├── ticket/
│       │   ├── ticket_card.dart
│       │   └── ticket_option_selector.dart
│       ├── cart/
│       │   ├── cart_item_widget.dart
│       │   └── cart_summary.dart
│       └── navigation/
│           ├── bottom_nav_bar.dart
│           └── app_drawer.dart
│
├── l10n/
│   ├── app_ro.arb
│   └── app_ru.arb
│
├── di/
│   └── injection_container.dart
│
└── main.dart
```

### 2.2 Key Dependencies (pubspec.yaml)

```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter

  # State Management
  flutter_bloc: ^8.1.3
  equatable: ^2.0.5

  # Dependency Injection
  get_it: ^7.6.4
  injectable: ^2.3.2

  # Network
  dio: ^5.4.0
  retrofit: ^4.0.3
  connectivity_plus: ^5.0.2

  # Local Storage
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  shared_preferences: ^2.2.2
  flutter_secure_storage: ^9.0.0

  # Supabase (optional - can use REST API instead)
  supabase_flutter: ^2.3.0

  # UI Components
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.1
  shimmer: ^3.0.0
  photo_view: ^0.14.0
  carousel_slider: ^4.2.1

  # Navigation
  go_router: ^13.0.0

  # Forms & Validation
  flutter_form_builder: ^9.2.1
  form_builder_validators: ^9.1.0
  intl_phone_field: ^3.2.0

  # Payment
  webview_flutter: ^4.4.4
  url_launcher: ^6.2.2

  # QR Code (for tickets)
  qr_flutter: ^4.1.0
  mobile_scanner: ^4.0.1

  # Maps
  google_maps_flutter: ^2.5.3
  geolocator: ^11.0.0

  # Notifications
  firebase_core: ^2.24.2
  firebase_messaging: ^14.7.10
  flutter_local_notifications: ^16.3.0

  # Analytics
  firebase_analytics: ^10.7.4

  # Utils
  intl: ^0.19.0
  json_annotation: ^4.8.1
  freezed_annotation: ^2.4.1
  dartz: ^0.10.1
  path_provider: ^2.1.2
  share_plus: ^7.2.1

  # PDF Viewer
  flutter_pdfview: ^1.3.2

  # Animations
  flutter_animate: ^4.3.0
  lottie: ^3.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.1
  build_runner: ^2.4.8
  json_serializable: ^6.7.1
  freezed: ^2.4.6
  injectable_generator: ^2.4.1
  retrofit_generator: ^8.0.6
  hive_generator: ^2.0.1
  bloc_test: ^9.1.5
  mockito: ^5.4.4
  mocktail: ^1.0.1
```

---

## 3. API ENDPOINTS FOR FLUTTER APP

### 3.1 New Endpoints to Create (Server-side)

Для полноценного мобильного приложения нужно добавить следующие API endpoints:

#### Content Endpoints (Public)

```typescript
// GET /api/mobile/tickets
// Returns all active tickets with options
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": "uuid",
        "name": "day-pass",
        "nameRo": "Abonament de Zi",
        "nameRu": "Дневной Абонемент",
        "descriptionRo": "...",
        "descriptionRu": "...",
        "featuresRo": ["Feature 1", "Feature 2"],
        "featuresRu": ["Фича 1", "Фича 2"],
        "price": 350,
        "originalPrice": 450,
        "currency": "MDL",
        "maxPerOrder": 10,
        "hasOptions": false,
        "options": []
      }
    ]
  }
}

// GET /api/mobile/lineup?year=2025
// Returns artists grouped by day/stage
{
  "success": true,
  "data": {
    "year": 2025,
    "headliners": [...],
    "days": [
      {
        "date": "2025-08-15",
        "stages": [
          {
            "name": "Main Stage",
            "artists": [...]
          }
        ]
      }
    ],
    "stats": {
      "headlinersCount": 5,
      "totalArtists": 45,
      "stages": 3,
      "days": 2
    }
  }
}

// GET /api/mobile/news?page=1&limit=10&locale=ro
{
  "success": true,
  "data": {
    "news": [
      {
        "id": "uuid",
        "slug": "article-slug",
        "title": "...",
        "excerpt": "...",
        "content": "...",
        "coverImage": "https://...",
        "category": "announcements",
        "publishedAt": "2025-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "hasMore": true
    }
  }
}

// GET /api/mobile/news/:slug
{
  "success": true,
  "data": {
    "article": {...},
    "related": [...]
  }
}

// GET /api/mobile/gallery?year=2024&page=1&limit=20
{
  "success": true,
  "data": {
    "years": [2024, 2023, 2022],
    "images": [
      {
        "id": "uuid",
        "thumbnailUrl": "https://...",
        "fullUrl": "https://...",
        "year": 2024,
        "order": 1
      }
    ],
    "pagination": {...}
  }
}

// GET /api/mobile/program?date=2025-08-15
{
  "success": true,
  "data": {
    "dates": ["2025-08-15", "2025-08-16"],
    "events": [
      {
        "id": "uuid",
        "title": "...",
        "description": "...",
        "startTime": "14:00",
        "endTime": "15:30",
        "stage": "Main Stage",
        "category": "music"
      }
    ]
  }
}

// GET /api/mobile/partners
{
  "success": true,
  "data": {
    "partners": [
      {
        "id": "uuid",
        "name": "Partner Name",
        "logo": "https://...",
        "website": "https://...",
        "tier": "gold"
      }
    ]
  }
}

// GET /api/mobile/activities
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "uuid",
        "title": "...",
        "description": "...",
        "image": "https://...",
        "location": "Zone A"
      }
    ]
  }
}

// GET /api/mobile/info
// General festival info
{
  "success": true,
  "data": {
    "festivalName": "FL Festival",
    "dates": {
      "start": "2025-08-15",
      "end": "2025-08-16"
    },
    "location": {
      "name": "Orheiul Vechi",
      "address": "...",
      "coordinates": {
        "lat": 47.0,
        "lng": 28.9
      }
    },
    "contacts": {
      "general": {...},
      "tickets": {...},
      "press": {...}
    },
    "social": {
      "instagram": "...",
      "facebook": "...",
      "telegram": "..."
    },
    "rules": "...",
    "faq": [...]
  }
}

// GET /api/mobile/aftermovies
{
  "success": true,
  "data": {
    "videos": [
      {
        "id": "uuid",
        "title": "FL 2024 Aftermovie",
        "youtubeId": "abc123",
        "thumbnail": "https://...",
        "year": 2024
      }
    ]
  }
}
```

#### User & Orders Endpoints

```typescript
// POST /api/mobile/auth/register
// Optional user registration for order history
{
  "email": "user@example.com",
  "password": "...",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+373..."
}

// POST /api/mobile/auth/login
{
  "email": "user@example.com",
  "password": "..."
}

// GET /api/mobile/orders
// Requires auth token
// Returns user's order history
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "uuid",
        "orderNumber": "FL2501-ABC123",
        "status": "paid",
        "totalAmount": 700,
        "createdAt": "...",
        "items": [...]
      }
    ]
  }
}

// GET /api/mobile/orders/:orderNumber
// Can work with or without auth (by order number + email)
{
  "success": true,
  "data": {
    "order": {...},
    "tickets": [
      {
        "ticketCode": "FL-ABC123",
        "ticketName": "Day Pass",
        "pdfUrl": "https://...",
        "qrData": "..."
      }
    ]
  }
}
```

#### Push Notifications Endpoint

```typescript
// POST /api/mobile/devices/register
{
  "deviceToken": "fcm_token_here",
  "platform": "ios" | "android",
  "language": "ro" | "ru"
}

// DELETE /api/mobile/devices/:token
// Unregister device
```

### 3.2 Server Changes Required

Create new file: `server/src/routes/mobile.ts`

```typescript
import { Router } from 'express';
import { supabase } from '../services/supabase';

const router = Router();

// GET /api/mobile/tickets
router.get('/tickets', async (req, res) => {
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select(`
      *,
      options:ticket_options(*)
    `)
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  res.json({
    success: true,
    data: { tickets }
  });
});

// ... other endpoints

export default router;
```

Update `server/src/index.ts`:

```typescript
import mobileRoutes from './routes/mobile';
// ...
app.use('/api/mobile', mobileRoutes);
```

---

## 4. FLUTTER APP SCREENS & FEATURES

### 4.1 Core Screens (Same as Website)

| Screen | Features |
|--------|----------|
| **Home** | Hero banner, countdown timer, featured tickets, news preview, aftermovie, quick actions |
| **Tickets** | Ticket list, filtering, quantity selector, option selector, add to cart |
| **Cart** | Cart items, quantity edit, promo code input, order summary, checkout button |
| **Checkout** | Customer form (name, email, phone), payment method, terms acceptance |
| **Payment WebView** | MAIB payment gateway (WebView) |
| **Order Success** | Confirmation, order details, download tickets button |
| **Order Failed** | Error message, retry button |
| **Orders History** | List of user's orders (by email or account) |
| **Order Detail** | Order info, ticket list, download/share tickets |
| **Lineup** | Artists grid, year filter, headliners section |
| **News List** | News cards, pagination |
| **News Detail** | Full article, related news |
| **Gallery** | Year tabs, image grid, full-screen viewer |
| **Program** | Day tabs, timeline view, filters by stage/category |
| **Partners** | Partner logos grid |
| **Activities** | Activity cards |
| **Info/About** | Festival info, location, dates |
| **How to Get** | Map, directions, transport options |
| **Contacts** | Department contacts, social links |
| **FAQ** | Expandable FAQ items |
| **Rules** | Festival rules |
| **Settings** | Language, notifications, theme |

### 4.2 Additional Mobile-Only Features

| Feature | Description |
|---------|-------------|
| **Push Notifications** | News alerts, lineup updates, schedule reminders, order status |
| **Digital Wallet Tickets** | Apple Wallet / Google Pay passes |
| **Offline Mode** | Cached lineup, program, map for use without internet at festival |
| **Interactive Map** | Festival map with zones, stages, facilities, food, toilets |
| **AR Navigation** | AR arrows to navigate festival grounds |
| **Schedule Builder** | Personal schedule with favorite artists, reminders |
| **Artist Notifications** | "Your favorite artist performs in 30 min" alerts |
| **QR Ticket Scanner** | Built-in scanner for staff app version |
| **Social Sharing** | Share tickets, lineup, photos to social media |
| **Live Updates** | Real-time schedule changes, weather alerts |
| **Friends Location** | Share location with friends at festival (opt-in) |
| **Food & Drinks Menu** | Vendors list with menus and wait times |
| **Lost & Found** | Report/find lost items |
| **Emergency Info** | Medical points, security, emergency contacts |
| **Photo Memories** | Festival photos with date/location tags |
| **Merch Store** | Buy merchandise in-app |
| **Gamification** | Check-in badges, achievements, rewards |

---

## 5. DEVELOPMENT PHASES

### Phase 1: Foundation (2-3 weeks)

**Tasks:**
1. Project setup with Clean Architecture
2. Configure dependencies (BLoC, Dio, Hive, etc.)
3. Setup routing (go_router)
4. Create base API client with interceptors
5. Implement localization (ro, ru)
6. Create design system (colors, typography, components)
7. Setup CI/CD pipeline

**Deliverables:**
- Empty app shell with navigation
- API client ready
- Theme system
- Base widgets library

### Phase 2: Content Screens (2-3 weeks)

**Tasks:**
1. Home screen with hero, countdown, sections
2. Lineup screen with filtering
3. News list and detail screens
4. Gallery with full-screen viewer
5. Program/Schedule screen
6. Info, FAQ, Rules, Contacts screens
7. Partners and Activities screens

**Deliverables:**
- All read-only content screens
- Pull-to-refresh
- Offline caching

### Phase 3: Tickets & Cart (2 weeks)

**Tasks:**
1. Tickets list screen
2. Ticket detail with options
3. Cart management (add, remove, quantity)
4. Cart persistence (Hive)
5. Promo code validation
6. Cart summary calculations

**Deliverables:**
- Full ticket browsing experience
- Persistent cart
- Promo codes working

### Phase 4: Checkout & Payments (2 weeks)

**Tasks:**
1. Checkout form with validation
2. MAIB payment WebView integration
3. Payment callback handling
4. Success/Failed screens
5. Order status polling

**Deliverables:**
- Complete purchase flow
- Payment integration

### Phase 5: Orders & Tickets (1-2 weeks)

**Tasks:**
1. Order lookup by email/number
2. Orders history screen
3. Order detail with tickets
4. PDF ticket viewer
5. Download tickets functionality
6. Share tickets

**Deliverables:**
- Order management
- Ticket viewing/downloading

### Phase 6: Push Notifications (1 week)

**Tasks:**
1. Firebase setup
2. FCM token registration
3. Notification handling (foreground/background)
4. Deep linking from notifications
5. Notification preferences

**Deliverables:**
- Working push notifications
- User preferences

### Phase 7: Advanced Features (2-3 weeks)

**Tasks:**
1. Interactive festival map
2. Personal schedule builder
3. Favorite artists
4. Offline mode improvements
5. Social sharing
6. Apple Wallet / Google Pay tickets

**Deliverables:**
- Enhanced user experience
- Offline-ready app

### Phase 8: Polish & Release (1-2 weeks)

**Tasks:**
1. Performance optimization
2. Bug fixes
3. Accessibility improvements
4. App Store assets
5. Beta testing
6. Release

**Deliverables:**
- Production-ready app
- Published to stores

---

## 6. API DOCUMENTATION FOR FLUTTER DEVELOPER

### 6.1 Base Configuration

```dart
// lib/core/constants/api_constants.dart

class ApiConstants {
  static const String baseUrl = 'https://api.flfestival.md';
  static const String mobileApiPath = '/api/mobile';
  static const String checkoutApiPath = '/api/checkout';
  static const String promoApiPath = '/api/promo';

  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // Endpoints
  static const String tickets = '/tickets';
  static const String lineup = '/lineup';
  static const String news = '/news';
  static const String gallery = '/gallery';
  static const String program = '/program';
  static const String partners = '/partners';
  static const String activities = '/activities';
  static const String info = '/info';
  static const String aftermovies = '/aftermovies';

  static const String createOrder = '/create-order';
  static const String orderStatus = '/status';
  static const String orderTickets = '/tickets';
  static const String validatePromo = '/validate';
}
```

### 6.2 API Client Setup

```dart
// lib/core/network/api_client.dart

import 'package:dio/dio.dart';

class ApiClient {
  late final Dio _dio;

  ApiClient() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: ApiConstants.connectTimeout,
      receiveTimeout: ApiConstants.receiveTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    _dio.interceptors.addAll([
      LogInterceptor(requestBody: true, responseBody: true),
      _LanguageInterceptor(),
      _ErrorInterceptor(),
    ]);
  }

  Future<Response<T>> get<T>(String path, {Map<String, dynamic>? queryParameters}) {
    return _dio.get<T>(path, queryParameters: queryParameters);
  }

  Future<Response<T>> post<T>(String path, {dynamic data}) {
    return _dio.post<T>(path, data: data);
  }
}

class _LanguageInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final locale = LocaleService.currentLocale; // 'ro' or 'ru'
    options.headers['Accept-Language'] = locale;
    handler.next(options);
  }
}
```

### 6.3 Data Models

```dart
// lib/data/models/ticket_model.dart

import 'package:freezed_annotation/freezed_annotation.dart';

part 'ticket_model.freezed.dart';
part 'ticket_model.g.dart';

@freezed
class TicketModel with _$TicketModel {
  const factory TicketModel({
    required String id,
    required String name,
    required String nameRo,
    required String nameRu,
    String? descriptionRo,
    String? descriptionRu,
    @Default([]) List<String> featuresRo,
    @Default([]) List<String> featuresRu,
    required double price,
    double? originalPrice,
    @Default('MDL') String currency,
    @Default(true) bool isActive,
    int? sortOrder,
    @Default(10) int maxPerOrder,
    @Default(false) bool hasOptions,
    @Default([]) List<TicketOptionModel> options,
  }) = _TicketModel;

  factory TicketModel.fromJson(Map<String, dynamic> json) =>
      _$TicketModelFromJson(json);
}

@freezed
class TicketOptionModel with _$TicketOptionModel {
  const factory TicketOptionModel({
    required String id,
    required String ticketId,
    required String name,
    required String nameRo,
    required String nameRu,
    String? descriptionRo,
    String? descriptionRu,
    @Default(0) double priceModifier,
    @Default(false) bool isDefault,
    int? sortOrder,
  }) = _TicketOptionModel;

  factory TicketOptionModel.fromJson(Map<String, dynamic> json) =>
      _$TicketOptionModelFromJson(json);
}
```

```dart
// lib/data/models/order_model.dart

@freezed
class CreateOrderRequest with _$CreateOrderRequest {
  const factory CreateOrderRequest({
    required CustomerInfo customer,
    required List<OrderItemRequest> items,
    String? promoCode,
    required String language,
  }) = _CreateOrderRequest;

  factory CreateOrderRequest.fromJson(Map<String, dynamic> json) =>
      _$CreateOrderRequestFromJson(json);
}

@freezed
class CustomerInfo with _$CustomerInfo {
  const factory CustomerInfo({
    required String firstName,
    required String lastName,
    required String email,
    required String phone,
  }) = _CustomerInfo;

  factory CustomerInfo.fromJson(Map<String, dynamic> json) =>
      _$CustomerInfoFromJson(json);
}

@freezed
class OrderItemRequest with _$OrderItemRequest {
  const factory OrderItemRequest({
    required String ticketId,
    String? optionId,
    required int quantity,
  }) = _OrderItemRequest;

  factory OrderItemRequest.fromJson(Map<String, dynamic> json) =>
      _$OrderItemRequestFromJson(json);
}

@freezed
class CreateOrderResponse with _$CreateOrderResponse {
  const factory CreateOrderResponse({
    required bool success,
    OrderData? data,
    String? error,
  }) = _CreateOrderResponse;

  factory CreateOrderResponse.fromJson(Map<String, dynamic> json) =>
      _$CreateOrderResponseFromJson(json);
}

@freezed
class OrderData with _$OrderData {
  const factory OrderData({
    required String orderId,
    required String orderNumber,
    required String redirectUrl,
  }) = _OrderData;

  factory OrderData.fromJson(Map<String, dynamic> json) =>
      _$OrderDataFromJson(json);
}
```

### 6.4 Repository Implementation

```dart
// lib/data/repositories/orders_repository_impl.dart

class OrdersRepositoryImpl implements OrdersRepository {
  final ApiClient _apiClient;

  OrdersRepositoryImpl(this._apiClient);

  @override
  Future<Either<Failure, CreateOrderResponse>> createOrder(
    CreateOrderRequest request,
  ) async {
    try {
      final response = await _apiClient.post(
        '${ApiConstants.checkoutApiPath}${ApiConstants.createOrder}',
        data: request.toJson(),
      );

      return Right(CreateOrderResponse.fromJson(response.data));
    } on DioException catch (e) {
      return Left(ServerFailure(e.message ?? 'Server error'));
    }
  }

  @override
  Future<Either<Failure, OrderStatusResponse>> getOrderStatus(
    String orderNumber,
  ) async {
    try {
      final response = await _apiClient.get(
        '${ApiConstants.checkoutApiPath}${ApiConstants.orderStatus}/$orderNumber',
      );

      return Right(OrderStatusResponse.fromJson(response.data));
    } on DioException catch (e) {
      return Left(ServerFailure(e.message ?? 'Server error'));
    }
  }

  @override
  Future<Either<Failure, ValidatePromoResponse>> validatePromoCode(
    String code,
    double totalAmount,
  ) async {
    try {
      final response = await _apiClient.post(
        '${ApiConstants.promoApiPath}${ApiConstants.validatePromo}',
        data: {
          'code': code,
          'totalAmount': totalAmount,
        },
      );

      return Right(ValidatePromoResponse.fromJson(response.data));
    } on DioException catch (e) {
      return Left(ServerFailure(e.message ?? 'Server error'));
    }
  }
}
```

### 6.5 BLoC Implementation

```dart
// lib/presentation/bloc/checkout/checkout_bloc.dart

class CheckoutBloc extends Bloc<CheckoutEvent, CheckoutState> {
  final CreateOrderUseCase _createOrderUseCase;
  final ValidatePromoCodeUseCase _validatePromoUseCase;

  CheckoutBloc({
    required CreateOrderUseCase createOrderUseCase,
    required ValidatePromoCodeUseCase validatePromoUseCase,
  })  : _createOrderUseCase = createOrderUseCase,
        _validatePromoUseCase = validatePromoUseCase,
        super(const CheckoutState.initial()) {
    on<CheckoutSubmitted>(_onSubmitted);
    on<PromoCodeValidated>(_onPromoCodeValidated);
  }

  Future<void> _onSubmitted(
    CheckoutSubmitted event,
    Emitter<CheckoutState> emit,
  ) async {
    emit(const CheckoutState.loading());

    final result = await _createOrderUseCase(event.request);

    result.fold(
      (failure) => emit(CheckoutState.error(failure.message)),
      (response) {
        if (response.success && response.data != null) {
          emit(CheckoutState.success(response.data!));
        } else {
          emit(CheckoutState.error(response.error ?? 'Unknown error'));
        }
      },
    );
  }

  Future<void> _onPromoCodeValidated(
    PromoCodeValidated event,
    Emitter<CheckoutState> emit,
  ) async {
    final result = await _validatePromoUseCase(
      code: event.code,
      totalAmount: event.totalAmount,
    );

    result.fold(
      (failure) => emit(state.copyWith(promoError: failure.message)),
      (response) {
        if (response.success && response.data != null) {
          emit(state.copyWith(
            appliedPromo: response.data,
            promoError: null,
          ));
        } else {
          emit(state.copyWith(promoError: response.error));
        }
      },
    );
  }
}
```

---

## 7. PAYMENT INTEGRATION

### 7.1 MAIB WebView Implementation

```dart
// lib/presentation/pages/checkout/payment_webview_page.dart

import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class PaymentWebViewPage extends StatefulWidget {
  final String paymentUrl;
  final String orderNumber;

  const PaymentWebViewPage({
    super.key,
    required this.paymentUrl,
    required this.orderNumber,
  });

  @override
  State<PaymentWebViewPage> createState() => _PaymentWebViewPageState();
}

class _PaymentWebViewPageState extends State<PaymentWebViewPage> {
  late final WebViewController _controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(NavigationDelegate(
        onPageStarted: (_) => setState(() => _isLoading = true),
        onPageFinished: (_) => setState(() => _isLoading = false),
        onNavigationRequest: _handleNavigation,
      ))
      ..loadRequest(Uri.parse(widget.paymentUrl));
  }

  NavigationDecision _handleNavigation(NavigationRequest request) {
    final url = request.url;

    // Check for success callback URL
    if (url.contains('/checkout/success') ||
        url.contains('/maib/return/ok')) {
      Navigator.of(context).pushReplacementNamed(
        '/checkout/success',
        arguments: widget.orderNumber,
      );
      return NavigationDecision.prevent;
    }

    // Check for failure callback URL
    if (url.contains('/checkout/failed') ||
        url.contains('/maib/return/fail')) {
      Navigator.of(context).pushReplacementNamed(
        '/checkout/failed',
        arguments: widget.orderNumber,
      );
      return NavigationDecision.prevent;
    }

    return NavigationDecision.navigate;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(context.l10n.payment),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => _showCancelDialog(),
        ),
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(child: CircularProgressIndicator()),
        ],
      ),
    );
  }

  Future<void> _showCancelDialog() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(context.l10n.cancelPayment),
        content: Text(context.l10n.cancelPaymentConfirm),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(context.l10n.no),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(context.l10n.yes),
          ),
        ],
      ),
    );

    if (confirm == true) {
      Navigator.of(context).pop();
    }
  }
}
```

### 7.2 Order Status Polling

```dart
// lib/presentation/pages/checkout/checkout_success_page.dart

class CheckoutSuccessPage extends StatefulWidget {
  final String orderNumber;

  const CheckoutSuccessPage({super.key, required this.orderNumber});

  @override
  State<CheckoutSuccessPage> createState() => _CheckoutSuccessPageState();
}

class _CheckoutSuccessPageState extends State<CheckoutSuccessPage> {
  Timer? _pollingTimer;

  @override
  void initState() {
    super.initState();
    _startPolling();
  }

  void _startPolling() {
    // Poll every 2 seconds for up to 30 seconds
    int attempts = 0;
    _pollingTimer = Timer.periodic(const Duration(seconds: 2), (timer) {
      attempts++;
      if (attempts >= 15) {
        timer.cancel();
        return;
      }

      context.read<OrdersBloc>().add(
        FetchOrderStatus(widget.orderNumber),
      );
    });
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<OrdersBloc, OrdersState>(
      builder: (context, state) {
        if (state is OrderStatusLoaded && state.order.status == 'paid') {
          _pollingTimer?.cancel();
          return _buildSuccessContent(state.order);
        }

        return _buildWaitingContent();
      },
    );
  }
}
```

---

## 8. OFFLINE SUPPORT

### 8.1 Caching Strategy

```dart
// lib/data/datasources/local/cache_datasource.dart

class CacheDataSource {
  static const String ticketsKey = 'cached_tickets';
  static const String lineupKey = 'cached_lineup';
  static const String newsKey = 'cached_news';
  static const String programKey = 'cached_program';
  static const String infoKey = 'cached_info';

  final Box _box;

  CacheDataSource(this._box);

  Future<void> cacheTickets(List<TicketModel> tickets) async {
    await _box.put(ticketsKey, {
      'data': tickets.map((t) => t.toJson()).toList(),
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  List<TicketModel>? getCachedTickets() {
    final cached = _box.get(ticketsKey);
    if (cached == null) return null;

    // Check if cache is stale (older than 1 hour)
    final timestamp = DateTime.parse(cached['timestamp']);
    if (DateTime.now().difference(timestamp).inHours > 1) {
      return null;
    }

    return (cached['data'] as List)
        .map((json) => TicketModel.fromJson(json))
        .toList();
  }

  // Similar methods for other data types...
}
```

### 8.2 Network-Aware Repository

```dart
// lib/data/repositories/tickets_repository_impl.dart

class TicketsRepositoryImpl implements TicketsRepository {
  final TicketsRemoteDataSource _remoteDataSource;
  final CacheDataSource _cacheDataSource;
  final NetworkInfo _networkInfo;

  TicketsRepositoryImpl({
    required TicketsRemoteDataSource remoteDataSource,
    required CacheDataSource cacheDataSource,
    required NetworkInfo networkInfo,
  })  : _remoteDataSource = remoteDataSource,
        _cacheDataSource = cacheDataSource,
        _networkInfo = networkInfo;

  @override
  Future<Either<Failure, List<Ticket>>> getTickets() async {
    if (await _networkInfo.isConnected) {
      try {
        final tickets = await _remoteDataSource.getTickets();
        await _cacheDataSource.cacheTickets(tickets);
        return Right(tickets.map((m) => m.toEntity()).toList());
      } catch (e) {
        return Left(ServerFailure(e.toString()));
      }
    } else {
      final cached = _cacheDataSource.getCachedTickets();
      if (cached != null) {
        return Right(cached.map((m) => m.toEntity()).toList());
      }
      return const Left(NetworkFailure('No internet connection'));
    }
  }
}
```

---

## 9. PUSH NOTIFICATIONS

### 9.1 Firebase Setup

```dart
// lib/core/services/push_notification_service.dart

class PushNotificationService {
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  Future<void> initialize() async {
    // Request permission
    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      // Get FCM token
      final token = await _messaging.getToken();
      if (token != null) {
        await _registerDevice(token);
      }

      // Listen for token refresh
      _messaging.onTokenRefresh.listen(_registerDevice);

      // Handle foreground messages
      FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

      // Handle background/terminated messages
      FirebaseMessaging.onBackgroundMessage(_handleBackgroundMessage);

      // Handle notification taps
      FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);
    }
  }

  Future<void> _registerDevice(String token) async {
    await _apiClient.post('/api/mobile/devices/register', data: {
      'deviceToken': token,
      'platform': Platform.isIOS ? 'ios' : 'android',
      'language': LocaleService.currentLocale,
    });
  }

  void _handleForegroundMessage(RemoteMessage message) {
    // Show local notification
    _localNotifications.show(
      message.hashCode,
      message.notification?.title,
      message.notification?.body,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'festival_channel',
          'Festival Notifications',
          importance: Importance.high,
        ),
        iOS: DarwinNotificationDetails(),
      ),
      payload: jsonEncode(message.data),
    );
  }

  void _handleNotificationTap(RemoteMessage message) {
    // Handle deep linking based on notification data
    final data = message.data;

    if (data['type'] == 'news') {
      NavigationService.navigateTo('/news/${data['slug']}');
    } else if (data['type'] == 'order') {
      NavigationService.navigateTo('/orders/${data['orderNumber']}');
    } else if (data['type'] == 'lineup') {
      NavigationService.navigateTo('/lineup');
    }
  }
}

@pragma('vm:entry-point')
Future<void> _handleBackgroundMessage(RemoteMessage message) async {
  // Handle background message
  print('Background message: ${message.messageId}');
}
```

---

## 10. TESTING STRATEGY

### 10.1 Unit Tests

```dart
// test/domain/usecases/create_order_test.dart

void main() {
  late CreateOrderUseCase useCase;
  late MockOrdersRepository mockRepository;

  setUp(() {
    mockRepository = MockOrdersRepository();
    useCase = CreateOrderUseCase(mockRepository);
  });

  test('should create order successfully', () async {
    // Arrange
    final request = CreateOrderRequest(
      customer: CustomerInfo(
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+37360000000',
      ),
      items: [
        OrderItemRequest(ticketId: 'ticket-1', quantity: 2),
      ],
      language: 'ro',
    );

    final expectedResponse = CreateOrderResponse(
      success: true,
      data: OrderData(
        orderId: 'order-1',
        orderNumber: 'FL2501-ABC123',
        redirectUrl: 'https://maib.md/pay/...',
      ),
    );

    when(() => mockRepository.createOrder(request))
        .thenAnswer((_) async => Right(expectedResponse));

    // Act
    final result = await useCase(request);

    // Assert
    expect(result, Right(expectedResponse));
    verify(() => mockRepository.createOrder(request)).called(1);
  });
}
```

### 10.2 Widget Tests

```dart
// test/presentation/widgets/ticket_card_test.dart

void main() {
  testWidgets('TicketCard displays ticket info correctly', (tester) async {
    final ticket = Ticket(
      id: '1',
      name: 'day-pass',
      nameRo: 'Abonament de Zi',
      nameRu: 'Дневной Абонемент',
      price: 350,
      originalPrice: 450,
      currency: 'MDL',
    );

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: TicketCard(
            ticket: ticket,
            onAddToCart: (_) {},
          ),
        ),
      ),
    );

    expect(find.text('Abonament de Zi'), findsOneWidget);
    expect(find.text('350 MDL'), findsOneWidget);
    expect(find.text('450 MDL'), findsOneWidget); // Original price
  });
}
```

### 10.3 Integration Tests

```dart
// integration_test/checkout_flow_test.dart

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Complete checkout flow', (tester) async {
    await tester.pumpWidget(const MyApp());
    await tester.pumpAndSettle();

    // Navigate to tickets
    await tester.tap(find.text('Tickets'));
    await tester.pumpAndSettle();

    // Add ticket to cart
    await tester.tap(find.byIcon(Icons.add).first);
    await tester.pumpAndSettle();

    // Go to cart
    await tester.tap(find.byIcon(Icons.shopping_cart));
    await tester.pumpAndSettle();

    // Proceed to checkout
    await tester.tap(find.text('Checkout'));
    await tester.pumpAndSettle();

    // Fill form
    await tester.enterText(find.byKey(Key('firstName')), 'John');
    await tester.enterText(find.byKey(Key('lastName')), 'Doe');
    await tester.enterText(find.byKey(Key('email')), 'john@example.com');
    await tester.enterText(find.byKey(Key('phone')), '+37360000000');

    // Accept terms
    await tester.tap(find.byType(Checkbox));

    // Submit
    await tester.tap(find.text('Place Order'));
    await tester.pumpAndSettle();

    // Verify navigation to payment
    expect(find.byType(PaymentWebViewPage), findsOneWidget);
  });
}
```

---

## 11. RELEASE CHECKLIST

### 11.1 Pre-Release

- [ ] All features implemented and tested
- [ ] Localization complete (ro, ru)
- [ ] Offline mode tested
- [ ] Payment flow tested with sandbox
- [ ] Push notifications tested
- [ ] Analytics events tracked
- [ ] Error tracking setup (Sentry/Crashlytics)
- [ ] Performance profiling done
- [ ] Accessibility audit passed
- [ ] Security review completed

### 11.2 App Store Assets

**iOS (App Store Connect):**
- [ ] App icon (1024x1024)
- [ ] Screenshots (6.7", 6.5", 5.5")
- [ ] App Preview video (optional)
- [ ] Description (ro, ru)
- [ ] Keywords
- [ ] Privacy Policy URL
- [ ] Support URL

**Android (Google Play Console):**
- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (phone, tablet)
- [ ] Description (ro, ru)
- [ ] Privacy Policy URL
- [ ] Content rating questionnaire

### 11.3 Post-Release

- [ ] Monitor crash reports
- [ ] Monitor user feedback
- [ ] Track adoption metrics
- [ ] Plan feature updates
- [ ] Set up A/B testing

---

## 12. SUMMARY

This document provides a comprehensive development plan for the FL Festival Flutter mobile app, including:

1. **Complete project analysis** of the existing web platform
2. **Clean Architecture structure** for maintainable codebase
3. **All required API endpoints** with documentation
4. **Screen-by-screen feature list** matching web + mobile exclusives
5. **Phase-by-phase development timeline** (10-15 weeks total)
6. **Code examples** for key implementations
7. **Testing strategy** for quality assurance
8. **Release checklist** for successful launch

The Flutter developer can use this document as a comprehensive guide to build the mobile application with full feature parity to the website plus enhanced mobile-specific features.


⏺ Готово! Созданы все mobile API endpoints

  Созданные файлы:

  | Файл                                                  | Описание                                    |
  |-------------------------------------------------------|---------------------------------------------|
  | server/src/routes/mobile.ts                           | Все API endpoints для мобильного приложения |
  | server/src/index.ts                                   | Обновлён - добавлен import и route          |
  | supabase/migrations/20251208_create_mobile_tables.sql | Миграция для новых таблиц                   |

  ---
  Новые API Endpoints (/api/mobile/*):

  GET  /api/mobile/tickets                    - Все активные билеты с опциями
  GET  /api/mobile/lineup?year=2025           - Лайнап артистов
  GET  /api/mobile/news?page=1&limit=10&locale=ro  - Список новостей
  GET  /api/mobile/news/:slug?locale=ro       - Детали новости
  GET  /api/mobile/gallery?year=2024&page=1   - Галерея с пагинацией
  GET  /api/mobile/program?date=2025-08-15    - Программа фестиваля
  GET  /api/mobile/partners                   - Партнёры по tier'ам
  GET  /api/mobile/activities?locale=ro       - Активности
  GET  /api/mobile/aftermovies                - Aftermovie видео
  GET  /api/mobile/info?locale=ro             - Общая информация + FAQ
  GET  /api/mobile/version?platform=ios&version=1.0.0  - Проверка версии
  POST /api/mobile/devices/register           - Регистрация устройства (push)
  DELETE /api/mobile/devices/:token           - Удаление устройства

  ---
  Новые таблицы в БД:

  device_tokens          -- FCM токены для push уведомлений
  faq                    -- FAQ с локализацией
  app_versions           -- Версии приложения (force update)
  push_notifications_log -- Лог отправленных push

  ---
  Чтобы применить:

  # 1. Применить миграцию в Supabase
  cd supabase
  supabase db push

  # 2. Пересобрать сервер
  cd server
  npm run build

  # 3. Перезапустить сервер
  npm run dev

  ---
  Пример ответа /api/mobile/tickets:

  {
    "success": true,
    "data": {
      "tickets": [
        {
          "id": "uuid",
          "name": "day-pass",
          "nameRo": "Abonament de Zi",
          "nameRu": "Дневной Абонемент",
          "price": 350,
          "originalPrice": 450,
          "currency": "MDL",
          "maxPerOrder": 10,
          "hasOptions": false,
          "options": []
        }
      ]
    }
  }

  Все endpoints готовы к использованию Flutter разработчиком!