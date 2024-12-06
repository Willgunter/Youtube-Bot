const fs = require('fs');
// const canvas = require('canvas');
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
require('dotenv').config();

async function generateLipSyncVideo(
    // audioPath, spriteSheetPath, phonemeData, 
    fps = 24) {const axios = require('axios');
      const fs = require('fs');
      
      // Replace with your local Gentle server URL
      const GENTLE_SERVER_URL = 'http://localhost:5000/transcribe';  // Change to the correct Gentle server URL
      
      // Read the audio file
      const audioFile = fs.readFileSync('path/to/your/audio.mp3');
      
      // Send the audio file to Gentle
      axios.post(GENTLE_SERVER_URL, audioFile, {
        headers: {
          'Content-Type': 'audio/mp3',
        }
      })
        .then(response => {
          console.log('Phoneme Segmentation Result:', response.data);
        })
        .catch(error => {
          console.error('Error interacting with Gentle:', error);
        });
              
        
        // transcribeAudio();
        
//   const spriteSheet = await canvas.loadImage(spriteSheetPath);
//   const ctx = canvas.createCanvas(1920, 1080).getContext('2d');
//   const frames = [];

//   phonemeData.forEach((phoneme, index) => {
//     const { text, start, end } = phoneme;
    
//     // Calculate how many frames this phoneme needs based on FPS
//     const duration = end - start; // Duration in seconds
//     const frameCount = Math.round(duration * fps); // Frames for this phoneme

//     // Determine which sprite frame to use for this phoneme
//     const spriteX = phonemeToSpriteX(text); // Map phoneme to sprite position
//     const spriteY = 0; // Assuming a single-row sprite sheet

//     for (let i = 0; i < frameCount; i++) {
//       ctx.clearRect(0, 0, 1920, 1080); // Clear canvas for each new frame

//       ctx.drawImage(
//         spriteSheet,
//         spriteX, spriteY, spriteWidth, spriteHeight, // Source from sprite sheet
//         0, 0, 1920, 1080 // Destination canvas size
//       );

//       // Save the frame as an image file
//       const framePath = `frame-${index}-${i}.png`;
//       fs.writeFileSync(framePath, canvas.toBuffer('image/png'));
//       frames.push(framePath); // Store the frame path for later
//     }
//   });

//   // Use FFmpeg to combine frames into a video with audio
//   ffmpeg()
//     .input('frame-%d-%d.png')
//     .inputFPS(fps)
//     .input(audioPath)
//     .output('output.webm')
//     .on('end', () => console.log('Video created!'))
//     .run();
}
// 
// function phonemeToSpriteX(phoneme) {
//   Example mapping function: maps phoneme text to x position in the sprite sheet
//   const mapping = {
    // 'a': 0,
    // 'e': spriteWidth,
    // 'o': spriteWidth * 2,
    // 'u': spriteWidth * 3,
    // 'p': spriteWidth * 4
//   };
//   return mapping[phoneme] || 0; // Default to first sprite if phoneme not found
// }

generateLipSyncVideo();