"use client";
import {
  GoogleAuthProvider,
  User,
  getAuth,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
} from "firebase/auth";
import { addDoc, collection, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { APP_DESCRIPTION, APP_TITLE } from "./constants";
import { auth, db } from "./firebase";

interface Event {
  id: string;
  author: string;
  name: string;
  startTime: Date;
  endTime: Date;
}

interface Calendar {
  id: string;
  name: string;
  events: { [eventId: string]: Event };
  roles: { [userId: string]: "READ" | "WRITE" | "ADMIN" };
}

export default function Home() {
  const [todos, setTodos] = useState<Calendar[]>([]);
  const [newTodo, setNewTodo] = useState<string>("");

  // Add item

  const addCalendar = async () => {
    if (!newTodo || !auth.currentUser) {
      return;
    }

    addDoc(collection(db, "calendars"), {
      content: newTodo,
      completed: false,
      author: auth.currentUser?.uid,
    });

    setNewTodo("");
  };

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

  // Read items
  useEffect(() => {
    if (!user) {
      return;
    }

    const q = query(
      collection(db, "calendars"),
      where("author", "==", auth.currentUser?.uid)
    );

    // const unsubscribe = onSnapshot(q, (querySnapshot) => {
    //   const itemsArr: Todo[] = [];

    //   querySnapshot.forEach((doc) => {
    //     itemsArr.push({ ...doc.data(), id: doc.id } as Todo);
    //   });

    //   setTodos(itemsArr);
    // });

    // return unsubscribe;
  }, [user]);

  return (
    <PageWrapper>
      {user ? (
        <>
          <div className="w-full text-center flex items-center justify-between">
            <h1 className="text-2xl text-center">{APP_TITLE}</h1>
            <button
              className="bg-slate-500 hover:bg-slate-700 text-white font-bold py-2 px-2 rounded"
              onClick={() => {
                auth.signOut();
              }}
            >
              Sign out
            </button>
          </div>
          <div className="mb-6 mt-8">hi {user.email}</div>
        </>
      ) : (
        userLoaded && <LoginContainer />
      )}
    </PageWrapper>
  );
}

function LoginContainer() {
  const [loginState, setLoginState] = useState<"NEED_EMAIL" | "EMAIL_SENT">(
    "NEED_EMAIL"
  );

  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    let email: string | null;
    if (isSignInWithEmailLink(auth, window.location.href)) {
      // Additional state parameters can also be passed via URL.
      // This can be used to continue the user's intended action before triggering
      // the sign-in operation.
      // Get the email if available. This should be available if the user completes
      // the flow on the same device where they started it.
      let email = window.localStorage.getItem("emailForSignIn");

      if (!email) {
        // User opened the link on a different device. To prevent session fixation
        // attacks, ask the user to provide the associated email again. For example:
        email = window.prompt("Please provide your email for confirmation");
      }

      // The client SDK will parse the code from the link for you.
      signInWithEmailLink(auth, email!, window.location.href)
        .then((result) => {
          // Clear email from storage.
          window.localStorage.removeItem("emailForSignIn");
          // You can access the new user via result.user
          // Additional user info profile not available via:
          // result.additionalUserInfo.profile == null
          // You can check if the user is new or existing:
          // result.additionalUserInfo.isNewUser
        })
        .catch((error) => {
          // Some error occurred, you can inspect the code: error.code
          // Common errors could be invalid email and invalid or expired OTPs.
        });
    }
  }, [auth, window.location.href]);

  return (
    <div className="w-6/12 place-content-center text-center flex flex-col align-items justify-center p-24">
      <h1 className="text-2xl p-4 text-center pb-10">{APP_TITLE}</h1>
      <h2 className="text-slate-400 pb-10">{APP_DESCRIPTION}</h2>

      {loginState === "NEED_EMAIL" && (
        <>
          <input
            type="email"
            placeholder="Email"
            className="p-2 m-2 border border-slate-400 rounded"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 m-2 rounded"
            onClick={() => {
              const actionCodeSettings = {
                url: `${window.location.protocol}//${window.location.host}`,
                handleCodeInApp: true,
              };

              sendSignInLinkToEmail(auth, email, actionCodeSettings)
                .then(() => {
                  window.localStorage.setItem("emailForSignIn", email);
                  setLoginState("EMAIL_SENT");
                })
                .catch((error) => {
                  const errorCode = error.code;
                  const errorMessage = error.message;
                  // ...
                });
            }}
          >
            Send sign-in link to email
          </button>
        </>
      )}
      {loginState === "EMAIL_SENT" &&
        "Email sent! Check your inbox for a link to sign in."}
    </div>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 bg-white dark:bg-slate-800 text-black dark:text-white">
      <div className="z-10 w-full max-w-5xl items-center flex justify-center font-mono text-sm">
        {children}
      </div>
    </main>
  );
}
