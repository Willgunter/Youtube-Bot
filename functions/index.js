/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
const { onRequest } = require("firebase-functions/v2/https");
// const { logger } from "firebase-functions/logger";

const axios = require("axios");
const fsExtra = require('fs-extra');
const ffmpeg = require('fluent-ffmpeg');
const { ZapCap } = require("zapcap");
const { pipeline } = require("stream/promises");

// NO @ffmpeg/ffmpeg !!!!!!!!!!!

const admin = require('firebase-admin')
const serviceAccount = require('./bot-e5092-firebase-adminsdk-n1rf1-d5e77f04c2.json');
const fs = require('fs');
const gTTS = require('gtts');
const os = require('os');
const path = require('path');

const createScript = require("./utils/createScript.js"); // not using to save on api requests
const getCurrentDateTime = require('./utils/currentDateTime.js');
const generateTTS = require('./utils/generateTTS.js');
const speechUpload = require('./utils/speechUpload.js'); // not using because it is not uploaded to cloud yet
const editVideo = require('./utils/editVideo.js');
const generateSubtitles = require('./utils/generateSubtitles.js');
const addSubtitlesToVideo = require('./utils/addSubtitlesToVideo.js'); // currently working on
const addCaptions = require('./utils/addCaptions.js');

// firebase emulators:start

// Import Firebase and Firestore
// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";

// const firestore = admin.firestore();

// Initialize Firebase Admin SDK 
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://bot-e5092.appspot.com',
});

const bucket = admin.storage().bucket();

// START OF MAIN STUFF!!!

exports.helloWorld = onRequest({
    timeoutSeconds: 540, // 9 minutes (max is 540 seconds for standard tier)
    memory: '2GiB',     // Increase memory allocation
    minInstances: 0,    // Minimum number of instances
    maxInstances: 100   // Maximum number of instances
}, async (request, response) => {
    // exports.helloWorld = onRequest.runWith({timeoutSeconds: "300s"}).async(async (request, response) => {

    let script;
    let title = "";

    // TODO comment for testing (so we don't waste gemini)
    // do {
    //     try {
    //         responseFromGemini = await createScript("Give me a short speech on why fast food is bad for you and a complementary title as well")
    //         // response.send("script: " + responseFromGemini.script + "title: " + responseFromGemini.title);

    //         script = responseFromGemini.script;
    //         title = responseFromGemini.title;

    //     } catch (error) {
    //         logger.error("Error creating script: ", error);
    //         response.status(500).send("An error occurred");
    //     }
    // } while (title.length > 100); // repeats if title is too long (might change later)
    // TODO: for testing 
    const responseFromGemini = `I tried starting a hot air balloon business, but it never took off.
I used to hate facial hair... but then I grew fond of it.
I'm reading a book about anti-gravity. It's impossible to put down. `;

    currentTime = getCurrentDateTime();
    ttsAudioPath = path.join(os.tmpdir(), "YoutubeBotFiles/ttsAudio" + currentTime + ".mp3");

    console.log("basic stuff completed");

    try {

        // 1) script 2) file path
        // generates tts audio
        await generateTTS(responseFromGemini, ttsAudioPath);

        // uploads .mp3 file to firebase bucket
        // await speechUpload(localFilePath, currentTime, bucket);
        // console.log("speechUpload completed");

        // https://www.gyan.dev/ffmpeg/builds/ <-- if we decide on something else later
        const editedVideoFilePath = path.join(os.tmpdir(), "YoutubeBotFiles/edited" + currentTime + ".mp4");
        const originalVideoFilePath = path.join(os.tmpdir(), "YoutubeBotFiles/minecraft.mp4")
        await editVideo(ttsAudioPath, originalVideoFilePath, editedVideoFilePath);

        // transcribe video
        const srtOutputPath = path.join(os.tmpdir(), `YoutubeBotFiles/transcription${currentTime}.srt`);
        await generateSubtitles(editedVideoFilePath, srtOutputPath);
        console.log(`Transcription saved to: ${srtOutputPath}`);

        // works until here

        const videoWithCaptionsPath = path.join(os.tmpdir(), `YoutubeBotFiles/withCaptions${currentTime}.mp4`);
        
        // CAPTIONING
        await addCaptions(editedVideoFilePath, videoWithCaptionsPath);
        // CAPTIONING

        // console.log(`Subtitles successfully added to: ${videoWithSubtitlesPath}`);

        response.send("works")

    } catch (error) {
        console.error("Failed to upload file:", error);
        response.status(500).send("Failed to upload file.");
    } finally {
        // fs.unlinkSync(ttsPath);
        // don't forget to unlinkSync (delete) all the other files
    }

});