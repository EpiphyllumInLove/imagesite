/**
 * Cloudflare Pages Function - random image site/API.
 *
 * Browser visits receive a tiny page with an <img> that points at the selected
 * static image. That keeps page load random, while "Save image as..." saves the
 * exact image currently displayed instead of re-requesting this random route.
 *
 * Non-HTML requests still get a random image response directly, preserving the
 * old API-style behavior for tools or embeds that request the site as an image.
 */
export async function onRequest(context) {
    const { request, env } = context;

    try {
        const imagePath = await pickRandomImage(request, env);
        const accept = request.headers.get('Accept') || '';

        if (accept.includes('text/html')) {
            return renderImagePage(imagePath);
        }

        return fetchImage(request, env, imagePath);
    } catch (err) {
        return new Response('Server error: ' + err.message, { status: err.status || 500 });
    }
}

async function pickRandomImage(request, env) {
    const listResp = await env.ASSETS.fetch(new URL('/image-list.json', request.url));

    if (!listResp.ok) {
        throw new Error('Cannot read image-list.json. Run the image list generator before deploying.');
    }

    const data = await listResp.json();
    const images = data.images;

    if (!images || images.length === 0) {
        const error = new Error('No images found in the image directory.');
        error.status = 404;
        throw error;
    }

    return images[Math.floor(Math.random() * images.length)];
}

async function fetchImage(request, env, imagePath) {
    const imageResp = await env.ASSETS.fetch(new URL(imagePath, request.url));

    if (!imageResp.ok) {
        return new Response('Failed to load image: ' + imagePath, { status: 500 });
    }

    const headers = new Headers(imageResp.headers);
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.delete('Content-Encoding');

    return new Response(imageResp.body, {
        status: 200,
        headers
    });
}

function renderImagePage(imagePath) {
    const escapedPath = escapeHtml(imagePath);
    const html = `<!doctype html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Random Image</title>
    <style>
        html,
        body {
            margin: 0;
            min-height: 100%;
            background: #111;
        }

        body {
            display: grid;
            place-items: center;
        }

        img {
            display: block;
            max-width: 100vw;
            max-height: 100vh;
            object-fit: contain;
        }
    </style>
</head>
<body>
    <img src="${escapedPath}" alt="">
</body>
</html>`;

    return new Response(html, {
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
    });
}

function escapeHtml(value) {
    return value.replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}
