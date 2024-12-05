const ffmpeg = require('fluent-ffmpeg');

// ffmpeg.setFfmpegPath("../bin/ffmpeg-master-latest-win64-gpl/ffmpeg-master-latest-win64-gpl/bin/ffmpeg.exe");
ffmpeg.setFfmpegPath("../bin/ffmpeg-master-latest-win64-gpl/ffmpeg-master-latest-win64-gpl/bin/ffmpeg.exe");

ffmpeg.setFfprobePath('../bin/ffmpeg-master-latest-win64-gpl/ffmpeg-master-latest-win64-gpl/bin/ffprobe');

function generateVisemeVideo(visemeFrames, audioFile, outputFile) {
    ffmpeg.ffprobe(audioFile, (err, metadata) => {
        if (err) return console.error(err);

        const totalDuration = metadata.format.duration;
        const frameDuration = totalDuration / visemeFrames.length;

        const video = ffmpeg();
        visemeFrames.forEach(frame => {
            video.input(frame).inputOptions(`-t ${frameDuration}`);
        });

        video.input(audioFile)
            .on('end', () => console.log('Viseme video created successfully'))
            .on('error', (err) => console.error('Error:', err))
            .output(outputFile)
            .run();
    });
}

const visemeFrames = ['viseme1.jpg', 'viseme2.jpg', 'viseme3.jpg'];
generateVisemeVideo(visemeFrames, 'audio.mp3', 'output_video.mp4');

// Dynamic Mapping: Use libraries like pocketsphinx or deepspeech to extract phoneme timings from audio.
// Audio-Driven Animation: Match phoneme timestamps to visemes dynamically for more accurate lip-sync.