import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCcE4BEhXGL5RzHjNUaBswM3mVp7zPnFbU",
  authDomain: "hotel-crisis-app.firebaseapp.com",
  projectId: "hotel-crisis-app",
  storageBucket: "hotel-crisis-app.appspot.com",
  messagingSenderId: "134260681734",
  appId: "1:134260681734:web:1c8b0871ce690aece3a787"
};

const app = initializeApp(firebaseConfig);

// ✅ Export only these
export const auth = getAuth(app);
export const db = getFirestore(app);