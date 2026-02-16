## Assessment 2 – 40% (Individual)

### Modern Data Engineering Project (MySQL → BigQuery)

### Scenario: StreamWave Digital Subscription Streaming Platform

### Project Overview (40%)

In this project, you will build a small end-to-end data engineering system for a digital streaming platform (StreamWave).

You will:

1. **Design a transactional database in MySQL**

   * Create normalized tables (users, plans, content, subscriptions, stream events)
   * Enforce primary keys, foreign keys, and at least one composite key
   * Generate your own dataset using your unique student seed

2. **Build a data warehouse in BigQuery**

   * Design a star schema (1 fact table + 3–4 dimensions)
   * Use surrogate keys
   * Partition and cluster the fact table

3. **Implement SCD Type 2**

   * Simulate subscription plan price changes
   * Maintain historical versions in a dimension table

4. **Implement incremental loading**

   * Perform a full load
   * Add new transactional data
   * Run incremental load without creating duplicates

5. **Run analytical queries**

   * Produce summary metrics (e.g., watch hours, top content, usage by tier/region)
   * Record query bytes processed

The project tests your ability to:

* Design relational and dimensional schemas
* Generate realistic, skewed data
* Transform OLTP data into an analytical warehouse
* Handle historical changes correctly
* Prevent duplicate data in pipelines
* Use BigQuery partitioning and clustering effectively

All outputs must depend on your unique dataset.


---

## 0) Overview

You will build a small end-to-end data system:

1. **Transactional OLTP database in MySQL** (local, MySQL Workbench).
2. **Analytical warehouse in BigQuery** (star schema).
3. **Incremental loading** (no duplicates).
4. **SCD Type 2** for subscription plan price changes.
5. **Partitioning + clustering** in BigQuery.
6. **Analytics queries** and record bytes processed.

This assessment is designed so each student produces **unique outputs**.

---

## 1) Unique Dataset Requirement (Anti-copy)

You must use:

**student_seed = last 5 digits of your student ID**

Your data generation must depend on your seed.
If two students submit identical metrics, both will be investigated.

---

## 2) Provided Fixed Schemas (Scaffolded)

You must use the table names and columns below **exactly**.
You may add extra columns, but you **must not** remove or rename the required ones.

### 2.1 MySQL OLTP schema (create in MySQL)

#### Table: `users`

* `user_id` INT PRIMARY KEY
* `signup_date` DATE NOT NULL
* `region` VARCHAR(20) NOT NULL  *(e.g., 'AU', 'NZ', 'SG', 'IN', 'UK')*

#### Table: `plans`

* `plan_id` INT PRIMARY KEY
* `plan_name` VARCHAR(30) NOT NULL  *(e.g., Basic/Standard/Premium)*
* `tier` VARCHAR(20) NOT NULL       *(e.g., Basic/Standard/Premium)*
* `current_price` DECIMAL(8,2) NOT NULL

#### Table: `content`

* `content_id` INT PRIMARY KEY
* `content_type` VARCHAR(10) NOT NULL *(Movie/Series)*
* `genre` VARCHAR(20) NOT NULL
* `release_year` INT NOT NULL

#### Table: `subscriptions`

* `user_id` INT NOT NULL
* `plan_id` INT NOT NULL
* `start_date` DATE NOT NULL
* `end_date` DATE NULL
* PRIMARY KEY (`user_id`, `start_date`)  ✅ **composite key required**
* FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`)
* FOREIGN KEY (`plan_id`) REFERENCES `plans`(`plan_id`)

#### Table: `stream_events`

* `event_id` BIGINT PRIMARY KEY
* `user_id` INT NOT NULL
* `content_id` INT NOT NULL
* `event_ts` DATETIME NOT NULL
* `watch_seconds` INT NOT NULL
* `device_type` VARCHAR(20) NOT NULL *(Mobile/Web/TV)*
* FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`)
* FOREIGN KEY (`content_id`) REFERENCES `content`(`content_id`)

✅ You must create **at least one non-PK index**, e.g.

* `INDEX idx_stream_ts (event_ts)` or
* `INDEX idx_user_ts (user_id, event_ts)`

---

### 2.2 BigQuery Warehouse schema (create in BigQuery)

You must create:

#### Dimension: `dim_user`

* `user_sk` INT64
* `user_id` INT64
* `region` STRING
* `signup_date` DATE

#### Dimension: `dim_content`

* `content_sk` INT64
* `content_id` INT64
* `content_type` STRING
* `genre` STRING
* `release_year` INT64

