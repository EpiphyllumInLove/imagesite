// scripts/generate-list.js
// Cloudflare Pages 部署前运行：扫描 image 目录，生成图片列表
// 用法: node scripts/generate-list.js

const fs = require('fs');
const path = require('path');

const imageDir = path.join(__dirname, '..', 'image');
const outputFile = path.join(__dirname, '..', 'image-list.json');

// 支持的图片扩展名
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];

function scanImages(dir) {
    const results = [];
    if (!fs.existsSync(dir)) {
        return results;
    }
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isFile()) {
            const ext = path.extname(item).toLowerCase();
            if (imageExtensions.includes(ext)) {
                // 返回相对于项目根目录的路径，以 / 开头
                results.push('/image/' + item);
            }
        }
    }
    return results;
}

const images = scanImages(imageDir);
const data = { images };

fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf-8');
console.log(`✅ 已生成图片列表，共 ${images.length} 张图片`);
if (images.length > 0) {
    console.log('图片列表:');
    images.forEach((img, i) => console.log(`  ${i + 1}. ${img}`));
} else {
    console.log('⚠️  image 文件夹为空，请添加图片后重新运行此脚本');
}
