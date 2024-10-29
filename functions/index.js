/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
console.log("this works1"); // << I have not tried this console.log yet
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// import axios, { AxiosError } from 'axios'
const axios = require("axios")
// import fs from 'fs-extra'
const fsExtra = require('fs-extra')
const admin = require('firebase-admin');
const serviceAccount = require('./bot-e5092-firebase-adminsdk-n1rf1-d5e77f04c2.json');
const fs = require('fs');
const gTTS = require('gtts');
const os = require('os');
const path = require('path');
console.log("this works2"); // << I have not tried this console.log yet

const createScript = require("./utils/createScript");
const getCurrentDateTime = require("./utils/currentDateTime");
const generateTTS = require("./utils/generateTTS");
const speechUpload = require("./utils/speechUpload");
const editVideo = require("./utils/editVideo");
const transcribeVideo = require("./utils/transcribeVideo");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started
console.log("this works3"); // << I have not tried this console.log yet

// firebase emulators:start

// Import Firebase and Firestore
// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";

// const firestore = admin.firestore();


// Example of querying Firestore
// START HERE WHEN YOU NEXT WORK ON IT

// Initialize Firebase Admin SDK 
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://bot-e5092.appspot.com',
});

const bucket = admin.storage().bucket();
console.log("this works4"); // << I have not tried this console.log yet

// const storage = new Storage();
// const bucket = sto


// START OF MAIN STUFF!!!
// TODO: NOTE: eventually export setup / admin / other firebase stuff to utils

// eventually get script from either random prompt or text or something
// user input?

exports.helloWorld = onRequest(async (request, response) => {
    
    const headers = {
        "authorization": process.env.ASSEMBLYAI,
        "Content-Type": "audio/mp3",
    }
    
    async function uploadToAssemblyAI(filePath) {
        const audioData = await fsExtra.readFile(filePath);
        let responseFromAssembly;
        try {
            responseFromAssembly = await axios.post("https://api.assemblyai.com/v2/upload", audioData, { headers } );
            return responseFromAssembly.data;
        } catch (error) {
            console.error("uploadToAssemblyAI Error:", error);
        }
    }

    async function requestTranscription(uploadUrl) {
        const data = {
            audio_url: uploadUrl
        }
        const responseFromTranscript = await axios.post("https://api.assemblyai.com/v2/transcript", data, {headers});
        return responseFromTranscript.data.id;
    }

    async function pollTranscription(transcriptionId) {
        let transcriptionResult;
        
        const statusUrl = `https://api.assemblyai.com/v2/transcript/${transcriptionId}`;
        
        while (true) {
            
            const responseFromPoll = await axios.get(statusUrl, {headers: headers, });
            
            transcriptionResult = responseFromPoll.data

            if (transcriptionResult.status === "completed") { 
                break; 
            }
            else if (transcriptionResult.status === "failed") { 
                throw new Error(`Transcription failed: ${transcriptionResult.error}`);
            }
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5 seconds 
        }
        return transcriptionResult;
    }

    async function getSubtitleFile(transcriptId, fileFormat) {

        if (!['srt', 'vtt'].includes(fileFormat)) {
            throw new Error(
              `Unsupported file format: ${fileFormat}. Please specify 'srt' or 'vtt'.`
            )
          }
        
          const url = `https://api.assemblyai.com/v2/transcript/${transcriptId}/${fileFormat}`
        
          try {
            const response = await axios.get(url, { headers })
            return response.data
          } catch (error) {
            throw new Error(
              `Failed to retrieve ${fileFormat.toUpperCase()} file: ${error.response
                ?.status} ${error.response?.data?.error}`
            )
          }
    }

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

    currentTime = getCurrentDateTime(); // get time to name files
    // localFilePath = "/tmp/scripttest.mp3";
    tmpPath = path.join(os.tmpdir(), "testasdf" + currentTime + ".mp3");
    console.log("basic stuff completed5");

    // TODO: for testing 
    const responseFromGemini = "look at me my project is starting to finally take shape finally this has taken so long I am so happy wheee eeeeeeeeee wheeeeeeee eeeee wheeeeeeeeeeeee";

    console.log("basic stuff completed");

    try {

        // 1) script 2) file path
        await generateTTS(responseFromGemini, tmpPath);

        console.log("generateTTS completed");
        console.log(tmpPath);

        // uploads .mp3 file to firebase bucket
        // await speechUpload(localFilePath, currentTime, bucket);

        console.log("speechUpload completed");

        // https://www.gyan.dev/ffmpeg/builds/ <-- if we decide on something else later
        // generated/texttospeech${currentTime}.mp3, "minecraft.mp4", "generated/edited" + currentTime + ".mp4" 
        // editVideo(`generated/texttospeech10_27_2024_05_18_28.mp3`, "generated/minecraft.mp4", `generated/edited${currentTime}.mp3` ); // TODO once you come back pathToGeneratedAudio, videoPath, outputPath
        await editVideo(tmpPath, path.join(os.tmpdir(), "minecraft.mp4"), path.join(os.tmpdir(), "edited" + currentTime + ".mp4") ); // TODO once you come back pathToGeneratedAudio, videoPath, outputPath
        await new Promise((resolve) => setTimeout(resolve, 10000));
        // transcribe video
        // transcribeVideo(path.join(os.tmpdir(), "edited" + currentTime + ".mp4"), path.join(os.tmpdir(), "transcription.srt"));
        // TRANSCRIBE VIDEO
        
// async function transcribeVideo(path.join(os.tmpdir(), "edited" + currentTime + ".mp4"), path.join(os.tmpdir(), "transcription.srt")) {
    try { // Step 1: Upload the video file to AssemblyAI 
        const videoFilePath = path.join(os.tmpdir(), "edited" + currentTime + ".mp4");
        const srtOutputPath = path.join(os.tmpdir(), `transcription${currentTime}.srt`);
        const uploadResponse = await uploadToAssemblyAI(tmpPath);
        const uploadUrl = uploadResponse.upload_url; // verified that it works
        
        // Step 2: Request transcription
        const transcriptionId = await requestTranscription(uploadUrl);
        console.log("transcriptionid: " + transcriptionId);

        // Step 3: Poll for transcription completion
        const transcriptionResult = await pollTranscription(transcriptionId);

        // Step 4: Export transcription to SRT format
        const subtitles = await getSubtitleFile(
            transcriptionId,
            'srt'
        )
        
        fsExtra.writeFile(srtOutputPath, subtitles);

        console.log(`Transcription saved to: ${srtOutputPath}`);
        return srtOutputPath;
    } catch (error) {
        console.error("Error during transcription:", error);
    }

// }

        // TRANSCRIBE VIDEO
        response.send("works")

    } catch (error) {
        console.error("Failed to upload file:", error);
        response.status(500).send("Failed to upload file.");
    } finally {
        // fs.unlinkSync(tmpPath);
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
//     )
//     srt_path = transcribe_video(video_path, f"generated/{formatted_now}.srt")
//     final_video_path = add_subtitles_to_video(
//         video_path, srt_path, f"generated/final_{formatted_now}.mp4"
//     )
//     final_short_path = shorten_video_if_needed(final_video_path)