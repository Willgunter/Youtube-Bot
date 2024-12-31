const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const createFrames = require('./createFrames');
const axios = require('axios');
const CMUDict = require('cmudict').CMUDict;
require('dotenv').config();

const audioPath = './9_second_audio.mp3';

async function generateLipSyncVideo(
    // audioPath, spriteSheetPath, phonemeData, 
    sanitizedFilename,
    fps = 24) {
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
                  console.log("hello breakpoint1");

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
                console.log("hello breakpoint");
                phoneme_list.forEach(word => {
                  word.sounds.forEach(sounds =>{
                    console.log(`${sounds}`)//+${word.start_time}+${word.end_time}`)
                  })
                })
                createFrames(phoneme_list, sanitizedFilename, 24, './shortened-audiomp3.mp3');
                // Use FFmpeg to combine frames into a video with audio
                ffmpeg()
                .input(`./movieframes/frame-${sanitizedFilename}-%d.jpg`)
                .inputFPS(fps)
                .input(audioPath)
                .output('outputcharacter.webm')
                .on('end', () => console.log('Video created!'))
                .on('progress', (progress) => { console.log(`Processing: ${Math.round(progress.percent)}% done`); })
                .run();
                
                // await fs.rm("./frames");
                
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

module.exports = generateLipSyncVideo;