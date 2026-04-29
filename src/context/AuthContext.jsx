import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user data from firestore
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setUser({ id: firebaseUser.uid, uid: firebaseUser.uid, ...docSnap.data() });
          } else {
            setUser({ id: firebaseUser.uid, uid: firebaseUser.uid, email: firebaseUser.email });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Failed to load user profile.");
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Data will be fetched by onAuthStateChanged
      
      // Wait for user state to populate (handled by onAuthStateChanged, but we need the role for redirect)
      const docRef = doc(db, 'users', userCredential.user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        navigate(`/${userData.role}`);
      } else {
        navigate('/');
      }
      toast.success('Logged in successfully!');
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (name, email, password, role) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const defaultSkills = role === 'student' ? [] : []; // Empty initially, can be updated in profile
      
      const userData = {
        uid: userCredential.user.uid,
        name,
        email,
        role,
        skills: defaultSkills,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      
      // Navigate to the respective dashboard
      navigate(`/${role}`);
      toast.success('Account created successfully!');
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
