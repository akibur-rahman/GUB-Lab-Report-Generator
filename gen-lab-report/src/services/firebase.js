// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getDatabase, ref, set, get } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyDqCo7nYSS8x4O7Mt4j89BMrzD2qddo0iA",
    authDomain: "gublabreport-e48ab.firebaseapp.com",
    databaseURL: "https://gublabreport-e48ab-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "gublabreport-e48ab",
    storageBucket: "gublabreport-e48ab.appspot.com",
    messagingSenderId: "341411955941",
    appId: "1:341411955941:web:eb14fd1addfbf01790400c",
    measurementId: "G-D89CR4VRPG"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database, ref, set, get, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut };
