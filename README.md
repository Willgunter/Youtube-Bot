# Youtube-Bot
A bot that creates shorts content and automatically uploads them to platforms

checklist:
    - integrate with google gemini for script✅
    - use gtts for text-to-speech ✅
    - use something better (elevenLabs) for text-to-speech
    - editing
        - combine speech + audio into a video✅
        - crop video to 16:9 or whatever --> come back to once
            I find a source of videos
        - figure out how to fetch random clips + validate they are Creative Commons certified
        - edit video (idk what specific things)
    - figure out how to edit video really well for viewer engagement (stretch goal if this ends up working)
    - add subtitles✅
    - upload to youtube
    - figure out deployment with GCP
    - break up steps between different gcp cloud functions (in same file) so one does not do all the work

current problems / todos:
    - finish with captions
        - poke around a little bit with changing time out, but
        look into breaking up work into other functions (might not be able to do without pub / sub or something)
        - once timeout starts working, zapcap captions should(???) work which would be good
        - start looking around for a place for creative commons vertical videos I can use
        - then finish editing (cropping / padding mainly) if necessary

commands:

    // runs locally
    // run from root of project?
    firebase emulators:start


TODO: (for self) eventually export setup / admin / other firebase stuff to utils
- also tailor gemini prompt + tailor properties and stuff (look bat at like 69 in createScript.js idk what that does)
- or figure out how to put sources in description of video (using generationConfig from gemini api) (https://ai.google.dev/api/generate-content?_gl=1*3prpvu*_up*MQ..&gclid=CjwKCAjw1NK4BhAwEiwAVUHPUB06YslWhuNcHUGpG1kNYBUnoGh8LmaDMJEBoQ3TG48MmRPC0W5pFBoCWaoQAvD_BwE#v1beta.GenerationConfig)
also useful commands are in variousstuff.js file
- generate speech using better text to speech thing