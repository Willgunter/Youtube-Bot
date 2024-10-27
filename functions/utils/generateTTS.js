const gTTS = require('gtts'); // Ensure gTTS is imported

// Function that generates TTS and saves it to a file
async function generateTTS(script, localFilePath) {
    const gtts = new gTTS(script, 'en'); // Adjust language if needed

    return new Promise((resolve, reject) => {
        gtts.save(localFilePath, (err) => {
            if (err) {
                console.error("Error generating TTS:", err);
                return reject(err);
            }
            console.log(`TTS saved to ${localFilePath}`);
            resolve(localFilePath);
        });
    });
}

module.exports = generateTTS;