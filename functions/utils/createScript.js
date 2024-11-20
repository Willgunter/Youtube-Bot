
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

module.exports = createScript;

