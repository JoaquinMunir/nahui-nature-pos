# Nahui Nature - Route Sales mPOS

A Progressive Web Application (PWA) and Mobile Point of Sale (mPOS) designed for remote route sales operations in environments with limited or no internet connectivity. The system implements a robust Store-and-Forward architecture to ensure seamless logistics, data persistence, and zero-loss order reconciliation regardless of network availability.

## System Architecture
This project utilizes a decoupled, modern service architecture prepared for cloud deployment (CI/CD):
* **Frontend / Client:** React.js (Vite) + Tailwind CSS (v4) + Dexie.js (IndexedDB) + Vite PWA (Service Worker). Target Hosting: Vercel / Netlify.
* **Backend / API:** Python (FastAPI) for high-performance, asynchronous REST API services. Target Hosting: Render / Railway.
* **Database:** PostgreSQL (Supabase).

## Core Capabilities
* **Offline-First B2B Sales:** Full POS operation capability during network dead zones. Order generation, cryptographic ID mapping, and temporal state management are handled exclusively via IndexedDB.
* **Dual-Node Inventory Management (Strict Stock Lock):** Real-time isolation between Central Warehouse (central) and Mobile Van (mobile) inventories. The POS engine dynamically evaluates the active saleMode and implements a strict UI/UX stock lock that prevents overselling in both online and offline environments, ensuring exact physical reconciliation.
* **Route Session Lifecycle (Shift Auditing):** A state-machine implementation for tracking daily logistics ("On Road" mode). The system generates isolated shift containers, tracking start/end times and mapping accumulated sales via an internal "Cash Register" accumulator (shiftSales). It tracks operational costs in real-time (gas, tolls, supplies) and mathematically crosses sales against expenses to generate a fully automated End-of-Day reconciliation ticket, detailing net cash deliverables and physical vehicle inventory remainders.
* **Concurrent Bulk Procurement & Restocking:** A dedicated procurement module that enables administrators to execute mass-updates of the central inventory. Leveraging JavaScript's Promise.all, the system fires parallel asynchronous requests to the backend, updating dozens of SKU stock levels simultaneously without blocking the main thread. Features an integrated supplier directory for quick vendor communication via deep links.
* **Real-Time Sales Dashboard & Analytics:** Administrative view to track daily revenue and reconcile field transactions.
  * **Relational Hydration:** The frontend dynamically consumes cross-referenced logistics data (Client Names, Locations) mapped via an optimized LEFT JOIN and nested json_agg arrays on the backend, allowing zero-latency expansion of order contents without secondary network requests.
  * **Dynamic Revenue Filtering:** Implements a dual-engine in-memory filter (Text-based searching & YYYY-MM-DD Date mapping) that dynamically recalculates total accumulated revenue on the fly.
* **Automated & Controllable WhatsApp Ticketing:** Instant generation of digital receipts. The system compiles transaction details (client, itemized list, subtotals) into a URI-encoded text string and triggers a native deep link (wa.me). Includes a persistent, state-managed toggle mechanism (sendWhatsApp) bound to localStorage, allowing operators to suppress automatic ticketing during rapid transaction bursts or testing phases.
* **Offline Client Onboarding & GPS Capture:** Sales representatives can register new clients in the field without connectivity. The app uses the native HTML5 Geolocation API to capture precise satellite coordinates (Latitude/Longitude) offline.
* **Dynamic Route Management:** The system automatically learns and categorizes new delivery routes using a Smart Combobox and backend ON CONFLICT DO NOTHING SQL rules, completely eliminating hardcoded route management.
* **Background Synchronization & Auto-Healing:** Automated, silent state reconciliation with PostgreSQL upon network restoration. The sync queue is strictly ordered (Clients -> Orders -> Sessions) to maintain relational integrity, and implements native idempotency checks to discard invalid payloads (e.g., 400 Bad Request on over-drafted stock).
* **Progressive Web App (PWA) & Native Mobile Experience:** Installable client interface that caches the entire Application Shell. Implements strict viewport scaling prevention (user-scalable=no), portrait orientation locks, and deep OS integration via manifest.json.

## Environment Management & Deployment
The architecture strictly separates environment variables to isolate local development from production cloud environments.

