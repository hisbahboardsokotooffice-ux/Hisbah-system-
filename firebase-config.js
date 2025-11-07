// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5UQ-8624b960An1wmwSE_zIgszNYkWZQ",
  authDomain: "hisbah-board.firebaseapp.com",
  databaseURL: "https://hisbah-board-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hisbah-board",
  storageBucket: "hisbah-board.firebasestorage.app",
  messagingSenderId: "385506606666",
  appId: "1:385506606666:web:11e68844287a0d1d3170b3",
  measurementId: "G-11F46GSTFY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export to be used by other scripts
export { auth, db, storage };