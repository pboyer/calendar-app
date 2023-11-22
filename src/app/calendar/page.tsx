"use client";

import {
  DocumentReference,
  FieldPath,
  Timestamp,
  addDoc,
  and,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { LoginContainer } from "../LoginContainer";
import { Calendar, CalendarEvent } from "../entityTypes";
import { auth, db } from "../firebase";
import Header from "../header";
import { useAuth } from "../useAuth";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function formatDateForDatetimeLocal(date: Date) {
  function pad(num: number) {
    if (num < 10) {
      return "0" + num;
    }
    return num;
  }

  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );
}

export default function CalendarPage() {
  const [calendarRef, setCalendarRef] =
    useState<DocumentReference<Calendar> | null>(null);
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [newEventName, setNewEventName] = useState<string>("");
  const [newEventStart, setNewEventStart] = useState<Date | null>(new Date());
  const [newEventEnd, setNewEventEnd] = useState<Date | null>(new Date());

  const searchParams = useSearchParams();

  const [user, userLoaded] = useAuth();

  // Add calendar

  const addEventToCalendar = async () => {
    if (
      !newEventName ||
      !auth.currentUser ||
      !calendarRef ||
      !calendar ||
      !newEventStart ||
      !newEventEnd
    ) {
      return;
    }

    const newEvent: CalendarEvent = {
      id: Math.random().toString(),
      author: auth.currentUser.uid,
      name: newEventName,
      updatedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      startTime: Timestamp.fromDate(newEventStart),
      endTime: Timestamp.fromDate(newEventEnd),
    };

    updateDoc(calendarRef, {
      events: [newEvent, ...calendar.events],
    });

    setNewEventName("");
  };

  const updateCalendar = async (data: Partial<Calendar>) => {
    if (!calendarRef) {
      return;
    }

    updateDoc(calendarRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  };

  // Read events

  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }

    const q = query(
      collection(db, "calendars"),
      where(new FieldPath("roles", auth.currentUser.uid), "!=", "")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (doc.id === searchParams.get("id")) {
          setCalendarRef(doc.ref as DocumentReference<Calendar>);
          setCalendar({ ...doc.data(), id: doc.id } as Calendar);
        }
      });
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
        <div className="flex justify-between">
          <div>
            <h2 className="mb-4 bold">Events{` - ${calendar?.name}`}</h2>
          </div>
          <div>
            <Link href="/">Back to my calendars</Link>
          </div>
        </div>
        <form className="grid grid-cols-12">
          <input
            className="col-span-5 p-4 text-black bg-slate-100 dark:bg-slate-900 focus:bg-slate-200 focus:dark:bg-slate-950 dark:text-white mr-2 rounded outline-none"
            type="text"
            placeholder="New event name"
            value={newEventName}
            onChange={(e) => setNewEventName(e.target.value)}
            onKeyUp={(e) => {
              if (e.code === "Enter") {
                addEventToCalendar();
              }
            }}
          ></input>
          <input
            type="datetime-local"
            defaultValue={formatDateForDatetimeLocal(newEventStart!)}
            onChange={(e) => setNewEventStart(new Date(e.target.value))}
            className="col-span-3 p-4 text-black bg-slate-100 dark:bg-slate-900 focus:bg-slate-200 focus:dark:bg-slate-950 dark:text-white mr-2 rounded outline-none"
          ></input>
          <input
            type="datetime-local"
            defaultValue={formatDateForDatetimeLocal(newEventEnd!)}
            onChange={(e) => setNewEventEnd(new Date(e.target.value))}
            className="col-span-3 p-4 text-black bg-slate-100 dark:bg-slate-900 focus:bg-slate-200 focus:dark:bg-slate-950 dark:text-white mr-2 rounded outline-none"
          ></input>
          <button
            className="col-span-1 p-4 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:text-white dark:hover:bg-slate-700 rounded"
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              addEventToCalendar();
            }}
          >
            +
          </button>
        </form>
      </div>
      <div className="w-full">
        <div className="w-full  mb-5">
          {calendar?.events.map((event, eventIndex) => (
            <div
              key={event.id}
              className="bg-slate-200 p-4 mt-4 dark:bg-slate-600 hover:bg-slate-300 dark:text-white dark:hover:bg-slate-700 rounded flex justify-between"
            >
              <Link href={`/calendar?id=${event.id}`}>{event.name}</Link>
              <div>
                Start:
                {new Date(event.startTime.seconds * 1000).toLocaleString()}
              </div>
              <div>
                End: {new Date(event.endTime.seconds * 1000).toLocaleString()}
              </div>
              <div>
                Updated:
                {new Date(event.updatedAt.seconds * 1000).toLocaleString()}
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  const removed = [...calendar.events];
                  removed.splice(eventIndex, 1);
                  updateCalendar({
                    events: removed,
                  });
                }}
              >
                x
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
