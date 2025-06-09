# 💼 E-Commerce Sales Chatbot

An interactive AI-powered chatbot for an e-commerce platform, designed to assist users in product discovery and simulate the entire sales journey from search to purchase.

## 📌 Project Overview

This project demonstrates the development of a full-stack e-commerce chatbot system that enhances the user shopping experience. The chatbot interacts with users via a conversational UI and fetches product data using a Django-powered RESTful API from a mock database.

## 🎯 Objectives

* Enable intelligent product search and discovery via chatbot interface.
* Provide a responsive, engaging, and session-aware UI for desktop, tablet, and mobile.
* Implement authentication, product filtering, and chat history management.
* Simulate backend server with a mock inventory of 100+ products.

---

## ⚙️ Technology Stack

| Layer          | Technology                  |
| -------------- | --------------------------- |
| Frontend       | React.js, HTML5, CSS3       |
| Backend        | Django (REST Framework)     |
| Authentication | Django Rest Auth / JWT      |
| Database       | SQLite3 (for mock data)     |
| UI Libraries   | Tailwind CSS / Material UI  |
| State Mgmt     | Context API + Local Storage |
| Deployment     | (Optional) Vercel + Render  |

---

## 🔧 Features

### ✅ Frontend (React)

* Responsive chatbot UI with product card previews.
* Login/Signup flow with session handling.
* Persistent chat sessions (with timestamps).
* Reset conversation, explore products, and auto-scroll UX.
* Dark/Light Mode toggle (optional enhancement).

### ✅ Backend (Django)

* RESTful API endpoints for:

  * Authentication (`/api/auth/`)
  * Product search and retrieval (`/api/products/`)
  * Chat logging (`/api/chats/`)
* Mock e-commerce inventory with 100+ records.
* Modular structure with serializers, viewsets, and pagination.

---

## 📁 Project Structure

```
ecommerce-chatbot/
├── backend/
│   ├── chatbot_api/
│   ├── products/
│   ├── users/
│   └── db.sqlite3
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js
├── README.md
```

---

## 🚀 Getting Started

### 🛠 Backend (Django)

```bash
cd backend/
python -m venv env
source env/bin/activate  # Windows: env\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py loaddata mock_products.json
python manage.py runserver
```

### 🌐 Frontend (React)

```bash
cd frontend/
npm install
npm start
```

---

## 📌 Sample API Endpoints

* `GET /api/products/?search=phone` – Search for products
* `POST /api/auth/login/` – Authenticate user
* `POST /api/chats/` – Log chatbot interaction
* `GET /api/chats/?user_id=1` – Get previous chats for user

---

## 🧐 Design Decisions

* **Django** was selected for its scalability, built-in admin interface, and robust API development via Django REST Framework.
* **React** offers component-driven architecture and flexibility for chatbot UI rendering.
* **SQLite3** serves well for mock data and rapid prototyping.
* Modular separation ensures maintainability and fault tolerance.

---

## ⚠️ Challenges & Solutions

| Challenge                        | Solution                                                              |
| -------------------------------- | --------------------------------------------------------------------- |
| Real-time session tracking       | Used `localStorage` with React Context API to persist session states. |
| Efficient product filtering      | Backend-level filtering with query params and pagination.             |
| Chat history management          | Logged all interactions in DB via Django models.                      |
| Responsive design on all devices | Used Tailwind/MUI and tested layout with dev tools.                   |

---

## 📊 Future Improvements

* Integrate NLP models for more intelligent search.
* Add payment gateway simulation.
* Integrate real product APIs for live data.
* Deploy backend on Render and frontend on Vercel.

---

## 📄 Documentation

* Detailed in `/docs` folder (if present).
* Includes:

  * System architecture diagram
  * API documentation (Swagger/Postman optional)
  * Mock data generation scripts

---
