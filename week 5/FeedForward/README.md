# 🍱 Feed Forward — Full Stack Food Rescue Platform

> From Surplus to Service — connecting caterers with receivers through real-time food listings, live delivery tracking, push notifications, and subscription payments.

---

## 🚀 New Features Added

| Feature | Details |
|---|---|
| 🗺️ **Google Maps** | Location autocomplete, delivery route maps, live tracking, nearby caterer finder |
| 🔔 **Push Notifications** | Web Push (VAPID) — alerts for new food, expired listings, order updates |
| ⚡ **Real-Time Updates** | Socket.IO — live food expiry, new listings, order status without page refresh |
| ⏳ **Expiry Management** | Countdown timers, expiry bars, background thread auto-expires listings |
| 💳 **Razorpay Payments** | Replaces QR codes — Weekly/Monthly/Yearly plans with secure online checkout |
| 🚚 **Delivery Tracking** | Live delivery boy location sharing, route rendering, step-by-step status |
| 🧹 **UI/UX Overhaul** | New design system — Playfair Display + DM Sans, green/lime palette, glassmorphism |

---

## 📁 Project Structure

```
FeedForward/
├── app.py                    ← Main Flask app (all routes + Socket.IO)
├── requirements.txt          ← Updated dependencies
├── .env                      ← Secrets (never commit!)
├── .env.example              ← Template for env setup
├── static/
│   ├── sw.js                 ← Service Worker for push notifications
│   ├── css/
│   │   ├── style.css         ← Homepage styles
│   │   ├── about.css         ← About page styles
│   │   ├── login.css
│   │   └── signup.css
│   └── images/               ← Existing images preserved
└── templates/
    ├── index.html            ← Homepage
    ├── login.html            ← Redesigned login
    ├── signup.html           ← Redesigned signup with role cards
    ├── provider.html         ← Provider dashboard + map + listings
    ├── receiver.html         ← Food browser + real-time + order
    ├── delivery.html         ← Live delivery tracking map ← NEW
    ├── subscribe.html        ← Razorpay payment plans
    └── about.html            ← About page
```

---

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

#### Required Keys:

**Google Maps API** — [console.cloud.google.com](https://console.cloud.google.com)
- Enable: Maps JavaScript API, Places API, Directions API, Geocoding API
- Set `GOOGLE_MAPS_KEY=your_key`

**Razorpay** — [razorpay.com](https://razorpay.com) → Dashboard → Settings → API Keys
- Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- Use test keys (`rzp_test_...`) during development

**VAPID Keys** (for push notifications):
```bash
python -c "from pywebpush import Vapid; v=Vapid(); v.generate_keys(); print('Private:', v.private_key, '\nPublic:', v.public_key)"
```
Or generate at [vapidkeys.com](https://vapidkeys.com)

### 3. Run the App

```bash
python app.py
```

For production with gunicorn + eventlet (required for Socket.IO):
```bash
gunicorn --worker-class eventlet -w 1 app:app
```

---

## 🗃️ New Database Tables

These are **auto-created** on first run via `initialize_db()`:

| Table | Purpose |
|---|---|
| `users` | Extended with lat/lng, address, subscription info |
| `available_food` | Extended with lat/lng, expiry_time, is_expired |
| `orders` | New — tracks food orders with delivery status |
| `push_subscriptions` | Stores browser push subscription objects |
| `payments` | Razorpay order + payment IDs with status |

---

## 🔑 API Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/delivery` | Delivery tracking page |
| POST | `/receiver/order` | Place a food order |
| GET | `/api/nearby-caterers` | Get caterers sorted by distance |
| POST | `/api/update-location` | Save user's lat/lng |
| POST | `/api/update-delivery-location` | Update delivery boy position (real-time) |
| POST | `/api/update-order-status` | Update order status (provider) |
| POST | `/api/push-subscribe` | Register push subscription |
| GET | `/api/vapid-public-key` | Get VAPID public key |
| POST | `/api/create-order` | Create Razorpay payment order |
| POST | `/api/verify-payment` | Verify payment signature + activate sub |
| POST | `/provider/delete/<id>` | Remove a food listing |

---

## 💳 Subscription Plans

| Plan | Price | Duration |
|---|---|---|
| Weekly | ₹300 | 7 days |
| Monthly | ₹1,000 | 30 days |
| Yearly | ₹10,000 | 365 days |

Payments are verified server-side using HMAC-SHA256 signature matching (Razorpay standard).

---

## 🔧 Socket.IO Events

| Event | Direction | Payload |
|---|---|---|
| `new_food` | Server → All | `{id, food_name, mess_name, location}` |
| `food_expired` | Server → All | `{id, food_name}` |
| `food_removed` | Server → All | `{id}` |
| `order_placed` | Server → All | `{order_id, food_id}` |
| `order_status` | Server → All | `{order_id, status}` |
| `delivery_update` | Server → All | `{order_id, lat, lng}` |

---

## 📱 Push Notification Flow

1. Browser registers service worker (`/static/sw.js`)
2. User grants notification permission
3. Browser subscribes via `pushManager.subscribe()`
4. Subscription saved to DB via `/api/push-subscribe`
5. Server uses `pywebpush` to send notifications when:
   - New food is listed
   - Food expires
   - Order status changes
   - Payment is confirmed

---

## ⚠️ Notes

- The background expiry checker runs in a **daemon thread** every 60 seconds
- For production, consider replacing the thread with **Celery + Redis** for reliability
- Google Maps requires billing enabled (free tier covers most small apps)
- HTTPS is **required** for push notifications and geolocation in production
- Use `rzp_test_` keys during development; switch to `rzp_live_` for production

