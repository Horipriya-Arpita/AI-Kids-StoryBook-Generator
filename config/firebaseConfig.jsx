// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage} from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD62QVhZEmBjtKmrR8l08OunW1Gcj31jj4",
  authDomain: "ai-kids-story-generator-eec18.firebaseapp.com",
  projectId: "ai-kids-story-generator-eec18",
  storageBucket: "ai-kids-story-generator-eec18.appspot.app",
  messagingSenderId: "573860690985",
  appId: "1:573860690985:web:f773463641b150ebb57038",
  measurementId: "G-LGM0SWD8LM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
export const storage = getStorage(app);
export const db = getFirestore(app); 