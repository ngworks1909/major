const { ref, uploadBytesResumable, getDownloadURL } = require("firebase/storage");
const { doc, updateDoc, arrayUnion } = require("firebase/firestore");

const uploadFile = async(storage, id, filename, db, textblob, hashCode, fileId) => {
    const storageRef = ref(storage, `${id}/${filename}.txt`);
    await uploadBytesResumable(storageRef, textblob).then(async () => {
      getDownloadURL(storageRef).then(async (downloadURL) => {
        await updateDoc(doc(db, "userfiles", `${id}`), {
          files: arrayUnion({
            fileId,
            filename: `${filename}.txt`,
            url: downloadURL,
            hashCode,
            createdAt: new Date(),
          }),
        });
      });
    });
}


module.exports = uploadFile;