const fs = require('fs');
// const canvas = require('canvas');
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
require('dotenv').config();
const CMUDict = require('cmudict').CMUDict;
const getCurrentDateTime = require('../utils/currentDateTime');

const sanitizedFilename = getCurrentDateTime();

const audioPath = './9_second_audio.mp3';

async function generateLipSyncVideo(
    // audioPath, spriteSheetPath, phonemeData, 
    fps = 24) {
        const axios = require('axios');
        const fs = require('fs');
        const API_KEY = process.env.ASSEMBLYAI;
        
        let phoneme_list = [];
        // async function transcribeAudio() {
          try {
            // 1. Upload the audio file to AssemblyAI
            console.log('Uploading audio file...');
            const audioData = fs.createReadStream(audioPath);
            
            const uploadResponse = await axios.post('https://api.assemblyai.com/v2/upload', audioData, {
              headers: { 'authorization': API_KEY }
            });
        
            const audioUrl = uploadResponse.data.upload_url;
            console.log('Audio uploaded successfully:', audioUrl);

            // 2. Request transcription with phoneme-level output
            console.log('Requesting transcription...');
            const transcriptionResponse = await axios.post(
              'https://api.assemblyai.com/v2/transcript',
              {
                audio_url: audioUrl,
                // phoneme_boost: true, // Enable phoneme-level output (use 'word_boost' for custom terms if needed)
                word_boost: [], // Optional array for boosting words (if needed)
                // boost_param: 'low', 
                format_text: true,
                // enable_audio_intellegence: true,
                // speaker_labels: true,
                // punctuate: true,    
              },
              {
                headers: { 'authorization': API_KEY }
              }
            );
        
            const transcriptId = transcriptionResponse.data.id;
            console.log('Transcription requested. ID:', transcriptId);
        
            // 3. Poll for transcription status
            let transcriptionCompleted = false;
            let statusResponse;
            while (!transcriptionCompleted) {
              statusResponse = await axios.get(
                `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
                { headers: { authorization: API_KEY } }
              );
            
              if (statusResponse.data.status === 'completed') {
                transcriptionCompleted = true;
                console.log('Transcription complete!');
                console.log(statusResponse);
                // Check and print phonemes
                if (statusResponse.data.words) {
                  let cmudict = new CMUDict();
                  statusResponse.data.words.forEach(word => {

                    // console.log("statusResponse : " + word);
                    // console.log(typeof cmudict.get(word.text.replace(/\./g, "")))
                    if (cmudict.get(word.text) != undefined) {

                      let new_phoneme = {
                        sounds: cmudict.get(word.text.replace(/\./g, "")).split(' '), // .split(' ')
                        start_time: word.start,
                        end_time: word.end
                      }
                      phoneme_list.push(new_phoneme)
                    } else {
                      console.log("undefined")
                      phoneme_list.push({sounds: ["AH"], start_time: word.start, end_time: word.end}) // implement random logic for words certain length or more (>1 second?)
                    }

                  });
                }
                phoneme_list.forEach(word => {
                  word.sounds.forEach(sounds =>{
                    console.log(`${sounds}`)//+${word.start_time}+${word.end_time}`)
                  })
                  console.log(`${word.start_time}+${word.end_time}`)
                })

                createFrames(phoneme_list, 24, audioPath);
                // error somewhere after here

                // Use FFmpeg to combine frames into a video with audio
                ffmpeg(`./short_subway_fixed.mp4`)
                .input(`./movieframes/frame-${sanitizedFilename}-%d.png`)
                .inputFPS(fps)
                .input(audioPath)
                .output('output.mp4')
                .outputOptions([
                    '-filter_complex',
                    '[0:v][1:v]overlay=(W-w)/2:(H-h)+125',
                  ]) 
                .on('end', () => console.log('Video created!'))
                .on('progress', (progress) => { 
                  console.log(`Processing: ${Math.round(progress.percent)}% done`);
                })
                // .on('stderr', (stderrLine) => console.log('FFmpeg stderr: ' + stderrLine)) // Capture errors here
                // .on('error', (err) => console.error('Error:', err)) // Handle FFmpeg process errors
                .run();

                // ls frame-*.png
                
                // await fs.rm("./movieframes");
                
              } else if (statusResponse.data.status === 'failed') {
                console.error('Transcription failed.');
                return;
              } else {
                console.log('Processing...');
                await new Promise(resolve => setTimeout(resolve, 5000));
              }

            }
          } catch (error) {
            console.error('Error:', error.message);
          }

}
        
        // transcribeAudio();
        
