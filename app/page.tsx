"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";

interface SearchResult {
  zipCodes: string[];
  meta: {
    count: number;
    centerZip: string;
    radius: number;
    units: string;
  };
}

export default function Home() {
  const [zip, setZip] = useState("");
  const [radius, setRadius] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [copied, setCopied] = useState(false);

  const validateInputs = (): string | null => {
    const cleanZip = zip.trim();
    if (!/^\d{5}$/.test(cleanZip)) {
      return "Enter a valid 5-digit ZIP code.";
    }

    const radiusNum = parseFloat(radius);
    if (isNaN(radiusNum) || radiusNum <= 0) {
      return "Enter a radius greater than 0.";
    }

    if (radiusNum > 200) {
      return "Radius too large for this tool (max: 200 miles).";
    }

    return null;
  };

  const handleSearch = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/radius", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zip: zip.trim(),
          radius: parseFloat(radius),
          units: "mile",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Couldn't fetch ZIP codes. Try again.");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error calling ZIP service.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;

    const text = result.zipCodes.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Failed to copy to clipboard.");
    }
  };

  const handleClear = () => {
    setZip("");
    setRadius("");
    setError("");
    setResult(null);
    setCopied(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      <header className="hero">
        <div className="hero-content">
          <Image src="/logo.png" alt="Arachnid Works" width={160} height={53} />
          <h1>ZIP Radius Finder</h1>
          <p>Find ZIP codes within any radius</p>
        </div>
      </header>

      <main className="main">
        <div className="card">
          <form onSubmit={handleSearch}>
            <div className="form-section">
              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="zip">Center ZIP Code</label>
                  <input
                    id="zip"
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. 21701"
                    maxLength={5}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="radius">Radius</label>
                  <input
                    id="radius"
                    type="number"
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. 15"
                    min="1"
                    max="200"
                  />
                </div>
                <span className="units-label">miles</span>
              </div>
            </div>

            <div className="button-row">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading && <span className="loading" />}
                Search
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCopy}
                disabled={!result || loading}
              >
                Copy ZIP List
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleClear}
                disabled={loading}
              >
                Clear
              </button>
              {copied && <span className="success-toast">Copied</span>}
            </div>
          </form>

          {error && <div className="error-banner">{error}</div>}

          {result && (
            <div className="results-section">
              <div className="results-header">
                <span className="results-count">
                  {result.meta.count} ZIP codes found
                </span>
                <span className="results-meta">
                  Center: {result.meta.centerZip} &bull; Radius: {result.meta.radius}{" "}
                  {result.meta.units}s
                </span>
              </div>
              <textarea
                className="results-textarea"
                readOnly
                value={result.zipCodes.join("\n")}
              />
            </div>
          )}

          <div className="api-notice">
            <strong>API Limits (Free Tier):</strong> 10 requests/hour &bull; 240
            requests/day.
            <br />
            Limit resets hourly. If you hit the limit, wait and try again.
          </div>
        </div>
      </main>
    </>
  );
}
