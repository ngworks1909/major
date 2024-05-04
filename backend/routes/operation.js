const express = require("express");
const { fetchUser } = require("../middlewares/user");
const router = express.Router();
const { getDoc, doc, updateDoc, arrayUnion } = require("firebase/firestore");
const { db, storage } = require("../firebase");
const {ref, deleteObject, uploadBytesResumable, getDownloadURL } = require('firebase/storage')
const { v4 } = require("uuid");
const { backupstorage, backupdb } = require("../backup");
const createHash = require("../functions/createHash");
const uploadFile = require("../functions/uploadFile");
const createBlob = require('../functions/createBlob');
const encryptData = require('../functions/encryptData');
const decryptData = require('../functions/decryptData');



router.post("/uploadFile", fetchUser, async (req, res) => {
  //collect file details
  const id = req.user.id;
  let fileContent = req.body.fileContent;
  const filename = req.body.name;
  let success = false;
  if (!id) {
    return res.status(400).json({ success, error: "Please authenticate using valid token..." });
  }
  try {
    const userDoc = await getDoc(doc(db, "users", id));
    if (!userDoc.exists()) {
      return res.status(400).json({ success, error: "Authentication error..." });
    }
    const user = userDoc.data();
    //check if file already exists using hashcode
    const serializedKey = user.serializedKey;
    const hashCode = createHash(fileContent);
    const docSnapshot = await getDoc(doc(db, "userfiles", `${id}`));
    if (!docSnapshot.exists()) {
      return res.status(400).json({ success, error: "Authentication error..." });
    }
    const files = docSnapshot.data().files;
    let dbhashExists = false;
    for (let i = 0; i < files.length; i++) {
      const userfile = files[i];
      if (userfile.hashCode === hashCode.toString()) {
        dbhashExists = true;
      }
    }
    if (dbhashExists) {
      success = false;
      return res.status(400).json({success, error: 'File already exists...'})
    }

    //check file in backups
    const backupSnapshot = await getDoc(doc(backupdb, "userfiles", `${id}`));
    if (!backupSnapshot.exists()) {
      success = false;
      return res.status(400).json({ success, error: "Authentication error..." });
    }
    const backupfiles = backupSnapshot.data().files;
    let backuphashExists = false;
    let fileUrl = ''
    let fileId = '';
    for (let i = 0; i < backupfiles.length; i++) {
      const userfile = backupfiles[i];
      if (userfile.hashCode === hashCode.toString()) {
        backuphashExists = true;
        fileUrl = userfile.url;
        fileId = userfile.fileId;
      }
    }
    if(backuphashExists){
      const response = await fetch(fileUrl);
      if(!response.ok){
        return res.status(400).json({success, error: 'Network failure...'});
      }
      //fetch from ackup if file exists
      const encryptedData = await response.text()
      fileContent = decryptData(encryptedData, serializedKey);
      const textblob = createBlob(fileContent, 'text/plain');
      await uploadFile(storage, id, filename, db, textblob, hashCode, fileId);
      success = true;
      return res.json({success, message: "File uploaded successfully..."});
    }
    //create new file in both backup and main db
    else{
      let textblob = createBlob(fileContent, 'text/plain');
      fileId = v4();
      await uploadFile(storage,id, filename, db, textblob, hashCode, fileId)
      const encryptedData = encryptData(fileContent, serializedKey);
      textblob = createBlob(encryptedData, "text/plain");
      await uploadFile(backupstorage,id,filename,backupdb, textblob,hashCode,fileId);
      success = true;
      return res.status(400).json({ success, message: "File uploaded successfully..." });
    }
  } catch (error) {
    success = false;
    console.log(error)
    return res.status(500).json({ success, error: "Internal server error..." });
  }
});



router.delete('/deleteFile/:fileId', fetchUser, async(req, res) => {
  const id = req.user.id;
  let success = false;
  if(!id){
     return res.status(400).json({success, error: "Please authenticate using valid token..."});
  }
  try {
    const docSnapshot = await getDoc(doc(db, "userfiles", `${id}`));
    if (!docSnapshot.exists()) {
      return res.status(400).json({ success, error: "Authentication error..." });
    }
    const fileArray = docSnapshot.data().files;
    const index = fileArray.findIndex(file => file.fileId === req.params.fileId);
    if(index === -1){
      return res.status(404).json({success, error: 'File doesnt exist...'});
    }
    const file = fileArray[index];
    fileArray.splice(index, 1);
    await updateDoc(doc(db, 'userfiles', id), {files: fileArray});
    const storageRef = ref(storage, `${id}/${file.filename}`);
    await deleteObject(storageRef);
    success = true;
    return res.json({success, message: 'File deleted successfully'});
  } catch (error) {
    success = false;
    console.log(error);
    return res.status(500).json({success, error: 'Internal server error...'});
  }
});

