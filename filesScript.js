const fs = require('fs').promises;
const path = require('path');
const ignore = require('ignore');

async function readGitignore() {
  try {
    const content = await fs.readFile('.fileignore', 'utf8');
    return ignore().add(content.split('\n'));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Error reading .gitignore:', error);
    }
    return ignore();
  }
}

async function listFiles(dir, ig) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const relativePath = path.relative(
        process.cwd(),
        path.join(dir, entry.name),
      );

      if (ig.ignores(relativePath)) {
        continue;
      }

      if (entry.isDirectory()) {
        console.log(`${relativePath}${path.sep}`);
        await listFiles(path.join(dir, entry.name), ig);
      } else {
        console.log(relativePath);
      }
    }
  } catch (error) {
    console.error('Error reading directory:', error);
  }
}

async function main() {
  const ig = await readGitignore();
  await listFiles(process.cwd(), ig);
}

main().catch(console.error);
