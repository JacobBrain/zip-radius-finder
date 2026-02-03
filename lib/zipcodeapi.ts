export interface ZipCodeResult {
  zip_code: string;
  distance: number;
  city: string;
  state: string;
}

export interface ZipCodeWithCoords extends ZipCodeResult {
  lat: number;
  lng: number;
}

export interface RadiusResponse {
  zip_codes: ZipCodeResult[];
}

export interface ZipInfoResponse {
  zip_code: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
}

export interface RadiusSearchResult {
  zipCodes: string[];
  zipDetails: ZipCodeWithCoords[];
  centerCoords: { lat: number; lng: number } | null;
  meta: {
    count: number;
    centerZip: string;
    radius: number;
    units: string;
  };
}

async function getZipInfo(
  apiKey: string,
  zipCode: string
): Promise<ZipInfoResponse | null> {
  try {
    const url = `https://www.zipcodeapi.com/rest/${apiKey}/info.json/${zipCode}/degrees`;
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function searchZipCodesInRadius(
  zip: string,
  radius: number,
  units: string = "mile"
): Promise<RadiusSearchResult> {
  const apiKey = process.env.ZIPCODEAPI_KEY;

  if (!apiKey) {
    throw new Error("Server not configured: ZIPCODEAPI_KEY missing.");
  }

  const url = `https://www.zipcodeapi.com/rest/${apiKey}/radius.json/${zip}/${radius}/${units}`;

  const response = await fetch(url);

  if (response.status === 401 || response.status === 403) {
    throw new Error("API key invalid or missing.");
  }

  if (response.status === 429) {
    throw new Error("ZIP service rate limit reached. Try again later.");
  }

  if (!response.ok) {
    const text = await response.text();
    // ZipCodeAPI returns error messages in the response body
    if (text.includes("invalid zip code")) {
      throw new Error("Enter a valid 5-digit ZIP code.");
    }
    throw new Error("Couldn't fetch ZIP codes. Try again.");
  }

  const data: RadiusResponse = await response.json();

  // Get coordinates for center ZIP
  const centerInfo = await getZipInfo(apiKey, zip);
  const centerCoords = centerInfo
    ? { lat: centerInfo.lat, lng: centerInfo.lng }
    : null;

  // Fetch coordinates for all result ZIPs in parallel
  const zipDetailsPromises = data.zip_codes.map(async (z) => {
    const info = await getZipInfo(apiKey, z.zip_code);
    return {
      zip_code: z.zip_code.padStart(5, "0"),
      distance: z.distance,
      city: z.city,
      state: z.state,
      lat: info?.lat ?? 0,
      lng: info?.lng ?? 0,
    };
  });

  const zipDetailsRaw = await Promise.all(zipDetailsPromises);

  // Dedupe and sort by distance
  const seen = new Set<string>();
  const zipDetails = zipDetailsRaw
    .filter((z) => {
      if (seen.has(z.zip_code)) return false;
      seen.add(z.zip_code);
      return true;
    })
    .sort((a, b) => a.distance - b.distance);

  // Also create simple zipCodes array for copy functionality
  const zipCodes = zipDetails
    .map((z) => z.zip_code)
    .sort((a, b) => a.localeCompare(b));

  return {
    zipCodes,
    zipDetails,
    centerCoords,
    meta: {
      count: zipDetails.length,
      centerZip: zip.padStart(5, "0"),
      radius,
      units,
    },
  };
}
