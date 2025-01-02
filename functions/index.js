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
const { PubSub } = require('@google-cloud/pubsub');
// const functions = require('firebase-functions');
// const functions = require('@google-cloud/functions-framework');
// const functions = require("firebase-functions");

const pubSubClient = new PubSub();

const axios = require("axios");
const fsExtra = require('fs-extra');
const ffmpeg = require('fluent-ffmpeg');
const { ZapCap } = require("zapcap");
const { pipeline } = require("stream/promises");
require('dotenv').config();

// const admin = require('firebase-admin')
// const serviceAccount = require('./bot-e5092-firebase-adminsdk-n1rf1-d5e77f04c2.json');
// const fs = require('fs');
// const gTTS = require('gtts');
const os = require('os');
const path = require('path');

const generateSubtitles = require('./utils/captions/generateCaptionTimingFile.js');
const addCaptions = require('./utils/captions/addCaptions.js');

const createScript = require("./utils/script/createScript.js"); // not using to save on api requests
const fetchYoutube = require("./utils/script/fetchYoutubeTrendingData.js");

const generateLipSyncVideo = require("./utils/lipsync/generateLipSyncVideo.js")

const getCurrentDateTime = require('./utils/currentDateTime.js');
const generateTTS = require('./utils/generateTTS.js');
const editVideo = require('./utils/editVideo.js');

// firebase emulators:start

// Import Firebase and Firestore
// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";

// const firestore = admin.firestore();

// Initialize Firebase Admin SDK 
// admin.initializeApp({
    // credential: admin.credential.cert(serviceAccount),
    // storageBucket: 'gs://bot-e5092.appspot.com',
// });

// const bucket = admin.storage().bucket();

// START OF MAIN STUFF!!!

// URL: https://refactored-parakeet-pp9gqxr7qq92rr66-8001.app.github.dev/bot-e5092/us-central1/coreLogic

