// Upload the file to Firebase Storage (works)
// bucket.upload(localFilePath, { destination: destination, public: true,}) // optional, to make it public
//     .then(() => { console.log("File uploaded to 'generated/file.txt'"); })
//     .catch((err) => { console.error('Error uploading file:', err); });

// reads from file (works)
// let fileContent = '';
// remoteFile.createReadStream()
// .on('error', (err) => {
//     console.error('Error reading the file:', err);
//   })
//   .on('data', (chunk) => {
//     // Accumulate chunks into the fileContent variable
//     fileContent += chunk.toString('utf8');
//   })
//   .on('end', () => {
//     // All chunks are received, and the fileContent string is complete
//     console.log('File read complete. Content:');
//     console.log(fileContent);  // Here is the full content of the file as a string
//   });