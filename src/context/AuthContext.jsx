import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";

import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     AUTH STATE LISTENER
  ===================================================== */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUser({
            uid: firebaseUser.uid,
            ...userSnap.data()
          });
        } else {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: null
          });
        }
      } catch (error) {
        console.error("Auth state error:", error);

        setUser({
          uid: firebaseUser?.uid || null,
          email: firebaseUser?.email || null,
          role: null
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  /* =====================================================
     SIGNUP
  ===================================================== */
  const signup = useCallback(
    async (name, email, password, role) => {
      try {
        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const userData = {
          uid: credential.user.uid,
          name,
          email,
          role,
          skills: [],
          createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, "users", credential.user.uid), userData);

        setUser(userData);

        toast.success("Account created successfully!");

        if (role === "student") {
          navigate("/student-dashboard");
        } else {
          navigate("/company-dashboard");
        }

        return credential.user;
      } catch (error) {
        toast.error(getErrorMessage(error.code));
        throw error;
      }
    },
    [navigate]
  );

  /* =====================================================
     LOGIN
  ===================================================== */
  const login = useCallback(
    async (email, password) => {
      try {
        const credential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const userRef = doc(db, "users", credential.user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();

          setUser({
            uid: credential.user.uid,
            ...userData
          });

          toast.success("Login successful!");

          if (userData.role === "student") {
            navigate("/student-dashboard");
          } else {
            navigate("/company-dashboard");
          }
        } else {
          toast.error("Profile not found.");
        }

        return credential.user;
      } catch (error) {
        toast.error(getErrorMessage(error.code));
        throw error;
      }
    },
    [navigate]
  );

  /* =====================================================
     LOGOUT
  ===================================================== */
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  }, [navigate]);

  /* =====================================================
     LOADING SCREEN
  ===================================================== */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading SkillMatch...</p>
        </div>
      </div>
    );
  }

  /* =====================================================
     PROVIDER
  ===================================================== */
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =====================================================
   FIREBASE FRIENDLY ERRORS
===================================================== */
function getErrorMessage(code) {
  const errors = {
    "auth/user-not-found": "No account found",
    "auth/wrong-password": "Incorrect password",
    "auth/invalid-credential": "Invalid email or password",
    "auth/email-already-in-use": "Email already registered",
    "auth/weak-password": "Password should be at least 6 characters",
    "auth/network-request-failed": "Network error",
    "auth/too-many-requests": "Too many attempts. Try later"
  };

  return errors[code] || "Something went wrong";
}
