"use client";

import { Timestamp } from "firebase/firestore";

export interface CalendarEvent {
  id: string;
  author: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  startTime: Timestamp;
  endTime: Timestamp;
}

export interface Calendar {
  id: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  events: CalendarEvent[];
  roles: { [userId: string]: "VIEW" | "EDIT" | "ADMIN" };
}
