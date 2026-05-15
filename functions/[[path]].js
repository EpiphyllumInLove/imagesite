export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    try {
        // 1. 获取图片列表
        // 注意：使用 env.ASSETS.fetch 直接读取部署好的静态文件
        const listResp = await env.ASSETS.fetch(new URL('/image-list.json', request.url));
        
        if (!listResp.ok) {
            return new Response('无法读取图片列表 (image-list.json)，请检查构建日志。', { status: 500 });
        }

        const data = await listResp.json();
        const images = data.images;

        if (!images || images.length === 0) {
            return new Response('image 文件夹中没有图片。', { status: 404 });
        }

        // 2. 随机抽取一张
        const randomIndex = Math.floor(Math.random() * images.length);
        const imagePath = images[randomIndex];

        // 3. 读取图片内容并返回
        const imageResp = await env.ASSETS.fetch(new URL(imagePath, request.url));
        
        // 复制原始 Headers 并强制设置不缓存，确保每次刷新都是随机图
        const newHeaders = new Headers(imageResp.headers);
        newHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');

        return new Response(imageResp.body, {
            status: imageResp.status,
            headers: newHeaders
        });

    } catch (err) {
        return new Response('服务器内部错误: ' + err.message, { status: 500 });
    }
}