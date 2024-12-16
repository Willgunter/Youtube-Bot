
// creates a script
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function createScript(scriptContent) {
    // Make sure to include these imports:
    try {
        console.log("first line");
        let genAI;
        try {
            genAI = new GoogleGenerativeAI(process.env.API_KEY); // problem
            console.log("GenAI initialized successfully");
        } catch (error) {
            console.log("GenAI initialization error:", error);
        }
        console.log("createScript is running");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
        
        console.log(process.env.API_KEY);
        const generationConfig = {
            maxOutputTokens: 8192,
            temperature: 1,
            top_p: 0.95,
            // top_k: 64, // for regular flash model
            top_k: 40, // for flash 8b model
            
        };
        
        const result = await model.generateContent({
            contents: [{ 
                role: 'user',
                parts: [{ text: scriptContent, },],
            }],
            // generationConfig: generationConfig,
            generationConfig
        });
        
        const textResponse = result.response.text();
        console.log("Full Result:", textResponse);
        
        try {
            // Try parsing the response as JSON
            const parsedResponse = JSON.parse(textResponse.trim()
                // .replace(/^```json\n/, '')
                .replace(/^```json\s*/, '')
                .replace(/```$/, ''))
                
            return {
                title: parsedResponse.title, 
                script: parsedResponse.script
            };
        } catch (parseError) {
            // If JSON parsing fails, return the raw text
            console.error("Could not parse JSON:", parseError);
            return {
                title: "Error parsing response",
                script: textResponse
            };
        }
        
    } catch (error) {
        console.log("this doesn't work")
        console.error("Error creating script:", error);
        throw error;
    }
    
    return {title: "Error message", script: "Error message"}
}

async function fetchYoutube() {
    const axios = require("axios");

    const key = "AIzaSyCq8AG5FJOBGCIaWZEG1WP4Wh5kE0e6vN8"
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

fetchYoutube();
// module.exports = {createScript, fetchYoutube};
