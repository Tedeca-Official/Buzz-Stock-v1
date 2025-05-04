import React, { createContext, useState, useContext, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/utils/firebase";

// Define user roles
export type UserRole = "admin" | "worker";

// Define user type
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => Promise.resolve(false),
  logout: () => {},
  isAuthenticated: false,
  isAdmin: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Check for user role in the "roles" collection
          const userRoleDoc = await getDoc(doc(db, "roles", firebaseUser.uid));

          if (userRoleDoc.exists()) {
            const userData = userRoleDoc.data();
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || userData.name || "User",
              email: firebaseUser.email || "",
              role: userData.role || "worker",
            });
            console.log("User role found in 'roles' collection:", userData.role);
          } else {
            // Fallback to "users" collection
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUser({
                id: firebaseUser.uid,
                name: userData.name || firebaseUser.displayName || "User",
                email: firebaseUser.email || "",
                role: userData.role || "worker",
              });
              console.log("User data found in 'users' collection:", userData);
            } else {
              setUser({
                id: firebaseUser.uid,
                name: firebaseUser.displayName || "User",
                email: firebaseUser.email || "",
                role: "worker",
              });
              console.log("No user document found, defaulting to worker role");
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Login with Firebase
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Firebase login error:", error);
      return false;
    }
  };

  // Logout with Firebase
  const logout = () => {
    signOut(auth).catch((error) => {
      console.error("Firebase logout error:", error);
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
