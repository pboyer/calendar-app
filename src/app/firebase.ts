// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyA6UX6izvVYqmpyIc5me3dnvhdjopVSJlM",
  authDomain: "calendar-app-82adc.firebaseapp.com",
  projectId: "calendar-app-82adc",
  storageBucket: "calendar-app-82adc.appspot.com",
  messagingSenderId: "617368833015",
  appId: "1:617368833015:web:c06269be4e19599dcefcf2",
  measurementId: "G-HN2EZ68X6D",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app!);
export const auth = getAuth(app);
// export const analytics = getAnalytics(app);
