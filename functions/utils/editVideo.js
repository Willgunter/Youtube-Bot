const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

// ffmpeg.setFfmpegPath('../bin/ffmpeg-7.0.2-amd64-static/ffmpeg');
// ffmpeg.setFfprobePath('../bin/ffmpeg-7.0.2-amd64-static/ffprobe');
// vvv
// https://www.gyan.dev/ffmpeg/builds/
async function editVideo(audioPath, videoPath, outputPath) {
    
    // audio_clip = AudioFileClip(audio_path).fx(vfx.speedx, 1)
    
    
    
    // start_point = random.randint(1, 100)
    // video_clip = VideoFileClip(video_path).subclip(
    //     start_point, start_point + audio_clip.duration + 1.3
    // )
    // final_clip = video_clip.set_audio(audio_clip)
    
    // w, h = final_clip.size
    // target_ratio = 1080 / 1920
    // current_ratio = w / h
    
    // if current_ratio > target_ratio:
    //     new_width = int(h * target_ratio)
    //     x_center = w / 2
    //     final_clip = crop_vid.crop(
    //         final_clip, width=new_width, height=h, x_center=x_center
    //     )
    // else:
    //     new_height = int(w / target_ratio)
    //     y_center = h / 2
    //     final_clip = crop_vid.crop(
    //         final_clip, width=w, height=new_height, y_center=y_center
    //     )
    
    // final_clip.write_videofile(
    //     output_path,
    //     codec="libx264",
    //     audio_codec="aac",
    //     temp_audiofile="temp-audio.m4a",
    //     remove_temp=True,
    //     threads=4,
    //     preset="ultrafast",
    // )
    

}

module.exports = editVideo;