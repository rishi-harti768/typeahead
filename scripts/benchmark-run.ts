import { app, db, cache } from "../src/server";

async function runBenchmark() {
  console.log("=== Starting Search Typeahead Benchmark ===");
  
  // Reset cache and stats before benchmark
  cache.clearAll();
  
  const totalPrefixes = ["i", "ip", "iph", "ipho", "iphon", "iphone", "iphone 1", "iphone 15"];
  const searchQueries = ["iphone 15", "iphone charger", "java tutorial", "javascript", "react", "typescript", "cab", "car", "cat", "dog"];

  const readLatencies: number[] = [];
  const writeLatencies: number[] = [];

  // Helper to make a request to the Elysia app in-memory
  async function makeRequest(path: string, method: string = "GET", body: any = null) {
    const url = `http://localhost${path}`;
    const options: RequestInit = { method };
    if (body) {
      options.headers = { "Content-Type": "application/json" };
      options.body = JSON.stringify(body);
    }
    
    const start = performance.now();
    const response = await app.handle(new Request(url, options));
    const duration = performance.now() - start;
    
    const bodyText = await response.text();
    return { duration, response, bodyText };
  }

  // --- PHASE 1: Cold Reads (Cache Misses) ---
  console.log("\nPhase 1: Cold reads (Prefix Suggestion Cache Misses)...");
  for (const prefix of totalPrefixes) {
    const { duration } = await makeRequest(`/suggest?q=${prefix}`);
    readLatencies.push(duration);
  }

  // --- PHASE 2: Repetitive Reads (Cache Hits) ---
  console.log("Phase 2: Warm reads (Prefix Suggestion Cache Hits)...");
  const warmReadsCount = 2000;
  for (let i = 0; i < warmReadsCount; i++) {
    const prefix = totalPrefixes[i % totalPrefixes.length];
    const { duration } = await makeRequest(`/suggest?q=${prefix}`);
    readLatencies.push(duration);
  }

  // --- PHASE 3: Write Path & Buffer / WAL Ingest ---
  console.log("Phase 3: High-pressure writes (Search submissions)...");
  const writeCount = 500;
  for (let i = 0; i < writeCount; i++) {
    const query = searchQueries[i % searchQueries.length];
    const { duration } = await makeRequest("/search", "POST", { query });
    writeLatencies.push(duration);
  }

  // --- PHASE 4: Fetch Metrics ---
  console.log("Phase 4: Gathering performance metrics...");
  const { bodyText } = await makeRequest("/metrics");
  const metrics = JSON.parse(bodyText);

  // Calculate local p50, p95 latencies
  readLatencies.sort((a, b) => a - b);
  writeLatencies.sort((a, b) => a - b);

  const getPercentile = (arr: number[], pct: number) => {
    const index = Math.floor((pct / 100) * arr.length);
    return arr[Math.max(0, Math.min(arr.length - 1, index))];
  };

  const p50Read = getPercentile(readLatencies, 50);
  const p95Read = getPercentile(readLatencies, 95);
  const avgRead = readLatencies.reduce((a, b) => a + b, 0) / readLatencies.length;

  const p50Write = getPercentile(writeLatencies, 50);
  const p95Write = getPercentile(writeLatencies, 95);
  const avgWrite = writeLatencies.reduce((a, b) => a + b, 0) / writeLatencies.length;

  console.log("\n=== BENCHMARK RESULTS ===");
  console.log("----------------------------------------");
  console.log("Read Path (GET /suggest) performance:");
  console.log(`  Total requests: ${readLatencies.length}`);
  console.log(`  Average Latency: ${avgRead.toFixed(3)} ms`);
  console.log(`  p50 (Median):    ${p50Read.toFixed(3)} ms`);
  console.log(`  p95:             ${p95Read.toFixed(3)} ms`);
  console.log(`  Cache Hits:      ${metrics.hits}`);
  console.log(`  Cache Misses:    ${metrics.misses}`);
  console.log(`  Cache Hit Rate:  ${(metrics.hitRate * 100).toFixed(2)}%`);
  console.log("----------------------------------------");
  console.log("Write Path (POST /search) performance:");
  console.log(`  Total writes:    ${writeLatencies.length}`);
  console.log(`  Average Latency: ${avgWrite.toFixed(3)} ms`);
  console.log(`  p50 (Median):    ${p50Write.toFixed(3)} ms`);
  console.log(`  p95:             ${p95Write.toFixed(3)} ms`);
  console.log("----------------------------------------");
  console.log("Storage & Write Buffering (WAL) statistics:");
  console.log(`  Total Submitted Searches: ${metrics.analytics.totalSearchesSubmitted}`);
  console.log(`  Database Flushes Triggered:  ${metrics.analytics.flushesCount}`);
  console.log(`  Disk Writes Saved (Ratio):  ${metrics.analytics.writeSavings} (${(metrics.analytics.writeSavings / metrics.analytics.totalSearchesSubmitted * 100).toFixed(2)}% reduction)`);
  console.log("----------------------------------------");
  console.log("========================================");
}

runBenchmark().catch(console.error);
