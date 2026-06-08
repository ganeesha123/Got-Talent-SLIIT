🎤 SLIIT's Got Talent — Smart Talent Voting & Analytics System
> A web-based talent voting and analytics platform built for SLIIT events, replacing manual scoring with a high-integrity digital system featuring real-time leaderboards and judge analytics.
---
📌 Project Info
Detail	Info
Project Name	Votify SLIIT 
Subject	ITPM – IT3040
Group	WD_59_2.2
University	Sri Lanka Institute of Information Technology (SLIIT)
---
👥 Team Members & Responsibilities
Name	Responsibility
Ayesha	Identity & Security — SLIIT email validation, JWT authentication, Bcrypt password hashing
Sammani	Contestant Lifecycle & Admin — Registration, category management, approval workflow
Vishwa	Live Voting Engine — Core voting logic, real-time sync using Socket.io
Dilmi	Judge Panel & Analytics — Weighted scoring, notification engine, audit report generation
---
🎯 Project Overview
VoxPop is a web-based ecosystem that replaces manual scoring and insecure voting with a high-integrity platform. It validates university emails, maintains audit trails, and surfaces real-time leaderboards and judge analytics to keep events transparent and engaging.
---
✨ Core Features
🔐 SLIIT Email Validation — Secure user onboarding with university email verification
📊 Real-time Leaderboards — Live vote tracking via WebSockets (Socket.io)
⚖️ Judge Portal — Weighted scoring system (40% public / 60% judge)
📋 Audit Reports — Reproducible result calculations for full transparency
🔔 Automated Notifications — Contestant status updates and event alerts
👤 Role-Based Access — Students, Contestants, Judges, and Admins
---
🎯 Aims & Objectives
Aim: Develop a web-based system to handle voting and scoring digitally, improving fairness and speed.
Objective	Description
Modern Stack	Use MERN (MongoDB, Express, React, Node) for reliability and scalability
Security	Secure registration and authentication with SLIIT email checks and JWT sessions
Transparency	Real-time vote tracking and reproducible result calculations for auditability
---
👥 Target Users
🎓 Students — Verified voters using SLIIT emails
🏆 Contestants — Register, monitor status and receive updates
👨‍⚖️ Judges — Submit scores via a secure Judge Portal
🛠️ Admins/Managers — Oversee events, approve entries and review audits
---
🛠️ Tech Stack
Layer	Technology
Frontend	React.js
Backend	Node.js + Express.js
Database	MongoDB
Real-time	Socket.io
Authentication	JWT + Bcrypt
Version Control	GitHub
---
🚀 Getting Started
Prerequisites
Node.js
MongoDB (local or Atlas)
npm
Installation
1. Clone the repo
```bash
git clone https://github.com/ganeesha123/SLIIT-s-Got-Talent.git
```
2. Setup Backend
```bash
cd server
npm install
```
Create a `.env` file in `/server`:
```
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_secret_key
```
```bash
npm start
```
3. Setup Web App
```bash
cd web-app
npm install
npm start
```
---
📄 License
This project was developed for academic purposes at SLIIT.
