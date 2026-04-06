import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';

const AuthContext = createContext(null);

async function getAllowedUserData(email) {
  const docSnap = await getDoc(doc(db, 'allowedUsers', email));
  if (!docSnap.exists()) return null;
  return docSnap.data(); // e.g. { name: 'Dr. Dharmesh', role: 'Chief Practitioner' }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const data = await getAllowedUserData(firebaseUser.email);
        if (!data) {
          await signOut(auth);
          setUser(null);
          setUserData(null);
        } else {
          setUser(firebaseUser);
          setUserData(data);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const data = await getAllowedUserData(result.user.email);
    if (!data) {
      await signOut(auth);
      throw new Error('NOT_ALLOWED');
    }
    setUserData(data);
    return result;
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, userData, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
