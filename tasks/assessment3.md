## Assessment 3

### Place in the unit

* Be group-based (4 students)
* Be hard to outsource
* Be hard to copy
* Not repeat Assessment 2
* Not rely on basic MySQL
* Cover post-Week-5 material
* Be realistic in 2 weeks
* Be structured for easier marking

Cover weeks 6–8 material:

* Streaming concepts
* Graph (Neo4j)
* System architecture
* Cost & scalability thinking

The final assessment tests:

> System design + streaming reasoning + graph modelling + architectural trade-offs

Not SQL mechanics.

---

# Final Assessment – 40%

## Group Data Architecture & Streaming System Design

### (30% Report + 10% Presentation)

---

# Scenario

You are hired by **StreamWave** (same company as Assessment 2).

The company now wants to:

1. Detect abnormal streaming and usage behaviour in near real-time.
(Spikes, bots, duplicate events, late data, burst activity)

2. Identify account-sharing and coordinated usage patterns across devices and regions.
(Graph-based cluster detection, device/IP connections)

3. Ensure streaming data reliability and correctness under disorder and duplication.
(Late events, idempotency, event-time handling)

4. Control warehouse cost while scaling to high event volumes.
(Streaming vs batch trade-offs, partitioning, lifecycle policies)

You must design a **modern data architecture** to support these goals.

You are not required to implement a full production system.

You must design and prototype selected components.

---

# What This Assessment Tests

* Streaming understanding
* Event-time thinking
* Graph modelling (Neo4j)
* System architecture
* Cost & scaling reasoning
* Trade-off evaluation
* Collaboration

It does NOT test:

* Basic SQL
* MySQL queries
* Star schema building again

---

# Part 1 – Streaming System Design (Required)

Design a streaming pipeline for:

* Real-time stream event ingestion
* Windowed metrics (e.g. 10-minute watch activity)
* Detection of abnormal spike behaviour

You must include:

* Event schema
* Event time vs processing time explanation
* Window type (tumbling / sliding)
* Late data handling strategy
* Idempotency strategy
* Storage layer (BigQuery streaming or alternative)

You are not required to deploy Kafka/Flink.
You must provide architecture + pseudo logic.

---

# Part 2 – Graph Use Case (Neo4j Prototype)

Model account sharing detection using Neo4j.

Example logic:

* Users connected via shared device IDs
* Users connected via shared IP
* Cross-region connections

You must:

* Design graph schema
* Load small sample dataset
* Run 3 Cypher queries:

  * Detect clusters of connected users
  * Identify high-risk nodes
  * Compute degree centrality

You must interpret results.

This cannot be copied easily because:

* Dataset must be group-generated
* Metrics differ per group

---

# Part 3 – Cost & Scaling Strategy

Analyse:

* BigQuery cost under:

  * Batch only
  * Streaming ingestion
* Partitioning strategy
* Storage lifecycle
* Hot vs cold data
* Trade-offs

Provide:

* Estimated cost comparison table
* Scaling strategy to 100M events/day

---

# Part 4 – Failure & Risk Analysis

Identify:

* 5 realistic failure modes:

  * Duplicate ingestion
  * Late events
  * Plan price inconsistency
  * Graph explosion
  * Cost runaway

For each:

* Explain detection strategy
* Explain mitigation

---

# Deliverables

---

## Report (Max 20 pages) – 30%

Must include:

1. System Architecture Diagram (mandatory visual)
2. Streaming design explanation
3. Graph schema & query results
4. Cost modelling section
5. Failure analysis section

No generic textbook explanations.

All diagrams must be original.

---

## Presentation (15 minutes) – 10%

All 4 members must present.

Must include:

* Architecture walkthrough
* One live Neo4j query demo
* One streaming window logic explanation
* Q&A defence

---

# AI use 

To ensure integrity of the submission:

1. Each group must:

   * Use group-specific seed for event simulation.
   * Generate unique abnormal scenario.
2. They must submit:

   * Neo4j export file
   * Event simulation dataset
   * Cost calculation sheet

If two groups submit similar architectures → flagged.

During presentation:

* Random member asked to explain one architectural decision.
* If unable → marks reduced.

---

# Marking Criteria (40%)

### Report – 30%

| Component                          | Marks |
| ---------------------------------- | ----- |
| Streaming architecture correctness | 8     |
| Event-time & window reasoning      | 5     |
| Graph modelling & queries          | 7     |
| Cost & scaling analysis            | 5     |
| Failure analysis depth             | 5     |

### Presentation – 10%

| Component            | Marks |
| -------------------- | ----- |
| Technical clarity    | 4     |
| Defence of decisions | 3     |
| Equal contribution   | 3     |

---

### Notes

The submission does not expect building full production systems.

Students are:

* Designing
* Prototyping small graph
* Simulating events
* Explaining architecture

Time estimate per group:

* 4–6 hours per student per week
* 30–40 total group hours

Challenging but achievable.

---

# What This Final Assessment Achieves

Assessment 2 tested:

> Batch data engineering implementation.

Final assessment tests:

> System-level architecture reasoning and real-time thinking.

No repetition.

No basic MySQL.

Modern.

---

If you want next:

* I can simplify further for a weaker cohort.
* Or produce a detailed student-facing brief.
* Or create a rubric tuned for faster marking.