async function createFrames(phoneme_list, fps, audioPath) {
  const frames = [];

  let numFrames = 0;
  phoneme_list.forEach((phonemes_for_word) => {
    const totalDuration = (phonemes_for_word.end_time / 1000) - (phonemes_for_word.start_time / 1000);
    const phonemeCount = phonemes_for_word.sounds.length;

    const phonemeDuration = totalDuration / phonemeCount;

    phonemes_for_word.sounds.forEach((phoneme, index) => {

      // Calculate the start and end times for this phoneme based on its position in the word
      const phonemeStartTime = phonemes_for_word.start_time / 1000 + phonemeDuration * index; // Start time of this phoneme in seconds
      const phonemeEndTime = phonemes_for_word.start_time / 1000 + phonemeDuration * (index + 1); // End time of this phoneme in seconds
 
      // Calculate how many frames this phoneme needs based on FPS
      // const duration = (phonemes_for_word.end_time/1000) - (phonemes_for_word.start_time/1000); // Duration in seconds
      // const frameCount = Math.round(duration * fps); // Frames for this phoneme

      // Calculate how many frames this phoneme needs based on FPS
      const frameCount = Math.round((phonemeEndTime - phonemeStartTime) * fps); // Frames for this phoneme

      // Determine which .png file to use for this phoneme
      const visemePath = getVisemeFilePath(phoneme.replace(/\d+/g, "")); // Map phoneme to .png file
      
      for (let i = 0; i < frameCount; i++) {
        // Save the frame as an image file (using the .png directly)
        const framePath = `./movieframes/frame-${sanitizedFilename}-${numFrames}.png`;
        console.log("framecound: " + numFrames)
        fs.copyFileSync(visemePath, framePath); // Copy the viseme .png to the frame path
        frames.push(framePath); // Store the frame path for later
        numFrames++;
      }
    });
  });
}

// Map phoneme to its corresponding .png file
function getVisemeFilePath(phoneme) {
    
      // if (['aa', 'ah', 'aw', 'ay', 'ih', 'iy', 'w', 'hh'].includes(phoneme.toLowerCase())) {
    if (['aa', 'ah', 'aw', 'ay', 'ih', 'iy', 'hh', 'ae', 'ao'].includes(phoneme.toLowerCase())) {
        return './frames/aei.png';
        
    // } else if (['ae', 'eh', 'ey', 's', 'z', 'l', 'sh', 'zh'].includes(phoneme.toLowerCase())) {
    } else if (['f', 'v'].includes(phoneme.toLowerCase())) {
      return './frames/fv.png';

    // } else if (['ao', 'ow', 'oy', 'f', 'v', 'm'].includes(phoneme.toLowerCase())) {
    } else if (['ow', 'oy'].includes(phoneme.toLowerCase())) {
      return './frames/o.png';

    // (ch j sh) 4) sh zh ch jh
    // } else if (['uw', 'uh'].includes(phoneme.toLowerCase())) {
    } else if (['sh', 'zh', 'ch', 'jh'].includes(phoneme.toLowerCase())) {
      return './frames/ch_j_sh.png';

    // } else if (['p', 'b'].includes(phoneme.toLowerCase())) {
    } else if (['l'].includes(phoneme.toLowerCase())) {
      return './frames/l.png';

      // (b m p) 6) m p b
    // } else if (['ch', 'd', 'dh', 'jh', 't'].includes(phoneme.toLowerCase())) {
    } else if (['m', 'p', 'b'].includes(phoneme.toLowerCase())) {
      return './frames/bmp.png';

    // (e) 7) eh ey 
    // } else if (['g', 'k', 'ng'].includes(phoneme.toLowerCase())) {
    } else if (['eh', 'ey'].includes(phoneme.toLowerCase())) {
      return './frames/e.png';

    // (c d g k n s t x y z) 8) s z d dh t g k ng n y
    // } else if (['n', 'r', 'th', 'y'].includes(phoneme.toLowerCase())) {
    } else if (['s', 'z', 'd', 'dh', 't', 'g', 'k', 'ng', 'n', 'y'].includes(phoneme.toLowerCase())) {
      return './frames/cdgknstxyz.png';

    // } else if (['er'].includes(phoneme.toLowerCase())) {
    } else if (['uw', 'uh'].includes(phoneme.toLowerCase())) {
      return './frames/u.png';

    } else if (['r', 'er'].includes(phoneme.toLowerCase())) {
      return './frames/r.png';
      
    } else if (['th'].includes(phoneme.toLowerCase())) {
      return './frames/th.png';

    } else if (['w'].includes(phoneme.toLowerCase())) {
      return './frames/qw.png';

    } else {
      return './frames/cdgknstxyz.png';  // Default image if phoneme is not found
    }

    // (a e i) 1) aa ah aw ay ih iy hh ae ao
    // (f v) 2) f v
    // (o) 3) ow oy
    // (ch j sh) 4) sh zh ch jh
    // (l) 5) l
    // (b m p) 6) m p b
    // (e) 7) eh ey 
    // (c d g k n s t x y z) 8) s z d dh t g k ng n y
    // (u) 9) uw uh
    // (r) 10) r er
    // (th) 11) th
    // (q w) 12) w
}

// createFrames(text, 24, '/Gusty_Garden_Galaxy.mp3');
generateLipSyncVideo();