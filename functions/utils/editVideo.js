const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

// ffmpeg.setFfmpegPath("../bin/ffmpeg-master-latest-win64-gpl/ffmpeg-master-latest-win64-gpl/bin/ffmpeg.exe");
ffmpeg.setFfmpegPath("C:/Users/Will Gunter/Personal Coding/PythonProjects/Youtube-Bot/functions/bin/ffmpeg-master-latest-win64-gpl/ffmpeg-master-latest-win64-gpl/bin/ffmpeg.exe");

ffmpeg.setFfprobePath('C:/Users/Will Gunter/Personal Coding/PythonProjects/Youtube-Bot/functions/bin/ffmpeg-master-latest-win64-gpl/ffmpeg-master-latest-win64-gpl/bin/ffprobe');

// vvv
// https://www.gyan.dev/ffmpeg/builds/
async function editVideo(audioPath, videoPath, outputPath) {
    return new Promise((resolve, reject) => {
        // First get the video dimensions
        const audioSpeed = 1.0;
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) {
                reject(new Error(`Failed to probe video: ${err.message}`));
                return;
            }

            const stream = metadata.streams.find(s => s.codec_type === 'video');
            if (!stream) {
                reject(new Error('No video stream found'));
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
                const scaledHeight = targetHeight;
                const scaledWidth = Math.round(scaledHeight * inputAspect);
                scaleFilter = `scale=${scaledWidth}:${targetHeight}`;
                const cropX = Math.round((scaledWidth - targetWidth) / 2);
                cropFilter = `crop=${targetWidth}:${targetHeight}:${cropX}:0`;
            } else {
                // Video is taller than target aspect ratio
                const scaledWidth = targetWidth;
                const scaledHeight = Math.round(scaledWidth / inputAspect);
                scaleFilter = `scale=${targetWidth}:${scaledHeight}`;
                const cropY = Math.round((scaledHeight - targetHeight) / 2);
                cropFilter = `crop=${targetWidth}:${targetHeight}:0:${cropY}`;
            }

            ffmpeg()
                .input(videoPath)
                .input(audioPath)
                // Apply video filters
                .videoFilters([
                    scaleFilter,
                    cropFilter
                ])
                // Apply audio filters
                .audioFilters(`atempo=${audioSpeed}`)
                // Set output options
                .outputOptions([
                    '-c:v libx264',        // Video codec
                    '-preset medium',       // Encoding speed preset
                    '-crf 23',             // Quality
                    '-c:a aac',            // Audio codec
                    '-b:a 192k',           // Audio bitrate
                    '-shortest'            // End when shortest input ends
                ])
                .size(`${targetWidth}x${targetHeight}`)
                .fps(30)
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
                    reject(err);
                })
                .on('end', () => {
                    console.log(`Successfully processed video. Output saved to: ${outputPath}`);
                    resolve(outputPath);
                })
                .save(outputPath);
        });
    });
}
    // audio_clip = AudioFileClip(audio_path).fx(vfx.speedx, 1)
    
     
module.exports = editVideo;