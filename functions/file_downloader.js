const ytdl = require('youtube-dl-exec');  // Ensure yt-dlp is installed
const fs = require('fs');
const path = require('path');

async function downloadVideo(outputDirectory) {

    fs.readFile('./utils/background_videos.json', 'utf8', (err, data) => {
        if (err) {
            console.log('Error reading the file:', err);
            return;
        }

        // Parse the JSON string into a JavaScript object
        const jsonData = JSON.parse(data);

        // Iterate over the keys of the JSON object
        Object.entries(jsonData).forEach(([key, videoData]) => {
            console.log(`Video name: ${key}`);
            // console.log(`URL: ${videoData[0]}`);
            // console.log(`File name: ${videoData[1]}`);
            const filename = videoData[1]
            const sanitizedFilename = filename.replace(/[^a-zA-Z0-9]/g, '_'); // Sanitize filename to be safe
            const outputPath = path.join(outputDirectory, sanitizedFilename);

            try { 
                // Use youtube-dl-exec to download the video directly to a file
                const ytDlpPath = path.resolve('C:\\Users\\Will Gunter\\AppData\\Local\\Temp\\YoutubeBotFiles\\yt-dlp.exe');
                // const ytDlpPath = path.resolve('C:/Users/as/lodfiju;sakdihfWill_Gunter/Personal Coding/PythonProjects/Youtube-Bot/functions/node_modules/youtube-dl-exec/bin/yt-dlp.exe');

                ytdl(videoData[0], {
                    stdout: 'pipe',
                    output: outputPath,
                    format: 'best', // You can adjust the format as needed
                    execPath: ytDlpPath
                }).then(() => {
                    console.log(`Download complete for: ${sanitizedFilename}`);
                }).catch((error) => {
                    console.error('Error downloading video:', error);
                });

            } catch (error) {
                console.error('Error downloading videoasdASD:', error);
            }

        });
    });

}

// Call the function with the desired video URL and output path
const videoUrl = 'YOUR_YOUTUBE_VIDEO_URL';
const outputPath = './videos';
downloadVideo(outputPath);