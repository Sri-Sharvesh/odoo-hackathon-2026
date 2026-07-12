# odoo-hackathon-2026
Smart Transport operations platform developed for the Odoo Hackathon 2026
# 🚛 TransitOps - Smart Transport Operations Platform

> A modern fleet management platform built to digitize and streamline transport operations.

![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-Hackathon-blue)
![Platform](https://img.shields.io/badge/platform-Web-orange)

---

## 📖 Overview

TransitOps is a centralized fleet management platform designed to help logistics companies efficiently manage vehicles, drivers, trips, maintenance, fuel expenses, and operational analytics.

Traditional fleet management often relies on spreadsheets and manual logbooks, leading to scheduling conflicts, poor fleet utilization, missed maintenance, expired driver licenses, and inaccurate expense tracking.

TransitOps solves these problems through an intuitive web application with automation, validation, and real-time operational insights.

---

## ✨ Features

### 🔐 Authentication

- Secure Login
- Role-Based Access Control (RBAC)
- Protected Routes

---

### 🚚 Vehicle Management

- Register vehicles
- Update vehicle information
- Vehicle status tracking
- Capacity management
- Odometer tracking
- Acquisition cost tracking

Vehicle Statuses:

- Available
- On Trip
- In Shop
- Retired

---

### 👨‍✈️ Driver Management

- Driver registration
- License tracking
- Safety scores
- Driver availability
- License expiry monitoring

Driver Statuses

- Available
- On Trip
- Off Duty
- Suspended

---

### 🛣 Trip Management

Create and manage trips by selecting:

- Source
- Destination
- Driver
- Vehicle
- Cargo Weight
- Planned Distance

Trip Lifecycle

```
Draft
   ↓
Dispatched
   ↓
Completed

or

Cancelled
```

Automatic validations include:

- Vehicle availability
- Driver availability
- License validity
- Cargo capacity checks

---

### 🔧 Maintenance Management

- Create maintenance logs
- Automatically move vehicles to **In Shop**
- Prevent maintenance vehicles from being assigned
- Restore availability after maintenance completion

---

### ⛽ Fuel & Expense Tracking

Track

- Fuel logs
- Maintenance costs
- Toll expenses
- Operational costs

Automatically calculates

- Fuel Efficiency
- Vehicle Operational Cost
- Maintenance Cost

---

### 📊 Analytics Dashboard

Visual KPIs including

- Active Vehicles
- Available Vehicles
- Vehicles in Maintenance
- Active Trips
- Fleet Utilization
- Drivers On Duty
- Fuel Efficiency
- Vehicle ROI

Interactive charts provide operational insights for fleet managers.

---

### 🗺 GPS Tracking *(Bonus Feature)*

Integrated map support using **Leaflet.js** and **OpenStreetMap**.

Features

- Live vehicle location
- Route visualization
- ETA estimation
- Distance calculation
- Real-time trip tracking
- Current vehicle status on map

---

## ✅ Business Rules

TransitOps enforces business validations automatically.

- Registration numbers must be unique
- Expired licenses cannot be dispatched
- Suspended drivers cannot be assigned
- Vehicles in maintenance cannot be assigned
- Retired vehicles are unavailable
- Cargo cannot exceed vehicle capacity
- Drivers already on trip cannot be reassigned
- Vehicles already on trip cannot be reassigned

Status transitions happen automatically during dispatch, completion, cancellation, and maintenance.

---

## 🏗 System Architecture

```
                    Frontend (React)

                           │

          ┌────────────────┴───────────────┐
          │                                │

 Authentication                   Dashboard

          │                                │

 Vehicle Module          Driver Module

          │                                │

 Trip Management       Maintenance

          │                                │

 Fuel Logs            Expense Tracking

          │
          ▼

      Backend (Node.js + Express)

          │

       MongoDB Database

          │

   Leaflet + OpenStreetMap
```

---

## 🛠 Tech Stack

### Frontend

- React.js
- Tailwind CSS
- React Router
- Axios
- Leaflet.js
- Chart.js

### Backend

- Node.js
- Express.js
- JWT Authentication
- REST API

### Database

- MongoDB
- Mongoose

### Maps

- Leaflet.js
- OpenStreetMap
- OpenRouteService API

---

## 📂 Project Structure

```
TransitOps/

│
├── client/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   └── assets/
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── config/
│   └── utils/
│
├── database/
│
├── README.md
│
└── package.json
```

---

## 🚀 Getting Started

### Clone Repository

```bash
git clone https://github.com/yourusername/transitops.git
```

### Install Dependencies

Frontend

```bash
cd client
npm install
```

Backend

```bash
cd server
npm install
```

---

### Environment Variables

Create a `.env` file inside the server directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret_key
```

---

### Run Backend

```bash
npm run dev
```

---

### Run Frontend

```bash
npm start
```

---

## 📈 Future Improvements

- Driver Mobile App
- AI Route Optimization
- Fuel Consumption Prediction
- Predictive Maintenance
- GPS Geofencing
- QR-based Vehicle Inspection
- IoT Vehicle Integration
- Push Notifications
- SMS Alerts
- Email Reminders
- Offline Support

---

## 👥 User Roles

### Fleet Manager

- Manage vehicles
- Maintenance
- Dashboard
- Reports

### Dispatcher

- Create trips
- Assign drivers
- Monitor deliveries

### Safety Officer

- License monitoring
- Driver compliance
- Safety scores

### Financial Analyst

- Fuel costs
- Expenses
- ROI
- Reports

---

## 📸 Screenshots

> Add screenshots here after completing the project.

- Login
- Dashboard
- Vehicle Registry
- Driver Management
- Trip Dashboard
- Maintenance
- Analytics
- Live GPS Tracking

---

## 🤝 Contributors

Developed during an **8-hour Hackathon**.

- Your Name
- Team Member 2
- Team Member 3

---

## 📜 License

This project is licensed under the MIT License.

---

# ⭐ If you like this project, don't forget to star the repository!
