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
    outputPath = './video.webm';
    // overlayContent = './output.webm';
    overlayContent = './aei_cropped_scaled_34_no_bkgrnd_adobe.png'; // './aei_cropped_scaled.jpg';
    // complexFilter([
    //     // Crop the overlay image
    //     {
    //       filter: 'crop',
    //       options: `${cropWidth}:${cropHeight}:${cropX}:${cropY}`,
    //       inputs: '[1:v]',
    //       outputs: 'croppedOverlay',
    //     },
    //     // Overlay the cropped image on the base video
    //     {
    //       filter: 'overlay',
    //       options: {
    //         x: '(W-w)/2', // Center horizontally
    //         y: 'H-h',     // Align bottom
    //       },
    //       inputs: ['[0:v]', 'croppedOverlay'],
    //       outputs: 'finalOutput',
    //     },
    //   ])
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
                
                // .videoFilters([
                    // scaleFilter,
                    // cropFilter
                // ])
                .input(overlayContent) // './output.webm
                .outputOptions('-filter_complex',
                    // Step 1: Scale and crop the base video to 1080x1920
                    '[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2[base];' +
                    // Step 2: Scale the overlay to 1080x1920
                    // '[1:v]scale=1080:1920[overlay];' +
                    // '[1:v]scale=iw*0.5:ih*0.5[scaledOverlay];' +
                    '[1:v]scale=1080:1920*0.35[scaledOverlay];' +
                    // Step 3: Overlay the scaled overlay onto the padded/cropped base video
                    '[base][scaledOverlay]overlay=(W-w)/2:(H-h)+100'
                )
                  
                        //  .outputOptions('-filter_complex',
                        //   '[1:v]scale=1080:1920[ov];' // there was a ; at the end  // Explicitly scale the overlay to 1920x1080 (adjust to your desired size)
                        //   + 
                        //   '[0:v][ov]overlay=(W-w)/2:(H-h)+125')  // Position overlay at the bottom half of the background
                          //     x: '(W-w)/2', // Center horizontally
                          //     y: 'H-h',     // Align bottom
                        //   .complexFilter([
                            // {
                                // filter: 'crop',
                                // options: {
                            //       w: 'min(iw,1920)', // Crop width to 1920 if input is wider
                            //       h: 'min(ih,1080)', // Crop height to 1080 if input is taller
                            //       x: '(iw-1920)/2',  // Center horizontally
                            //       y: '(ih-1080)/2',  // Center vertically
                            //     },
                            //   },

                            // {
                            //     filter: 'pad',
                            //     options: {
                            //       w: 1920, // Target width
                            //       h: 1080, // Target height
                            //       x: '(1920-iw)/2', // Center horizontally
                            //       y: '(1080-ih)/2', // Center vertically
                            //       color: 'black', // Padding color (default is black)
                            //     },
                            //   },

                            // {
                            //   filter: 'overlay',
                            //   options: {
                            //   },
                            // },
                        //   ])
                        //   complexFilter([
                        //     // Crop the overlay image
                        //     {
                        //       filter: 'crop',
                        //       options: `${cropWidth}:${cropHeight}:${cropX}:${cropY}`,
                        //       inputs: '[1:v]',
                        //       outputs: 'croppedOverlay',
                        //     },
                        //     // Overlay the cropped image on the base video
                        //     {
                        //       filter: 'overlay',
                        //       options: {
                        //         x: '(W-w)/2', // Center horizontally
                        //         y: 'H-h',     // Align bottom
                        //       },
                        //       inputs: ['[0:v]', 'croppedOverlay'],
                        //       outputs: 'finalOutput',
                        //     },
                        //   ])
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