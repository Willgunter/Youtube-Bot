
// creates a script
const GoogleGenerativeAI = require("@google/generative-ai");

async function createScript(scriptContent) {
    // Make sure to include these imports:
    
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {

    
        const generationConfig = {
            maxOutputTokens: 8192,
            temperature: 1,
            top_p: 0.95,
            top_k: 64,
            response_schema: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    script: { type: "string" }
                }
            },
            response_mime_type: "application/json"
        };
        
        const result = await model.generateContent({
            contents: [
                { 
                    role: 'user',
                parts: [
                    {
                        text: scriptContent,
                    },
                ],
                }
            ],
            generationConfig: generationConfig,
        });
        
        console.log("Full Result:", JSON.stringify(result, null, 2));
        
        if (result && result.response && result.response.candidates) {

            // Extract the 'text' content from the response
            const textResponse = result.response.candidates[0].content.parts[0].text;
            
            console.log("Title: " + JSON.parse(textResponse).title)
            console.log("Script:", JSON.parse(textResponse).script);

            return {title: JSON.parse(textResponse).title, script: JSON.parse(textResponse).script};  // Return the title or script as needed
        } else {
            console.error("Invalid response structure:", result);
        }

        // const {title, script} = result.response.data;
    } catch (error) {
        console.log("this doesn't work")
        console.error("Error creating script:", error);
        throw error;
    }
    
    return {title: "Error message", script: "Error message"}
}

module.exports = createScript;

