# ⛳ Golf Charity Subscription Platform

A modern subscription-based web platform that combines **golf performance tracking**, **monthly reward draws**, and **charity contributions** into one seamless experience.

> 🚀 Built as part of a Full-Stack Development selection assignment by Digital Heroes

---

## 📌 Overview

This platform allows users to:

- Subscribe (monthly/yearly)
- Track their latest golf scores (Stableford format)
- Participate in monthly prize draws
- Support charities through subscriptions

The product is designed to be **emotion-driven**, focusing on **impact, rewards, and engagement** rather than traditional golf aesthetics.

---

## 🎯 Core Features

### 💳 Subscription System
- Monthly & yearly plans
- Secure payment integration (Stripe or equivalent)
- Subscription lifecycle management (renewal, cancel, expire)
- Access control for non-subscribers

---

### ⛳ Score Management
- Enter last **5 golf scores**
- Score range: **1–45 (Stableford)**
- Each score includes a date
- Rolling logic:
  - Only latest 5 scores stored
  - New score replaces oldest automatically
- Displayed in reverse chronological order

---

### 🎰 Draw & Reward System
- Monthly draw execution
- Match tiers:
  - 5-number match
  - 4-number match
  - 3-number match

#### Draw Logic Options:
- Random (lottery-style)
- Algorithm-based (weighted by score frequency)

---

### 💰 Prize Pool Distribution

| Match Type | Share | Rollover |
|------------|------|----------|
| 5 Match    | 40%  | ✅ Yes   |
| 4 Match    | 35%  | ❌ No    |
| 3 Match    | 25%  | ❌ No    |

- Jackpot rolls over if no 5-match winner
- Equal distribution among winners

---

### ❤️ Charity System
- Select charity during signup
- Minimum contribution: **10%**
- Option to increase contribution
- Independent donation support

#### Features:
- Charity listing with search & filters
- Individual charity profiles
- Featured charity section

---

### 🏆 Winner Verification
- Upload proof (score screenshot)
- Admin approval/rejection
- Payment tracking:
  - Pending → Paid

---

## 👤 User Roles

### 🌐 Public Visitor
- View platform details
- Explore charities
- Understand draw system
- Subscribe

### 👤 Subscriber
- Manage profile
- Enter/edit scores
- Select charity
- View participation & winnings
- Upload winner proof

### 🛠️ Admin
- Manage users & subscriptions
- Configure and run draws
- Manage charities
- Verify winners
- View analytics & reports

---

## 📊 Dashboards

### 👤 User Dashboard
- Subscription status
- Score entry & history
- Charity selection
- Draw participation
- Winnings overview

### 🛠️ Admin Dashboard
- User management
- Draw configuration & simulation
- Charity management
- Winner verification
- Reports & analytics

---

## 🧠 Tech Stack (Suggested)

- **Frontend:** React / Next.js
- **Backend:** Node.js / API Routes
- **Database:** Supabase (PostgreSQL)
- **Authentication:** JWT / Supabase Auth
- **Payments:** Stripe
- **Deployment:** Vercel

---

## ⚙️ Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/golf-charity-platform.git
cd golf-charity-platform
