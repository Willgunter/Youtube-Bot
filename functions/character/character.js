const ffmpeg = require('fluent-ffmpeg');

// ffmpeg.setFfmpegPath("../bin/ffmpeg-master-latest-win64-gpl/ffmpeg-master-latest-win64-gpl/bin/ffmpeg.exe");
// ffmpeg.setFfmpegPath("../bin/ffmpeg-master-latest-win64-gpl/ffmpeg-master-latest-win64-gpl/bin/ffmpeg.exe");
// ffmpeg.setFfprobePath('../bin/ffmpeg-master-latest-win64-gpl/ffmpeg-master-latest-win64-gpl/bin/ffprobe');

ffmpeg.setFfprobePath("ffprobe");
ffmpeg.setFfmpegPath("ffmpeg");


function generateVisemeVideo(visemeFrames, audioFile, outputFile) {
    ffmpeg.ffprobe(audioFile, (err, metadata) => {
        if (err) return console.error(err);

        const totalDuration = metadata.format.duration;
        const frameDuration = totalDuration / visemeFrames.length;
        console.log(`${frameDuration}`)
        console.log(`${metadata.format}`)

        const video = ffmpeg();
        visemeFrames.forEach((frame, index) => {
            video.input(frame).inputOptions(`-t ${frameDuration}`)
            // .outputOptions(`-vf "setpts=PTS+${index * frameDuration}/TB"`);
        });

        video.input(audioFile)
            .on('end', () => console.log('Viseme video created successfully'))
            .on('error', (err) => console.error('Error:', err))
            .outputOptions('-shortest')
            .output(outputFile)
            .run();
    });
}

const visemeFrames = ['./not_smile.jpg', './face.jpg', './smile.jpg'];
generateVisemeVideo(visemeFrames, './Gusty_Garden_Galaxy.mp3', './outputdd_video.mp4');

// Dynamic Mapping: Use libraries like pocketsphinx or deepspeech to extract phoneme timings from audio.
// Audio-Driven Animation: Match phoneme timestamps to visemes dynamically for more accurate lip-sync.
// https://pypi.org/project/cmudict/
// https://pypi.org/project/SpeechRecognition/