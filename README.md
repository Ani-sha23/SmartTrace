# SmartTrace — AI-Powered Lost & Found System

**Live Demo:** https://smarttrace-pi.vercel.app/

---

## Overview

**SmartTrace** is an AI-powered lost & found platform that uses **deep learning-based visual similarity matching** to help users recover lost items efficiently.

Instead of manual searching, SmartTrace leverages **CNN embeddings + cosine similarity** to match lost and found items with high accuracy.

---

## Key Features

* **AI-Based Matching**
  Upload an image → get similar items using deep learning

* **Interactive Dashboard**
  Real-time analytics of lost, found, and matched items

* **Lost & Found Reporting**
  Submit and track items easily

* **Fast Retrieval System**
  Uses ANN (Approximate Nearest Neighbor) for fast matching

* **Smart Notifications**
  Alerts for high-confidence matches

* **Security & Privacy Focused**
  Embeddings instead of raw image storage

---

## How It Works

1. User uploads an image of lost item
2. CNN (ResNet-50) extracts feature embeddings
3. Cosine similarity compares with database
4. Ranked results returned with confidence score

---

## Tech Stack

### Frontend

* React (Vite)
* Custom UI (Glassmorphism)
* Data Visualization

### Backend

* FastAPI
* REST APIs

### AI / ML

* Deep Learning (CNN)
* Cosine Similarity
* ANN (FAISS-style retrieval)

### Deployment

* Vercel (Frontend)
* (Planned) Render / Railway (Backend)

---

## Project Structure

```
SmartTrace/
 ├── smarttrace/        # Frontend (React + Vite)
 │    ├── src/
 │    ├── public/
 │    ├── index.html
 │
 ├── backend/           # FastAPI backend
 │    ├── main.py
 │
 ├── README.md
```

---

## Installation & Setup

### Clone the repository

```bash
git clone https://github.com/Ani-sha23/SmartTrace.git
cd SmartTrace
```

---

### Frontend Setup

```bash
cd smarttrace
npm install
npm run dev
```

---

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## Screenshots (Optional)

<img width="1919" height="1074" alt="image" src="https://github.com/user-attachments/assets/45d51506-168b-422d-aa99-67ad0c08a30d" />

---

## Future Improvements

* Full backend deployment (Render)
* Database integration (MongoDB / Firebase)
* Real AI model integration (currently mocked)
* Mobile responsiveness improvements
* User authentication system

---

## Author

**Anisha**
GitHub: https://github.com/Ani-sha23

---

## Show your support

If you like this project:

* Star the repo
* Fork it
* Share it

---

## License

This project is for educational purposes.





<img width="1918" height="1069" alt="image" src="https://github.com/user-attachments/assets/0bf4ed50-ad8a-45bb-83f2-c9b5910c0823" />
