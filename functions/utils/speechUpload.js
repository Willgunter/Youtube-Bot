
async function speechUpload(localFilePath, currentTime, bucket) {

    await bucket.upload(localFilePath, {
        destination: `generated/texttospeech${currentTime}.mp3`, // generates file on the spot
        metadata: { contentType: "audio/mp3" },
    });

}

module.exports = speechUpload