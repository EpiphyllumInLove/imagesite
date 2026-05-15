// functions/random.js
// Cloudflare Pages Function - 访问任意 URL 直接返回一张随机图片
// 不再返回 HTML，浏览器直接显示图片本身

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const baseUrl = url.origin;

    try {
        // 获取图片列表（部署时自动生成的 json 文件）
        const listResp = await fetch(`${baseUrl}/image-list.json`);
        if (!listResp.ok) {
            return new Response('图片列表未生成，请先运行 node scripts/generate-list.js', {
                status: 500,
                headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
        }

        const data = await listResp.json();
        const images = data.images;

        if (!images || images.length === 0) {
            return new Response('image 文件夹中没有图片，请添加图片后重新部署', {
                status: 404,
                headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
        }

        // 随机选一张
        const randomIndex = Math.floor(Math.random() * images.length);
        const imagePath = images[randomIndex];

        // 获取图片文件
        const imageResp = await fetch(`${baseUrl}${imagePath}`);
        if (!imageResp.ok) {
            return new Response('图片加载失败', { status: 500 });
        }

        // 直接返回图片，不包装任何 UI
        const contentType = imageResp.headers.get('Content-Type') || 'image/jpeg';
        return new Response(imageResp.body, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });

    } catch (err) {
        return new Response('服务器错误: ' + err.message, {
            status: 500,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
    }
}
