# Search Typeahead System

[![Bun](https://img.shields.io/badge/Bun-v1.3.14-black.svg)](https://bun.sh) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/) [![Elysia](https://img.shields.io/badge/Elysia-Framework-red.svg)](https://elysiajs.com/) [![Tests](https://img.shields.io/badge/Tests-32%2F32%20Passed-green.svg)](tests/)

A production-ready, low-latency search typeahead (autocomplete) system designed for sub-millisecond read times and high-write resilience. Built using **Bun**, **TypeScript**, and the **Elysia** HTTP framework.

This project implements a complete backend data-system design to store query frequencies, serve suggestions with sub-millisecond latencies, partition caching nodes dynamically, calculate trending searches with decay, and batch writes to protect database durability.

---

## 🚀 Getting Started

Follow these steps to set up and run the system locally.

### Prerequisites
Ensure you have the [Bun runtime](https://bun.sh/) installed on your machine.
```bash
# Verify Bun installation
bun --version
```

### 1. Ingest & Seed the Dataset
The assignment requires a dataset of at least 100,000 queries with search frequencies. Seed the synthetic dataset by running:
```bash
bun run scripts/seed.ts
```
*This generates a 100,500+ query dictionary in `data/dataset.json` in less than a second.*

### 2. Run the Development Server
Start the Elysia backend application:
```bash
bun run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the search UI.

### 3. Run the Test Suite
The codebase is covered by an extensive suite of 32 unit and integration tests across 8 modules:
```bash
bun test
```

### 4. Run the Performance Benchmarks
Execute the in-memory load simulation benchmark to verify read and write path latency, cache hit rates, and database write reduction:
```bash
bun run scripts/benchmark-run.ts
```

---

## 🛠️ Architectural Highlights

The system separates high-throughput prefix reads from asynchronous, resilient database writes.

*   **In-Memory Trie**: Precomputes the `topCompletions` at every node to answer queries in $O(L)$ time (where $L$ is prefix length), achieving a **p95 read latency under 0.05 ms**.
*   **Distributed Cache Layer**: Employs **Consistent Hashing** with virtual nodes to balance prefix key routes dynamically over logical cache partitions.
*   **Write-Ahead Log (WAL) & Write Buffering**: Collects incoming search submissions in memory (**Write Buffering**) and logs them sequentially to disk (**WAL**). An automatic **Flush-and-Truncate** cycle flushes counts to the primary database in batches, **reducing database write pressure by over 99.8%**.
*   **Exponential Time Decay**: Tracks trending queries using 1-minute **Time-Binned Buckets**. Incorporates an exponential half-life scoring formula so short-term spikes decay naturally over time without requiring active cache evictions.

---

## 🖥️ User Interface Features

The application serves a complete web-based interface at `http://localhost:3000` containing:
1.  **Debounced Search Box**: Throttles prefix requests during typing to minimize backend server queries.
2.  **Suggestion Dropdown**: Lists the top-10 completions sorted by popularity count. Supports basic keyboard navigation (Up/Down arrow keys to select, Enter to search).
3.  **Search Submission Indicator**: Submits searches with Enter or a click, displaying a simulated "Searched" state and updating counts asynchronously.
4.  **Recency-Aware Trending Section**: Toggle between *Basic Ranking* (historical popularity) and *Recency-Aware Ranking* (exponentially decayed scoring) to see search spikes decay dynamically.
5.  **Operational Metrics Dashboard**: Real-time visualization of Cache Hit Rate, Average Latency, and Write Reduction metrics.

---

## 📂 Documentation Hub

Explore the workspace for deep architectural patterns, constraints, and test suites:

*   📘 **[PROJECT_REPORT.md](PROJECT_REPORT.md)**: Full System Architecture, sequence/flow diagrams, complete API references, empirical benchmarks, and in-depth design trade-offs.
*   📙 **[CONTEXT.md](CONTEXT.md)**: System-level domain models, design boundaries, and terminology.
*   📗 **[GLOSSARY.md](GLOSSARY.md)**: Project glossary containing canonical terms for Trie, Consistent Hashing, Write Buffering, WAL, and Exponential Decay.
*   📄 **[ASSIGNMENT.md](ASSIGNMENT.md)**: Original course specifications, functional constraints, and grading criteria.