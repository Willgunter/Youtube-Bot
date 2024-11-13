const path = require('path');
const { ZapCap } = require("zapcap");
const os = require('os');
const fs = require('fs');
const { pipeline } = require("stream/promises");

async function addCaptions(editedVideoFilePath, videoWithCaptionsPath) {

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
    } = await zapcap.createVideoTask(videoId, templateId, autoApprove = true);

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

}
module.exports = addCaptions;
