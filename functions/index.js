/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const admin = require('firebase-admin');
const serviceAccount = require('./bot-e5092-firebase-adminsdk-n1rf1-d5e77f04c2.json');

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// firebase emulators:start

// Import Firebase and Firestore
// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";

// Initialize Firebase Admin with your service account key
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://<YOUR_PROJECT_ID>.firebaseio.com" // optional if you're using database services
// });

// const firestore = admin.firestore();


// Example of querying Firestore
// START HERE WHEN YOU NEXT WORK ON IT
//*** Initialize Firebase Admin SDK 
admin.initializeApp({ 
    credential: admin.credential.cert(serviceAccount), 
    storageBucket: 'your-project-id.appspot.com', 
});

const bucket = admin.storage().bucket();

//*** Path to the file you want to upload const localFilePath = './local/path/to/file.txt'; const destination = 'generated/file.txt'; // "generated" is like a folder in cloud storage

//*** */ Upload the file to Firebase Storage bucket.upload(localFilePath, { destination: destination, public: true, // optional, to make it public }) .then(() => { console.log(File uploaded to 'generated/file.txt'); }) .catch((err) => { console.error('Error uploading file:', err); });

exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

// utility.py
// import os
// import random
// from datetime import datetime
// from moviepy.editor import *
// import moviepy.video.fx.all as vfx
// import moviepy.video.fx.crop as crop_vid
// from gtts import gTTS
// import assemblyai as aai
// import pysrt
// import praw
// import google_auth_oauthlib.flow
// import googleapiclient.discovery
// import googleapiclient.errors
// import google.auth.transport.requests
// import json

// # from dotenv import load_dotenv
// import google.generativeai as genai
// from google.ai.generativelanguage_v1beta.types import content

// # Load environment variables
// # load_dotenv()


// def get_current_datetime():
//     return datetime.now().strftime("%Y%m%d_%H%M%S")


// def create_script(prompt):
//     genai.configure(api_key="AIzaSyD3uai6s7MgxmxujO_qJmjT8yUoLknDhkQ")
//     generation_config = {
//         "temperature": 1,
//         "top_p": 0.95,
//         "top_k": 64,
//         "max_output_tokens": 8192,
//         "response_schema": content.Schema(
//             type=content.Type.OBJECT,
//             properties={
//                 "title": content.Schema(
//                     type=content.Type.STRING,
//                 ),
//                 "script": content.Schema(
//                     type=content.Type.STRING,
//                 ),
//             },
//         ),
//         "response_mime_type": "application/json",
//     }

//     model = genai.GenerativeModel(
//         model_name="gemini-1.5-flash",
//         generation_config=generation_config,
//         # safety_settings = Adjust safety settings
//         # See https://ai.google.dev/gemini-api/docs/safety-settings
//         system_instruction="You are an AI Agent tasked with creating an educational video script based on the prompt the user provides. The script should be about 150 words long, and keep an informative but authoritative tone throughout the video. Do not directly address the viewer. Use data to support your points. The scripts will be about maintaining a healthy lifestyle. Be as persuasive as possible, trying to scare the listener out of unhealthy habits.",
//     )

//     chat_session = model.start_chat(
//         history=[
//             {
//                 "role": "user",
//                 "parts": [
//                     prompt,
//                 ],
//             },
//         ]
//     )

//     response = chat_session.send_message("INSERT_INPUT_HERE")

//     print(response.text)
//     return json.loads(response.text)


// def generate_speech(content, output_path):
//     speech = gTTS(text=content, lang="en", slow=False)
//     speech.save(output_path)
//     return output_path


// def edit_video(audio_path, video_path, output_path):
//     audio_clip = AudioFileClip(audio_path).fx(vfx.speedx, 1)
//     start_point = random.randint(1, 100)
//     video_clip = VideoFileClip(video_path).subclip(
//         start_point, start_point + audio_clip.duration + 1.3
//     )
//     final_clip = video_clip.set_audio(audio_clip)

//     w, h = final_clip.size
//     target_ratio = 1080 / 1920
//     current_ratio = w / h

//     if current_ratio > target_ratio:
//         new_width = int(h * target_ratio)
//         x_center = w / 2
//         final_clip = crop_vid.crop(
//             final_clip, width=new_width, height=h, x_center=x_center
//         )
//     else:
//         new_height = int(w / target_ratio)
//         y_center = h / 2
//         final_clip = crop_vid.crop(
//             final_clip, width=w, height=new_height, y_center=y_center
//         )

//     final_clip.write_videofile(
//         output_path,
//         codec="libx264",
//         audio_codec="aac",
//         temp_audiofile="temp-audio.m4a",
//         remove_temp=True,
//         threads=4,
//         preset="ultrafast",
//     )
//     return output_path


