## Assessment 3 — Final — 40%

## Group Data Architecture & Streaming System Design

**(30% Report + 10% Presentation)**

---

# Scenario (StreamWave)

You are hired by **StreamWave** (same company as Assessment 2). The company wants to:

1. **Detect unusual streaming and usage behaviour in near real-time**
2. **Identify account-sharing and coordinated usage across devices and regions**
3. **Ensure streaming data is reliable** (late events, duplicates, disorder)
4. **Control warehouse cost while scaling** to high event volumes

You must design a modern data architecture and prototype selected components.

You are **not** required to deploy Kafka/Flink or build a production system.

---

# What this assessment tests

* Streaming concepts and reasoning (event-time, windows, late data)
* System design thinking (architecture + trade-offs)
* Neo4j graph modelling and Cypher queries
* Cost awareness and scaling reasoning
* Team collaboration + defence in presentation

It does **not** test:

* Advanced distributed systems deployment
* Complex SQL mechanics
* Rebuilding a star schema again

---

# Integrity Requirements (Anti-copy)

Each group must submit **unique artefacts**:

1. **Group-specific seed** used to generate the simulated event dataset
2. **One abnormal scenario** (selected from the list below) embedded in the dataset
3. **Neo4j export** (or database dump / screenshot evidence)
4. **Event simulation dataset** (CSV)
5. **Cost calculation sheet** (spreadsheet)

If two groups submit very similar architectures / datasets → flagged.

During the presentation, any group member may be asked to explain:

* one architectural decision, or
* one Cypher query, or
* how the abnormal scenario was generated/detected.

---

# How to generate your dataset (Required)

## Step 1 — Compute your group seed (Required)

Use this deterministic rule:

**Seed = sum of the last 4 digits of each member’s student ID**

Example:

* 12345678 → 5678
* 99881234 → 1234
  Seed = 5678 + 1234 + …

Write your seed at the top of the report.

## Step 2 — Simulate events (Required)

Create a CSV called:
`events_group_<seed>.csv`

Minimum dataset size:

* **At least 50,000 events**
* Cover **at least 7 days** of timestamps

Your dataset must include:

* Normal behaviour (baseline)
* One abnormal scenario (from the list below)

### Required event fields (schema)

Your CSV must include these columns:

| Column        | Type     | Description                                       |
| ------------- | -------- | ------------------------------------------------- |
| event_id      | string   | unique ID for each event                          |
| user_id       | string   | user account                                      |
| device_id     | string   | device identifier                                 |
| ip_address    | string   | IP (or simplified IP block)                       |
| region        | string   | e.g., AU, US, EU                                  |
| event_time    | datetime | when event actually happened (event-time)         |
| ingest_time   | datetime | when event reached the pipeline (processing-time) |
| event_type    | string   | play, pause, stop, subscribe, cancel              |
| title_id      | string   | content ID (can be synthetic)                     |
| watch_seconds | int      | watch duration for play events                    |
| plan          | string   | basic / standard / premium                        |
| price         | float    | plan price (optional, can be fixed per plan)      |

**Important:** `event_time` and `ingest_time` must differ sometimes (to support late events).

---

# Part 1 — Streaming System Design (Required)

Design a streaming pipeline that:

* Ingests events continuously
* Produces **10-minute tumbling window** metrics
* Detects your abnormal scenario in near real-time

## You must include (in the report)

### A) Architecture diagram (mandatory)

At minimum, include these blocks:

* Producer (app / service)
* Ingestion (e.g., Pub/Sub or equivalent)
* Stream processor (logical component)
* Storage (BigQuery or equivalent)
* Neo4j (for account-sharing analysis)

You can use any cloud, but keep it conceptual and realistic.

### B) Event-time vs processing-time (Required explanation)

Explain in 3–6 sentences:

* Event-time = when the user action happened
* Processing-time = when the system received it
* Why late events exist (network, retries, mobile offline)
* Why windows should be based on event-time for correctness

### C) Windowing (Fixed)

Use **10-minute tumbling windows** only.

You must define:

* Window key(s): e.g., by user_id, by region, by title_id
* Output metric(s): e.g., total watch_seconds, number of play events

### D) Late data handling (Simplified)

Pick ONE strategy and justify briefly:

* **Allow lateness:** accept events up to X minutes late (e.g., 15 minutes), then finalize window
* **Drop late events:** anything later than X is ignored (cheap but less correct)
* **Send to “late-events” table:** keep them separately for audit/backfill

### E) Duplicate mitigation (Simplified)

Describe one simple approach:

* Deduplicate by `event_id` in the processor (keep a short-term cache / state store)
* Or deduplicate in storage using a unique key (conceptual)
* Explain why duplicates can happen (retries, at-least-once delivery)

### F) Pseudo-logic (Required)

Provide pseudo-steps like:

1. Read events from ingestion
2. Convert timestamps, use `event_time`
3. Assign event to 10-min tumbling window
4. Aggregate metrics
5. Apply anomaly rule for your chosen scenario
6. Write results to storage
7. Write suspicious entities to Neo4j (optional)

No real deployment code required.

---

# Part 2 — Graph Use Case (Neo4j Prototype) (Required)

Goal: detect possible account sharing across devices/regions.

## A) Graph schema (Required)

Use this simple schema:

* Nodes:

  * `(:User {user_id})`
  * `(:Device {device_id})`
  * `(:IP {ip})`
  * `(:Region {region})` (optional but recommended)

