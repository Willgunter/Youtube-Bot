// might end up being a whole folder due to complexity
// start with aidan ouckman code (see if he can give it to me) first

async function speechUpload(localFilePath, currentTime, bucket) {

    await bucket.upload(localFilePath, {
        destination: `generated/texttospeech${currentTime}.mp3`, // generates file on the spot
        metadata: { contentType: "audio/mp3" },
    });

}

module.exports = speechUpload