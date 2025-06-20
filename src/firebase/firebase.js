// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyB6-_aMZiOa94zXGIkDy_oSrY3_Tf0A5ts",
  authDomain: "mininotes-dd2af.firebaseapp.com",
  projectId: "mininotes-dd2af",
  storageBucket: "mininotes-dd2af.appspot.com",
  messagingSenderId: "523532089800",
  appId: "1:523532089800:web:1603bd6582888cccb368fd",
  measurementId: "G-3BJECHK6DL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const realtimeDb = getDatabase(app)

export { auth, db, realtimeDb };