* Relationships:

  * `(User)-[:USES]->(Device)`
  * `(User)-[:FROM_IP]->(IP)`
  * `(User)-[:IN_REGION]->(Region)` (or store region as property on event edge)

## B) Load sample dataset (Required)

Use a smaller sample extracted from your CSV:

* minimum **2,000 events** (or 200 users, whichever comes first)

You can load via:

* Neo4j Browser + CSV import
* Neo4j Desktop import tools

## C) Required Cypher queries (3)

1. **Users sharing devices**

* Find devices used by more than 1 user

2. **High-risk users (high degree)**

* Users connected to many devices or IPs

3. **Connected clusters**

* Identify groups of users connected via shared device/IP

Provide screenshots or query outputs and interpret results (short paragraph each).

---

# Part 3 — Cost & Scaling Strategy (Required, simplified)

## A) Provide a simple comparison table

Include a table like:

| Item              | Batch-only approach                | Streaming approach      |
| ----------------- | ---------------------------------- | ----------------------- |
| Ingestion pattern | daily/hourly loads                 | continuous              |
| Likely cost       | lower ingestion costs              | higher ingestion costs  |
| Freshness         | delayed                            | near real-time          |
| Risk              | missing anomalies until next batch | early anomaly detection |

## B) Partitioning and lifecycle (Required)

* Partition by date (event_time)
* Keep “hot” data (e.g., last 30 days) in fast storage
* Move older data to cheaper storage or delete after retention period

## C) Scale to 100M events/day (Conceptual)

In 6–10 bullets explain:

* where bottlenecks happen (ingestion, processing, storage)
* how you would scale (more partitions, autoscaling processors, sampling, downsampling metrics, aggregation-first)

No exact pricing required.

---

# Part 4 — Failure & Risk Analysis (Reduced scope)

Identify **3** realistic failure modes (choose from below):

* Duplicate ingestion
* Late events
* Event spike / event storm
* Graph explosion (too many links)
* Cost runaway

For each:

* How to detect it (simple monitoring/metric)
* How to mitigate it (practical action)

---

# Abnormal Scenario Requirement (Choose 1 — Level 1 only)

You must choose **one** scenario below and embed it in your dataset.

For each scenario:

* **What it is**
* **How to inject it** (data generation hint)
* **How to detect it** (simple streaming rule)

---

## Scenario A — Sudden watch-time spike (Easy)

**What:** One user’s watch_seconds jumps 10× within 30 minutes.

**Inject (hint):**

* Pick one `user_id`
* For a chosen time range, increase watch_seconds to large values or increase play frequency

**Detect (hint):**

* In each 10-min window per user:

  * flag if `total_watch_seconds > threshold`
  * or if `total_watch_seconds > 5 × user_baseline_avg` (baseline from previous day)

---

## Scenario B — Multi-region login in short time (Easy–Medium)

**What:** Same account appears in two regions within 5 minutes.

**Inject (hint):**

* For the same `user_id`, create events with:

  * region = AU at time T
  * region = US at time T+2 minutes
* Use different ip_address to make it realistic

**Detect (hint):**

* Streaming rule per user:

  * if `count(distinct region) >= 2` within a 10-min window → flag
* Or detect “region change within X minutes” using last-seen state

---

## Scenario C — Device sharing burst (Easy–Medium)

**What:** Many users use the same device_id in a short period.

**Inject (hint):**

* Choose one `device_id`
* Generate events for 10–20 different users using that same device_id within 1 hour

**Detect (hint):**

* Windowed rule per device:

  * if `count(distinct user_id) > N` in 60 minutes → flag
* This also supports your Neo4j graph strongly

---

## Scenario D — Bot-like short sessions from same IP (Medium)

**What:** One IP generates many short “play” events across many users.

**Inject (hint):**

* Choose one `ip_address`
* Generate many play events with:

  * watch_seconds between 1 and 10 seconds
  * across many user_ids in a short time range

**Detect (hint):**

* Windowed rule per IP:

  * if `events_count > threshold` AND `avg_watch_seconds < small_threshold` → flag

---

## Required: late events + duplicates (lightweight)

Even if your main abnormal scenario is A–D, your dataset must include:

* some **late events**: set `ingest_time = event_time + random delay` (some delays > 10 minutes)
* some **duplicate events**: repeat the same `event_id` occasionally (e.g., 1–3% of rows)

These support reliability reasoning.

---

# Deliverables

## Report (Max 15 pages) — 30%

Must include:

1. Architecture diagram (original)
2. Streaming explanation (event-time, windows, late data, duplicates)
3. Abnormal scenario description + detection rule
4. Neo4j graph schema + 3 queries + interpretation
5. Cost/scaling section
6. Failure analysis (3 failure modes)

No generic textbook filler.

## Presentation (15 minutes) — 10%

All members present. Must include:

* Architecture walkthrough
* One live Neo4j query demo
* Explanation of abnormal scenario detection logic
* Q&A defence

---

# Marking Criteria (40%)

### Report — 30%

| Component                          | Marks |
| ---------------------------------- | ----: |
| Streaming architecture correctness |     8 |
| Event-time & window reasoning      |     5 |
| Graph modelling & queries          |     7 |
| Cost & scaling reasoning           |     5 |
| Failure analysis depth             |     5 |

### Presentation — 10%

| Component            | Marks |
| -------------------- | ----: |
| Technical clarity    |     4 |
| Defence of decisions |     3 |
| Equal contribution   |     3 |

---


