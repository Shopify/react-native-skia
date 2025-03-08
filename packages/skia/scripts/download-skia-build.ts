import * as path from 'path';
import { $ } from './utils';


// Parse command line arguments
function parseArgs(): { url: string } {
//   const args = process.argv.slice(2);
//   const urlArg = args.find(arg => arg.startsWith('--url='));
  
//   if (!urlArg) {
//     throw new Error('URL parameter is required. Usage: --url=https://example.com/archive.zip');
//   }
  
//   const url = urlArg.split('=')[1];
  return { url: "https://firebasestorage.googleapis.com/v0/b/start-react-native.appspot.com/o/tmp%2Fskia-build-next.zip?alt=media&token=35b73859-97cf-4683-8f01-16274bb117be" };
}

// Main function
async function main(): Promise<void> {
  const tempDir = path.join(process.cwd(), 'temp');
  try {
    // Parse command line arguments
    const { url } = parseArgs();
    
    // Create temporary directories
    const downloadPath = path.join(tempDir, 'archive.zip');
    const extractPath = path.join(tempDir, 'extracted');
    
    // Create temp directory
    $(`mkdir -p ${tempDir}`);
    $(`mkdir -p ${extractPath}`);
    
    // Download the zip file
    console.log(`Downloading file from ${url}...`);
    $(`curl -L "${url}" -o ${downloadPath}`);
    
    // Extract the zip file
    console.log(`Extracting zip file to ${extractPath}...`);
    $(`unzip -q -o ${downloadPath} -d ${extractPath}`);
    
    // Determine the directory structure by checking common patterns
    console.log('Analyzing extracted directory structure...');
    
    const libsSourcePath = path.join(extractPath, 'libs');
    const skiaSourcePath = path.join(extractPath, 'skia');
    
    // Copy the files to their target locations
    console.log('Found libs directory, copying to target...');
    // Remove existing libs directory if it exists
    $(`rm -rf libs`);
    // Copy the directory
    $(`cp -R ${libsSourcePath} .`);

    console.log('Found cpp/skia directory, copying to target...');
    // Remove existing cpp/skia directory if it exists
    $(`rm -rf cpp/skia`);
    // Ensure cpp directory exists
    $(`mkdir -p cpp`);
    // Copy the directory
    $(`cp -R ${skiaSourcePath} cpp/`);

    console.log('Process completed successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
  // Clean up
  console.log('Cleaning up temporary files...');
  $(`rm -rf ${tempDir}`);
}

// Run the script
main();