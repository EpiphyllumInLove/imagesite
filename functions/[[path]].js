// functions/[[path]].js
export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const baseUrl = url.origin;

    try {
        // 使用 env.ASSETS.fetch 效率更高，直接从静态资源中读取
        const listResp = await env.ASSETS.fetch(new URL(`${baseUrl}/image-list.json`));
        if (!listResp.ok) {
            return new Response('图片列表未生成，请检查构建日志', { status: 500 });
        }

        const data = await listResp.json();
        const images = data.images;

        if (!images || images.length === 0) {
            return new Response('未找到图片', { status: 404 });
        }

        const randomIndex = Math.floor(Math.random() * images.length);
        const imagePath = images[randomIndex];

        // 同样建议使用 env.ASSETS.fetch
        return env.ASSETS.fetch(new URL(`${baseUrl}${imagePath}`));

    } catch (err) {
        return new Response('Error: ' + err.message, { status: 500 });
    }
}