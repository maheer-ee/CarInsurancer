const catalog = "https://www.fueleconomy.gov/ws/rest/vehicle/menu/";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const make = searchParams.get("make");

  if ((year !== null && !/^\d{4}$/.test(year)) || (make !== null && (!year || !make.trim() || make.length > 100))) {
    return Response.json({ error: "Invalid vehicle selection." }, { status: 400 });
  }

  const url = new URL(make ? "model" : year ? "make" : "year", catalog);
  if (year) url.searchParams.set("year", year);
  if (make) url.searchParams.set("make", make);

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("Vehicle catalog request failed");
    const { menuItem } = await response.json();
    const items: unknown[] = menuItem == null ? [] : [menuItem].flat();
    const options = items.filter((item): item is { text: string; value: string } =>
      typeof item === "object" && item !== null &&
      "text" in item && typeof item.text === "string" &&
      "value" in item && typeof item.value === "string",
    );
    return Response.json(options);
  } catch {
    return Response.json({ error: "Vehicle catalog unavailable." }, { status: 502 });
  }
}
