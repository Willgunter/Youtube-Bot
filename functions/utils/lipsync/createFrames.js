
async function createFrames(phoneme_list, fps=24, audioPath) {
    const frames = [];
  
    let numFrames = 0;
    phoneme_list.forEach((phonemes_for_word) => {
      const totalDuration = (phonemes_for_word.end_time / 1000) - (phonemes_for_word.start_time / 1000);
      const phonemeCount = phonemes_for_word.sounds.length;
  
      const phonemeDuration = totalDuration / phonemeCount;
  
      phonemes_for_word.sounds.forEach((phoneme, index) => {
  
        // Calculate the start and end times for this phoneme based on its position in the word
        const phonemeStartTime = phonemes_for_word.start_time / 1000 + phonemeDuration * index; // Start time of this phoneme in seconds
        const phonemeEndTime = phonemes_for_word.start_time / 1000 + phonemeDuration * (index + 1); // End time of this phoneme in seconds
   
        // Calculate how many frames this phoneme needs based on FPS
        // const duration = (phonemes_for_word.end_time/1000) - (phonemes_for_word.start_time/1000); // Duration in seconds
        // const frameCount = Math.round(duration * fps); // Frames for this phoneme
  
        // Calculate how many frames this phoneme needs based on FPS
        const frameCount = Math.round((phonemeEndTime - phonemeStartTime) * fps); // Frames for this phoneme
  
        
        // Determine which .jpg file to use for this phoneme
        const visemePath = getVisemeFilePath(phoneme.replace(/\d+/g, "")); // Map phoneme to .jpg file
        
        for (let i = 0; i < frameCount; i++) {
          // Save the frame as an image file (using the .jpg directly)
          const framePath = `./movieframes/frame-${sanitizedFilename}-${numFrames}.jpg`;
          console.log("framecound: " + numFrames)
          fs.copyFileSync(visemePath, framePath); // Copy the viseme .jpg to the frame path
          frames.push(framePath); // Store the frame path for later
          numFrames++;
        }
      });
    });
  }
  
// Map phoneme to its corresponding .jpg file
function getVisemeFilePath(phoneme) {
      
        // if (['aa', 'ah', 'aw', 'ay', 'ih', 'iy', 'w', 'hh'].includes(phoneme.toLowerCase())) {
      if (['aa', 'ah', 'aw', 'ay', 'ih', 'iy', 'hh', 'ae', 'ao'].includes(phoneme.toLowerCase())) {
          return './frames/aei.jpg';
          
      // } else if (['ae', 'eh', 'ey', 's', 'z', 'l', 'sh', 'zh'].includes(phoneme.toLowerCase())) {
      } else if (['f', 'v'].includes(phoneme.toLowerCase())) {
        return './frames/fv.jpg';
  
      // } else if (['ao', 'ow', 'oy', 'f', 'v', 'm'].includes(phoneme.toLowerCase())) {
      } else if (['ow', 'oy'].includes(phoneme.toLowerCase())) {
        return './frames/o.jpg';
  
      // (ch j sh) 4) sh zh ch jh
      // } else if (['uw', 'uh'].includes(phoneme.toLowerCase())) {
      } else if (['sh', 'zh', 'ch', 'jh'].includes(phoneme.toLowerCase())) {
        return './frames/ch_j_sh.jpg';
  
      // } else if (['p', 'b'].includes(phoneme.toLowerCase())) {
      } else if (['l'].includes(phoneme.toLowerCase())) {
        return './frames/l.jpg';
  
        // (b m p) 6) m p b
      // } else if (['ch', 'd', 'dh', 'jh', 't'].includes(phoneme.toLowerCase())) {
      } else if (['m', 'p', 'b'].includes(phoneme.toLowerCase())) {
        return './frames/bmp.jpg';
  
      // (e) 7) eh ey 
      // } else if (['g', 'k', 'ng'].includes(phoneme.toLowerCase())) {
      } else if (['eh', 'ey'].includes(phoneme.toLowerCase())) {
        return './frames/e.jpg';
  
      // (c d g k n s t x y z) 8) s z d dh t g k ng n y
      // } else if (['n', 'r', 'th', 'y'].includes(phoneme.toLowerCase())) {
      } else if (['s', 'z', 'd', 'dh', 't', 'g', 'k', 'ng', 'n', 'y'].includes(phoneme.toLowerCase())) {
        return './frames/cdgknstxyz.jpg';
  
      // } else if (['er'].includes(phoneme.toLowerCase())) {
      } else if (['uw', 'uh'].includes(phoneme.toLowerCase())) {
        return './frames/u.jpg';
  
      } else if (['r', 'er'].includes(phoneme.toLowerCase())) {
        return './frames/r.jpg';
        
      } else if (['th'].includes(phoneme.toLowerCase())) {
        return './frames/th.jpg';
  
      } else if (['w'].includes(phoneme.toLowerCase())) {
        return './frames/qw.jpg';
  
      } else {
        return './frames/cdgknstxyz.jpg';  // Default image if phoneme is not found
      }
  
      // (a e i) 1) aa ah aw ay ih iy hh ae ao
      // (f v) 2) f v
      // (o) 3) ow oy
      // (ch j sh) 4) sh zh ch jh
      // (l) 5) l
      // (b m p) 6) m p b
      // (e) 7) eh ey 
      // (c d g k n s t x y z) 8) s z d dh t g k ng n y
      // (u) 9) uw uh
      // (r) 10) r er
      // (th) 11) th
      // (q w) 12) w
  }
  
  // createFrames(text, 24, '/Gusty_Garden_Galaxy.mp3');
module.exports = createFrames;