# SLIIT's Got Talent - Project Structure

This repository contains the source code for the "SLIIT's Got Talent" voting system. The project is divided into four main components, each handled by a dedicated member.

## Project Organization

### 1. Server (Backend API) - `server/`
- **Responsibility:** User Authentication (Member 01), API Logic, Database Connectivity.
- **Tech Stack:** Node.js, Express, MongoDB.
- **Key Features:**
  - JWT/OTP Authentication.
  - Role-Based Access Control (RBAC).
  - RESTful APIs for all client applications.

### 2. Mobile App (Student Voting) - `mobile-app/`
- **Member:** Member 02 (You)
- **Responsibility:** Student Voting Interface.
- **Tech Stack:** React Native (Expo).
- **Key Features:**
  - QR Code/OTP Login.
  - Voting Engine.
  - Live Ranking Display.
  - Countdown Timer.
  - Contestant Profiles.

### 3. Contestant Portal - `contestant-portal/`
- **Member:** Member 03
- **Responsibility:** Contestant Registration & Status Tracking.
- **Tech Stack:** React (Vite).
- **Key Features:**
  - Registration Form (Video/Photo Upload).
  - Application Status Check (Pending/Approved/Rejected).

### 4. Admin Dashboard - `admin-dashboard/`
- **Member:** Member 03 & Member 04
- **Responsibility:** Admin Approval Workflow & Analytics.
- **Tech Stack:** React (Vite).
- **Key Features:**
  - **Member 03:** Admin Approval System (Review Applications).
  - **Member 04:** Real-Time Visualization, Leaderboard, Audit Logging.

## Setup Instructions

1.  **Server:** Navigate to `server/`, duplicate `.env.example` to `.env`, and run `npm install`.
2.  **Clients:** Navigate to the respective folder (`mobile-app`, `admin-dashboard`, `contestant-portal`) and follow their specific README instructions.
