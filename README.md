# Nahui Nature - Route Sales mPOS

A Progressive Web Application (PWA) and Mobile Point of Sale (mPOS) designed for remote route sales operations in environments with limited or no internet connectivity. The system implements a robust Store-and-Forward architecture to ensure seamless logistics, data persistence, and zero-loss order reconciliation regardless of network availability.

## System Architecture
This project utilizes a decoupled, modern service architecture prepared for cloud deployment (CI/CD):
- **Frontend / Client:** React.js (Vite) + Tailwind CSS (v4) + Dexie.js (IndexedDB) + Vite PWA (Service Worker). Target Hosting: Vercel / Netlify.
- **Backend / API:** Python (FastAPI) for high-performance, asynchronous REST API services. Target Hosting: Render / Railway.
- **Database:** PostgreSQL (Supabase).

## Core Capabilities
- **Offline-First B2B Sales:** Full POS operation capability during network dead zones. Order generation, cryptographic ID mapping, and temporal state management are handled exclusively via IndexedDB.
- **Offline Client Onboarding & GPS Capture:** Sales representatives can register new clients in the field without connectivity. The app uses the native HTML5 Geolocation API to capture precise satellite coordinates (Latitude/Longitude) offline.
- **Dynamic Route Management:** The system automatically learns and categorizes new delivery routes using a Smart Combobox and backend `ON CONFLICT DO NOTHING` SQL rules, completely eliminating hardcoded route management.
- **Background Synchronization:** Automated, silent state reconciliation with the central PostgreSQL database upon network restoration, flushing both the offline transaction queue and the offline client registration queue.
- **Progressive Web App (PWA) & Native Mobile Experience:** Installable client interface that caches the entire Application Shell (HTML, CSS, JS, graphical assets) to function identically to a native mobile application without requiring server-side rendering. Implements strict viewport scaling prevention (`user-scalable=no`), portrait orientation locks, and deep OS integration via `manifest.json` and maskable icons.

## Environment Management & Deployment

The architecture strictly separates environment variables to isolate local development from production cloud environments.

### 1. Frontend Configuration (React/Vite)
The frontend utilizes a `.env` file at the root level to dynamically route HTTP requests (Axios) based on the active environment. Endpoints are strictly evaluated as variables (without string quotes) to prevent routing errors.
- **Variable:** `VITE_API_URL`
- **Development:** Points to `http://127.0.0.1:8000` for local testing.
- **Production:** Injected via Vercel/Netlify CI/CD pipeline to point to the live FastAPI cloud URL.

**Run Modes:**
- `npm run dev`: Bypasses Service Worker caching to allow immediate Hot Module Replacement visibility during development.
- `npm run build`: Compiles static assets and generates the final physical Service Worker (`sw.js`).
- `npm run preview`: Serves the compiled production build locally to test true offline PWA behavior before cloud deployment.

### 2. Backend Configuration (Python/FastAPI)
1. Navigate to the backend directory: `cd backend`
2. Activate the virtual environment: `.\venv\Scripts\activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Initialize the local development server: `uvicorn main:app --reload`
- **Variable:** `DATABASE_URL` (Isolated in the backend `.env` to protect the Supabase connection string from client exposure).
- **Supabase Cloud Connection:** To ensure compatibility with cloud hosts like Render, the connection utilizes the **Supabase Session Pooler** (IPv4 proxied, port 5432) instead of the default IPv6 Transaction Pooler. Passwords containing special characters are strictly **URL Encoded** to maintain URI string integrity.

### 3. Server Keep-Alive Strategy (Render Free Tier)
To prevent the FastAPI service from suspending after 15 minutes of inactivity, the API implements a dedicated Health Check endpoint (`GET /health`). This lightweight route is monitored by an external cron service (e.g., UptimeRobot) every 14 minutes, keeping the server perpetually awake without executing database queries or consuming Supabase connection limits.

### 4. Version Control & CI/CD
The project is version-controlled via Git, utilizing `.gitignore` policies to exclude `node_modules`, Python environments (`__pycache__`, `venv`), and `.env` files. The `main` branch acts as the single source of truth for automated cloud deployments.

## UI Branding & Theming Guidelines
The UI strictly adheres to the "Nahui Nature" corporate brand guidelines, implemented via Tailwind v4 CSS configuration:
- **Primary Typography:** Calistoga (Slab Serif) - Reserved for main branding and high-impact POS headers.
- **Accent Typography:** Satisfy (Brush Script) - Deployed for organic brand contrast.
- **Base Typography:** System Grotesque - Mapped for modern readability on catalog metadata and numerical data.
- **Corporate Color Palette:** 
  - Background Neutral: `#F8F6EF`
  - Primary Earth Green: `#5B8A3C`
  - Interactive Dark Green: `#42662C`
  - Warm Earth Brown: `#7B502B`

## Frontend Architecture & Offline Support (React)

The frontend employs a mobile-first, zero-friction interface engineered specifically to prevent click-fatigue during high-volume B2B route sales.

### State & Storage Management
- **Progressive Web App (PWA) Layer:** Utilizes `vite-plugin-pwa` to auto-generate and register a Service Worker (`registerSW`). This layer intercepts standard HTTP requests, caching the compiled application shell for complete offline functionality.
- **Local Database (IndexedDB/Dexie.js v4):** Provisions an internal browser database (`NahuiNaturePOS`) supporting expanded entities:
  - `products`: Local catalog caching.
  - `clients`: Offline client directory mirroring the backend.
  - `routes`: Dynamic delivery zones array.
  - `sync_queue`: Temporal staging table for offline transaction payloads.
  - `sync_clients_queue`: Temporal staging table for newly registered offline clients.