### 1. Frontend Configuration (React/Vite)
The frontend utilizes a .env file at the root level to dynamically route HTTP requests (Axios).
* **Variable:** VITE_API_URL
* **Development:** Points to [http://127.0.0.1:8000](http://127.0.0.1:8000) for local testing.
* **Production:** Injected via Vercel/Netlify CI/CD pipeline to point to the live FastAPI cloud URL.

**Run Modes:**
* `npm run dev`: Bypasses Service Worker caching to allow immediate Hot Module Replacement visibility.
* `npm run build`: Compiles static assets and generates the final physical Service Worker (sw.js).
* `npm run preview`: Serves the compiled production build locally to test true offline PWA behavior.

### 2. Backend Configuration (Python/FastAPI)
* Navigate to the backend directory: `cd backend`
* Activate the virtual environment: `.\venv\Scripts\activate`
* Install dependencies: `pip install -r requirements.txt`
* Initialize the local development server: `uvicorn main:app --reload`
* **Variable:** DATABASE_URL (Isolated in the backend .env).
* **Supabase Cloud Connection:** To ensure compatibility with IPv4 networks and cloud hosts like Render, the connection utilizes the Supabase Session Pooler (Port 6543). Passwords containing special reserved URI characters (+, &, |, !, ;) are strictly URL Encoded (e.g., %2B, %26, %7C) to prevent internal server routing timeouts.

### 3. Server Keep-Alive Strategy (Render Free Tier)
To prevent the FastAPI service from suspending after 15 minutes of inactivity, the API implements a dedicated Health Check endpoint (GET /health). This lightweight route is monitored by an external cron service (e.g., UptimeRobot) every 14 minutes.

## UI Branding & Theming Guidelines
The UI strictly adheres to the "Nahui Nature" corporate brand guidelines, implemented via Tailwind v4 CSS configuration:
* **Primary Typography:** Calistoga (Slab Serif) - Reserved for main branding and high-impact POS headers.
* **Accent Typography:** Satisfy (Brush Script) - Deployed for organic brand contrast.
* **Base Typography:** System Grotesque - Mapped for modern readability on catalog metadata and numerical data.
* **Corporate Color Palette:** Background Neutral (#F8F6EF), Primary Earth Green (#5B8A3C), Interactive Dark Green (#42662C), Warm Earth Brown (#7B502B).

## Frontend Architecture & Offline Support (React)
The frontend employs a mobile-first, zero-friction interface engineered specifically to prevent click-fatigue during high-volume B2B route sales.

### State & Storage Management
The application utilizes a two-tier local storage architecture to guarantee maximum resilience:
* **Local Database (IndexedDB/Dexie.js v5):** Provisions an internal browser database (NahuiNatureDB) supporting complex entity caching and sync staging:
  * `products`, `clients`, `routes`: Local catalog mirroring.
  * `central_inventory`, `mobile_inventory`: Dual-pocket stock tracking tables updated upon every successful transaction or background fetch.
  * `sync_queue`: Temporal staging table for offline transaction payloads.
  * `sync_clients_queue`: Temporal staging table for newly registered offline clients.
  * `sync_sessions_queue`: Temporal staging for completed End-of-Day shift reports.
* **Volatile Session Storage (localStorage):** Isolates operational shift metrics to ensure survival across browser reloads or crashes without polluting the structured database: isOnRoad, shiftStartTime, shiftSales, shiftOrderCount, routeExpenses, and preference toggles (sendWhatsApp).

### UI/UX Rules Engine (POS Catalog & Logistics)
* **Responsive Contextual Architecture:** The application dynamically alters its control surfaces based on device orientation (max-lg:landscape).
  * *Portrait/Desktop:* Navigation is anchored via a unified sticky top header spanning the full viewport.
  * *Landscape Mobile:* The system collapses the brand header and transitions navigation into an organic, transparent sidebar utilizing Floating Action Buttons (FAB) constructed with perfect circular geometry (rounded-full, w-12, h-12) and deep shadows (shadow-xl). Category catalog cards automatically compress into a dense 3-column 16:9 panoramic grid to eliminate excessive vertical scrolling during high-speed field operations.
* **Lexicographical Offline Hydration:** When falling back to Dexie.js during offline modes, raw ID-based fetch arrays are programmatically sorted in memory using JavaScript's localeCompare. This replicates the exact behavior of SQL ORDER BY category ASC, name ASC, ensuring zero UI degradation when transitioning offline.
* **Category-First Navigation:** The main viewport suppresses individual SKUs, presenting exclusively high-level Category Cover Cards.
* **Centralized Modal Architecture:** Interacting with a category mounts a centralized, focus-trapping modal pop-up. Inside the modal, the reduce algorithm dynamically groups flavor variants by weight_g into independent accordions.
* **Dynamic Action Controls & Badging:** Action buttons dynamically mutate into inline increment/decrement controllers based on the SKU's active presence in the cart array. Flavor-Specific Floating Badges render programmatically mapped color matrices (e.g., #ffce33 for Queso).
* **Logistics Interfacing:**
  * *Inventory Transfers:* A customized popup allowing precise numeric transfers from Central to Mobile.
  * *Expense Registration:* A fast-action numeric keypad modal for immediate logging of operational costs.
  * *End of Shift Report:* A comprehensive modal dynamically crossing local accumulators (shiftSales) against recorded expenses to present net cash deliverables alongside vehicle inventory return checklists.

### UI/UX Rules Engine (Client Logistics & Administration)
* **Intelligent Client Directory:** The initial view groups clients strictly by their geographical location via reduce(), presenting collapsible accordions that prevent cognitive overload.
* **Native Deep Linking:** Client cards leverage professional SVG iconography natively hooked to mobile protocols (tel: and [https://wa.me/](https://wa.me/)).
* **Hybrid GPS Form & Smart Combobox (`<datalist>`):** The Client Onboarding form features dual-input geolocation and auto-complete functionality from the downloaded routes table.

### Store-and-Forward Transaction Lifecycle
* **Offline Shift Accumulators:** To prevent timezone filtering anomalies and network race conditions, the checkout payload securely registers the financial value of every successful order (both online and offline) directly into a local "Cash Register" variable (shiftSales). This ensures that closing a route offline calculates revenue perfectly without depending on historical API calls.
* **Adaptive Checkout Routing:** The POS engine utilizes Cryptographic UUIDs (crypto.randomUUID()) natively on the client. If an Axios POST request throws a network exception, the payload is routed to the local sync_queue table while simultaneously updating local Inventory tables (db.central_inventory / db.mobile_inventory) to maintain the stock-lock active.
* **Strict Execution Hierarchy in Background Schedulers:** The asynchronous polling routine (syncOfflineData) resolves queues sequentially: sync_clients_queue -> sync_queue -> sync_sessions_queue. This prevents referential integrity violations (e.g., syncing an order before its offline-created client exists, or syncing a session before its offline orders are processed).

## API Integration (FastAPI Backend)
The React client interfaces with a decoupled Python RESTful API built on the FastAPI framework.
* **CORS Policies:** Cross-Origin Resource Sharing is strictly enforced via CORSMiddleware.
* **Data Fetching (GET):**
  * The client simultaneously consumes /products, /clients, and /routes to hydrate the global state.
  * /inventory/central and /inventory/mobile are fetched constantly to validate current physical stock.
  * /sessions fetches historical analytics arrays for administrative dashboard reporting.
* **Transactional Writes (POST):**
  * `/orders`: Safely translates complex nested structures into database operations. Includes order items generation.
  * `/clients`: Inserts new field clients and executes ON CONFLICT DO NOTHING SQL rules for route discoveries.
  * `/inventory/transfer`: Executes cross-node atomic updates (e.g., deducting from central and adding to mobile inside a single ACID-compliant commit).
  * `/inventory/add`: Mass procurement handler resolving bulk inventory injections.
  * `/sessions`: Safe-commits entire shift containers (Revenue, Counts, and Expenses arrays) mapping via Foreign Keys. Incorporates an Idempotency Shield (SELECT id FROM route_sessions WHERE id = %s) to prevent duplicate reconciliation blocks.

## Database Schema (PostgreSQL)
* **routes:** Master lookup table containing active delivery zones (id, name).
* **clients:** Segmented logistics table isolating contact identity from geographic data (id, name, phone_number, address, location, latitude, longitude, route_name).
* **products:** Flat catalog structural table (id, category, name, price, weight_g, image_url).
* **inventory:** Tracks item quantities across defined location nodes (Central vs Mobile).
* **orders:** Transaction header table linked via Foreign Key client_id (id, client_id, total_amount, created_at).
* **order_items:** Relational line-item table mapping orders(id) to products(id), explicitly persisting static sales values (unit_price, quantity, subtotal).
* **route_sessions:** Aggregated End-of-Day shift analytics containing the core financials of a workflow block (id, start_time, end_time, total_sales, total_expenses, net_cash, order_count, created_at).
* **expenses:** Granular operational cost table enforcing referential integrity back to parent routes (id, session_id, concept, amount, created_at).
