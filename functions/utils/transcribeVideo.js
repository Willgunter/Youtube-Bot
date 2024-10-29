// const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require('fs');
const path = require('path');

async function transcribeVideo(videoFilePath, srtOutputPath) {
    try { // Step 1: Upload the video file to AssemblyAI 
        const uploadResponse = await uploadToAssemblyAI(videoFilePath);
        const uploadUrl = uploadResponse.upload_url; // verified that it works
        
        // Step 2: Request transcription
        const transcriptionId = await requestTranscription(uploadUrl);
        console.log("transcriptionid: " + transcriptionId);
        // Step 3: Poll for transcription completion
        const transcriptionResult = await pollTranscription(transcriptionId);

        // Step 4: Export transcription to SRT format
        const srtContent = transcriptionResult.subtitles_srt;
        fs.writeFileSync(srtOutputPath, srtContent);

        console.log(`Transcription saved to: ${srtOutputPath}`);
        return srtOutputPath;
    } catch (error) {
        console.error("Error during transcription:", error);
    }

}

async function uploadToAssemblyAI(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const response = await fetch("https://api.assemblyai.com/v2/upload", { method: "POST", headers: { authorization: process.env.ASSEMBLYAI, "Transfer-Encoding": "chunked", }, body: fileBuffer, });
    return await response.json();
}

async function requestTranscription(uploadUrl) {
    const data = {
        audio_url: uploadUrl
    }
    const headers = {
        authorization: process.env.ASSEMBLYAI 
      }
    const response = await axios.post("https://api.assemblyai.com/v2/transcript", data, {header: headers});

    const result = await response.json();
    console.log(`resultdata: ${result.data}`)
    console.log(`resultid: ${result.data.id}`)

    return result.data.id;
}

async function pollTranscription(transcriptionId) {
    let transcriptionResult;
    
    const statusUrl = `https://api.assemblyai.com/v2/transcript/${transcriptionId}`;
    
    while (true) {
        
        const response = await fetch(statusUrl, {headers: { authorization: process.env.ASEEMBLYAI }, });
        
        transcriptionResult = await response.json();

        if (transcriptionResult.status === "completed") { 
            break; 
        }
        else if (transcriptionResult.status === "failed") { 
            throw new Error("Transcription failed.");
        }
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5 seconds 
    }
    return transcriptionResult;
}

// Example usage: 
// const videoFilePath = "path/to/video.mp4"; 
// const srtOutputPath = path.join(__dirname, "transcription.srt"); 
// transcribeVideo(videoFilePath, srtOutputPath);

module.exports = transcribeVideo