const { initializeApp } = require('firebase/app');
const {getFirestore} = require('firebase/firestore');
const {getStorage} =  require('firebase/storage');

const firebaseConfig = {
    apiKey: "AIzaSyA5XNwIFi9zzHM_cU8bHwL1LI4QjU6Xfd4",
    authDomain: "healthbackup-dadf7.firebaseapp.com",
    projectId: "healthbackup-dadf7",
    storageBucket: "healthbackup-dadf7.appspot.com",
    messagingSenderId: "819669849007",
    appId: "1:819669849007:web:953b3f4ed42cce84a2555a",
    measurementId: "G-1THJK9Z6G6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig, 'BACKUP');
const backupdb = getFirestore(app);
const backupstorage = getStorage(app);

module.exports = {backupdb, backupstorage};