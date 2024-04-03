const { initializeApp } = require('firebase/app');
const {getFirestore} = require('firebase/firestore');
const {getStorage} =  require('firebase/storage');
const {getAuth} = require('firebase/auth')

const firebaseConfig = {
    apiKey: "AIzaSyCGcd190i-TbjkTWX5yVIk7Ec3Otd9dHQ4",
    authDomain: "healthp-6043e.firebaseapp.com",
    projectId: "healthp-6043e",
    storageBucket: "healthp-6043e.appspot.com",
    messagingSenderId: "188273848484",
    appId: "1:188273848484:web:faf59e05980113dbf1b631",
    measurementId: "G-34P315CB7R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

module.exports = {auth, db, storage};