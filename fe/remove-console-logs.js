const fs = require('fs');
const path = require('path');

// Đệ quy để tìm tất cả các file .ts, .tsx, .js, .jsx
function findFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Bỏ qua node_modules và .next
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                findFiles(filePath, fileList);
            }
        } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

// Xóa các dòng console.log, console.error, console.warn, console.info, console.debug
// CHỈ xóa các dòng đơn giản, không ảnh hưởng đến logic
function removeConsoleLogs(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        const lines = content.split('\n');
        const newLines = [];
        let inMultiLineComment = false;
        let inString = false;
        let stringChar = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            let shouldSkip = false;

            // Kiểm tra multi-line comments
            if (line.includes('/*')) {
                inMultiLineComment = true;
            }
            if (line.includes('*/')) {
                inMultiLineComment = false;
            }

            // Bỏ qua nếu đang trong multi-line comment
            if (inMultiLineComment && !line.includes('*/')) {
                newLines.push(line);
                continue;
            }

            // Kiểm tra string (đơn giản, không xử lý template strings phức tạp)
            const trimmedLine = line.trim();

            // Chỉ xóa các dòng console đơn giản (toàn bộ dòng chỉ có console)
            // Pattern: whitespace + console.method(...) + optional semicolon + whitespace
            const consolePattern = /^\s*console\.(log|error|warn|info|debug)\([^)]*\);?\s*$/;

            // Kiểm tra xem dòng có phải là console.log đơn giản không
            if (consolePattern.test(trimmedLine)) {
                // Đây là dòng console đơn giản, bỏ qua (không thêm vào newLines)
                shouldSkip = true;
            }

            // Xóa các dòng console trong single-line comment
            if (trimmedLine.startsWith('//') && trimmedLine.includes('console.')) {
                // Giữ lại comment nhưng xóa phần console
                const commentMatch = trimmedLine.match(/^(\/\/\s*)(.*console\.(log|error|warn|info|debug)\([^)]*\);?\s*)(.*)$/);
                if (commentMatch) {
                    newLines.push(commentMatch[1] + commentMatch[4]);
                    continue;
                }
            }

            if (!shouldSkip) {
                newLines.push(line);
            }
        }

        const newContent = newLines.join('\n');

        // Chỉ ghi file nếu có thay đổi
        if (newContent !== originalContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Tạo backup trước khi xóa
function createBackup(srcDir) {
    const backupDir = path.join(__dirname, 'backup-before-remove-console');
    if (fs.existsSync(backupDir)) {
        // Xóa backup cũ nếu có
        fs.rmSync(backupDir, { recursive: true, force: true });
    }
    fs.mkdirSync(backupDir, { recursive: true });

    function copyDirectory(src, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        const files = fs.readdirSync(src);
        files.forEach(file => {
            const srcPath = path.join(src, file);
            const destPath = path.join(dest, file);
            const stat = fs.statSync(srcPath);

            if (stat.isDirectory()) {
                if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                    copyDirectory(srcPath, destPath);
                }
            } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
                fs.copyFileSync(srcPath, destPath);
            }
        });
    }

    copyDirectory(srcDir, backupDir);
    console.log(`✅ Backup created at: ${backupDir}`);
    return backupDir;
}

// Main function
function main() {
    const srcDir = path.join(__dirname, 'src');

    if (!fs.existsSync(srcDir)) {
        console.error('src directory not found!');
        process.exit(1);
    }

    // Tạo backup trước
    console.log('Creating backup...');
    const backupDir = createBackup(srcDir);
    console.log('⚠️  IMPORTANT: Backup created. If something goes wrong, restore from:', backupDir);
    console.log('');

    console.log('Finding all TypeScript/JavaScript files...');
    const files = findFiles(srcDir);
    console.log(`Found ${files.length} files`);
    console.log('');

    let modifiedCount = 0;
    files.forEach(file => {
        if (removeConsoleLogs(file)) {
            modifiedCount++;
            console.log(`✓ Removed console logs from: ${file}`);
        }
    });

    console.log(`\n✅ Done! Modified ${modifiedCount} files.`);
    console.log(`📦 Backup location: ${backupDir}`);
    console.log('💡 If you need to restore, copy files from backup folder back to src folder.');
}

main();

