const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

ffmpeg.setFfprobePath("ffprobe");
ffmpeg.setFfmpegPath("ffmpeg");

const path = require('path');

// all this function does is position an overlay video / image on top
// in the bottom half of a base video. Most of this code is to make sure
// base video is correct ratio and correct if is not
// This code works properly, but cat images need to be scaled first ideally
function generateVisemeVideo(visemeFrames, audioFile, outputFile) {

    // videoPath = './edited12_05_2024_19_38_54.webm'; // 1 minute 3 second long subway surfers video
    videoPath = './shortened_subway_surfers_clip.webm'; // 10 second long subway surfers video used for testing
    outputPath = './video.mp4';
    // overlayContent = './output.webm';
    overlayContent = './frames/e_finished.png'; // './aei_cropped_scaled.jpg';
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
    
                // vvv basic error checking vvv
                if (err) {
                    reject(new Error(`Failed to probe video: ${err.message}`));
                    return;
                }
    
                const stream = metadata.streams.find(s => s.codec_type === 'video');
    
                if (!stream) {
                    reject(new Error('No video stream found'));
                    return;
                }
    
                const backgroundVideoDuration = metadata.format.duration;
    
                if (!backgroundVideoDuration || backgroundVideoDuration < 2) {
                    // reject(new Error("Video is shorter than 2 minutes or doesn't exist"));
                    console.log(backgroundVideoDuration);
                    console.log("video is short")
                    return;
                }
    
                const inputWidth = stream.width;
                const inputHeight = stream.height;
                console.log(`Input video dimensions: ${inputWidth}x${inputHeight}`);
    
                const targetWidth = 1080;
                const targetHeight = 1920;
    
                // Calculate scaling parameters based on aspect ratio
                let scaleFilter = `scale=1080:1920`;
                let cropFilter = `crop=1080:1920:0:0`;
    
                // Calculate scaling while maintaining aspect ratio
                const inputAspect = inputWidth / inputHeight;
                const targetAspect = targetWidth / targetHeight;
    
                if (inputAspect > targetAspect) {
                    // Video is wider than target aspect ratio
                    console.log("wide")
                    const scaledHeight = targetHeight;
                    const scaledWidth = Math.round(scaledHeight * inputAspect);
                    scaleFilter = `scale=${scaledWidth}:${targetHeight}`;
                    const cropX = Math.round((scaledWidth - targetWidth) / 2);
                    cropFilter = `crop=${targetWidth}:${targetHeight}:${cropX}:0`;
                } else if (inputAspect < targetAspect) {
                    // Video is taller than target aspect ratio
                    console.log("tall")
                    const scaledWidth = targetWidth;
                    const scaledHeight = Math.round(scaledWidth / inputAspect);
                    scaleFilter = `scale=${targetWidth}:${scaledHeight}`;
                    const cropY = Math.round((scaledHeight - targetHeight) / 2);
                    cropFilter = `crop=${targetWidth}:${targetHeight}:0:${cropY}`;
                } else {
                    // equal aspects
                } 

                const audioSpeed = 1.0
    
                ffmpeg(videoPath)
                .input(overlayContent) // './output.webm
                .outputOptions('-filter_complex',
                    // Step 1: Scale and crop the base video to 1080x1920
                    '[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2[base];' +
                    // Step 2: Scale the overlay to 1080x1920
                    // '[1:v]scale=1080:1920*0.35[scaledOverlay];' +
                    // Step 3: Overlay the scaled overlay onto the padded/cropped base video
                    '[base][1:v]overlay=(W-w)/2:(H-h)+100')
                    // .fps(30)
                    .format('mp4')
                    .on('start', (commandLine) => {
                        console.log('Started FFmpeg with command:', commandLine);
                        console.log(`Output target dimensions: ${targetWidth}x${targetHeight}`);
                    })
                    .on('progress', (progress) => {
                        console.log(`Processing: ${Math.round(progress.percent)}% done`);
                    })
                    .on('error', (err) => {
                        console.error('Error during processing:', err);
                        // reject(err);
                    })
                    .on('end', () => {
                        console.log(`Successfully processed video. Output saved to: ${outputPath}`);
                        path.resolve(outputPath);
                    })
                    .save(outputPath);
                })
}

const visemeFrames = ['./not_smile.jpg', './face.jpg', './smile.jpg'];
generateVisemeVideo(visemeFrames, './Gusty_Garden_Galaxy.mp3', './outputdd_video.mp4');

// Dynamic Mapping: Use libraries like pocketsphinx or deepspeech to extract phoneme timings from audio.
// Audio-Driven Animation: Match phoneme timestamps to visemes dynamically for more accurate lip-sync.
// https://pypi.org/project/cmudict/
// https://pypi.org/project/SpeechRecognition/