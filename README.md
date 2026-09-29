# 🥗☁️ Cloud-Based Diet Planner

A modern **Cloud-Based Diet Planner** built using **React.js and Firebase** that helps users create personalized meal plans, track food intake, monitor calories, and manage their diet information through a cloud-based platform.

The project demonstrates practical implementation of **Cloud Computing, Firebase Authentication, Cloud Firestore, CRUD operations, personalized dashboards, and responsive web development**.

> **Note:** This project is designed for educational and portfolio purposes. It is not a medical or clinical nutrition system and should not be treated as professional medical advice.

---

# 📌 Project Overview

Planning daily meals and tracking nutrition manually can be difficult. Users may struggle to organize meals, remember their dietary goals, and maintain consistent records.

The **Cloud-Based Diet Planner** provides a centralized application where users can:

* 👤 Create and manage their account
* 🎯 Set personal diet goals
* 🍽️ Create meal plans
* 🥗 Track meals and food intake
* 🔥 Monitor calories
* 📊 Track progress
* ☁️ Store diet information in the cloud

The application uses **Firebase Authentication** for user authentication and **Cloud Firestore** for storing user-specific diet data.

---

# ✨ Features

## 🔐 User Authentication

Users can:

* Register an account
* Login
* Logout
* Access a personalized dashboard
* Manage their own diet information

Authentication is handled using **Firebase Authentication**.

---

# 🎯 Personal Diet Goals

Users can select or define goals such as:

* ⚖️ Weight Loss
* 💪 Weight Gain
* 🧘 Maintenance
* 🥗 Healthy Eating

The selected goal can be used to personalize the user's meal-planning experience.

---

# 👤 Personal Profile

Users can provide information such as:

```text
Name
Age
Height
Weight
Diet Goal
Activity Level
Diet Preference
```

Example:

```text
Name: User
Age: 21
Height: 165 cm
Weight: 60 kg
Goal: Maintenance
Activity: Moderate
Diet: Vegetarian
```

---

# 🍽️ Meal Planning

Users can organize meals for different times of the day.

Example:

```text
🌅 Breakfast
Oatmeal + Banana
Calories: 350 kcal

☀️ Lunch
Rice + Dal + Salad
Calories: 550 kcal

🌆 Snack
Fruit + Yogurt
Calories: 200 kcal

🌙 Dinner
Vegetable Roti + Paneer
Calories: 450 kcal
```

Meal categories can include:

* Breakfast
* Lunch
* Dinner
* Snacks

---

# 🔥 Calorie Tracking

The application can track estimated calories associated with meals.

Example:

```text
Daily Calorie Summary

Breakfast     350 kcal
Lunch         550 kcal
Snack         200 kcal
Dinner        450 kcal
-----------------------
Total        1550 kcal
```

The calorie values are intended for general tracking and educational use.

---

# 🥗 Diet Preferences

Users can specify dietary preferences such as:

* Vegetarian
* Non-Vegetarian
* Vegan
* Eggetarian
* Custom preferences

This information can be used to organize a more personalized meal plan.

---

# 📊 Progress Tracking

Users can track information such as:

* Current weight
* Target weight
* Calories consumed
* Meal completion
* Daily progress

Example:

```text
Current Weight: 65 kg
Target Weight: 60 kg

Progress: ███████░░░ 70%
```

---

# 📅 Daily Meal Planner

The application can organize meals according to specific dates.

Example:

```text
Monday
├── Breakfast
├── Lunch
├── Snack
└── Dinner

Tuesday
├── Breakfast
├── Lunch
├── Snack
└── Dinner
```

This makes it easier to manage meal plans throughout the week.

---

# ☁️ Cloud Data Management

Diet information is stored using **Cloud Firestore**.

The database can contain:

* User profiles
* Diet goals
* Meal plans
* Food records
* Calorie information
* Progress records

Data remains available across sessions for authenticated users.

---

# 📱 Responsive Interface

The application is designed for:

* 💻 Desktop
* 💻 Laptop
* 📱 Mobile
* 📱 Tablet

---

# 🛠️ Technologies Used

| Technology              | Purpose                 |
| ----------------------- | ----------------------- |
| React.js                | Frontend development    |
| Vite                    | Development environment |
| JavaScript              | Application logic       |
| Firebase Authentication | User authentication     |
| Cloud Firestore         | Cloud database          |
| HTML5                   | Application structure   |
| CSS3                    | User interface          |
| Git                     | Version control         |
| GitHub                  | Repository hosting      |

