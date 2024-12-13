import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase"; // Assicurati che il percorso sia corretto
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUser({ id: user.uid, ...userDoc.data() });
            console.log("Utente autenticato:", user.uid); // Aggiungi un log
          }
        } else {
          setUser(null);
          console.log("Nessun utente autenticato"); // Aggiungi un log
        }
      });
  
      return () => unsubscribe();
    }, []);
  
    return (
      <UserContext.Provider value={user}>
        {children}
      </UserContext.Provider>
    );
  };
  

export const useUser = () => {
  return useContext(UserContext);
};