// handles core things like script creation, captioning, 
exports.coreLogic = onRequest({
    timeoutSeconds: 540, // 9 minutes (max is 540 seconds for standard tier)
    memory: '2GiB',     // Increase memory allocation
    minInstances: 0,    // Minimum number of instances
    maxInstances: 100   // Maximum number of instances
}, async (request, response) => {
    // DELETE LATER
    
    currentTime = getCurrentDateTime();

    try {
        // Trigger Function B via Pub/Sub
        const message = { task: 'addCharacter', 
            // captionsFileName: `./delete_later/withCaptions${currentTime}.mp4`, 
            currentTime: currentTime
            // webmFileName: `./delete_later/aswebm${currentTime}.webm`
             };

        pubSubClient.topic('add-character').publishMessage({
            data: Buffer.from(JSON.stringify(message)),
        });
        
        console.log('Function B triggered via Pub/Sub');
        
        // Function A exits after triggering Function B
        response.status(200).send('Function A is done.');
    } catch (error) {
        console.error('Error in Function A:', error);
        response.status(500).send('Failed to execute Function A');
    }

    console.error("idk yet");
    // response.send("stop");
    // DELETE LATER
        // TODO comment for testing (so we don't waste gemini)
//         let responseFromGemini;
//         let title;

//         try {
//             do {
//                 console.log("aosidhf;");
//                 // - Include potential B-roll or visual suggestions in parentheses

//             const youtubeTrendingStuff = await fetchYoutube();
//             const scriptResponse = await createScript(youtubeTrendingStuff);
            
//             console.log(`Script: ${scriptResponse.script}`)
//             responseFromGemini = scriptResponse.script;
//             title = scriptResponse.title;

//         } while (title == undefined || title.length > 100); // repeats if title is too long (might change later)
//         } catch (error) {
//             // logger.error("Error creating script: ", error);
//             response.status(500).send("An error occurred");
//         }
//     // response.status(500).send("stop")
//     console.log(`Scrip555t: ${responseFromGemini}`)
    
//     // TODO: for testing 
// //     responseFromGemini = `I tried starting a hot air balloon business, but it never took off.
// // I used to hate facial hair... but then I grew fond of it.
// // I'm reading a book about anti-gravity. It's impossible to put down. `;

//     // ttsAudioPath = path.join(os.tmpdir(), "YoutubeBotFiles/ttsAudio" + currentTime + ".mp3");
//     ttsAudioPath = "./delete_later/ttsAudio" + currentTime + ".mp3";
//     // npm install firebase-functions-test@latest --save-dev npm isntall firebase-functions@latest firebase-admin@latest --save

//     console.log("basic stuff completed");

//     try {

//         // 1) script 2) file path
//         // generates tts audio
//         await generateTTS(responseFromGemini, ttsAudioPath);

//         // uploads .mp3 file to firebase bucket
//         // await speechUpload(localFilePath, currentTime, bucket);
//         // console.log("speechUpload completed");

//         // https://www.gyan.dev/ffmpeg/builds/ <-- if we decide on something else later
//         // const editedVideoFilePath = path.join(os.tmpdir(), "YoutubeBotFiles/edited" + currentTime + ".mp4");
//         const editedVideoFilePath = "./delete_later/edited" + currentTime + ".webm";

//         // const originalVideoFilePath = path.join(os.tmpdir(), "YoutubeBotFiles/minecraft.mp4")
//         const originalVideoFilePath = "./videos/surfer-1.mp4";
//         await editVideo(ttsAudioPath, originalVideoFilePath, editedVideoFilePath);

//         // transcribe video
//         // const srtOutputPath = path.join(os.tmpdir(), `YoutubeBotFiles/transcription${currentTime}.srt`);
//         const srtOutputPath = `./delete_later/transcription${currentTime}.srt`;
//         await generateSubtitles(editedVideoFilePath, srtOutputPath);
//         // console.log(`Transcription saved to: ${srtOutputPath}`);

//         // works until here

//         // const videoWithCaptionsPath = path.join(os.tmpdir(), `YoutubeBotFiles/withCaptions${currentTime}.mp4`);
//         const videoWithCaptionsPath = `./delete_later/withCaptions${currentTime}.mp4`;
//         // CAPTIONING
//         await addCaptions(editedVideoFilePath, videoWithCaptionsPath);
//         // CAPTIONING

//         // console.log(`Subtitles successfully added to: ${videoWithSubtitlesPath}`);
        
//         // const webmFile = `./delete_later/aswebm${currentTime}.webm`
//         // ffmpeg(videoWithCaptionsPath)
//         //   .output(webmFile)
      
//         // SEND videoWithCaptionsPath and webmFile OVER TO CHARACTER FUNCTION
        
//         try {
//             // Trigger Function B via Pub/Sub
//             const message = { task: 'addCharacter', 
//                 captionsFileName: `./delete_later/withCaptions${currentTime}.mp4`, 
//                 webmFileName: `./delete_later/aswebm${currentTime}.webm` };

//             await pubSubClient.topic('add-character').publishMessage({
//                 data: Buffer.from(JSON.stringify(message)),
//             });
            
//             console.log('Function B triggered via Pub/Sub');
            
//             // Function A exits after triggering Function B
//             response.status(200).send('Function A is done.');
//         } catch (error) {
//             console.error('Error in Function A:', error);
//             response.status(500).send('Failed to execute Function A');
//         }

//     } catch (error) {
//         console.error("Failed to upload file:", error);
//         response.status(500).send("Failed to upload file.");
//     } finally {
//         // fs.unlinkSync(ttsPath);
//         // don't forget to unlinkSync (delete) all the other files
//     }

});

// Handles lip-sync and adding character to video
// exports.character = 
// functions.cloudEvent('addCharacter', cloudEvent => {
    // The Pub/Sub message is passed as the CloudEvent's data payload.
    // console.log("hi");
    
//   });
const { onMessagePublished } = require('firebase-functions/v2/pubsub');

// Pub/Sub trigger for the 'add-character' topic
// emulator commands: 
// 1) start emulator check
// 2) curl -X PUT http://localhost:8085/v1/projects/bot-e5092/topics/add-character
exports.character = onMessagePublished('add-character', (event) => {
    //   try {
        // Decode the message from base64
        const messageData = event.data.message ? Buffer.from(event.data.message.data, 'base64').toString() : null;
        const message = JSON.parse(messageData);

        const currentTime = message.currentTime;
        
        console.log('Received message:', message);
        console.log('currentTime variable:', currentTime);

        console.log('Processing task:');

        generateLipSyncVideo(currentTime);

        try {

        } catch {
            console.error("bad")
        }
    // console.error('Error processing Pub/Sub message:', error);
//   }
});
    // .timeoutSeconds(540)  // Set timeout within the function declaration
    // .memory('2GiB');      // Optionally increase memory if needed
