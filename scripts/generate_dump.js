const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const outputFile = path.join(rootDir, 'repo_dump.txt');

const EXCLUDED_DIRS = [
    'node_modules',
    '.git',
    '.next',
    '.vercel',
    'dist',
    'build',
    'coverage',
];

const EXCLUDED_FILES = [
    'package-lock.json',
    '.DS_Store',
    'yarn.lock',
    'pnpm-lock.yaml',
    'repo_dump.txt',
    'repo_dump_FULL.txt',
    '.env',
    '.env.local',
    '.gitignore'
];

const INCLUDED_EXTENSIONS = [
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.json',
    '.css',
    '.scss',
    '.md',
    '.html'
];

function shouldIncludeFile(filePath) {
    const ext = path.extname(filePath);
    const filename = path.basename(filePath);

    if (EXCLUDED_FILES.includes(filename)) return false;

    // Exclude specific generated files
    if (filename.includes('player-script') && filename.endsWith('.js')) return false;

    // Size check (skip > 500KB)
    try {
        const stats = fs.statSync(filePath);
        if (stats.size > 500 * 1024) return false;
    } catch (e) {
        return false;
    }

    // Checking exact match for filename or if extension is in list
    // Note: some config files might be .js or .json, we generally want them, 
    // but we might want to exclude asset files like images.
    // The whitelist approach with INCLUDED_EXTENSIONS is safer for "text" dump.
    return INCLUDED_EXTENSIONS.includes(ext) ||
        filename === '.gitignore' ||
        filename === 'Dockerfile' ||
        filename === '.npmrc';
}

function scanDirectory(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (!EXCLUDED_DIRS.includes(file)) {
                scanDirectory(filePath, fileList);
            }
        } else {
            if (shouldIncludeFile(filePath)) {
                fileList.push(filePath);
            }
        }
    }
    return fileList;
}

function generateDump() {
    console.log('Scanning directory...');
    const allFiles = scanDirectory(rootDir);
    console.log(`Found ${allFiles.length} files.`);

    let content = '';

    // Add file tree structure at the beginning
    content += '--- PROJECT STRUCTURE ---\n';
    // Simple tree visualization could be added here, but for now just list paths relative to root
    allFiles.forEach(f => {
        content += path.relative(rootDir, f) + '\n';
    });
    content += '\n\n';

    for (const filePath of allFiles) {
        const relativePath = path.relative(rootDir, filePath);
        console.log(`Processing ${relativePath}...`);

        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            content += `--- START FILE: ${relativePath} ---\n`;
            content += fileContent;
            content += `\n--- END FILE: ${relativePath} ---\n\n`;
        } catch (err) {
            console.error(`Error reading ${relativePath}:`, err.message);
            content += `--- START FILE: ${relativePath} ---\n`;
            content += `[Error reading file: ${err.message}]\n`;
            content += `--- END FILE: ${relativePath} ---\n\n`;
        }
    }

    fs.writeFileSync(outputFile, content);
    console.log(`\nDump generated at: ${outputFile}`);
    console.log(`Total size: ${(fs.statSync(outputFile).size / 1024 / 1024).toFixed(2)} MB`);
}

generateDump();
