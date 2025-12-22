const fs = require('fs');
const path = require('path');

const srcDir = 'src/app/svg';
const destDir = 'public/symbols/archimate';

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

const files = walk(srcDir).filter(f => f.endsWith('.svg'));

files.forEach(file => {
    const baseName = path.basename(file, '.svg');
    // Skip files ending with _<number>
    if (/_\d+$/.test(baseName)) {
        return;
    }

    let newName = baseName.toLowerCase().replace(/_/g, '-') + '.svg';

    // Special correction for typo observed in repository
    if (newName === 'data-oject.svg') {
        newName = 'data-object.svg';
    }

    const destPath = path.join(destDir, newName);
    fs.copyFileSync(file, destPath);
    console.log(`Copied: ${file} -> ${destPath}`);
});
