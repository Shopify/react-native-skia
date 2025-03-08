import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';

/**
 * Creates an archive file containing the specified folders
 * @param foldersToArchive Array of folder paths to include in the archive
 * @param outputFilePath Path where the archive file will be saved
 * @param archiveType Type of archive ('zip' or 'tar')
 */
function createArchive(
  foldersToArchive: string[],
  outputFilePath: string,
  archiveType: 'zip' | 'tar' = 'zip'
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create a file to write the archive to
    const output = fs.createWriteStream(outputFilePath);
    const archive = archiver(archiveType, {
      zlib: { level: 9 }, // Compression level (9 = best compression)
    });

    // Listen for events
    output.on('close', () => {
      console.log(`Archive created successfully: ${outputFilePath}`);
      console.log(`Total bytes: ${archive.pointer()}`);
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    // Pipe archive data to the output file
    archive.pipe(output);

    // Add each folder to the archive
    for (const folderPath of foldersToArchive) {
      if (!fs.existsSync(folderPath)) {
        console.warn(`Warning: Folder not found: ${folderPath}`);
        continue;
      }

      const folderName = path.basename(folderPath);
      archive.directory(folderPath, folderName);
      console.log(`Added folder to archive: ${folderPath}`);
    }

    // Finalize the archive
    archive.finalize();
  });
}

/**
 * Main function to run the script
 */
async function main() {
  try {
    const outputFilePath = `skia-build.zip`;
    
    // Define folders to archive
    const foldersToArchive = [
      'libs',
      'cpp/skia'
    ];

    console.log('Starting archive creation...');
    await createArchive(foldersToArchive, outputFilePath);
    console.log('Archive creation completed successfully!');
  } catch (error) {
    console.error('Error creating archive:', error);
    process.exit(1);
  }
}

// Run the script
main();