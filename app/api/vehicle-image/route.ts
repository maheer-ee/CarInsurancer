export async function GET(request: Request) {
  const key = process.env.CAR_IMAGE_API_KEY;
  if (!key) return new Response(null, { status: 404 });

  const selection = new URL(request.url).searchParams;
  const year = selection.get("year") ?? "";
  const make = selection.get("make")?.trim() ?? "";
  const model = selection.get("model")?.trim() ?? "";
  if (!/^\d{4}$/.test(year) || !make || !model || make.length > 100 || model.length > 150) {
    return new Response(null, { status: 400 });
  }

  const url = new URL("https://carimage.dev/api/v1/images/car");
  // Catalog names may group multiple trims, such as Camry LE/SE.
  const baseModel = model.replace(/\s+(?:L|LE|SE|XLE|XSE|TRD)(?:\/(?:L|LE|SE|XLE|XSE|TRD))+$/i, "");
  url.search = new URLSearchParams({ year, make, model: baseModel, view: "front-3-4", format: "png", background: "transparent", trim: "true" }).toString();

  try {
    const image = await fetch(url, {
      headers: { Authorization: "Bearer " + key },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(25000),
    });
    if (!image.ok || image.headers.get("X-Vehicle-Match") !== "exact" ||
        !image.headers.get("Content-Type")?.startsWith("image/png")) {
      return new Response(null, { status: 404 });
    }
    return new Response(image.body, {
      headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
}
