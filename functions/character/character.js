const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

ffmpeg.setFfprobePath("ffprobe");
ffmpeg.setFfmpegPath("ffmpeg");

const path = require('path');

function generateVisemeVideo(visemeFrames, audioFile, outputFile) {


    // ffmpeg('edited12_05_2024_19_38_54.webm')
        // .input('smile.jpg')
        // .complexFilter('overlay=W-w:H-h')
        // .output('output.webm')
        // .on('end', () => console.log('Overlay added successfully'))
        // .on('error', err => console.error('Error:', err))
        // .save('test.webm');

    videoPath = './edited12_05_2024_19_38_54.webm';
    outputPath = './video.webm';
    audioPath = './Gusty_Garden_Galaxy.mp3';
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
    
                if (!backgroundVideoDuration || backgroundVideoDuration < 5) {
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
                let scaleFilter;
                let cropFilter;
    
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
                } else if (inputAspect == targetAspect) {
                    console.log("just right")
                } else {
                    // Video is taller than target aspect ratio
                    console.log("tall")
                    const scaledWidth = targetWidth;
                    const scaledHeight = Math.round(scaledWidth / inputAspect);
                    scaleFilter = `scale=${targetWidth}:${scaledHeight}`;
                    const cropY = Math.round((scaledHeight - targetHeight) / 2);
                    cropFilter = `crop=${targetWidth}:${targetHeight}:0:${cropY}`;
                }

                const audioSpeed = 1.0
    
                ffmpeg(videoPath)
                
                .input('./output.webm')
                        .outputOptions('-filter_complex',
                          '[1:v]scale=1920:1080[ov];'  // Explicitly scale the overlay to 1920x1080 (adjust to your desired size)
                          + '[0:v][ov]overlay=0:H/2')  // Position overlay at the bottom half of the background
                    // Apply audio filters
                    // .fps(30)
                    .format('webm')
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