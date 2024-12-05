// const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require('fs');
const path = require('path');
const axios = require("axios")
const fsExtra = require('fs-extra')

async function generateSubtitles(videoFilePath, srtOutputPath) {

    const headers = {
        "authorization": process.env.ASSEMBLYAI,
        "Content-Type": "audio/mp3",
    }

    try {
        
        // Step 1: Upload the video file to AssemblyAI 
        const uploadResponse = await uploadToAssemblyAI(videoFilePath, headers);
        const uploadUrl = uploadResponse.upload_url;

        // Step 2: Request transcription
        const transcriptionId = await requestTranscription(uploadUrl, headers);
        console.log("transcriptionid: " + transcriptionId);

        // Step 3: Poll for transcription completion
        const transcriptionResult = await pollTranscription(transcriptionId, headers);
        console.log("transcription polled")

        // Step 4: Export transcription to SRT format
        const srtContent = transcriptionResult.subtitles_srt;
        const subtitles = await getSubtitleFile( transcriptionId, 'srt', headers);
        
        fsExtra.writeFile(srtOutputPath, subtitles);

        return srtOutputPath;
    } catch (error) {
        console.error("Error during transcription:", error);
    }

}


async function getSubtitleFile(transcriptId, fileFormat, headers) {

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

async function uploadToAssemblyAI(filePath, headers) {

    const audioData = await fsExtra.readFile(filePath);
    let responseFromAssembly;
 
    try {
        responseFromAssembly = await axios.post("https://api.assemblyai.com/v2/upload", audioData, { headers });
        // console.log(responseFromAssembly);
        return responseFromAssembly.data;
    } catch (error) {
        console.error("uploadToAssemblyAI Error:", error);
    }
}


async function requestTranscription(uploadUrl, headers) {
    
    const data = {
        audio_url: uploadUrl
    }
    const responseFromTranscript = await axios.post("https://api.assemblyai.com/v2/transcript", data, { headers });
    return responseFromTranscript.data.id;
}


async function pollTranscription(transcriptionId, headers) {
    
    let transcriptionResult;

    const statusUrl = `https://api.assemblyai.com/v2/transcript/${transcriptionId}`;

    while (true) {

        const responseFromPoll = await axios.get(statusUrl, { headers: headers, });

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

module.exports = generateSubtitles