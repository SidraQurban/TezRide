const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, 'assets', 'applogo.png');
const outputPath = path.join(__dirname, 'assets', 'applogo_padded.png');

async function resizeImage() {
  try {
    console.log("Analyzing original logo...");
    const image = sharp(inputPath);
    
    // Fit the logo inside a 650x650 transparent box
    await image
      .resize({
        width: 650,
        height: 650,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      // Add a 215px transparent border to all sides to make it 1080x1080
      .extend({
        top: 215,
        bottom: 215,
        left: 215,
        right: 215,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toFile(outputPath);
      
    console.log("SUCCESS: Created heavily padded 1080x1080 image at " + outputPath);
  } catch (err) {
    console.error("ERROR: ", err);
  }
}

resizeImage();
