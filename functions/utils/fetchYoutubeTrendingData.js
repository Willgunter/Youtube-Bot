async function fetchYoutube() {
    const axios = require("axios");

    const key = "AIzaSyC3R4Yjq-VBPzBIOrqLlR7WTV5Ut4QwBr4"
    // Function to fetch trending videos
    try {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=US&maxResults=15&key=${key}`;

        const response = await axios.get(url);
        const videos = response.data.items;

        // Loop through videos and log details
        videos.forEach(video => {

        console.log(`Title: ${video.snippet.title}`);
        console.log(`URL: https://www.youtube.com/watch?v=${video.id}`);
        console.log(`Views: ${video.statistics.viewCount}`);
        console.log(`Channel Name: ${video.snippet.channelTitle}`);
        console.log(`Video Description: ${video.snippet.description}`);
        console.log(`Likes: ${video.statistics.likeCount || 'No data'}`);
        console.log('-----------------------------------------');
        });
    } catch (error) {
        console.error('Error fetching trending videos:', error.message);
    }

}

module.exports = fetchYoutube;