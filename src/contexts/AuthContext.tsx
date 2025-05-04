
import React, { createContext, useState, useContext, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
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
  userDatabase: { email: string, password: string, name: string, id: string, role: UserRole }[];
  updateUserDatabase: (newUsers: { email: string, password: string, name: string, id: string, role: UserRole }[]) => void;
}

// Local storage key for user database
const USER_DB_KEY = "stocksavvy_users";

// Default mock users
const DEFAULT_USERS = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@stocksavvy.com",
    password: "admin123",
    role: "admin" as UserRole,
  },
  {
    id: "2",
    name: "Worker User",
    email: "worker@stocksavvy.com",
    password: "worker123",
    role: "worker" as UserRole,
  },
];

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => Promise.resolve(false),
  logout: () => {},
  isAuthenticated: false,
  isAdmin: false,
  userDatabase: DEFAULT_USERS,
  updateUserDatabase: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userDatabase, setUserDatabase] = useState(() => {
    try {
      const savedUsers = localStorage.getItem(USER_DB_KEY);
      return savedUsers ? JSON.parse(savedUsers) : DEFAULT_USERS;
    } catch (error) {
      console.error("Failed to load user database:", error);
      return DEFAULT_USERS;
    }
  });

  // Save user database to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(USER_DB_KEY, JSON.stringify(userDatabase));
  }, [userDatabase]);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // First check for user role in the "roles" collection
          const userRoleDoc = await getDoc(doc(db, "roles", firebaseUser.uid));
          
          if (userRoleDoc.exists()) {
            const userData = userRoleDoc.data();
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || userData.name || "User",
              email: firebaseUser.email || "",
              role: userData.role || "worker"
            });
            console.log("User role found in 'roles' collection:", userData.role);
          } else {
            // Fallback to checking the "users" collection if no role document exists
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUser({
                id: firebaseUser.uid,
                name: userData.name || firebaseUser.displayName || "User",
                email: firebaseUser.email || "",
                role: userData.role || "worker"
              });
              console.log("User data found in 'users' collection:", userData);
            } else {
              // If no user document exists in either collection, default to worker role
              console.log("No user document found, defaulting to worker role");
              setUser({
                id: firebaseUser.uid,
                name: firebaseUser.displayName || "User",
                email: firebaseUser.email || "",
                role: "worker"
              });
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

  // Function to update user database
  const updateUserDatabase = (newUsers: typeof DEFAULT_USERS) => {
    setUserDatabase(newUsers);
  };

  // Login function using Firebase
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Firebase login error:", error);
      return false;
    }
  };

  // Logout function using Firebase
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
        userDatabase,
        updateUserDatabase,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
