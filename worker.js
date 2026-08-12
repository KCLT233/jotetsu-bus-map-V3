const UPSTREAM = "https://api.buskita.com";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Accept",
  "Access-Control-Max-Age": "86400",
};

async function proxy(request, path) {
  const body = await request.text();

  const response = await fetch(UPSTREAM + path, {
    method: "POST",
    headers: {
      "Content-Type": request.headers.get("Content-Type") || "application/json",
      "Accept": "application/json",
    },
    body,
  });

  const headers = new Headers(response.headers);
  Object.entries(CORS).forEach(([k, v]) => headers.set(k, v));
  headers.set("Cache-Control", "no-store");

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (request.method !== "POST") {
      return new Response("POST only", { status: 405, headers: CORS });
    }

    if (url.pathname === "/api/buses") {
      return proxy(request, "/get-buses");
    }

    if (url.pathname === "/api/route") {
      return proxy(request, "/get-map-route-points");
    }

    return new Response("Not Found", { status: 404, headers: CORS });
  }
};
