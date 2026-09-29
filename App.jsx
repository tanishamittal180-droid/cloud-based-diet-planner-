import { useEffect, useMemo, useState } from "react";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "./firebase";

import "./App.css";


const initialProfile = {
  name: "",
  age: "",
  sex: "female",
  height: "",
  weight: "",
  activity: "moderate",
  diet: "vegetarian",
  goal: "balanced",
  allergies: "",
  cuisine: "Indian",
  budget: "medium",
};


const foodPlans = {
  vegetarian: {
    breakfast: [
      "Vegetable oats with curd",
      "Paneer vegetable sandwich",
      "Vegetable poha with curd",
      "Moong dal chilla with mint chutney",
      "Vegetable upma with fruit",
    ],
    lunch: [
      "Dal, roti, mixed vegetables and salad",
      "Rajma rice with cucumber salad",
      "Paneer bhurji, roti and salad",
      "Chole, roti and mixed vegetables",
      "Dal khichdi with curd and salad",
    ],
    snack: [
      "Apple with roasted peanuts",
      "Roasted makhana",
      "Fruit bowl with curd",
      "Roasted chana",
      "Banana with a small handful of nuts",
    ],
    dinner: [
      "Paneer tikka with vegetables",
      "Dal soup with roti and salad",
      "Vegetable pulao with curd",
      "Mixed vegetable curry with roti",
      "Moong dal khichdi with vegetables",
    ],
  },

  vegan: {
    breakfast: [
      "Oats with banana and seeds",
      "Vegetable poha with fruit",
      "Besan chilla with vegetables",
      "Tofu vegetable sandwich",
      "Peanut banana oats",
    ],
    lunch: [
      "Rajma rice with salad",
      "Chole with roti and vegetables",
      "Dal rice with cucumber salad",
      "Tofu vegetable bowl",
      "Mixed bean rice bowl",
    ],
    snack: [
      "Fruit with roasted peanuts",
      "Roasted chana",
      "Makhana",
      "Banana with peanut butter",
      "Seasonal fruit bowl",
    ],
    dinner: [
      "Tofu stir fry with vegetables",
      "Dal with roti and salad",
      "Vegetable khichdi",
      "Chickpea vegetable bowl",
      "Mixed vegetable curry with roti",
    ],
  },

  nonveg: {
    breakfast: [
      "Vegetable omelette with toast",
      "Egg bhurji with roti",
      "Oats with boiled eggs",
      "Egg sandwich with fruit",
      "Masala omelette with vegetables",
    ],
    lunch: [
      "Chicken curry with roti and salad",
      "Chicken rice bowl with vegetables",
      "Egg curry with roti and salad",
      "Grilled chicken with rice and vegetables",
      "Chicken pulao with cucumber salad",
    ],
    snack: [
      "Fruit with roasted peanuts",
      "Boiled eggs with fruit",
      "Roasted chana",
      "Curd with fruit",
      "Banana with nuts",
    ],
    dinner: [
      "Grilled chicken with vegetables",
      "Egg curry with roti",
      "Chicken soup with vegetables",
      "Chicken stir fry with rice",
      "Egg bhurji with roti and salad",
    ],
  },
};


function calculateCalories(profile) {
  const weight = Number(profile.weight);
  const height = Number(profile.height);
  const age = Number(profile.age);

  if (!weight || !height || !age) {
    return 2000;
  }

  const sexAdjustment = profile.sex === "male" ? 5 : -161;

  const bmr =
    10 * weight +
    6.25 * height -
    5 * age +
    sexAdjustment;

  const activityFactors = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
  };

  const tdee =
    bmr *
    (activityFactors[profile.activity] || 1.55);

  let calories = tdee;

  if (profile.goal === "weight-loss") {
    calories = tdee * 0.85;
  }

  if (profile.goal === "fitness") {
    calories = tdee * 1.05;
  }

  return Math.round(calories);
}


function calculateMacros(calories) {
  return {
    protein: Math.round((calories * 0.3) / 4),
    carbs: Math.round((calories * 0.4) / 4),
    fats: Math.round((calories * 0.3) / 9),
  };
}


function generatePlan(profile) {
  const diet = foodPlans[profile.diet] || foodPlans.vegetarian;

  const calories = calculateCalories(profile);
  const macros = calculateMacros(calories);

  const randomItem = (items) =>
    items[Math.floor(Math.random() * items.length)];

  return {
    breakfast: randomItem(diet.breakfast),
    lunch: randomItem(diet.lunch),
    snack: randomItem(diet.snack),
    dinner: randomItem(diet.dinner),
    calories,
    macros,
    hydration: "Aim to stay hydrated throughout the day.",
    generatedFor: profile.goal,
    dietPreference: profile.diet,
    educationalNote:
      "This is a general wellness example generated for educational purposes and is not medical or clinical nutrition advice.",
  };
}


