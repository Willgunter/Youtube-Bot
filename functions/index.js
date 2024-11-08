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

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

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

// const storage = new Storage();
// const bucket = sto

// START OF MAIN STUFF!!!

exports.helloWorld = onRequest(async (request, response) => {
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
    const responseFromGemini = "look at me my project is starting to finally take shape finally this has taken so long I am so happy wheee eeeeeeeeee wheeeeeeee eeeee wheeeeeeeeeeeee";

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
        // "edits" the video --> applys basic cropping + just combines audio + video for now
        await editVideo(ttsAudioPath, originalVideoFilePath, editedVideoFilePath);

        // transcribe video
        const srtOutputPath = path.join(os.tmpdir(), `YoutubeBotFiles/transcription${currentTime}.srt`);
        await generateSubtitles(editedVideoFilePath, srtOutputPath);
        console.log(`Transcription saved to: ${srtOutputPath}`);

        // works until here

        
        const videoWithCaptionsPath = path.join(os.tmpdir(), `YoutubeBotFiles/withCaptions${currentTime}.mp4`);
        
        // CAPTIONING

        const zapcap = new ZapCap({
            apiKey: process.env.ZAPCAP_API_KEY,
        });

        // Upload a video
        const {
            data: { id: videoId },
        } = await zapcap.uploadVideo(fs.createReadStream(editedVideoFilePath));

        // Create a video task with the first available template
        const templateId = "982ad276-a76f-4d80-a4e2-b8fae0038464"; // id for caption template
        const {
            data: { taskId },
        } = await zapcap.createVideoTask(videoId, templateId, autoApprove=true);

        console.log(`Video uploaded and task created with ID: ${taskId}`);

        // already have srt file from earlier so can skip to rendering (???)
        const transcript = await zapcap.helpers.pollForTranscript(videoId, taskId, {
            retryFrequencyMs: 5000, // Poll every 5 seconds
            timeoutMs: 60000, // Timeout after 60 seconds
        });

        const stream = await zapcap.helpers.pollForRender(
            videoId,
            taskId,
            {
                retryFrequencyMs: 5000, // Poll every 5 seconds
                timeoutMs: 120000, // Timeout after 120 seconds
            },
            true
        );

        const writeStream = fs.createWriteStream(videoWithCaptionsPath);
        await pipeline(stream, writeStream);
        console.log(`Video has been downloaded and saved to ${videoWithCaptionsPath}`);

        // CAPTIONING

        // console.log(`Subtitles successfully added to: ${videoWithSubtitlesPath}`);

        response.send("works")

    } catch (error) {
        console.error("Failed to upload file:", error);
        response.status(500).send("Failed to upload file.");
    } finally {
        // fs.unlinkSync(ttsPath);
    }

});

// def main():
//     if not os.path.exists("generated"):✅
//         os.makedirs("generated")✅

//     script = create_script("Fast food")✅
//     title, content = script["title"], script["script"]✅
//     print("Title:", title)✅
//     print("Content:", content)✅

//     if len(title) > 100:✅
//         print("Error: The title is too long for YouTube. Title length:", len(title))✅
//         return✅

//     formatted_now = get_current_datetime()✅

//     speech_path = generate_speech(content, f"generated/speech_{formatted_now}.mp3")✅

//     video_path = edit_video(
//         speech_path, "minecraft.mp4", f"generated/intermediate_{formatted_now}.mp4"
//     )🟨
//     srt_path = transcribe_video(video_path, f"generated/{formatted_now}.srt")✅
//     final_video_path = add_subtitles_to_video(
//         video_path, srt_path, f"generated/final_{formatted_now}.mp4"
//     )
//     final_short_path = shorten_video_if_needed(final_video_path)