import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDcFDCTx-PYe0nyPi8BfQ0lUMLmfKpTAgM",
    authDomain: "d-yd-ca786.firebaseapp.com",
    databaseURL: "https://d-yd-ca786-default-rtdb.firebaseio.com",
    projectId: "d-yd-ca786",
    storageBucket: "d-yd-ca786.firebasestorage.app",
    messagingSenderId: "316391198959",
    appId: "1:316391198959:web:701870b7749057f6788b1a",
    measurementId: "G-CPTF1872RX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