function formatDate(value) {
  if (!value) return "Unknown date";

  if (value?.toDate) {
    return value.toDate().toLocaleString();
  }

  return new Date(value).toLocaleString();
}


function App() {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [authMode, setAuthMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [authError, setAuthError] = useState("");
  const [success, setSuccess] = useState("");

  const [activePage, setActivePage] = useState("dashboard");

  const [profile, setProfile] = useState(initialProfile);

  const [plans, setPlans] = useState([]);

  const [latestPlan, setLatestPlan] = useState(null);

  const [intake, setIntake] = useState({
    breakfast: false,
    lunch: false,
    snack: false,
    dinner: false,
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [showPlan, setShowPlan] = useState(false);

  const [intakeItems, setIntakeItems] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  useEffect(() => {
    if (!user) {
      setProfile(initialProfile);
      setPlans([]);
      setLatestPlan(null);
      return;
    }

    const profileRef = doc(
      db,
      "users",
      user.uid,
      "profile",
      "main"
    );

    const unsubscribeProfile = onSnapshot(
      profileRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setProfile({
            ...initialProfile,
            ...snapshot.data(),
          });
        }
      },
      (error) => {
        console.error(error);
      }
    );

    const plansQuery = query(
      collection(
        db,
        "users",
        user.uid,
        "plans"
      ),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsubscribePlans = onSnapshot(
      plansQuery,
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setPlans(data);

        if (data.length > 0) {
          setLatestPlan(data[0]);
        }
      },
      (error) => {
        console.error(error);
      }
    );

    return () => {
      unsubscribeProfile();
      unsubscribePlans();
    };
  }, [user]);


  useEffect(() => {
    if (!user) return;

    const today = new Date()
      .toISOString()
      .split("T")[0];

    const intakeRef = doc(
      db,
      "users",
      user.uid,
      "intake",
      today
    );

    const unsubscribe = onSnapshot(
      intakeRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();

          setIntake({
            breakfast: data.breakfast || false,
            lunch: data.lunch || false,
            snack: data.snack || false,
            dinner: data.dinner || false,
          });
        }
      }
    );

    return () => unsubscribe();
  }, [user]);


  const completedMeals = useMemo(() => {
    return Object.values(intake).filter(Boolean).length;
  }, [intake]);


  async function handleAuth(event) {
    event.preventDefault();

    setAuthError("");
    setSuccess("");

    if (!email || !password) {
      setAuthError(
        "Please enter both email and password."
      );
      return;
    }

    if (password.length < 6) {
      setAuthError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    try {
      if (authMode === "register") {
        const result =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

        await setDoc(
          doc(
            db,
            "users",
            result.user.uid,
            "profile",
            "main"
          ),
          {
            ...initialProfile,
            email: result.user.email,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }
        );

        setSuccess(
          "Account created successfully!"
        );
      } else {
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        setSuccess("Login successful!");
      }
    } catch (error) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        setAuthError(
          "This email is already registered. Please login."
        );
      } else if (
        error.code === "auth/invalid-credential"
      ) {
        setAuthError(
          "Invalid email or password."
        );
      } else if (
        error.code === "auth/weak-password"
      ) {
        setAuthError(
          "Password is too weak."
        );
      } else if (
        error.code === "auth/invalid-email"
      ) {
        setAuthError(
          "Please enter a valid email."
        );
      } else {
        setAuthError(
          error.message || "Authentication failed."
        );
      }
    }
  }


  async function handleLogout() {
    await signOut(auth);

    setActivePage("dashboard");
    setShowPlan(false);
    setSuccess("");
  }


  function updateProfile(field, value) {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  }


  async function saveProfile() {
    setSuccess("");
    setAuthError("");

    if (!profile.name.trim()) {
      setAuthError("Please enter your name.");
      return;
    }

    if (
      Number(profile.age) < 13 ||
      Number(profile.age) > 100
    ) {
      setAuthError(
        "Please enter an age between 13 and 100."
      );
      return;
    }

    if (
      Number(profile.height) < 100 ||
      Number(profile.height) > 250
    ) {
      setAuthError(
        "Please enter a valid height in cm."
      );
      return;
    }

    if (
      Number(profile.weight) < 25 ||
      Number(profile.weight) > 300
    ) {
      setAuthError(
        "Please enter a valid weight in kg."
      );
      return;
    }

    setSavingProfile(true);

    try {
      await setDoc(
        doc(
          db,
          "users",
          user.uid,
          "profile",
          "main"
        ),
        {
          ...profile,
          email: user.email,
          age: Number(profile.age),
          height: Number(profile.height),
          weight: Number(profile.weight),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setSuccess(
        "Profile saved successfully."
      );
    } catch (error) {
      console.error(error);
      setAuthError(
        "Unable to save profile. Check Firestore."
      );
    } finally {
      setSavingProfile(false);
    }
  }


  async function generateDietPlan() {
    setSuccess("");
    setAuthError("");

    if (
      !profile.name ||
      !profile.age ||
      !profile.height ||
      !profile.weight
    ) {
      setAuthError(
        "Complete your profile before generating a plan."
      );

      setActivePage("profile");
      return;
    }

    setGenerating(true);

    try {
      const plan = generatePlan(profile);

      const planRef = doc(
        collection(
          db,
          "users",
          user.uid,
          "plans"
        )
      );

      await setDoc(planRef, {
        ...plan,
        createdAt: serverTimestamp(),
      });

      setLatestPlan({
        id: planRef.id,
        ...plan,
        createdAt: new Date(),
      });

      setShowPlan(true);

      setActivePage("plan");

      setSuccess(
        "Personalized wellness plan generated and saved."
      );
    } catch (error) {
      console.error(error);

      setAuthError(
        "Could not generate the diet plan."
      );
    } finally {
      setGenerating(false);
    }
  }


  async function deletePlan(planId) {
    try {
      await deleteDoc(
        doc(
          db,
          "users",
          user.uid,
          "plans",
          planId
        )
      );

      setSuccess("Plan deleted successfully.");
    } catch (error) {
      console.error(error);

      setAuthError(
        "Unable to delete this plan."
      );
    }
  }


  async function toggleMeal(meal) {
    const today = new Date()
      .toISOString()
      .split("T")[0];

    const updated = {
      ...intake,
      [meal]: !intake[meal],
    };

    setIntake(updated);

    try {
      await setDoc(
        doc(
          db,
          "users",
          user.uid,
          "intake",
          today
        ),
        {
          ...updated,
          date: today,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error(error);

      setAuthError(
        "Unable to update today's intake."
      );
    }
  }


  function getGoalText() {
    if (profile.goal === "weight-loss") {
      return "Weight Management";
    }

    if (profile.goal === "fitness") {
      return "Fitness Oriented";
    }

    return "Balanced Wellness";
  }


  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-card">
          <div className="spinner"></div>
          <h2>Loading Diet Planner...</h2>
          <p>Connecting to Firebase</p>
        </div>
      </div>
    );
  }


  if (!user) {
    return (
      <div className="auth-page">

        <div className="auth-left">

          <div className="brand">
            <div className="brand-icon">🥗</div>
            <span>NutriCloud</span>
          </div>

          <div className="auth-content">

            <div className="hero-badge">
              ☁️ Cloud Powered Wellness
            </div>

            <h1>
              Your smarter way to plan
              <span> daily meals.</span>
            </h1>

            <p>
              Create personalized educational meal
              suggestions, track your daily meals,
              and securely save your plans with
              Firebase Cloud Firestore.
            </p>

            <div className="feature-list">

              <div>
                <span>✓</span>
                Personalized meal suggestions
              </div>

              <div>
                <span>✓</span>
                Secure cloud database
              </div>

              <div>
                <span>✓</span>
                Daily intake tracking
              </div>

              <div>
                <span>✓</span>
                Access your plans anytime
              </div>

            </div>

          </div>

        </div>


        <div className="auth-right">

          <form
            className="auth-card"
            onSubmit={handleAuth}
          >

            <div className="auth-icon">
              🥑
            </div>

            <h2>
              {authMode === "login"
                ? "Welcome back"
                : "Create account"}
            </h2>

            <p className="muted">
              {authMode === "login"
                ? "Login to continue your wellness journey."
                : "Create your free demo account."}
            </p>

            {authError && (
              <div className="alert error">
                {authError}
              </div>
            )}

            {success && (
              <div className="alert success">
                {success}
              </div>
            )}

            <label>Email address</label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            <label>Password</label>

            <input
              id="password"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            <button
              id="login"
              className="primary-btn full"
              type="submit"
            >
              {authMode === "login"
                ? "Login →"
                : "Create Account →"}
            </button>

            <div className="auth-switch">

              {authMode === "login" ? (
                <>
                  Don't have an account?
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("register");
                      setAuthError("");
                    }}
                  >
                    Register
                  </button>
                </>
              ) : (
                <>
                  Already have an account?
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setAuthError("");
                    }}
                  >
                    Login
                  </button>
                </>
              )}

            </div>

          </form>

        </div>

      </div>
    );
  }


  return (
    <div className="app-layout">

      <aside className="sidebar">

        <div className="sidebar-brand">

          <div className="brand-icon">
            🥗
          </div>

          <div>
            <strong>NutriCloud</strong>
            <small>Diet Planner</small>
          </div>

        </div>


        <div className="user-mini">

          <div className="avatar">
            {(profile.name ||
              user.email ||
              "U")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <strong>
              {profile.name || "Demo User"}
            </strong>

            <small>
              {user.email}
            </small>
          </div>

        </div>


        <nav>

          <button
            className={
              activePage === "dashboard"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("dashboard")
            }
          >
            <span>⌂</span>
            Dashboard
          </button>


          <button
            className={
              activePage === "profile"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("profile")
            }
          >
            <span>👤</span>
            My Profile
          </button>


          <button
            className={
              activePage === "generate"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("generate")
            }
          >
            <span>✨</span>
            Generate Plan
          </button>


          <button
            className={
              activePage === "plan"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("plan")
            }
          >
            <span>🍽️</span>
            Latest Plan
          </button>


          <button
            className={
              activePage === "history"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("history")
            }
          >
            <span>📚</span>
            Saved Plans
          </button>


          <button
            className={
              activePage === "tracker"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("tracker")
            }
          >
            <span>📊</span>
            Daily Tracker
          </button>

        </nav>


        <div className="sidebar-bottom">

          <div className="cloud-status">
            <span>●</span>
            Firebase connected
          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            ↪ Logout
          </button>

        </div>

      </aside>


      <main className="main-content">

        <header className="topbar">

          <div>

            <div className="breadcrumb">
              NutriCloud /{" "}
              {activePage}
            </div>

            <h1>
              {activePage === "dashboard" &&
                "Dashboard"}

              {activePage === "profile" &&
                "My Profile"}

              {activePage === "generate" &&
                "Generate Diet Plan"}

              {activePage === "plan" &&
                "Latest Diet Plan"}

              {activePage === "history" &&
                "Saved Plans"}

              {activePage === "tracker" &&
                "Daily Tracker"}
            </h1>

          </div>

          <div className="top-user">

            <div className="online-dot"></div>

            <span>
              {profile.name ||
                user.email}
            </span>

          </div>

        </header>


        <div className="page-container">

          {authError && (
            <div className="alert error global-alert">
              {authError}
              <button
                onClick={() =>
                  setAuthError("")
                }
              >
                ×
              </button>
            </div>
          )}

          {success && (
            <div className="alert success global-alert">
              {success}
              <button
                onClick={() =>
                  setSuccess("")
                }
              >
                ×
              </button>
            </div>
          )}


          {activePage === "dashboard" && (

            <>

              <section className="welcome-card">

                <div>

                  <span className="welcome-label">
                    GOOD TO SEE YOU 👋
                  </span>

                  <h2>
                    Welcome,{" "}
                    {profile.name ||
                      "Demo User"}
                  </h2>

                  <p>
                    Manage your personalized
                    wellness plan and daily
                    meal progress from one
                    place.
                  </p>

                </div>

                <div className="welcome-icon">
                  🥗
                </div>

              </section>


              <section className="stats-grid">

                <div className="stat-card">

                  <div className="stat-icon purple">
                    🎯
                  </div>

                  <div>
                    <span>Current Goal</span>
                    <strong>
                      {getGoalText()}
                    </strong>
                  </div>

                </div>


                <div className="stat-card">

                  <div className="stat-icon green">
                    🔥
                  </div>

                  <div>
                    <span>Daily Calories</span>
                    <strong>
                      {latestPlan
                        ? latestPlan.calories
                        : calculateCalories(
                            profile
                          )}{" "}
                      kcal
                    </strong>
                  </div>

                </div>


                <div className="stat-card">

                  <div className="stat-icon orange">
                    🍽️
                  </div>

                  <div>
                    <span>Plans Saved</span>
                    <strong>
                      {plans.length}
                    </strong>
                  </div>

                </div>


                <div className="stat-card">

                  <div className="stat-icon blue">
                    ✓
                  </div>

                  <div>
                    <span>Today's Meals</span>
                    <strong>
                      {completedMeals}/4
                    </strong>
                  </div>

                </div>

              </section>


              <section className="dashboard-grid">

                <div className="panel">

                  <div className="panel-header">

                    <div>
                      <h3>
                        Your latest plan
                      </h3>

                      <p>
                        Your most recently
                        generated meal
                        suggestions.
                      </p>
                    </div>

                    <button
                      className="small-btn"
                      onClick={() =>
                        setActivePage(
                          "plan"
                        )
                      }
                    >
                      View
                    </button>

                  </div>


                  {latestPlan ? (

                    <div className="meal-preview">

                      <div className="meal-row">
                        <span>🌅</span>
                        <div>
                          <small>
                            Breakfast
                          </small>
                          <strong>
                            {
                              latestPlan.breakfast
                            }
                          </strong>
                        </div>
                      </div>

                      <div className="meal-row">
                        <span>☀️</span>
                        <div>
                          <small>
                            Lunch
                          </small>
                          <strong>
                            {latestPlan.lunch}
                          </strong>
                        </div>
                      </div>

                      <div className="meal-row">
                        <span>🍎</span>
                        <div>
                          <small>
                            Snack
                          </small>
                          <strong>
                            {latestPlan.snack}
                          </strong>
                        </div>
                      </div>

                      <div className="meal-row">
                        <span>🌙</span>
                        <div>
                          <small>
                            Dinner
                          </small>
                          <strong>
                            {latestPlan.dinner}
                          </strong>
                        </div>
                      </div>

                    </div>

                  ) : (

                    <div className="empty-state">
                      <div>🍽️</div>
                      <h3>
                        No plan yet
                      </h3>
                      <p>
                        Complete your profile
                        and generate your first
                        plan.
                      </p>

                      <button
                        className="primary-btn"
                        onClick={() =>
                          setActivePage(
                            "generate"
                          )
                        }
                      >
                        Generate Plan
                      </button>
                    </div>

                  )}

                </div>


                <div className="panel">

                  <div className="panel-header">

                    <div>
                      <h3>
                        Daily progress
                      </h3>

                      <p>
                        Meals completed today
                      </p>
                    </div>

                    <span className="progress-number">
                      {completedMeals * 25}%
                    </span>

                  </div>


                  <div className="progress-bar">
                    <div
                      style={{
                        width: `${
                          completedMeals *
                          25
                        }%`,
                      }}
                    ></div>
                  </div>


                  <div className="progress-meals">

                    {[
                      [
                        "breakfast",
                        "Breakfast",
                        "🌅",
                      ],
                      [
                        "lunch",
                        "Lunch",
                        "☀️",
                      ],
                      [
                        "snack",
                        "Snack",
                        "🍎",
                      ],
                      [
                        "dinner",
                        "Dinner",
                        "🌙",
                      ],
                    ].map(
                      ([key, label, icon]) => (

                        <button
                          key={key}
                          className={
                            intake[key]
                              ? "meal-check completed"
                              : "meal-check"
                          }
                          onClick={() =>
                            toggleMeal(key)
                          }
                        >
                          <span>
                            {intake[key]
                              ? "✓"
                              : icon}
                          </span>

                          {label}
                        </button>

                      )
                    )}

                  </div>


                  <button
                    className="secondary-btn full"
                    onClick={() =>
                      setActivePage(
                        "tracker"
                      )
                    }
                  >
                    Open Daily Tracker
                  </button>

                </div>

              </section>


              <section className="quick-actions">

                <div
                  onClick={() =>
                    setActivePage("profile")
                  }
                >
                  <span>👤</span>
                  <strong>
                    Update Profile
                  </strong>
                  <small>
                    Personalize your plan
                  </small>
                </div>

                <div
                  onClick={() =>
                    setActivePage("generate")
                  }
                >
                  <span>✨</span>
                  <strong>
                    Generate New Plan
                  </strong>
                  <small>
                    Create fresh suggestions
                  </small>
                </div>

                <div
                  onClick={() =>
                    setActivePage("history")
                  }
                >
                  <span>📚</span>
                  <strong>
                    View History
                  </strong>
                  <small>
                    Explore saved plans
                  </small>
                </div>

              </section>

            </>

          )}


          {activePage === "profile" && (

            <section className="panel large-panel">

              <div className="section-heading">

                <div>
                  <span className="section-kicker">
                    PERSONAL INFORMATION
                  </span>

                  <h2>
                    Build your wellness profile
                  </h2>

                  <p>
                    These demo inputs are used
                    to create general educational
                    meal suggestions.
                  </p>
                </div>

                <div className="profile-symbol">
                  👤
                </div>

              </div>


              <div className="form-grid">

                <div className="form-group full-field">

                  <label>
                    Full Name
                  </label>

                  <input
                    value={profile.name}
                    onChange={(e) =>
                      updateProfile(
                        "name",
                        e.target.value
                      )
                    }
                    placeholder="Enter your name"
                  />

                </div>


                <div className="form-group">

                  <label>
                    Age
                  </label>

                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) =>
                      updateProfile(
                        "age",
                        e.target.value
                      )
                    }
                    placeholder="22"
                  />

                </div>


                <div className="form-group">

                  <label>
                    Sex
                  </label>

                  <select
                    value={profile.sex}
                    onChange={(e) =>
                      updateProfile(
                        "sex",
                        e.target.value
                      )
                    }
                  >
                    <option value="female">
                      Female
                    </option>

                    <option value="male">
                      Male
                    </option>
                  </select>

                </div>


                <div className="form-group">

                  <label>
                    Height cm
                  </label>

                  <input
                    type="number"
                    value={profile.height}
                    onChange={(e) =>
                      updateProfile(
                        "height",
                        e.target.value
                      )
                    }
                    placeholder="165"
                  />

                </div>


                <div className="form-group">

                  <label>
                    Weight kg
                  </label>

                  <input
                    type="number"
                    value={profile.weight}
                    onChange={(e) =>
                      updateProfile(
                        "weight",
                        e.target.value
                      )
                    }
                    placeholder="60"
                  />

                </div>


                <div className="form-group">

                  <label>
                    Activity Level
                  </label>

                  <select
                    value={profile.activity}
                    onChange={(e) =>
                      updateProfile(
                        "activity",
                        e.target.value
                      )
                    }
                  >
                    <option value="sedentary">
                      Sedentary
                    </option>

                    <option value="light">
                      Lightly Active
                    </option>

                    <option value="moderate">
                      Moderately Active
                    </option>

                    <option value="active">
                      Very Active
                    </option>

                  </select>

                </div>


                <div className="form-group">

                  <label>
                    Dietary Preference
                  </label>

                  <select
                    value={profile.diet}
                    onChange={(e) =>
                      updateProfile(
                        "diet",
                        e.target.value
                      )
                    }
                  >
                    <option value="vegetarian">
                      Vegetarian
                    </option>

                    <option value="vegan">
                      Vegan
                    </option>

                    <option value="nonveg">
                      General / Non-Vegetarian
                    </option>

                  </select>

                </div>


                <div className="form-group">

                  <label>
                    General Goal
                  </label>

                  <select
                    value={profile.goal}
                    onChange={(e) =>
                      updateProfile(
                        "goal",
                        e.target.value
                      )
                    }
                  >
                    <option value="balanced">
                      Balanced Wellness
                    </option>

                    <option value="weight-loss">
                      Weight Management
                    </option>

                    <option value="fitness">
                      Fitness Oriented
                    </option>

                  </select>

                </div>


                <div className="form-group">

                  <label>
                    Preferred Cuisine
                  </label>

                  <select
                    value={profile.cuisine}
                    onChange={(e) =>
                      updateProfile(
                        "cuisine",
                        e.target.value
                      )
                    }
                  >
                    <option>
                      Indian
                    </option>

                    <option>
                      North Indian
                    </option>

                    <option>
                      South Indian
                    </option>

                    <option>
                      Mixed
                    </option>

                  </select>

                </div>


                <div className="form-group">

                  <label>
                    Daily Food Budget
                  </label>

                  <select
                    value={profile.budget}
                    onChange={(e) =>
                      updateProfile(
                        "budget",
                        e.target.value
                      )
                    }
                  >
                    <option value="low">
                      Budget Friendly
                    </option>

                    <option value="medium">
                      Moderate
                    </option>

                    <option value="high">
                      Flexible
                    </option>

                  </select>

                </div>


                <div className="form-group full-field">

                  <label>
                    Allergies / Food Preferences
                  </label>

                  <textarea
                    value={profile.allergies}
                    onChange={(e) =>
                      updateProfile(
                        "allergies",
                        e.target.value
                      )
                    }
                    placeholder="Optional demo field, e.g. peanuts, lactose..."
                    rows="4"
                  />

                </div>

              </div>


              <div className="profile-footer">

                <div className="info-note">
                  🔒 Your profile is stored under
                  your Firebase user ID.
                </div>

                <button
                  className="primary-btn"
                  onClick={saveProfile}
                  disabled={savingProfile}
                >
                  {savingProfile
                    ? "Saving..."
                    : "Save Profile"}
                </button>

              </div>

            </section>

          )}


          {activePage === "generate" && (

            <section className="generate-layout">

              <div className="panel generator-panel">

                <div className="section-heading">

                  <div>

                    <span className="section-kicker">
                      AI SIMULATION
                    </span>

                    <h2>
                      Generate your meal plan
                    </h2>

                    <p>
                      Our local recommendation
                      engine uses your profile
                      preferences to create
                      a personalized educational
                      example.
                    </p>

                  </div>

                  <div className="ai-orb">
                    ✨
                  </div>

                </div>


                <div className="profile-summary">

                  <div>
                    <span>Name</span>
                    <strong>
                      {profile.name ||
                        "Not completed"}
                    </strong>
                  </div>

                  <div>
                    <span>Diet</span>
                    <strong>
                      {profile.diet}
                    </strong>
                  </div>

                  <div>
                    <span>Activity</span>
                    <strong>
                      {profile.activity}
                    </strong>
                  </div>

                  <div>
                    <span>Goal</span>
                    <strong>
                      {getGoalText()}
                    </strong>
                  </div>

                </div>


                <div className="target-preview">

                  <div>
                    <span>
                      Estimated daily target
                    </span>

                    <strong>
                      {calculateCalories(
                        profile
                      )}{" "}
                      kcal
                    </strong>
                  </div>

                  <div>
                    <span>
                      Protein
                    </span>

                    <strong>
                      {
                        calculateMacros(
                          calculateCalories(
                            profile
                          )
                        ).protein
                      }
                      g
                    </strong>
                  </div>

                  <div>
                    <span>
                      Carbs
                    </span>

                    <strong>
                      {
                        calculateMacros(
                          calculateCalories(
                            profile
                          )
                        ).carbs
                      }
                      g
                    </strong>
                  </div>

                  <div>
                    <span>
                      Fat
                    </span>

                    <strong>
                      {
                        calculateMacros(
                          calculateCalories(
                            profile
                          )
                        ).fats
                      }
                      g
                    </strong>
                  </div>

                </div>


                <button
                  className="generate-btn"
                  onClick={generateDietPlan}
                  disabled={generating}
                >
                  <span>
                    {generating
                      ? "⏳"
                      : "✨"}
                  </span>

                  {generating
                    ? "Generating..."
                    : "Generate Personalized Plan"}
                </button>


                <div className="disclaimer">

                  <strong>
                    Educational use only
                  </strong>

                  <p>
                    This application demonstrates
                    cloud computing and AI-style
                    recommendation concepts.
                    Generated meals are general
                    wellness examples and are not
                    medical or clinical nutrition
                    advice.
                  </p>

                </div>

              </div>

            </section>

          )}


          {activePage === "plan" && (

            <section>

              {latestPlan ? (

                <>

                  <div className="plan-hero">

                    <div>

                      <span>
                        PERSONALIZED WELLNESS PLAN
                      </span>

                      <h2>
                        Your daily meal guide
                      </h2>

                      <p>
                        Generated using your
                        selected profile
                        preferences.
                      </p>

                    </div>

                    <div className="calorie-circle">

                      <strong>
                        {latestPlan.calories}
                      </strong>

                      <span>
                        kcal
                      </span>

                    </div>

                  </div>


                  <div className="macro-grid">

                    <div>
                      <span>Protein</span>
                      <strong>
                        {
                          latestPlan.macros
                            ?.protein
                        }
                        g
                      </strong>
                    </div>

                    <div>
                      <span>Carbohydrates</span>
                      <strong>
                        {
                          latestPlan.macros
                            ?.carbs
                        }
                        g
                      </strong>
                    </div>

                    <div>
                      <span>Fats</span>
                      <strong>
                        {
                          latestPlan.macros
                            ?.fats
                        }
                        g
                      </strong>
                    </div>

                    <div>
                      <span>Hydration</span>
                      <strong>
                        💧
                      </strong>
                    </div>

                  </div>


                  <div className="meal-grid">

                    <div className="meal-card">

                      <div className="meal-icon">
                        🌅
                      </div>

                      <span>
                        BREAKFAST
                      </span>

                      <h3>
                        {latestPlan.breakfast}
                      </h3>

                    </div>


                    <div className="meal-card">

                      <div className="meal-icon">
                        ☀️
                      </div>

                      <span>
                        LUNCH
                      </span>

                      <h3>
                        {latestPlan.lunch}
                      </h3>

                    </div>


                    <div className="meal-card">

                      <div className="meal-icon">
                        🍎
                      </div>

                      <span>
                        SNACK
                      </span>

                      <h3>
                        {latestPlan.snack}
                      </h3>

                    </div>


                    <div className="meal-card">

                      <div className="meal-icon">
                        🌙
                      </div>

                      <span>
                        DINNER
                      </span>

                      <h3>
                        {latestPlan.dinner}
                      </h3>

                    </div>

                  </div>


                  <div className="hydration-card">

                    <span>
                      💧
                    </span>

                    <div>

                      <strong>
                        Hydration reminder
                      </strong>

                      <p>
                        {latestPlan.hydration}
                      </p>

                    </div>

                  </div>


                  <div className="disclaimer">

                    <strong>
                      General wellness example
                    </strong>

                    <p>
                      {latestPlan.educationalNote}
                    </p>

                  </div>

                </>

              ) : (

                <div className="empty-state big">

                  <div>
                    🍽️
                  </div>

                  <h2>
                    No diet plan generated
                  </h2>

                  <p>
                    Complete your profile and
                    generate your first plan.
                  </p>

                  <button
                    className="primary-btn"
                    onClick={() =>
                      setActivePage(
                        "generate"
                      )
                    }
                  >
                    Generate Plan
                  </button>

                </div>

              )}

            </section>

          )}


          {activePage === "history" && (

            <section className="panel large-panel">

              <div className="section-heading">

                <div>

                  <span className="section-kicker">
                    FIRESTORE HISTORY
                  </span>

                  <h2>
                    Your saved plans
                  </h2>

                  <p>
                    Previously generated plans
                    are stored securely in
                    your Firestore account.
                  </p>

                </div>

                <div className="history-count">
                  {plans.length}
                </div>

              </div>


              {plans.length === 0 ? (

                <div className="empty-state">
                  <div>📚</div>

                  <h3>
                    No saved plans
                  </h3>

                  <p>
                    Your generated plans will
                    appear here.
                  </p>

                </div>

              ) : (

                <div className="history-list">

                  {plans.map((plan, index) => (

                    <div
                      className="history-item"
                      key={plan.id}
                    >

                      <div className="history-number">
                        {index + 1}
                      </div>

                      <div className="history-main">

                        <span>
                          {formatDate(
                            plan.createdAt
                          )}
                        </span>

                        <h3>
                          {plan.breakfast}
                        </h3>

                        <p>
                          {plan.lunch}
                        </p>

                      </div>

                      <div className="history-calories">
                        {plan.calories}
                        <small>
                          kcal
                        </small>
                      </div>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          deletePlan(
                            plan.id
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  ))}

                </div>

              )}

            </section>

          )}


          {activePage === "tracker" && (

            <section className="tracker-layout">

              <div className="panel">

                <div className="section-heading">

                  <div>

                    <span className="section-kicker">
                      TODAY
                    </span>

                    <h2>
                      Daily meal tracker
                    </h2>

                    <p>
                      Mark the meals you have
                      completed today.
                    </p>

                  </div>

                  <div className="tracker-score">
                    {completedMeals}
                    <small>/4</small>
                  </div>

                </div>


                <div className="tracker-progress">

                  <div>
                    <span>
                      Daily completion
                    </span>

                    <strong>
                      {completedMeals * 25}%
                    </strong>
                  </div>

                  <div className="progress-bar">
                    <div
                      style={{
                        width: `${
                          completedMeals *
                          25
                        }%`,
                      }}
                    ></div>
                  </div>

                </div>


                <div className="tracker-meals">

                  {[
                    [
                      "breakfast",
                      "Breakfast",
                      "🌅",
                      "Start your day",
                    ],
                    [
                      "lunch",
                      "Lunch",
                      "☀️",
                      "Midday meal",
                    ],
                    [
                      "snack",
                      "Snack",
                      "🍎",
                      "Small snack",
                    ],
                    [
                      "dinner",
                      "Dinner",
                      "🌙",
                      "Evening meal",
                    ],
                  ].map(
                    ([key, title, icon, text]) => (

                      <button
                        key={key}
                        className={
                          intake[key]
                            ? "tracker-meal done"
                            : "tracker-meal"
                        }
                        onClick={() =>
                          toggleMeal(key)
                        }
                      >

                        <div className="tracker-meal-icon">
                          {intake[key]
                            ? "✓"
                            : icon}
                        </div>

                        <div>

                          <strong>
                            {title}
                          </strong>

                          <span>
                            {intake[key]
                              ? "Completed"
                              : text}
                          </span>

                        </div>

                        <div className="check-circle">
                          {intake[key]
                            ? "✓"
                            : ""}
                        </div>

                      </button>

                    )
                  )}

                </div>

              </div>


              <div className="panel tip-panel">

                <div className="tip-icon">
                  💡
                </div>

                <h3>
                  Cloud tracking
                </h3>

                <p>
                  Your daily tracker is stored
                  in Firestore under your
                  authenticated user ID.
                </p>

                <div className="cloud-flow">
                  <span>
                    React
                  </span>

                  <b>→</b>

                  <span>
                    Firebase Auth
                  </span>

                  <b>→</b>

                  <span>
                    Firestore
                  </span>
                </div>

              </div>

            </section>

          )}

        </div>

      </main>

    </div>
  );
}

export default App;