router.get('/fetchFiles', fetchUser, async(req, res) => {
  const id = req.user.id;
  let success = false;
  if(!id) {
    return res.status(400).json({success, error: 'Authentication error...'})
  }
  try {
    const docSnapshot = await getDoc(doc(db, "userfiles", `${id}`));
    if (!docSnapshot.exists()) {
      return res.status(400).json({ success, error: "Authentication error..." });
    }
    const files = docSnapshot.data().files;
    files.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
  });
    success = true;
    return res.json({success, files});
  } catch (error) {
    success = false;
    return res.status(500).json({success, error: 'Internal server error...'});
  }
})

router.put('/fetchMissing/:fileId', fetchUser, async(req, res) => {
  const id = req.user.id;
  let success = false;
  if(!id){
    res.status(400).json({success, error: 'Authentication error...'});
  }
  try {
    const userDoc = await getDoc(doc(db, "users", id));
    if (!userDoc.exists()) {
      return res.status(400).json({ success, error: "Authentication error..." });
    }
    const user = userDoc.data();
    const serializedKey = user.serializedKey;
    const docSnapshot = await getDoc(doc(backupdb, "userfiles", `${id}`));
  if (!docSnapshot.exists()) {
    return res.status(400).json({ success, error: "Authentication error..." });
  }
  const fileArray = docSnapshot.data().files;
  const index = fileArray.findIndex(file => file.fileId === req.params.fileId);
  if(index === -1){
      return res.status(404).json({success, error: 'File doesnt exist...'});
  }
  const url = fileArray[index].url;
  
  const response = await fetch(url);
  if(!response.ok){
    return res.status(400).json({success, error: 'Network failure...'});
  }
  const encryptedData = await response.text()
  fileContent = decryptData(encryptedData, serializedKey);
  const textblob = createBlob(fileContent, 'text/plain');

  const dbSnapshot = await getDoc(doc(db, "userfiles", `${id}`));
  if (!dbSnapshot.exists()) {
    return res.status(400).json({ success, error: "Authentication error..." });
  }
  const dbArray = dbSnapshot.data().files;
  const dbindex = dbArray.findIndex(file => file.fileId === req.params.fileId);
  if(dbindex === -1){
      return res.status(404).json({success, error: 'File doesnt exist...'});
  }
  let filename = dbArray[dbindex].filename;
  const storageRef = ref(storage, `${id}/${filename}`);
  await uploadBytesResumable(storageRef, textblob).then(async () => {
    getDownloadURL(storageRef).then(async (downloadURL) => {
        dbArray[dbindex].url = downloadURL;
        await updateDoc(doc(db, "userfiles", `${id}`), {
          files: dbArray,
        });
    });
  });
  success = true;
  return res.json({success, message: 'File fetched successfully...'})
  
  } catch (error) {
    console.log(error)
    success = false;
    return res.status(500).json({success, error: 'Internal server error...'})
  }
});


// router.put("/encryptFile/:fileId", fetchUser, async (req, res) => {
//   const id = req.user.id;
//   let success = false;
//   if (!id) {
//     return res.status(400).json({ success, error: "Please authenticate using valid token..." });
//   }
  
//   const userDoc = await getDoc(doc(db, "users", id));
//   if (!userDoc.exists()) {
//     return res.status(400).json({ success, error: "Authentication error..." });
//   }
//   const user = userDoc.data();
//   const serializedKey = user.serializedKey;
//   const docSnapshot = await getDoc(doc(db, "userfiles", `${id}`));
//   if (!docSnapshot.exists()) {
//     return res.status(400).json({ success, error: "Authentication error..." });
//   }

// });

// router.get("/decryptFile/:fileId", fetchUser, async (req, res) => {
//   const id = req.user.id;
//   let success = false;
//   if (!id) {
//     return res.status(400).json({ success, error: "Please authenticate using valid token..." });
//   }

//   const userDoc = await getDoc(doc(db, "users", id));
//   if (!userDoc.exists()) {
//     return res.status(400).json({ success, error: "Authentication error..." });
//   }
//   const user = userDoc.data();
//   const serializedKey = user.serializedKey;
//   const docSnapshot = await getDoc(doc(db, "userfiles", `${id}`));
//   if (!docSnapshot.exists()) {
//     return res.status(400).json({ success, error: "Authentication error..." });
//   }
//   const files = docSnapshot.data().files;
//   const fileId = req.params.fileId;
//   let userfile;
//   for (let i = 0; i < files.length; i++) {
//     const tempFile = files[i];
//     if (tempFile.fileId === fileId) {
//       userfile = tempFile;
//       break;
//     }
//   }
//   if (!userfile) {
//     return res.status(400).json({ success, error: "Some error occured..." });
//   }
//   fetch(userfile.url)
//     .then((response) => {
//       if (!response.ok) {
//         return res.status(500).json({success,error: 'Network failure...'})
//       }
//       return response.text();
//   })
//     .then((encryptedData) => {
//       const decryptedData = decryptData(encryptedData, serializedKey);
//       fs.writeFileSync(
//         "C:/Users/Nithin/OneDrive/Desktop/projects/major/backend/files/decrypted.txt",
//         decryptedData
//       );
//       success = true;
//       res.json({ success, message: "File decrypted successfully..." });
//     })
//     .catch((error) => {
//       success = false;
//       res.status(400).json({ success, error: "Some error occured..." });
//     });
// });



module.exports = router;
