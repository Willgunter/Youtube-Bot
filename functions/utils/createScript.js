
// creates a script
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function createScript(youtubeData) {
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

        const scriptContent = `Create a YouTube video script and title for a youtube short summarizing the following trending videos, 
        ignore the parts of the descriptions that don't see relevant. Here are the requirements, videos and the format I want:
        
        REQUIREMENTS:
        - Title must be engaging, clickbait-style, under 60 characters
        - Target length: 30 seconds - 50 seconds of spoken content
        - Use a conversational, energetic tone suitable for YouTube
        - I am not worried about b-roll or who says what, just give me the text and I can take care of the editing later
        - do not use quotes, parentheses, or brackets of any kind, again, just the text
        - do not give me timestamps, I am just concerned about the script for now, this is a rough draft
        - Return ONLY raw JSON with no markdown formatting, no code blocks, and no backticks.
        - give the script value in one string, not a list of strings 
        
        YOUTUBE TRENDING VIDEOS:
        ${youtubeData}        

        FORMAT:
        {
            "title": "String: Catchy YouTube title",
            "script": "String: Summarize the youtube trending page in an interesting way. Be / pretend to be an enthusiastic youtuber
            while still keeping a formal tone"
            }`;
            
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

module.exports = createScript;