### UI/UX Rules Engine (POS Catalog)
- **Category-First Navigation:** The main viewport suppresses individual SKUs, presenting exclusively high-level Category Cover Cards.
- **Centralized Modal Architecture:** Interacting with a category mounts a centralized, focus-trapping modal pop-up. Inside the modal, the `reduce` algorithm dynamically groups flavor variants by `weight_g` into independent accordions.
- **Robust Type Coercion Engine:** The categorization logic implements loose equality operators (`==`) to safely map Supabase structural integers (`int4`) to JavaScript string representations, guaranteeing bulletproof UI rendering of product variants across strict typing boundaries.
- **Dynamic Category Accent Lines:** The system intercepts database product categories to programmatically render a top-border 6px accent line across cards and left-border accents on cart items via corporate hex mapping (Obleas: `#8A6B4E`, Chocohojuelas: `#3B2216`, Chips: `#5B8A3C`, Nubes de Maíz: `#F3D36B`, Lentejas: `#953431`, Platanitos: `#E4B647`, Cecina/Carne: `#2B1010`).
- **Flavor-Specific Floating Badges:** SKU variants render a single floating badge mapping the flavor name to its physical packaging color matrix (e.g., `#ffce33` for Queso, `#bc584b` for Fuego). Single-variant products automatically suppress this component.
- **Dynamic Action Controls:** Action buttons dynamically mutate into inline increment/decrement controllers (`[ - | qty | + ]`) based on the SKU's active presence in the cart array, augmented with a direct `<input type="number">` field triggering the native mobile numeric keypad.
- **True Offline Visual Resilience:** Completely eliminates third-party image placeholder dependencies (like placehold.co). Broken offline images dynamically default to CSS-based fallback cards matching the category's corporate hex code with the SKU's initials.
- **Pixel-Perfect Alignment:** Utilizes Tailwind's `leading-none` and precise micro-margins (`mt-[1px]`) to ensure optical center alignment between typography and SVG iconography.

### UI/UX Rules Engine (Client Logistics)
- **Intelligent Client Directory:** The initial view groups clients strictly by their geographical `location` via `reduce()`, presenting collapsible accordions that prevent cognitive overload.
- **Native Deep Linking:** Client cards leverage professional SVG iconography natively hooked to mobile protocols (`tel:` and `https://wa.me/`) for instant direct calling and WhatsApp messaging.
- **Hybrid GPS Form:** The Client Onboarding form features a dual-input geolocation system. Users can tap a button to extract precise satellite GPS coordinates in the field, or manually override the `latitude` and `longitude` fields if inputting data from an administrative desktop.
- **Smart Combobox (`<datalist>`):** The route assignment field utilizes native HTML5 datalists to provide auto-complete functionality from the downloaded `routes` table, while allowing free-text creation of new routes.

### Store-and-Forward Transaction Lifecycle
- **Adaptive Checkout Routing:** The POS engine utilizes Cryptographic UUIDs (`crypto.randomUUID()`) natively on the client for both orders, order items, and new client IDs. If an Axios `POST` request to FastAPI throws a network exception, the catch block routes the payload to the respective local `sync_queue` table.
- **Parallel Background Synchronization:** An asynchronous polling routine (`syncOfflineData`) resolves the `sync_clients_queue` prior to the `sync_queue` to ensure referential integrity (an order cannot be synced if its offline-created client hasn't been recognized by the server yet). It flushes transactions to PostgreSQL via FastAPI, purging the local IndexedDB records upon verifying a `200 OK` response.

## API Integration (FastAPI Backend)

The React client interfaces with a decoupled Python RESTful API built on the FastAPI framework.

- **CORS Policies:** Cross-Origin Resource Sharing is strictly enforced via `CORSMiddleware`, granting access exclusively to the local development environment (`http://localhost:5173`) and the Vercel production domain.
- **Data Fetching (GET):** The client simultaneously consumes `/products`, `/clients`, and `/routes` via `Promise.all` to hydrate the global state and IndexedDB cache.
- **Transactional Writes (POST):** 
  - `/orders`: Strictly validates cross-origin JSON payloads, safely translating complex nested structures into database operations.
  - `/clients`: Inserts new field clients and executes a secondary `INSERT INTO routes ON CONFLICT DO NOTHING` to automatically register new delivery routes natively discovered by field workers.
- **Security & Performance:** PostgreSQL credentials are isolated via `.env` file abstraction. The API relies on `psycopg 3` configured with `dict_row` cursors to natively serialize relational database rows directly into JSON-compatible dictionaries, effectively bypassing heavy ORM bottlenecks.

## Database Schema (PostgreSQL)

- **`routes`:** Master lookup table containing active delivery zones (`id`, `name`).
- **`clients`:** Segmented logistics table isolating contact identity from geographic data (`id`, `name`, `phone_number`, `address`, `location`, `latitude`, `longitude`, `route_name`).
- **`products`:** Flat catalog structural table (`id`, `category`, `name`, `description`, `price`, `weight_g`, `image_url`).
- **`orders`:** Transaction header table linked via Foreign Key `client_id` (`id`, `client_id`, `total_amount`, `created_at`).
- **`order_items`:** Relational line-item table mapping `orders(id)` to `products(id)`, explicitly persisting static sales values (`unit_price`, `quantity`, `subtotal`) to preserve historical financial integrity.