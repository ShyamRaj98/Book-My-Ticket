# Movie Ticket Booking System

A full-stack **MERN** application for managing movies, showtimes, bookings, and admin reports — built with **React, Node.js, Express, and MongoDB**.

---

## 🔔 Stripe Webhook (Production)
- To handle live payments and send tickets via email, make sure to run the Stripe webhook listener in PowerShell:
```bash
stripe listen --forward-to https://your-backend-domain.com/api/webhooks/stripe
```

## Features
### 👤 User Features

- Register and login using JWT authentication
- Browse movies and available showtimes
- Book movie tickets with seat selection
- Pay using Stripe integration (Card/UPI)
- Payment success mail send pdf
- View booking history
- Edit user profile (name and phone)

### 🧑‍💼 Admin Features

- Register ADMIN SECRET KEY = "ADMIN@123"
- Register and login using JWT authentication
- Add, edit, delete movies and showtimes
- View all bookings
- Generate sales and occupancy reports
- Dashboard analytics and charts

### 🧑 Theater Admin Features

- Create & manage your own theaters after login
- Add screens and assign custom seat layouts
- Create showtimes only for your theaters
- Manage movies available to your theater
- View theater-wise reports (bookings, revenue, occupancy)
- Full CRUD for screens, layouts, and theater showtimes

---

## Tech Stack

| Area           | Technology                              |
| -------------- | --------------------------------------- |
| Frontend       | React.js + Redux Toolkit + Tailwind CSS |
| Backend        | Node.js + Express.js                    |
| Database       | MongoDB + Mongoose                      |
| Authentication | JWT (JSON Web Token)                    |
| Payments       | Stripe API                              |
| Charts         | Charts.js                               |
| Reports        | MongoDB Aggregation + Mongoose Models   |

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/ShyamRaj98/Book-My-Ticket.git
cd Book-My-Ticket
```