---

# ☁️ Cloud Architecture

```text id="u6n8yw"
                         ┌──────────────────┐
                         │       User       │
                         │   Web Browser    │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   React + Vite   │
                         │    Frontend      │
                         └────────┬─────────┘
                                  │
                     ┌────────────┴────────────┐
                     │                         │
                     ▼                         ▼
            ┌─────────────────┐       ┌──────────────────┐
            │ Firebase Auth   │       │ Cloud Firestore  │
            │                 │       │                  │
            │ Login/Register  │       │ Profiles         │
            │ User Sessions   │       │ Meal Plans       │
            └─────────────────┘       │ Food Records     │
                                      │ Progress         │
                                      └──────────────────┘
```

---

# 📂 Project Structure

```text id="jzv0mh"
cloud-diet-planner/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── App.jsx
│   ├── App.css
│   ├── firebase.js
│   └── main.jsx
│
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

---

# ⚙️ Installation

## 1. Clone the Repository

```bash id="r4q1vs"
git clone https://github.com/YOUR-USERNAME/cloud-diet-planner.git
```

Navigate to the project:

```bash id="j1y8hs"
cd cloud-diet-planner
```

---

## 2. Install Dependencies

```bash id="z6pj5m"
npm install
```

---

## 3. Start Development Server

```bash id="g8a2yd"
npm run dev
```

The application will be available at a local URL similar to:

```text id="w0p6r9"
http://localhost:5173/
```

Open the URL in your browser.

---

# 🔥 Firebase Setup

## Step 1 — Create Firebase Project

Create a project using the Firebase Console.

Enable:

```text id="f8q5za"
Firebase Authentication
Cloud Firestore
```

Firebase Storage is **not required** for the basic project.

---

## Step 2 — Enable Authentication

Navigate to:

```text id="z3h0cr"
Firebase Console
        ↓
Authentication
        ↓
Sign-in method
        ↓
Email/Password
```

Enable **Email/Password** authentication.

---

## Step 3 — Create Firestore Database

Navigate to:

```text id="c4v5ps"
Firebase Console
        ↓
Firestore Database
        ↓
Create Database
```

Create the database.

---

## Step 4 — Register Web Application

Navigate to:

```text id="v4s3ap"
Project Settings
        ↓
Your Apps
        ↓
Web App
```

Register the React application.

Firebase provides configuration values such as:

```text id="r0d5q7"
apiKey
authDomain
projectId
storageBucket
messagingSenderId
appId
```

Add the required configuration values to:

```text id="m3d6qk"
src/firebase.js
```

---

# 🗄️ Firestore Database Structure

A possible database structure is:

## Users

```text id="e1c7hx"
users
 └── userId
      ├── name
      ├── email
      ├── age
      ├── height
      ├── weight
      ├── goal
      ├── activityLevel
      └── dietPreference
```

---

## Meals

```text id="g2r7f9"
meals
 └── mealId
      ├── userId
      ├── date
      ├── mealType
      ├── foodName
      ├── calories
      ├── protein
      ├── carbs
      └── fats
```

---

## Diet Plans

```text id="h8u3sj"
dietPlans
 └── planId
      ├── userId
      ├── date
      ├── breakfast
      ├── lunch
      ├── snack
      └── dinner
```

---

## Progress

```text id="p9y4kf"
progress
 └── progressId
      ├── userId
      ├── date
      ├── weight
      ├── caloriesConsumed
      └── notes
```

---

# 🔄 Application Workflow

```text id="q8p0i4"
                          START
                            │
                            ▼
                     Create Account
                            │
                            ▼
                          Login
                            │
                            ▼
                   Personal Dashboard
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
        Set Profile      Meal Plan      Track Progress
             │              │              │
             ▼              ▼              ▼
        Set Goal         Add Meals      Record Data
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                     Cloud Firestore
                            │
                            ▼
                     Updated Data
