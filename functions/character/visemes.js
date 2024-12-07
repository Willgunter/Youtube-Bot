const fs = require('fs');
// const canvas = require('canvas');
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
require('dotenv').config();
const CMUDict = require('cmudict').CMUDict;

async function generateLipSyncVideo(
    // audioPath, spriteSheetPath, phonemeData, 
    fps = 24) {
        const axios = require('axios');
        const fs = require('fs');
        const API_KEY = process.env.ASSEMBLYAI;
        const audioPath = './ttsAudio12_05_2024_18_39_13.mp3';
        
        let phoneme_list = [];
        // async function transcribeAudio() {
          // try {
            // 1. Upload the audio file to AssemblyAI
            // console.log('Uploading audio file...');
            // const audioData = fs.createReadStream(audioPath);
            
            // const uploadResponse = await axios.post('https://api.assemblyai.com/v2/upload', audioData, {
            //   headers: { 'authorization': API_KEY }
            // });
        
            // const audioUrl = uploadResponse.data.upload_url;
            // console.log('Audio uploaded successfully:', audioUrl);

            // // 2. Request transcription with phoneme-level output
            // console.log('Requesting transcription...');
            // const transcriptionResponse = await axios.post(
            //   'https://api.assemblyai.com/v2/transcript',
            //   {
            //     audio_url: audioUrl,
            //     // phoneme_boost: true, // Enable phoneme-level output (use 'word_boost' for custom terms if needed)
            //     word_boost: [], // Optional array for boosting words (if needed)
            //     // boost_param: 'low', 
            //     format_text: true,
            //     // enable_audio_intellegence: true,
            //     // speaker_labels: true,
            //     // punctuate: true,    
            //   },
            //   {
            //     headers: { 'authorization': API_KEY }
            //   }
            // );
        
            // const transcriptId = transcriptionResponse.data.id;
            // console.log('Transcription requested. ID:', transcriptId);
        
            // // 3. Poll for transcription status
            // let transcriptionCompleted = false;
            // let statusResponse;
            // while (!transcriptionCompleted) {
            //   statusResponse = await axios.get(
            //     `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
            //     { headers: { authorization: API_KEY } }
            //   );
            
              // if (statusResponse.data.status === 'completed') {
                // transcriptionCompleted = true;
                // console.log('Transcription complete!');
                // console.log(statusResponse);
                // Check and print phonemes
                // if (statusResponse.data.words) {
                  let cmudict = new CMUDict();
                  // statusResponse.data.words.forEach(word => {
                  const sentence = "this is a sentence"
                  sentence.split(" ").forEach(word => {

                    console.log(word);
                    // console.log(typeof cmudict.get(word.text.replace(/\./g, "")))
                    if (cmudict.get(word.text.replace(/\./g, "")) != undefined) {

                      let new_phoneme = {
                        phonemes: cmudict.get(word.text.replace(/\./g, "")).split(' '), // .split(' ')
                        start_time: word.start,
                        end_time: word.end
                      }
                      // ^^ use length of phoneme list to divide start / end time ONCE YOU GET THE FIRST ONE TO WORK
                      phoneme_list.push(new_phoneme)
                    }
                  });
                // }
                // phoneme_list.forEach(word => {
                //   console.log(`${word.phoneme_list[0]}+${word.start_time}+${word.end_time}`)
                // })
                createFrames(phoneme_list, 24, '/Gusty_Garden_Galaxy.mp3');

                createFrames()
            //   } else if (statusResponse.data.status === 'failed') {
            //     console.error('Transcription failed.');
            //     return;
            //   } else {
            //     console.log('Processing...');
            //     await new Promise(resolve => setTimeout(resolve, 5000));
            //   }
            // }
          // } catch (error) {
          //   console.error('Error:', error.message);
          // }
}
        
        // transcribeAudio();
        
async function createFrames(phonemes, fps, audioPath) {
  const frames = [];

  phonemes.forEach((phoneme, index) => {
    const { phonemes, start, end } = phoneme;

    // Calculate how many frames this phoneme needs based on FPS
    const duration = end - start; // Duration in seconds
    const frameCount = Math.round(duration * fps); // Frames for this phoneme

    // Determine which .jpg file to use for this phoneme
    const visemePath = getVisemeFilePath(phonemes.replace(/\d+/g, "")); // Map phoneme to .jpg file

    for (let i = 0; i < frameCount; i++) {
      // Save the frame as an image file (using the .jpg directly)
      const framePath = `frame-${index}-${i}.jpg`;
      fs.copyFileSync(visemePath, framePath); // Copy the viseme .jpg to the frame path
      frames.push(framePath); // Store the frame path for later
    }
  });

  // Use FFmpeg to combine frames into a video with audio
  ffmpeg()
    .input('frame-%d-%d.jpg')
    .inputFPS(fps)
    .input(audioPath)
    .output('output.webm')
    .on('end', () => console.log('Video created!'))
    .run();
}

// Map phoneme to its corresponding .jpg file
function getVisemeFilePath(phoneme) {
  const mapping = {
    'a': './frames/a.jpg', // a.jpg AA AH AW AY IH IY W HH
    'e': './frames/e.jpg', // e.jpg AE EH EY S Z L SH ZH
    'o': './frames/o.jpg', // o.jpg AO OW OY F V M
    'u': './frames/u.jpg', // u.jpg UW UH
    'p': './frames/p.jpg',  // p.jpg P B
    'd': './frames/d.jpg', // CH, D, DH, JH, T,
    'g': './frames/g.jpg', // G K NG
    'n': './frames/n.jpg', // N R T TH Y
    'er': './frames/er.jpg', // ER

  };
  return mapping[phoneme] || 'default.jpg'; // Default image if phoneme not found
}

// createFrames(text, 24, '/Gusty_Garden_Galaxy.mp3');
// generateLipSyncVideo();