// def transcribe_video(video_path, srt_output_path):
//     aai.settings.api_key = "185ad5ea9a874fd4ad65afc89cd4da1c"
//     transcriber = aai.Transcriber()
//     transcript = transcriber.transcribe(video_path)
//     srt = transcript.export_subtitles_srt()

//     with open(srt_output_path, "w") as f:
//         f.write(srt)
//     return srt_output_path


// def add_subtitles_to_video(video_path, srt_path, output_path):
//     video = VideoFileClip(video_path)
//     subtitles = pysrt.open(srt_path)

//     def to_seconds(timestamp):
//         return (
//             timestamp.hours * 3600
//             + timestamp.minutes * 60
//             + timestamp.seconds
//             + timestamp.milliseconds / 1000
//         )

//     subtitle_clips = [
//         TextClip(
//             subtitle.text,
//             fontsize=48,
//             font="Marker-Felt-Wide",
//             stroke_color="black",
//             stroke_width=2,
//             color="white",
//             bg_color="transparent",
//             size=(video.size[0] * 3 / 4, None),
//             method="caption",
//         )
//         .set_start(to_seconds(subtitle.start))
//         .set_duration(to_seconds(subtitle.end) - to_seconds(subtitle.start))
//         .set_position(("center", "center"))
//         for subtitle in subtitles
//     ]

//     final_video = CompositeVideoClip([video, *subtitle_clips])
//     final_video.write_videofile(
//         output_path, codec="libx264", remove_temp=True, preset="ultrafast"
//     )
//     return output_path


// def shorten_video_if_needed(video_path, max_duration=58):
//     video_clip = VideoFileClip(video_path)
//     if video_clip.duration > max_duration:
//         final_short_clip = video_clip.subclip(0, max_duration)
//         final_short_path = video_path.replace(".mp4", "_short.mp4")
//         final_short_clip.write_videofile(
//             final_short_path, codec="libx264", remove_temp=True, preset="ultrafast"
//         )
//         final_short_clip.close()
//         return final_short_path
//     video_clip.close()
//     return video_path


// def add_subtitles_to_video_with_backgrounds(video_paths, srt_path, output_paths):
//     video_clips = [VideoFileClip(video_path) for video_path in video_paths]
//     subtitles = pysrt.open(srt_path)

//     def to_seconds(timestamp):
//         return (
//             timestamp.hours * 3600
//             + timestamp.minutes * 60
//             + timestamp.seconds
//             + timestamp.milliseconds / 1000
//         )

//     # generate subtitle clips once, reuse across all videos
//     subtitle_clips = [
//         TextClip(
//             subtitle.text,
//             fontsize=48,
//             font="Marker-Felt-Wide",
//             stroke_color="black",
//             stroke_width=2,
//             color="white",
//             bg_color="transparent",
//             size=(video_clips[0].size[0] * 3 / 4, None),
//             method="caption",
//         )
//         .set_start(to_seconds(subtitle.start))
//         .set_duration(to_seconds(subtitle.end) - to_seconds(subtitle.start))
//         .set_position(("center", "center"))
//         for subtitle in subtitles
//     ]

//     # now create 3 videos with different backgrounds
//     for video_clip, output_path in zip(video_clips, output_paths):
//         final_video = CompositeVideoClip([video_clip, *subtitle_clips])
//         final_video.write_videofile(
//             output_path, codec="libx264", remove_temp=True, preset="ultrafast"
//         )

//     return output_paths

// video_creator_script.py
// import os

// from utility import (
//     create_script,
//     generate_speech,
//     edit_video,
//     transcribe_video,
//     add_subtitles_to_video,
//     shorten_video_if_needed,
//     get_current_datetime,
// )


// def main():
//     if not os.path.exists("generated"):
//         os.makedirs("generated")

//     script = create_script("Fast food")
//     title, content = script["title"], script["script"]
//     print("Title:", title)
//     print("Content:", content)

//     if len(title) > 100:
//         print("Error: The title is too long for YouTube. Title length:", len(title))
//         return

//     formatted_now = get_current_datetime()

//     speech_path = generate_speech(content, f"generated/speech_{formatted_now}.mp3")
//     video_path = edit_video(
//         speech_path, "minecraft.mp4", f"generated/intermediate_{formatted_now}.mp4"
//     )
//     srt_path = transcribe_video(video_path, f"generated/{formatted_now}.srt")
//     final_video_path = add_subtitles_to_video(
//         video_path, srt_path, f"generated/final_{formatted_now}.mp4"
//     )
//     final_short_path = shorten_video_if_needed(final_video_path)


// if __name__ == "__main__":
//     main()