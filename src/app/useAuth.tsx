"use client";
import { User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userLoaded, setUserLoaded] = useState<boolean>(false);

  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      if (!userLoaded) {
        setUserLoaded(true);
      }

      setUser(user);
    });
  }, []);

  return [user, userLoaded];
}
