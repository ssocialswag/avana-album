const ALBUMS = {
  autumn: { folder: "/album/autumn/", envKey: "ALBUM_AUTUMN_PASSWORD" },
  winter: { folder: "/album/winter/", envKey: "ALBUM_WINTER_PASSWORD" }
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health" && request.method === "GET") {
      return json({
        ok: true,
        imagekit: Boolean(env.IMAGEKIT_PRIVATE_KEY && env.IMAGEKIT_URL_ENDPOINT),
        passwords: {
          autumn: Boolean(env.ALBUM_AUTUMN_PASSWORD),
          winter: Boolean(env.ALBUM_WINTER_PASSWORD)
        }
      });
    }

    const match = url.pathname.match(/^\/api\/albums\/([^/]+)\/access$/);
    if (match && request.method === "POST") {
      return handleAccess(request, env, match[1]);
    }

    // Всё остальное — обычные статические файлы (index.html, картинки и т.д.)
    return env.ASSETS.fetch(request);
  }
};

async function handleAccess(request, env, albumName) {
  const config = ALBUMS[albumName];
  if (!config) return json({ error: "Album not found" }, 404);

  let body = {};
  try {
    body = await request.json();
  } catch {
    // тело пустое/битое — password останется ""
  }
  const password = typeof body.password === "string" ? body.password : "";
  const expected = env[config.envKey] || "";

  if (!expected) {
    return json({ error: "Пароль для этого альбома ещё не настроен." }, 500);
  }

  const ok = password.length > 0 && (await timingSafeEqualStrings(password, expected));
  if (!ok) return json({ error: "Invalid password" }, 401);

  try {
    const photos = await listAlbumPhotos(env, config.folder);
    return json({ photos });
  } catch (error) {
    return json(
      { error: "Не удалось загрузить фотографии. Проверьте настройки ImageKit." },
      500
    );
  }
}

async function timingSafeEqualStrings(a, b) {
  const enc = new TextEncoder();
  const [da, db] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(a)),
    crypto.subtle.digest("SHA-256", enc.encode(b))
  ]);
  const va = new Uint8Array(da);
  const vb = new Uint8Array(db);
  let diff = 0;
  for (let i = 0; i < va.length; i++) diff |= va[i] ^ vb[i];
  return diff === 0;
}

async function listAlbumPhotos(env, folder) {
  const key = env.IMAGEKIT_PRIVATE_KEY;
  if (!key) throw new Error("IMAGEKIT_PRIVATE_KEY is not configured");

  const endpoint = new URL("https://api.imagekit.io/v1/files");
  endpoint.searchParams.set("path", folder);
  endpoint.searchParams.set("fileType", "image");
  endpoint.searchParams.set("limit", "1000");

  const auth = btoa(key + ":");
  const response = await fetch(endpoint, {
    headers: { Authorization: "Basic " + auth }
  });

  if (!response.ok) {
    throw new Error(`ImageKit list failed: ${response.status}`);
  }

  const files = await response.json();
  const list = Array.isArray(files) ? files : [];

  const sorted = list
    .filter(file => file.filePath || file.url)
    .sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || ""), undefined, {
        numeric: true
      })
    );

  const photos = [];
  for (const file of sorted) {
    const path = file.filePath || new URL(file.url).pathname;
    photos.push({
      name: file.name,
      url: await signedUrl(env, path, 5 * 60)
    });
  }
  return photos;
}

async function signedUrl(env, filePath, expiresIn) {
  const endpoint = (env.IMAGEKIT_URL_ENDPOINT || "").replace(/\/$/, "");
  const key = env.IMAGEKIT_PRIVATE_KEY;
  if (!endpoint) throw new Error("IMAGEKIT_URL_ENDPOINT is not configured");

  const expires = Math.floor(Date.now() / 1000) + expiresIn;
  const cleanPath = "/" + String(filePath).replace(/^\/+/, "");

  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    enc.encode(cleanPath + expires)
  );
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  return `${endpoint}${cleanPath}?ik-t=${expires}&ik-s=${signature}`;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