```

---

# 📊 Dashboard

The dashboard can display:

```text id="6e7f3m"
┌─────────────────────────────────────┐
│          DIET DASHBOARD             │
├─────────────────────────────────────┤
│                                     │
│  Daily Calories        1550 kcal    │
│  Meals Completed       3 / 4        │
│  Current Weight        60 kg        │
│  Goal                  Maintenance  │
│                                     │
│  Today's Meals                     │
│  ✓ Breakfast                       │
│  ✓ Lunch                           │
│  ✓ Snack                           │
│  ○ Dinner                          │
│                                     │
└─────────────────────────────────────┘
```

---

# 🎯 Learning Objectives

This project provides practical experience with:

* ☁️ Cloud Computing
* 🔥 Firebase
* 🔐 Firebase Authentication
* 🗄️ Cloud Firestore
* ⚛️ React.js
* 💻 JavaScript
* 🔄 CRUD operations
* 👤 User-specific cloud data
* 🍽️ Meal planning
* 📊 Data tracking
* 📱 Responsive web development
* 🔧 Git and GitHub

---

# 🔐 Security

Firebase Authentication is used to authenticate users.

Firestore Security Rules should be configured so users can access only the records associated with their authenticated account.

User records can be associated with:

```text id="e7o2z0"
userId = Firebase Authentication UID
```

For a real nutrition product, additional privacy, security, validation, and professional dietary-review requirements would be necessary.

---

# 🚀 Future Enhancements

The project can be expanded with:

* 🤖 AI-powered meal recommendations
* 📊 Nutrition analytics
* 🔔 Meal reminders
* 💧 Water intake tracking
* 🏃 Exercise tracking
* 📈 Weight progress charts
* 🥗 Food database integration
* 🔎 Food search
* 📅 Weekly/monthly reports
* 📱 PWA support
* 🌐 Firebase Hosting
* 🧮 Macro tracking
* 📝 Custom meal creation

---

# 🤖 Future AI Integration

A future version could use AI to generate meal suggestions based on user-provided preferences and goals.

```text id="w6h8t3"
User Profile
     │
     ▼
Diet Goal + Preferences
     │
     ▼
AI Recommendation Engine
     │
     ▼
Personalized Meal Suggestions
     │
     ▼
React Dashboard
```

AI-generated recommendations should be treated as general informational suggestions rather than medical or clinical nutrition advice.

---

# 📸 Screenshots

Recommended screenshots:

<img width="1366" height="768" alt="Screenshot 2026-09-29 193725" src="https://github.com/user-attachments/assets/ffe8017c-9fde-484f-9819-d8cbfa10df48" />
<img width="1366" height="768" alt="Screenshot 2026-09-29 193751" src="https://github.com/user-attachments/assets/a141a039-6bc7-43b3-8b15-5a0b327dd837" />
<img width="1366" height="768" alt="Screenshot 2026-09-29 193910" src="https://github.com/user-attachments/assets/9d72bf5e-fbd2-4bd2-a2a9-4e509143496c" />
<img width="1366" height="768" alt="Screenshot 2026-09-29 194205" src="https://github.com/user-attachments/assets/4c9fdf7d-273e-4e09-bd23-d788c6f1ecbd" />
<img width="1366" height="768" alt="Screenshot 2026-09-29 194215" src="https://github.com/user-attachments/assets/a16e041b-5c42-4678-ad29-971144ace54d" />

Add them to the README:

```markdown id="r7v9k2"
![Login Page](screenshots/login.png)

![Diet Dashboard](screenshots/dashboard.png)

![Meal Planner](screenshots/meal-planner.png)

![Progress Tracking](screenshots/progress.png)
```

---

# 💻 Available Commands

Start development server:

```bash id="n8m1cx"
npm run dev
```

Build the application:

```bash id="a7r5pv"
npm run build
```

Preview the production build:

```bash id="q3f4md"
npm run preview
```

---

# 🌐 Deployment

The application can be deployed using:

* Firebase Hosting
* Vercel
* Netlify

---

# 👩‍💻 Author

**Your Name**

B.Tech — Electronics and Computer Engineering

GitHub:
`https://github.com/YOUR-USERNAME`

LinkedIn:
`https://linkedin.com/in/YOUR-PROFILE`

---

# ⭐ Project Highlights

```text id="s5g2b9"
🥗 Cloud-Based Diet Planning
☁️ Cloud Computing
🔐 Firebase Authentication
🗄️ Cloud Firestore
🍽️ Meal Planning
🔥 Calorie Tracking
📊 Progress Tracking
👤 Personalized Dashboard
⚛️ React.js
📱 Responsive UI
🤖 Future AI Integration
🚀 Deployment Ready
```

---

## 📄 License

This project is developed for **educational and portfolio purposes**.
