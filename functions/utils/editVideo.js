const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

// ffmpeg.setFfmpegPath("../bin/ffmpeg-master-latest-win64-gpl/ffmpeg-master-latest-win64-gpl/bin/ffmpeg.exe");
ffmpeg.setFfmpegPath("C:/Users/Will Gunter/Personal Coding/PythonProjects/Youtube-Bot/functions/bin/ffmpeg-master-latest-win64-gpl/ffmpeg-master-latest-win64-gpl/bin/ffmpeg.exe");

ffmpeg.setFfprobePath('../../bin/ffmpeg-7.0.2-amd64-static/ffmpeg-master-latest-win64-gpl/bin/ffprobe');

// vvv
// https://www.gyan.dev/ffmpeg/builds/
async function editVideo(audioPath, videoPath, outputPath) {
                    // texttospeech+, minecraft, edited+
        
        // MUST BE BETWEEN 0.5 and 2.0
        // (can chain more together if necessary tho)
        // .audioFilters(`atempo=0.5,atempo=0.5) etc..
        const audioSpeed = 1.0;
    
        // const [targetWidth, targetHeight] = [1080, 1920];
        // const [targetWidth, targetHeight] = [100, 100];

        // const scaleFilter = `scale=if(gte(iw/ih,${targetWidth}/${targetHeight}),-1,${targetHeight}):if(gte(iw/ih,${targetWidth}/${targetHeight}),${targetWidth},-1)`;
        // const cropFilter = `crop=${targetWidth}:${targetHeight}`;
        // const cropFilter = `crop=${targetWidth}:${targetHeight}`; // width, height
        console.log() // log size of 
        return new Promise((resolve, reject) => {
            ffmpeg(videoPath)
              .audioCodec('aac') // Set the audio codec
              .input(audioPath) // Add the audio file as input
              .audioFilters(`atempo=${audioSpeed}`)
              .outputOptions('-shortest') // Stop when the shortest stream ends
            //   .videoFilters(cropFilter)//,${scaleFilter}`)
              .save(outputPath) // Save the output file
              // await new Promise(resolve => setTimeout(resolve, 20000)); // 20 seconds
              .on('end', () => {
                console.log(`Successfully combined audio and video. Output saved to: ${outputPath}`);
                resolve(outputPath);
              })
              .on('error', (err) => {
                console.error('Error combining audio and video:', err);
                reject(err);
              });
          });

        
        // try downloading file from firebase first
        // into tmp directory (see "Youtube Bot Project")
        // await new Promise((resolve, reject) => {
        //   ffmpeg(audioPath)
        //     .audioFilters(`atempo=${audioSpeed}`)
        //     .save(outputPath)
        //     .on('end', resolve)
        //     .on('error', reject);
        // });
      
        // // Step 2: Trim the Video Clip and Add Audio
        // const audioDuration = await new Promise((resolve, reject) => {
        //   ffmpeg.ffprobe(tempAudioPath, (err, metadata) => {
        //     if (err) reject(err);
        //     else resolve(metadata.format.duration);
        //   });
        // });
      
        // const videoEndPoint = startPoint + audioDuration + 1.3;
        
        // Step 3: Set the Audio to Video and Adjust Aspect Ratio
        // await new Promise((resolve, reject) => {
        //   ffmpeg(videoPath)
        //     .setStartTime(startPoint)
        //     .setDuration(videoEndPoint - startPoint)
        //     .videoFilters("scale=1080:1920:force_original_aspect_ratio=decrease")
        //     .input(tempAudioPath)
        //     .outputOptions("-c:v libx264", "-c:a aac", "-threads 4", "-preset ultrafast")
        //     .save(outputPath)
        //     .on("end", resolve)
        //     .on("error", reject);
        // });
      
        // // Clean up temporary audio file
        // fs.unlinkSync(tempAudioPath);
        // console.log("Video processing completed.");
}
    // audio_clip = AudioFileClip(audio_path).fx(vfx.speedx, 1)
    
     
module.exports = editVideo;