const express = require("express");
const router = express.Router();
const {auth, db} = require('../firebase');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const NodeRSA = require('node-rsa');
const {getDocs, query, collection,where,doc,setDoc, arrayUnion} = require('firebase/firestore');
const {createUserWithEmailAndPassword, signInWithEmailAndPassword} = require('firebase/auth');
const { validateUser, validateCredentials } = require("../middlewares/user");
const { backupdb } = require("../backup");


dotenv.config();


//generate private key
const generateKeyPairs = () => {
    const key = new NodeRSA({b: 2048});
    const serializedKey = key.exportKey('pkcs1-private-pem');
    return serializedKey;
}


router.post('/createUser', validateUser, async(req, res) => {
    //signup route
    const {email, password} = req.body;
    let success = false;
    try {
        const userQuerySnapshot = await getDocs(query(collection(db, 'users'), where('email', '==', email)));
        //check if user exists
        if (userQuerySnapshot.docs.length > 0) {
            return res.status(400).json({success, error: "User already exists..."})
        }

        const {user} = await createUserWithEmailAndPassword(auth, email, password);
        const id = user.uid;
        const serializedKey = generateKeyPairs();
        await setDoc(doc(db, 'users', `${id}`), {
            email,
            serializedKey,
            createdAt: new Date()
        });
        //create new user
        await setDoc(doc(db, 'userfiles', `${id}`), {
            files: arrayUnion()
        });
        await setDoc(doc(backupdb, 'userfiles', `${id}`), {
            files: arrayUnion()
        })
        const data = {
            user: {
              id,
            },
          };
        //generate token
        const authToken = jwt.sign(data, process.env.JWT_SECRET);
        success = true;
        return res.status(200).json({ success, authToken });
    } catch (error) {
        success = false;
        console.log(error);
        return res.status(500).json({success, error: "Internal server error..."});
    }
})

router.post('/login', validateCredentials, async(req, res) => {
    const {email, password} = req.body;
    let success = false;
    try {
        //fetch user details
        const userQuerySnapshot = await getDocs(query(collection(db, 'users'), where('email', '==', email)));
        if (userQuerySnapshot.docs.length === 0) {
            return res.status(400).json({success, error: "User does not exists..."})
        }
        //signin 
        const {user} = await signInWithEmailAndPassword(auth, email, password);
        const id = user.uid;
        const data = {
            user: {
              id,
            },
          };
        //generate auth token
        const authToken = jwt.sign(data, process.env.JWT_SECRET);
        success = true;
        res.status(200).json({ success, authToken });

    } catch (error) {
        success = false;
        res.status(500).json({success, error: "Invalid credentials..."})
    }

});

module.exports = router;