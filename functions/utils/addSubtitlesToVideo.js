const ffmpegFluent = require('fluent-ffmpeg')

async function addSubtitlesToVideo(videoPath, srtPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpegFluent(videoPath)
            .outputOptions([
                '-vf', `subtitles=${srtPath}`,
            ])
            .save(outputPath)
            .on('end', () => {
                console.log('Subtitles added to video successfully!');
                resolve();
            })
            .on('error', (err) => {
                console.error('Error adding subtitles to video:', err);
                reject(err);
            });
    })
}

module.exports = addSubtitlesToVideo;