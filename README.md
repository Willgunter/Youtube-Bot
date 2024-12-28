# Youtube-Bot
A bot that creates shorts content and automatically uploads them to platforms
   gh cs ports forward <remote-port>:<local-port> -c <codespace-name> 

    URL: https://refactored-parakeet-pp9gqxr7qq92rr66-8001.app.github.dev/bot-e5092/us-central1/helloWorld

checklist:
    - integrate with google gemini for script ✅
    - use gtts for text-to-speech ✅
    - use something better (elevenLabs) for text-to-speech ---> generateTTS file (easy fix basically already have code)
    iuse 
    - go to character.js and make it give an error if it is < 2 minutes long
    - switch from using assemblyai / cmu library phonemes to gentle phoneme timings
        - add timing stuff for all phonemes from cmudict not just the first one
        - also handle case of "undefined (like a period or something)" for cmudict transcription stuff
        - while using cmu library, handle undefined logic (like if it is a certain length or longer, make it generate visemes randomly)
        could start off random, then use google for machine learning or something idk (chat api or some sort of thing maybe) to break words that aren't in cmu dictionary into different phonemes and stuff
    - could also use papagayo: https://github.com/morevnaproject-org/papagayo-ng
    - editing
        - combine speech + audio into a video ✅
        - crop video to 16:9 or whatever ✅
        - make video crop properly
        - add remove file capabilities in visemes.js
            I find a source of videos
        - figure out how to fetch random clips + validate they are Creative Commons certified 🟨
        - edit video (idk what specific things)
    - figure out how to edit video really well for viewer engagement (stretch goal if this ends up working)
    - add subtitles ✅
    - upload to youtube
    - figure out deployment with GCP
    - break up steps between different gcp cloud functions (in same file) so one does not do all the work (after I am done with main stuff though)
    - either get rid of addSubtitlesToVideos or do it through ZapCap (want to do it through subtitles but thats not super important and something for the future)
    - organize code (add / remove comments, move variable initiation around, remove unneeded imports, etc...)
    - add error handling / retry login / phone text if it goes wrong (in the future)
    - swap like 100 in editVideo.js to be webm instead of mp4

commands:

    - (in functions) firebase emulators:start
    - (in functions) yt-dlp -o "./videos/fall_guys.(%ext)s" -f bestvideo https://www.youtube.com/watch?v=oGSsgACIc6Q
        - (downloads fall guys video w/ best video quality (background audio is not necessary rn))
    - gh cs ports forward <remote-port>:<local-port> -c <codespace-name> (ports to local machine I think) 

TODO:
    - next get video together 
        - go through every frame and adjust its ratios so that it fits with 1080x1920 and remove its background as well
        - move character pub / sub function into a different file then export at the top?
        - then work backwards to add stuff in .character pub / sub callback function to create video
    - do stuff for actual video content
    - break apart visemes.js into like 3 seperate parts (generate vid, create frames, map visemes to files)
    - might be pretty close to being done tho I forgot
 (for self) eventually export setup / admin / other firebase stuff to utils
- also tailor gemini prompt + tailor properties and stuff (look bat at like 69 in createScript.js idk what that does)
- or figure out how to put sources in description of video (using generationConfig from gemini api) (https://ai.google.dev/api/generate-content?_gl=1*3prpvu*_up*MQ..&gclid=CjwKCAjw1NK4BhAwEiwAVUHPUB06YslWhuNcHUGpG1kNYBUnoGh8LmaDMJEBoQ3TG48MmRPC0W5pFBoCWaoQAvD_BwE#v1beta.GenerationConfig)
also useful commands are in variousstuff.js file
- generate speech using better text to speech thing