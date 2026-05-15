export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. 如果是请求图片或列表本身，直接返回静态资源
    if (url.pathname.startsWith('/image/') || url.pathname === '/image-list.json') {
      return env.ASSETS.fetch(request);
    }

    try {
      // 2. 获取图片列表
      const response = await env.ASSETS.fetch(new URL('/image-list.json', request.url));
      if (!response.ok) return new Response("列表未找到", { status: 404 });
      
      const { images } = await response.json();
      
      // 3. 随机选一张
      const randomImage = images[Math.floor(Math.random() * images.length)];

      // 4. 重定向到图片 (302)
      // 这样最省事，浏览器会自动去加载那张静态图片
      return Response.redirect(new URL(randomImage, request.url), 302);

    } catch (e) {
      return new Response("服务器错误: " + e.message, { status: 500 });
    }
  }
};