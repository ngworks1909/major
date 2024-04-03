const RSA = require('node-rsa');

const decryptData = (encryptedData, serializedKey) => {
    const key = new RSA();
    key.importKey(serializedKey, "pkcs1-private-pem");
    const decryptedData = key.decrypt(encryptedData, "utf8");
    return decryptedData;
};

module.exports = decryptData;