#### Dimension: `dim_date`

* `date_sk` INT64
* `date` DATE
* `year` INT64
* `month` INT64
* `day` INT64

#### Dimension (SCD2): `dim_plan_scd`

* `plan_sk` INT64
* `plan_id` INT64
* `plan_name` STRING
* `tier` STRING
* `price` NUMERIC
* `start_date` DATE
* `end_date` DATE
* `is_current` BOOL

#### Fact: `fact_streaming`

* `stream_sk` INT64
* `date_sk` INT64
* `user_sk` INT64
* `content_sk` INT64
* `plan_sk` INT64
* `watch_seconds` INT64
* `event_ts` TIMESTAMP

✅ **Partition** `fact_streaming` by `DATE(event_ts)`
✅ **Cluster** `fact_streaming` by `content_sk`

---

## 3) Reduced Data Volume Requirements (7-day version)

Your MySQL generator must produce at least:

* **3,000 users**
* **120 content items**
* **30,000 stream_events**
* **subscriptions**: at least one subscription per user (some may change plans)

Your BigQuery warehouse must contain at least:

* **60,000 rows in `fact_streaming`** (after full load)

### Required Skew (must be visible in your data)

* Some users stream a lot, some very little
* Some content is very popular (top 5 items dominate)

(You can implement skew by making probability depend on seed and a “popularity weight”.)

---

## 4) SCD Type 2 Requirement (dim_plan_scd)

Plans can change price over time.

### You must simulate a plan price change:

* Update the price for **at least 2 plans** in MySQL (based on your seed).
* Then rerun your load into BigQuery.

### SCD Type 2 rules:

When a plan price changes:

1. The old record in `dim_plan_scd` must be closed:

   * set `end_date` to change date
   * set `is_current = FALSE`
2. A new version must be inserted:

   * new `plan_sk`
   * `start_date` = change date
   * `end_date` = NULL
   * `is_current = TRUE`

---

## 5) Incremental Load (Idempotent)

You must run:

1. **Full load** (initial load).
2. Insert **5,000 new stream_events** into MySQL.
3. Run **incremental load** into BigQuery.
4. Run the **same incremental load again**.

✅ After step 4, **fact_streaming row count must not increase**.
(You must prevent duplicates.)

---

## 6) Analytics Queries (Simplified – no revenue)

Write and run **4** BigQuery queries:

1. **Total watch hours by month**
2. **Top 10 most watched content items**
3. **Average watch_seconds by tier (Basic/Standard/Premium)**
4. **Region comparison:** total watch hours by region and month

For each query, record **bytes processed**.

---

## 7) What You Submit (Auto-checkable)

Submit a ZIP containing:

1. `mysql_schema.sql`
2. `mysql_data_generation.sql`
3. `bq_ddl.sql`
4. `bq_full_load.sql`
5. `bq_incremental_load.sql`
6. `bq_queries.sql`
7. `metrics.json`

### Required `metrics.json` format

```json
{
  "student_seed": 12345,
  "mysql_counts": {
    "users": 3000,
    "content": 120,
    "stream_events": 30000,
    "subscriptions": 3000
  },
  "bq_counts": {
    "fact_initial": 60000,
    "fact_after_increment": 65000,
    "fact_after_rerun": 65000,
    "dim_plan_versions": 0
  },
  "query_bytes": {
    "q1": 12345678,
    "q2": 23456789,
    "q3": 34567890,
    "q4": 45678901
  }
}
```

Notes:

* `dim_plan_versions` must reflect total rows in `dim_plan_scd` (should increase after price changes).
* If JSON is missing or malformed → marking cannot be automated → marks will be capped.

---

## 8) Marking (40 marks)

| Component                                                      | Marks |
| -------------------------------------------------------------- | ----: |
| MySQL schema correctness (tables, PK/FK, composite key, index) |     8 |
| Data generation meets volume + skew + seed use                 |     6 |
| BigQuery star schema created correctly                         |     8 |
| SCD Type 2 works (price change creates new version)            |     8 |
| Incremental load + idempotency (no duplicates on rerun)        |     6 |
| Partitioning + clustering correctly applied                    |     2 |
| 4 analytics queries run + bytes recorded                       |     2 |

---

## 9) Academic Integrity

* You must use your own seed and generate your own dataset.
* You may use AI tools to help write code, but your outputs must match **your dataset**.
* Identical metrics between students will be flagged.

---

## 10) Expected Effort

Approximately **20–30 hours** depending on debugging skill.

---


