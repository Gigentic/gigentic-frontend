const fs = require('fs').promises;
const path = require('path');
const ignore = require('ignore');

async function readGitignore() {
  try {
    const content = await fs.readFile('.fileignore', 'utf8');
    return ignore().add(content.split('\n'));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Error reading .fileignore:', error);
    }
    return ignore();
  }
}

async function isTextFile(filePath) {
  try {
    const buffer = await fs.readFile(filePath);
    const fileType = await import('file-type');
    const result = await fileType.fileTypeFromBuffer(buffer);
    return !result; // If file-type can't determine the type, it's likely a text file
  } catch (error) {
    console.error(`Error checking file type for ${filePath}:`, error);
    return false;
  }
}

async function listFiles(dir, ig, fileContents) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const relativePath = path.relative(
        process.cwd(),
        path.join(dir, entry.name),
      );
      const fullPath = path.join(dir, entry.name);

      if (ig.ignores(relativePath)) {
        continue;
      }

      if (entry.isDirectory()) {
        console.log(`${relativePath}${path.sep}`);
        await listFiles(fullPath, ig, fileContents);
      } else {
        console.log(relativePath);
        if (await isTextFile(fullPath)) {
          const content = await fs.readFile(fullPath, 'utf8');
          fileContents.push(`// File: ${relativePath}\n${content}\n\n`);
        }
      }
    }
  } catch (error) {
    console.error('Error reading directory:', error);
  }
}

async function main() {
  const ig = await readGitignore();
  const fileContents = [];
  await listFiles(process.cwd(), ig, fileContents);

  const concatenatedContent = fileContents.join('');
  await fs.writeFile('concat-all.txt', concatenatedContent);
  console.log('All text files have been concatenated into concat-all.txt');
}

main().catch(console.error);
