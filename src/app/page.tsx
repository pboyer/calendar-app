"use client";

import {
  FieldPath,
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LoginContainer } from "./LoginContainer";
import { Calendar } from "./entityTypes";
import { auth, db } from "./firebase";
import Header from "./header";
import { useAuth } from "./useAuth";

export default function HomePage() {
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [newCalendarName, setNewCalendarName] = useState<string>("");

  const [user, userLoaded] = useAuth();

  // Add item

  const addCalendar = async () => {
    if (!newCalendarName || !auth.currentUser) {
      return;
    }

    addDoc(collection(db, "calendars"), {
      name: newCalendarName,
      updatedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      events: [],
      roles: { [auth.currentUser.uid]: "ADMIN" },
    });

    setNewCalendarName("");
  };

  const updateCalendar = async (id: string, data: Partial<Calendar>) => {
    updateDoc(doc(db, "calendars", id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  };

  const deleteCalendar = async (id: string) => {
    await deleteDoc(doc(db, "calendars", id));
  };

  // Read items

  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }

    const q = query(
      collection(db, "calendars"),
      where(new FieldPath("roles", auth.currentUser.uid), "!=", "")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const itemsArr: Calendar[] = [];

      querySnapshot.forEach((doc) => {
        itemsArr.push({ ...doc.data(), id: doc.id } as Calendar);
      });

      setCalendars(itemsArr);

      console.log(itemsArr);
    });

    return unsubscribe;
  }, [user]);

  if (!user) {
    userLoaded && <LoginContainer />;
  }

  return (
    <>
      <Header />
      <div className="w-full mb-6 mt-8">
        <form className="grid grid-cols-6">
          <input
            className="col-span-5 p-4 text-black bg-slate-100 dark:bg-slate-900 focus:bg-slate-200 focus:dark:bg-slate-950 dark:text-white mr-2 rounded outline-none"
            type="text"
            placeholder="New calendar name"
            value={newCalendarName}
            onChange={(e) => setNewCalendarName(e.target.value)}
            onKeyUp={(e) => {
              if (e.code === "Enter") {
                addCalendar();
              }
            }}
          ></input>
          <button
            className="col-span-1 p-4 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:text-white dark:hover:bg-slate-700 rounded"
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              addCalendar();
            }}
          >
            +
          </button>
        </form>
      </div>
      <div className="w-full">
        {calendars.map((calendar) => (
          <Link href={`/calendar?id=${calendar.id}`} key={calendar.id}>
            <div className="bg-slate-200 p-4 mt-4 dark:bg-slate-600 hover:bg-slate-300 dark:text-white dark:hover:bg-slate-700 rounded flex justify-between">
              <div>{calendar.name}</div>
              <div>
                Updated:
                {new Date(calendar.updatedAt.seconds * 1000).toLocaleString()}
              </div>
              <button
                className=""
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  if (
                    confirm("Are you sure you want to delete this calendar?")
                  ) {
                    deleteCalendar(calendar.id);
                  }
                }}
              >
                x
              </button>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
