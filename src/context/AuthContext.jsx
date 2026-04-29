import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, withRetry } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Build a minimal user object that is safe even when Firestore is unreachable.
 */
function buildFallbackUser(firebaseUser) {
  return {
    id: firebaseUser.uid,
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    name: firebaseUser.displayName || firebaseUser.email,
    role: null, // caller must handle missing role
    _profileMissing: true,
  };
}

/**
 * Fetch the Firestore profile with up to 3 retries.
 * Returns the document snapshot, or null on failure.
 */
async function fetchUserProfile(uid) {
  const docRef = doc(db, 'users', uid);
  try {
    const snap = await withRetry(() => getDoc(docRef), 3, 800);
    return snap.exists() ? snap : null;
  } catch (err) {
    console.error('❌ fetchUserProfile failed after retries:', err.message);
    return null;
  }
}

// ─── Provider ───────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const navigate = useNavigate();

  // ── onAuthStateChanged ──────────────────────────────────────────────────
  useEffect(() => {
 onAuthStateChanged(auth, (user) => {
   setUser(user || null)
   setLoading(false)
 })
}, [])
        return;
      }

      try {
        const snap = await fetchUserProfile(firebaseUser.uid);

        if (snap) {
          setUser({
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            ...snap.data(),
          });
        } else {
          // Profile missing or Firestore unreachable — degrade gracefully
          const fallback = buildFallbackUser(firebaseUser);
          setUser(fallback);
          setProfileError(true);

          if (!snap) {
            // true Firestore failure (not just missing doc)
            toast.error('Could not load your profile. Some features may be limited.', {
              id: 'profile-load-error',
              duration: 5000,
            });
          }
        }
      } catch (err) {
        console.error('❌ Auth state handler error:', err);
        setUser(buildFallbackUser(firebaseUser));
        setProfileError(true);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ── login ───────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);

      // Fetch role separately for redirect (onAuthStateChanged handles state)
      const snap = await fetchUserProfile(credential.user.uid);

      if (snap?.exists()) {
        const { role } = snap.data();
        navigate(`/${role}`);
      } else {
        // Profile missing — send to landing, they can still browse
        navigate('/');
        toast('Your profile could not be loaded. Please try again.', {
          icon: '⚠️',
          id: 'login-profile-warn',
        });
      }

      toast.success('Logged in successfully!');
      return credential.user;
    } catch (err) {
      const msg = getFriendlyAuthError(err.code || err.message);
      throw new Error(msg);
    }
  }, [navigate]);

  // ── signup ──────────────────────────────────────────────────────────────
  const signup = useCallback(async (name, email, password, role) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);

      const userData = {
        uid: credential.user.uid,
        name,
        email,
        role,
        skills: [],
        createdAt: new Date().toISOString(),
      };

      await withRetry(() =>
        setDoc(doc(db, 'users', credential.user.uid), userData)
      );

      navigate(`/${role}`);
      toast.success('Account created successfully!');
      return credential.user;
    } catch (err) {
      const msg = getFriendlyAuthError(err.code || err.message);
      throw new Error(msg);
    }
  }, [navigate]);

  // ── logout ──────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Failed to log out. Please try again.');
    }
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, profileError }}>
      {loading ? <FullPageLoader /> : children}
    </AuthContext.Provider>
  );
}

// ─── Full-page loading spinner ───────────────────────────────────────────────
function FullPageLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      gap: '1rem',
    }}>
      <div style={{
        width: 48, height: 48,
        border: '4px solid rgba(99,102,241,0.2)',
        borderTop: '4px solid #6366f1',
        borderRadius: '50%',
        animation: 'spin 0.9s linear infinite',
      }} />
      <p style={{ color: '#94a3b8', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
        Connecting to SkillMatch…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Friendly Firebase error messages ───────────────────────────────────────
function getFriendlyAuthError(code) {
  const map = {
    'auth/user-not-found':      'No account found with this email.',
    'auth/wrong-password':      'Incorrect password. Please try again.',
    'auth/invalid-credential':  'Invalid email or password.',
    'auth/email-already-in-use':'An account with this email already exists.',
    'auth/weak-password':       'Password must be at least 6 characters.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/too-many-requests':   'Too many failed attempts. Please wait and try again.',
  };
  return map[code] || 'An authentication error occurred. Please try again.';
}

export const useAuth = () => useContext(AuthContext);
