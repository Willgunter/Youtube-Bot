// const functions = require('@google-cloud/functions-framework');
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath("ffmpeg");
ffmpeg.setFfprobePath("ffprobe");
// Register a CloudEvent callback with the Functions Framework that will
// be executed when the Pub/Sub trigger topic receives a message.
// functions.cloudEvent('addCharacter', cloudEvent => {
  // The Pub/Sub message is passed as the CloudEvent's data payload.
//   const base64name = cloudEvent.data.message.data;

//   const name = base64name
    // ? Buffer.from(base64name, 'base64').toString()
    // : 'World';
  // console.log(`Hello, name!`);
// });

// const webmFile = `./delete_later/aswebm${currentTime}.webm`

// ffmpeg(`./delete_later/withCaptions01_02_2025_03_10_26.mp4`)
  // .output('./delete_later/stthsth.webm')
  // const ffmpeg = require('fluent-ffmpeg');

ffmpeg('./delete_later/withCaptions01_02_2025_03_10_26.mp4') // Input MP4 file
  .output('./delete_later/stthsth.webm') // Output WebM file
  .on('start', () => console.log('Conversion started...'))
  .on('progress', (progress) => console.log(`Progress: ${progress.percent.toFixed(2)}%`))
  .on('end', () => console.log('Conversion completed successfully!'))
  .on('error', (err) => console.error('Error during conversion:', err))
  .run();
