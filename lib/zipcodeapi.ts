export interface ZipCodeResult {
  zip_code: string;
  distance: number;
  city: string;
  state: string;
}

export interface RadiusResponse {
  zip_codes: ZipCodeResult[];
}

export interface RadiusSearchResult {
  zipCodes: string[];
  meta: {
    count: number;
    centerZip: string;
    radius: number;
    units: string;
  };
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

  // Normalize ZIP codes: ensure 5-digit strings with leading zeros, dedupe, sort
  const zipCodes = data.zip_codes
    .map((z) => z.zip_code.padStart(5, "0"))
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort((a, b) => a.localeCompare(b));

  return {
    zipCodes,
    meta: {
      count: zipCodes.length,
      centerZip: zip.padStart(5, "0"),
      radius,
      units,
    },
  };
}
