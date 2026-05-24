/**
 * Cloudflare Pages Function - 随机图片 API
 * 
 * 访问站点时，会从 image 文件夹中随机选取一张图片，直接返回其内容。
 * 不再使用 302 重定向，以避免用户保存图片时工具/浏览器重新请求原始 URL
 * 导致"所见≠所存"的问题。
 */
export async function onRequest(context) {
    const { request, env } = context;

    try {
        // 1. 获取图片列表
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

        // 3. 直接通过 ASSETS.fetch 获取图片的二进制内容
        //    不再使用 302 重定向，而是把图片内容作为响应直接返回。
        //    这样用户无论"保存页面"还是"保存图片"，拿到的都是同一份数据。
        const imageResp = await env.ASSETS.fetch(new URL(imagePath, request.url));

        if (!imageResp.ok) {
            return new Response('图片加载失败: ' + imagePath, { status: 500 });
        }

        // 4. 构建响应，保留原始 Content-Type，添加禁止缓存控制
        const headers = new Headers(imageResp.headers);
        headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        // 移除 Content-Encoding 避免流式传输冲突
        headers.delete('Content-Encoding');

        return new Response(imageResp.body, {
            status: 200,
            headers
        });

    } catch (err) {
        return new Response('服务器内部错误: ' + err.message, { status: 500 });
    }
}