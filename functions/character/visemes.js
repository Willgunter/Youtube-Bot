const fs = require('fs');
// const canvas = require('canvas');
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
require('dotenv').config();
const CMUDict = require('cmudict').CMUDict;


const now = new Date(); 

// Options for US formatting
const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false // Use 24-hour format; set to true for 12-hour format
};

// Get the formatted date and time in US format
const formattedDate = now.toLocaleString('en-US', options);

// Replace spaces with no spaces
const formattedDateNoSpaces = formattedDate.replace(/ /g, '');
const sanitizedFilename = sanitizeFilename(formattedDateNoSpaces);

// don't export - we don't need in index.js
function sanitizeFilename(filename) {
return filename
    .replace(/[\/\\:]/g, '_')  // Replace slashes and colons with underscores
    .replace(/,/g, '_');        // Replace commas with underscores
}


async function generateLipSyncVideo(
    // audioPath, spriteSheetPath, phonemeData, 
    fps = 24) {
        const axios = require('axios');
        const fs = require('fs');
        const API_KEY = process.env.ASSEMBLYAI;
        const audioPath = './shortened-audiomp3.mp3';
        
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

                    console.log(word);
                    // console.log(typeof cmudict.get(word.text.replace(/\./g, "")))
                    if (cmudict.get(word.text) != undefined) {

                      let new_phoneme = {
                        sounds: cmudict.get(word.text.replace(/\./g, "")).split(' '), // .split(' ')
                        start_time: word.start,
                        end_time: word.end
                      }
                      phoneme_list.push(new_phoneme)
                    } else {
                      phoneme_list.push({sounds: ["AH"], start_time: word.start, end_time: word.end}) // implement random logic for words certain length or more (>1 second?)
                    }

                  });
                }
                phoneme_list.forEach(word => {
                  console.log(`${word.sounds[0]}`)//+${word.start_time}+${word.end_time}`)
                })
                createFrames(phoneme_list, 24, './shortened-audiomp3.mp3');

                // createFrames()
                // Use FFmpeg to combine frames into a video with audio
                ffmpeg()
                .input(`./movieframes/frame-${sanitizedFilename}-%d.jpg`)
                .inputFPS(fps)
                .input(audioPath)
                .output('output.webm')
                .on('end', () => console.log('Video created!'))
                .run();
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

  phoneme_list.forEach((phonemes_for_word) => {
    const totalDuration = (phonemes_for_word.end_time / 1000) - (phonemes_for_word.start_time / 1000);
    const phonemeCount = phonemes_for_word.sounds.length;

    const phonemeDuration = totalDuration / phonemeCount;

    let numFrames = 0;
    phonemes_for_word.sounds.forEach((phoneme, index) => {

      // Calculate the start and end times for this phoneme based on its position in the word
      const phonemeStartTime = phonemes_for_word.start_time / 1000 + phonemeDuration * index; // Start time of this phoneme in seconds
      const phonemeEndTime = phonemes_for_word.start_time / 1000 + phonemeDuration * (index + 1); // End time of this phoneme in seconds
 
      // Calculate how many frames this phoneme needs based on FPS
      // const duration = (phonemes_for_word.end_time/1000) - (phonemes_for_word.start_time/1000); // Duration in seconds
      // const frameCount = Math.round(duration * fps); // Frames for this phoneme

      // Calculate how many frames this phoneme needs based on FPS
      const frameCount = Math.round((phonemeEndTime - phonemeStartTime) * fps); // Frames for this phoneme

      
      // Determine which .jpg file to use for this phoneme
      const visemePath = getVisemeFilePath(phoneme.replace(/\d+/g, "")); // Map phoneme to .jpg file
      
      for (let i = 0; i < frameCount; i++) {
        // Save the frame as an image file (using the .jpg directly)
        const framePath = `./movieframes/frame-${sanitizedFilename}-${numFrames}.jpg`;
        fs.copyFileSync(visemePath, framePath); // Copy the viseme .jpg to the frame path
        frames.push(framePath); // Store the frame path for later
        numFrames++;
      }
    });
  });
}

// Map phoneme to its corresponding .jpg file
function getVisemeFilePath(phoneme) {
    
      // if (['aa', 'ah', 'aw', 'ay', 'ih', 'iy', 'w', 'hh'].includes(phoneme.toLowerCase())) {
    if (['aa', 'ah', 'aw', 'ay', 'ih', 'iy', 'hh', 'ae', 'ao'].includes(phoneme.toLowerCase())) {
        return './frames/aei.jpg';
        
    // } else if (['ae', 'eh', 'ey', 's', 'z', 'l', 'sh', 'zh'].includes(phoneme.toLowerCase())) {
    } else if (['f', 'v'].includes(phoneme.toLowerCase())) {
      return './frames/fv.jpg';

    // } else if (['ao', 'ow', 'oy', 'f', 'v', 'm'].includes(phoneme.toLowerCase())) {
    } else if (['ow', 'oy'].includes(phoneme.toLowerCase())) {
      return './frames/o.jpg';

    // (ch j sh) 4) sh zh ch jh
    // } else if (['uw', 'uh'].includes(phoneme.toLowerCase())) {
    } else if (['sh', 'zh', 'ch', 'jh'].includes(phoneme.toLowerCase())) {
      return './frames/ch_j_sh.jpg';

    // } else if (['p', 'b'].includes(phoneme.toLowerCase())) {
    } else if (['l'].includes(phoneme.toLowerCase())) {
      return './frames/l.jpg';

      // (b m p) 6) m p b
    // } else if (['ch', 'd', 'dh', 'jh', 't'].includes(phoneme.toLowerCase())) {
    } else if (['m', 'p', 'b'].includes(phoneme.toLowerCase())) {
      return './frames/bmp.jpg';

    // (e) 7) eh ey 
    // } else if (['g', 'k', 'ng'].includes(phoneme.toLowerCase())) {
    } else if (['eh', 'ey'].includes(phoneme.toLowerCase())) {
      return './frames/e.jpg';

    // (c d g k n s t x y z) 8) s z d dh t g k ng n y
    // } else if (['n', 'r', 'th', 'y'].includes(phoneme.toLowerCase())) {
    } else if (['s', 'z', 'd', 'dh', 't', 'g', 'k', 'ng', 'n', 'y'].includes(phoneme.toLowerCase())) {
      return './frames/cdgknstxyz.jpg';

    // } else if (['er'].includes(phoneme.toLowerCase())) {
    } else if (['uw', 'uh'].includes(phoneme.toLowerCase())) {
      return './frames/u.jpg';

    } else if (['r', 'er'].includes(phoneme.toLowerCase())) {
      return './frames/r.jpg';

    } else if (['th'].includes(phoneme.toLowerCase())) {
      return './frames/th.jpg';

    } else if (['w'].includes(phoneme.toLowerCase())) {
      return './frames/qw.jpg';

    } else {
      return './frames/cdgknstxyz.jpg';  // Default image if phoneme is not found
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