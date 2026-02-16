# data_engineering


Asssessment 2 expectations: 

Students must have already seen and practised:

* OLTP schema design
* Data generation logic
* Star schema
* Surrogate keys
* SCD Type 2
* Full load
* Incremental load
* Idempotency
* BigQuery partitioning & clustering
* Recording query cost


---

# ✅ 

# WEEK 1 — OLTP Foundations (MySQL)

### Topics

* Relational model (compressed)
* ER modeling (practical, minimal theory)
* 1NF–3NF (conceptual only)
* Primary vs composite keys
* Foreign keys & constraints
* OLTP vs OLAP comparison (important)
* Deterministic data generation using seed logic

### Lab

* Create 4–5 table OLTP schema
* Add composite key
* Add index
* Generate skewed synthetic data using seed
* Insert ≥10k rows

✅ Assessment 2: this supports:

* Part 1 (schema + data generation)

---

# WEEK 2 — SQL & Performance (MySQL)

### Topics

* JOINs
* Aggregations
* Window functions
* Indexing strategy
* EXPLAIN plan
* Transactions
* Idempotent updates concept

### Lab

* Performance comparison indexed vs non-indexed
* Write aggregation queries
* Simulate update scenarios

✅ For assessment 2 this supports:

* Schema correctness
* Data validation
* Analytical query skills
* Understanding idempotency concept (early exposure)

---

# WEEK 3 — Dimensional Modeling & SCD (BigQuery Intro)

### Topics

* Star schema fundamentals
* Fact vs dimension
* Surrogate keys
* Denormalization logic
* SCD Type 1 vs Type 2
* SCD Type 2 pattern (step-by-step logic)
* BigQuery basics (DDL + loading)

### Must Demo in Class

* Build dim_plan_scd live
* Show:

  * Close old record
  * Insert new version
  * is_current logic

### Lab

* Build simple star schema in BigQuery
* Load OLTP into BQ
* Implement SCD Type 2 example

✅ For assessment 2 this supports:

* Star schema
* SCD requirement
* Surrogate keys

Without this week being practical, they will fail the assignment.

---

# WEEK 4 — BigQuery Architecture & Optimization

### Topics

* BigQuery architecture overview
* Columnar storage
* Partitioning
* Clustering
* Query cost model
* Bytes processed
* Compute vs storage
* Cost control

### Lab

* Partition fact table
* Cluster by column
* Run two queries:

  * Without partition filter
  * With partition filter
* Compare bytes processed

✅ For assessment 2 this supports:

* Partition requirement
* Cost recording requirement
* Clustering requirement

---

# WEEK 5 — Pipelines & Incremental Logic (Critical Week)

This must be entirely assessment-aligned.

### Topics

* ETL vs ELT
* Full load vs incremental load
* High-watermark pattern
* Timestamp-based incremental load
* Idempotency (very important)
* Duplicate prevention
* Re-run safety
* Validation queries (row counts)

### Must Demo in Class

1. Full load
2. Insert new data
3. Incremental load
4. Rerun incremental load
5. Show row count unchanged

### Lab

* Implement incremental load
* Test rerun logic
* Validate row counts
* Record metrics

✅ For assessment 2 this supports:

* Incremental logic requirement
* Idempotency requirement
* metrics.json row count logic

---

## WEEK 6 — Streaming & Real-Time

* Event-time
* Windowing
* Streaming inserts
* Late data

## WEEK 7 — Neo4j

* Graph modeling
* Cypher
* Traversals
* Use case comparison

## WEEK 8 — Architecture & Presentations

* End-to-end design
* Trade-offs
* Cost & scalability
* Graph use case

---

# What Moves Earlier (Critical Adjustments)

| Topic                 | Old Week | New Week                   |
| --------------------- | -------- | -------------------------- |
| Star Schema Intro     | Week 3   | Week 1 (light intro)       |
| SCD Type 2            | Week 3   | Week 3 (deep practical)    |
| BigQuery Partitioning | Week 4   | Week 4                     |
| Incremental ELT       | Week 5   | Week 5 (full focus)        |
| Idempotency           | Week 5   | Week 2 intro + Week 5 deep |
| Cost comparison       | Week 4   | Week 4                     |

