const createBlob = (data, mimeType) => {
    const blob = new Blob([data], { type: mimeType });
    return blob;
};
module.exports = createBlob;