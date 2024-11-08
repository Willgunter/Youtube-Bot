const ffmpegFluent = require('fluent-ffmpeg')
// .addOutputOptions(['-filter_complex "[0:a:0][1:a:0]concat=n=2:v=0:a=1[a]"', '-map "[a]"', '-strict -2'])

//  .complexFilter([
//     {
//         "filter":"concat",
//         "options": {
//             "n": "2",
//             "v":"0",
//             "a":"1",
//         },
//         "input": "[0:a:0][1:a:0]"
//     }
// ])
            
//:force_style='Fontsize=24,PrimaryColour=&H00FFFFFF&,OutlineColour=&H000000FF&,BorderStyle=4'`
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