# Loan Application System

## Introduction
The **Loan Application System** is a web application that enables users to apply for loans, view the status of their applications, compare loan options, and manage repayment schedules. Admin users can view all applications, approve or reject them, and monitor loan statistics. This project is built using **vanilla HTML, CSS (Tailwind), and JavaScript**, with Firebase handling authentication and database operations.

## Project Type
**Frontend**

## Deployed App
- **Frontend:** (https://loanapp7.netlify.app/)  

## Directory Structure
loan-application-system/ 

├─ frontend/ 
│ ├─ index.html │
 ├─ dashboard.html │ ├─ application-form.html │ ├─ calendar.html │ ├─ js/ │ │ ├─ auth.js │ │ ├─ dashboard.js │ │ ├─ firebase-config.js │ │ ├─ repayment.js │ ├─ css/ │ │ ├─ style.css │ ├─ assets/


## Features
- Firebase Email/Password Authentication
- Role-based dashboard (User vs Admin)
- Multi-step Loan Application Form
- Loan Status Tracking for Users
- EMI Calculator & Loan Comparison Tool
- Repayment Calendar View (Paid, Due, Overdue)
- Admin Approval and Rejection Functionality

## Design Decisions or Assumptions
- Firebase used to manage authentication and Firestore database.
- `users` collection in Firestore stores user roles (`user` or `admin`).
- Loan application data stored in `loanApplications` collection.
- Role-based routing handled on the frontend using session/auth state.
- No framework used — plain JavaScript and Tailwind CSS for simplicity and performance.

## Installation & Getting Started

# Clone the repo
git clone https://github.com/your-username/loan-application-system.git
cd loan-application-system/frontend

# Open index.html in your browser
💡 Make sure to configure your Firebase project and update firebase-config.js with your credentials.

# Workflow Example:
1. Open index.html
2. Sign up or login with Firebase credentials
3. Apply for a new loan
4. View status and repayment calendar
5. Admin logs in and manages applications
Screenshots

✅ User Dashboard

✅ Loan Form

✅ Application Status

✅ Admin Panel

✅ EMI Calculator

✅ Repayment Calendar

# Credentials

User: user@example.com | Password: 123456

Admin: admin@example.com | Password: admin123

APIs Used Firebase Authentication API

Firebase Firestore API

Firebase Collections (Firestore)
/users/{uid}: Contains user profile and role

/loanApplications/{loanId}: Contains all loan applications

Real-time updates and access control managed via Firestore rules

# Technology Stack

1. HTML

2. Tailwind CSS

3. JavaScript (Vanilla)

4. Firebase (Authentication + Firestore)
