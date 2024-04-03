const RSA = require('node-rsa');

const encryptData = (data, serializedKey) => {
    const key = new RSA();
    key.importKey(serializedKey, "pkcs1-private-pem");
    const encryptedData = key.encrypt(data, "base64");
    return encryptedData;
};
module.exports = encryptData;