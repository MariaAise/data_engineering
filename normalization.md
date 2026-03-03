## Database Normalization

**Schema:** `sales_raw` (single denormalized table)  
**Tasks:** 16 · **Covers:** 1NF · 2NF · 3NF · Anomalies · Full decomposition

---

## The Schema

`sales_raw` is a single flat table that stores everything about a sale in one row. It deliberately contains violations of 1NF, 2NF, and 3NF. Your job across these tasks is to diagnose each violation, understand why it causes problems, and decompose the table into a clean normalized schema.

```sql
CREATE DATABASE IF NOT EXISTS sales_norm;
USE sales_norm;

DROP TABLE IF EXISTS sales_raw;

CREATE TABLE sales_raw (
    sale_id          INT PRIMARY KEY,
    sale_date        DATE,
    year             INT,
    quarter          INT,
    quarter_label    VARCHAR(5),   -- e.g. 'Q1', 'Q2'
    month            INT,
    customer_id      INT,
    customer_segment VARCHAR(50),
    customer_region  VARCHAR(50),
    region_manager   VARCHAR(100),
    product_id       INT,
    product_name     VARCHAR(100),
    category         VARCHAR(50),
    product_tags     VARCHAR(200), -- e.g. 'portable,wireless,business'
    store_id         INT,
    city             VARCHAR(50),
    store_type       VARCHAR(50),
    store_state      VARCHAR(100),
    quantity         INT,
    revenue          DECIMAL(10,2)
);

INSERT INTO sales_raw VALUES
(1,  '2025-01-10', 2025, 1, 'Q1', 1, 1, 'Corporate',   'East',  'Alice Chen',  1, 'Laptop',  'Electronics', 'portable,high-performance,business',  1, 'Melbourne', 'Urban',    'Victoria',         1, 1500.00),
(2,  '2025-01-10', 2025, 1, 'Q1', 1, 2, 'Consumer',    'West',  'Bob Park',    6, 'Paper',   'Stationery',  'a4,recycled,bulk',                    2, 'Sydney',    'Urban',    'New South Wales',  3,  900.00),
(3,  '2025-01-25', 2025, 1, 'Q1', 1, 5, 'Consumer',    'East',  'Alice Chen',  2, 'Printer', 'Electronics', 'wireless,office,colour',               1, 'Melbourne', 'Urban',    'Victoria',         2, 1800.00),
(4,  '2025-01-25', 2025, 1, 'Q1', 1, 5, 'Consumer',    'East',  'Alice Chen',  3, 'Phone',   'Electronics', 'portable,wireless,touchscreen',        3, 'Melbourne', 'Suburban', 'Victoria',         1,  850.00),
(5,  '2025-02-05', 2025, 1, 'Q1', 2, 3, 'Home Office', 'North', 'Carol Singh', 4, 'Desk',    'Furniture',   'assembly-required,wood,office',        4, 'Brisbane',  'Suburban', 'Queensland',       2, 1200.00),
(6,  '2025-02-05', 2025, 1, 'Q1', 2, 4, 'Corporate',   'South', 'David Obi',   8, 'Jacket',  'Clothing',    'waterproof,unisex,outdoor',            1, 'Melbourne', 'Urban',    'Victoria',         3,  600.00),
(7,  '2025-02-20', 2025, 1, 'Q1', 2, 6, 'Home Office', 'West',  'Bob Park',    1, 'Laptop',  'Electronics', 'portable,high-performance,business',   2, 'Sydney',    'Urban',    'New South Wales',  1, 1600.00),
(8,  '2025-02-20', 2025, 1, 'Q1', 2, 7, 'Corporate',   'North', 'Carol Singh', 5, 'Chair',   'Furniture',   'ergonomic,adjustable,office',          3, 'Melbourne', 'Suburban', 'Victoria',         4,  400.00),
(9,  '2025-03-08', 2025, 1, 'Q1', 3, 1, 'Corporate',   'East',  'Alice Chen',  2, 'Printer', 'Electronics', 'wireless,office,colour',               1, 'Melbourne', 'Urban',    'Victoria',         2, 1000.00),
(10, '2025-03-08', 2025, 1, 'Q1', 3, 8, 'Consumer',    'South', 'David Obi',   9, 'Pants',   'Clothing',    'casual,cotton,unisex',                 5, 'Adelaide',  'Rural',    'South Australia',  1,  200.00),
(11, '2025-03-22', 2025, 1, 'Q1', 3, 2, 'Consumer',    'West',  'Bob Park',    7, 'Pen',     'Stationery',  'ballpoint,bulk,blue',                  2, 'Sydney',    'Urban',    'New South Wales',  5,  250.00),
(12, '2025-03-22', 2025, 1, 'Q1', 3, 3, 'Home Office', 'North', 'Carol Singh', 3, 'Phone',   'Electronics', 'portable,wireless,touchscreen',        4, 'Brisbane',  'Suburban', 'Queensland',       2,  700.00),
(13, '2025-04-03', 2025, 2, 'Q2', 4, 4, 'Corporate',   'South', 'David Obi',   1, 'Laptop',  'Electronics', 'portable,high-performance,business',   1, 'Melbourne', 'Urban',    'Victoria',         1, 2200.00),
(14, '2025-04-03', 2025, 2, 'Q2', 4, 5, 'Consumer',    'East',  'Alice Chen',  6, 'Paper',   'Stationery',  'a4,recycled,bulk',                    3, 'Melbourne', 'Suburban', 'Victoria',         3,  300.00),
(15, '2025-04-18', 2025, 2, 'Q2', 4, 6, 'Home Office', 'West',  'Bob Park',    4, 'Desk',    'Furniture',   'assembly-required,wood,office',        4, 'Brisbane',  'Suburban', 'Queensland',       1, 1100.00),
(16, '2025-04-18', 2025, 2, 'Q2', 4, 7, 'Corporate',   'North', 'Carol Singh', 8, 'Jacket',  'Clothing',    'waterproof,unisex,outdoor',            2, 'Sydney',    'Urban',    'New South Wales',  2,  480.00),
(17, '2025-05-07', 2025, 2, 'Q2', 5, 1, 'Corporate',   'East',  'Alice Chen',  5, 'Chair',   'Furniture',   'ergonomic,adjustable,office',          1, 'Melbourne', 'Urban',    'Victoria',         3,  750.00),
(18, '2025-05-07', 2025, 2, 'Q2', 5, 8, 'Consumer',    'South', 'David Obi',   1, 'Laptop',  'Electronics', 'portable,high-performance,business',   5, 'Adelaide',  'Rural',    'South Australia',  1, 1450.00),
(19, '2025-05-29', 2025, 2, 'Q2', 5, 2, 'Consumer',    'West',  'Bob Park',    2, 'Printer', 'Electronics', 'wireless,office,colour',               2, 'Sydney',    'Urban',    'New South Wales',  2,  960.00),
(20, '2025-05-29', 2025, 2, 'Q2', 5, 4, 'Corporate',   'South', 'David Obi',   9, 'Pants',   'Clothing',    'casual,cotton,unisex',                 3, 'Melbourne', 'Suburban', 'Victoria',         1,  180.00),
(21, '2025-07-04', 2025, 3, 'Q3', 7, 3, 'Home Office', 'North', 'Carol Singh', 7, 'Pen',     'Stationery',  'ballpoint,bulk,blue',                  4, 'Brisbane',  'Suburban', 'Queensland',       4,  200.00),
(22, '2025-07-19', 2025, 3, 'Q3', 7, 6, 'Home Office', 'West',  'Bob Park',    4, 'Desk',    'Furniture',   'assembly-required,wood,office',        2, 'Sydney',    'Urban',    'New South Wales',  2, 1300.00);
```

---

## Violations Map

Before you start the tasks, here is a complete map of what is wrong and where:

| Column(s) | Violation | Normal Form Broken | Why |
|---|---|---|---|
| `product_tags` | Non-atomic value — multiple tags in one cell | **1NF** | Can't filter by single tag without string hacks |
| `product_name`, `category` | Depend on `product_id`, not `sale_id` | **2NF** | Repeated across every sale of the same product |
| `customer_segment`, `customer_region` | Depend on `customer_id`, not `sale_id` | **2NF** | Repeated across every sale by the same customer |
| `city`, `store_type`, `store_state` | Depend on `store_id`, not `sale_id` | **2NF** | Repeated across every sale at the same store |
| `region_manager` | Depends on `customer_region`, not `customer_id` | **3NF** | Transitive: `sale_id → customer_id → region → manager` |
| `store_state` | Depends on `city`, not `store_id` | **3NF** | Transitive: `sale_id → store_id → city → state` |
| `quarter_label` | Depends on `quarter`, not `sale_id` | **3NF** | Transitive: `sale_id → quarter → quarter_label` |

---

## Block 1 — Diagnosis (Tasks 1–3)

*Read the data, count the violations, understand the scale of the problem before writing any DDL.*

---

### Task 1.1
**How many rows and columns does `sales_raw` contain? List every column name and classify each as a fact about the sale, a fact about the product, a fact about the customer, a fact about the store, or a fact about the date.**

```sql
-- Step 1: count rows
SELECT COUNT(*) AS total_rows
FROM sales_raw;

-- Step 2: inspect columns via DESCRIBE
DESCRIBE sales_raw;
```

**Expected output — row count:**

| total_rows |
|------------|
| 22         |

**Column classification:**

| Column | Belongs to |
|---|---|
| `sale_id`, `quantity`, `revenue` | Sale fact |
| `sale_date`, `year`, `quarter`, `quarter_label`, `month` | Date fact |
| `customer_id`, `customer_segment`, `customer_region`, `region_manager` | Customer / region fact |
| `product_id`, `product_name`, `category`, `product_tags` | Product fact |
| `store_id`, `city`, `store_type`, `store_state` | Store fact |

> **Why this matters.** A well-normalized table should contain facts about exactly one thing. A sales row should contain only sale facts plus foreign keys pointing to everything else.

---

### Task 1.2
**Find the `product_tags` column. Show the distinct `(product_id, product_name, product_tags)` combinations. How many values are packed into a single cell for each product?**

```sql
SELECT DISTINCT
    product_id,
    product_name,
    product_tags,
    LENGTH(product_tags) - LENGTH(REPLACE(product_tags, ',', '')) + 1 AS tag_count
FROM   sales_raw
ORDER BY product_id;
```

**Expected output:**

| product_id | product_name | product_tags | tag_count |
|---|---|---|---|
| 1 | Laptop  | portable,high-performance,business | 3 |
| 2 | Printer | wireless,office,colour | 3 |
| 3 | Phone   | portable,wireless,touchscreen | 3 |
| 4 | Desk    | assembly-required,wood,office | 3 |
| 5 | Chair   | ergonomic,adjustable,office | 3 |
| 6 | Paper   | a4,recycled,bulk | 3 |
| 7 | Pen     | ballpoint,bulk,blue | 3 |
| 8 | Jacket  | waterproof,unisex,outdoor | 3 |
| 9 | Pants   | casual,cotton,unisex | 3 |

> **1NF violation.** Each cell in `product_tags` contains multiple values. You cannot write `WHERE product_tags = 'wireless'` to find wireless products — you would need `LIKE '%wireless%'`, which is slow, fragile, and will match unintended substrings.

---

### Task 1.3
**Quantify the redundancy. For each repeating non-key value, count how many rows it appears in. Show `region_manager`, `quarter_label`, `city`, and `product_name` repetition counts.**

```sql
SELECT 'region_manager' AS column_name, region_manager AS value, COUNT(*) AS row_count
FROM   sales_raw GROUP BY region_manager
UNION ALL
SELECT 'quarter_label',  quarter_label,  COUNT(*) FROM sales_raw GROUP BY quarter_label
UNION ALL
SELECT 'city',           city,           COUNT(*) FROM sales_raw GROUP BY city
UNION ALL
SELECT 'product_name',   product_name,   COUNT(*) FROM sales_raw GROUP BY product_name
ORDER BY column_name, row_count DESC;
```

**Expected output:**

| column_name | value | row_count |
|---|---|---|
| city | Melbourne | 10 |
| city | Sydney | 6 |
| city | Brisbane | 4 |
| city | Adelaide | 2 |
| product_name | Laptop | 4 |
| product_name | Printer | 3 |
| product_name | Desk | 3 |
| product_name | Phone | 2 |
| product_name | Chair | 2 |
| product_name | Paper | 2 |
| product_name | Jacket | 2 |
| product_name | Pen | 2 |
| product_name | Pants | 2 |
| quarter_label | Q1 | 12 |
| quarter_label | Q2 | 8 |
| quarter_label | Q3 | 2 |
| region_manager | Alice Chen | 6 |
| region_manager | Bob Park | 6 |
| region_manager | Carol Singh | 5 |
| region_manager | David Obi | 5 |

> **The cost of redundancy.** `Alice Chen` is written into 6 rows. If she changes her name, 6 `UPDATE` statements are needed and missing any one creates an inconsistency. `Melbourne` is stored 10 times — if the city is renamed or reassigned to a different state, every one of those rows needs updating.

---

## Block 2 — First Normal Form (Tasks 4–6)

*1NF requires that every column contains atomic (indivisible) values and that there are no repeating groups. Fix `product_tags`.*

---

### Task 2.1
**List every sale that involves a product tagged `'wireless'`. Use the current `sales_raw` table. Explain why this query is fragile.**

```sql
SELECT
    sale_id,
    sale_date,
    product_name,
    product_tags,
    revenue
FROM   sales_raw
WHERE  product_tags LIKE '%wireless%'
ORDER BY sale_id;
```

**Expected output:**

| sale_id | sale_date | product_name | product_tags | revenue |
|---|---|---|---|---|
| 3  | 2025-01-25 | Printer | wireless,office,colour | 1800.00 |
| 4  | 2025-01-25 | Phone   | portable,wireless,touchscreen | 850.00 |
| 7  | 2025-02-20 | Printer | wireless,office,colour | 1600.00 |
| 11 | 2025-03-22 | Printer | wireless,office,colour | 250.00 |  
| 12 | 2025-03-22 | Phone   | portable,wireless,touchscreen | 700.00 |
| 16 | 2025-04-18 | Printer | wireless,office,colour | 480.00 |
| 19 | 2025-05-29 | Printer | wireless,office,colour | 960.00 |

> **Why it is fragile.** `LIKE '%wireless%'` would also match a hypothetical tag called `'semi-wireless'` or `'non-wireless'`. The query cannot use an index on `product_tags`, so it performs a full table scan. Sorting or grouping by individual tags is impossible without a function.

---

### Task 2.2
**Design the fix. Write the DDL to create a `product_tags` junction table that satisfies 1NF, then populate it from `sales_raw` using only the distinct `(product_id, tag)` pairs.**

```sql
-- Create the junction table
CREATE TABLE IF NOT EXISTS product_tags (
    product_id  INT          NOT NULL,
    tag         VARCHAR(100) NOT NULL,
    PRIMARY KEY (product_id, tag)
);

-- Populate using string splitting
-- Each product has exactly 3 comma-separated tags in this dataset.
-- We extract positions 1, 2, 3 using SUBSTRING_INDEX.
INSERT INTO product_tags (product_id, tag)
SELECT DISTINCT
    product_id,
    TRIM(SUBSTRING_INDEX(product_tags, ',', 1))  AS tag
FROM   sales_raw
UNION
SELECT DISTINCT
    product_id,
    TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(product_tags, ',', 2), ',', -1))
FROM   sales_raw
UNION
SELECT DISTINCT
    product_id,
    TRIM(SUBSTRING_INDEX(product_tags, ',', -1))
FROM   sales_raw
ORDER BY product_id, tag;
```

**Expected output — `SELECT * FROM product_tags ORDER BY product_id, tag`:**

| product_id | tag |
|---|---|
| 1 | business |
| 1 | high-performance |
| 1 | portable |
| 2 | colour |
| 2 | office |
| 2 | wireless |
| 3 | portable |
| 3 | touchscreen |
| 3 | wireless |
| 4 | assembly-required |
| 4 | office |
| 4 | wood |
| 5 | adjustable |
| 5 | ergonomic |
| 5 | office |
| 6 | a4 |
| 6 | bulk |
| 6 | recycled |
| 7 | ballpoint |
| 7 | blue |
| 7 | bulk |
| 8 | outdoor |
| 8 | unisex |
| 8 | waterproof |
| 9 | casual |
| 9 | cotton |
| 9 | unisex |

> **27 rows total** — 9 products × 3 tags each. The composite primary key `(product_id, tag)` enforces uniqueness and prevents duplicate tag assignments.

---

### Task 2.3
**Using the new `product_tags` table, rewrite the wireless-product query from Task 2.1. Confirm the same 7 sales are returned, and show why the normalized version is more reliable.**

```sql
SELECT
    sr.sale_id,
    sr.sale_date,
    sr.product_name,
    pt.tag,
    sr.revenue
FROM   sales_raw    sr
JOIN   product_tags pt ON sr.product_id = pt.product_id
WHERE  pt.tag = 'wireless'
ORDER BY sr.sale_id;
```

**Expected output:**

| sale_id | sale_date | product_name | tag | revenue |
|---|---|---|---|---|
| 3  | 2025-01-25 | Printer | wireless | 1800.00 |
| 4  | 2025-01-25 | Phone   | wireless | 850.00  |
| 7  | 2025-02-20 | Printer | wireless | 1600.00 |
| 11 | 2025-03-22 | Printer | wireless | 250.00  |
| 12 | 2025-03-22 | Phone   | wireless | 700.00  |
| 16 | 2025-04-18 | Printer | wireless | 480.00  |
| 19 | 2025-05-29 | Printer | wireless | 960.00  |

> **Same 7 rows, cleaner query.** `WHERE pt.tag = 'wireless'` is an exact equality match on an indexed column. No string scanning, no false matches, no ambiguity. You can also now easily query *how many tags each product has*, *which products share a tag*, or *add a new tag* by inserting one row.

---

## Block 3 — Second Normal Form (Tasks 7–9)

*2NF applies to tables with a composite primary key. It requires that every non-key column depends on the **whole** primary key, not just part of it. In `sales_raw` the PK is `sale_id` alone — but `product_name`, `category`, `city`, `store_type`, `customer_segment`, and `customer_region` all depend on a different column entirely, not on `sale_id`. This is the same logical problem: non-key columns that are facts about something other than a sale.*

---

### Task 3.1
**Demonstrate the partial dependency for products. Show that `product_name` and `category` have the same value every time the same `product_id` appears — meaning they are facts about the product, not about the sale.**

```sql
SELECT
    product_id,
    product_name,
    category,
    COUNT(*)        AS times_repeated,
    COUNT(DISTINCT product_name) AS distinct_names,
    COUNT(DISTINCT category)     AS distinct_categories
FROM   sales_raw
GROUP BY product_id, product_name, category
ORDER BY product_id;
```

**Expected output:**

| product_id | product_name | category | times_repeated | distinct_names | distinct_categories |
|---|---|---|---|---|---|
| 1 | Laptop  | Electronics | 4 | 1 | 1 |
| 2 | Printer | Electronics | 3 | 1 | 1 |
| 3 | Phone   | Electronics | 2 | 1 | 1 |
| 4 | Desk    | Furniture   | 3 | 1 | 1 |
| 5 | Chair   | Furniture   | 2 | 1 | 1 |
| 6 | Paper   | Stationery  | 2 | 1 | 1 |
| 7 | Pen     | Stationery  | 2 | 1 | 1 |
| 8 | Jacket  | Clothing    | 2 | 1 | 1 |
| 9 | Pants   | Clothing    | 2 | 1 | 1 |

> **`distinct_names = 1` and `distinct_categories = 1` for every product** confirms that these columns never vary once `product_id` is fixed. They are product facts stored redundantly in the sales table.

---

### Task 3.2
**Extract the `products` table. Write DDL to create it and populate it with the distinct values from `sales_raw`. Then verify that dropping `product_name` and `category` from `sales_raw` loses no information, because those facts are now in `products`.**

```sql
-- Create normalized products table
CREATE TABLE IF NOT EXISTS products (
    product_id   INT          PRIMARY KEY,
    category     VARCHAR(50)  NOT NULL,
    product_name VARCHAR(100) NOT NULL
);

-- Populate from sales_raw
INSERT INTO products (product_id, category, product_name)
SELECT DISTINCT product_id, category, product_name
FROM   sales_raw
ORDER BY product_id;

-- Verify: join back to confirm no information lost
SELECT
    sr.sale_id,
    sr.product_id,
    p.product_name,
    p.category,
    sr.revenue
FROM   sales_raw sr
JOIN   products  p ON sr.product_id = p.product_id
ORDER BY sr.sale_id
LIMIT 5;
```

**Expected output — `SELECT * FROM products`:**

| product_id | category | product_name |
|---|---|---|
| 1 | Electronics | Laptop |
| 2 | Electronics | Printer |
| 3 | Electronics | Phone |
| 4 | Furniture | Desk |
| 5 | Furniture | Chair |
| 6 | Stationery | Paper |
| 7 | Stationery | Pen |
| 8 | Clothing | Jacket |
| 9 | Clothing | Pants |

**Join verification (first 5 rows):**

| sale_id | product_id | product_name | category | revenue |
|---|---|---|---|---|
| 1 | 1 | Laptop  | Electronics | 1500.00 |
| 2 | 6 | Paper   | Stationery  | 900.00  |
| 3 | 2 | Printer | Electronics | 1800.00 |
| 4 | 3 | Phone   | Electronics | 850.00  |
| 5 | 4 | Desk    | Furniture   | 1200.00 |

---

### Task 3.3
**Repeat the process for stores. Demonstrate that `city`, `store_type`, and `store_state` depend on `store_id`, then extract a `stores` table.**

```sql
-- Show the partial dependency
SELECT
    store_id,
    city,
    store_type,
    store_state,
    COUNT(*) AS times_repeated
FROM   sales_raw
GROUP BY store_id, city, store_type, store_state
ORDER BY store_id;

-- Create and populate
CREATE TABLE IF NOT EXISTS stores (
    store_id   INT          PRIMARY KEY,
    city       VARCHAR(50)  NOT NULL,
    store_type VARCHAR(50)  NOT NULL,
    store_state VARCHAR(100) NOT NULL
);

INSERT INTO stores (store_id, city, store_type, store_state)
SELECT DISTINCT store_id, city, store_type, store_state
FROM   sales_raw
ORDER BY store_id;
```

**Expected output — partial dependency proof:**

| store_id | city | store_type | store_state | times_repeated |
|---|---|---|---|---|
| 1 | Melbourne | Urban    | Victoria        | 6 |
| 2 | Sydney    | Urban    | New South Wales | 6 |
| 3 | Melbourne | Suburban | Victoria        | 4 |
| 4 | Brisbane  | Suburban | Queensland      | 4 |
| 5 | Adelaide  | Rural    | South Australia | 2 |

> **Every store_id maps to exactly one city, store_type, and store_state.** Melbourne Urban Victoria is written 6 times in `sales_raw` when it only needs to exist once in a `stores` table.

---

## Block 4 — Third Normal Form (Tasks 10–12)

*3NF requires that no non-key column depends on another non-key column. Even after fixing 2NF, `sales_raw` still has columns that depend on other non-key columns rather than directly on `sale_id` — transitive dependencies.*

---

### Task 4.1
**Prove the transitive dependency for `region_manager`. Show that `region_manager` is entirely determined by `customer_region`, not by `customer_id` or `sale_id`.**

```sql
SELECT DISTINCT
    customer_region,
    region_manager,
    COUNT(DISTINCT customer_id) AS customers_in_region,
    COUNT(*)                    AS sales_rows
FROM   sales_raw
GROUP BY customer_region, region_manager
ORDER BY customer_region;
```

**Expected output:**

| customer_region | region_manager | customers_in_region | sales_rows |
|---|---|---|---|
| East  | Alice Chen  | 2 | 6 |
| North | Carol Singh | 2 | 5 |
| South | David Obi   | 2 | 5 |
| West  | Bob Park    | 2 | 6 |

> **Each region has exactly one manager**, and that manager is the same regardless of which customer or sale is involved. The dependency chain is `sale_id → customer_id → customer_region → region_manager`. Because `region_manager` does not depend directly on `sale_id` or even `customer_id`, it is a transitive dependency and violates 3NF.

---

### Task 4.2
**Fix the transitive dependency by extracting a `regions` table. Then show the update anomaly that this fix prevents: demonstrate how many rows would need changing if `Alice Chen` changed her name.**

```sql
-- Without normalization: how many rows need updating?
SELECT COUNT(*) AS rows_to_update
FROM   sales_raw
WHERE  region_manager = 'Alice Chen';

-- Create the regions lookup table
CREATE TABLE IF NOT EXISTS regions (
    region         VARCHAR(50)  PRIMARY KEY,
    region_manager VARCHAR(100) NOT NULL
);

INSERT INTO regions (region, region_manager)
SELECT DISTINCT customer_region, region_manager
FROM   sales_raw
ORDER BY customer_region;
```

**Rows at risk without normalization:**

| rows_to_update |
|---|
| 6 |

**Expected output — `SELECT * FROM regions`:**

| region | region_manager |
|---|---|
| East  | Alice Chen  |
| North | Carol Singh |
| South | David Obi   |
| West  | Bob Park    |

> **After normalization**, a name change requires updating exactly **1 row** in `regions`. Before normalization, it required updating 6 rows in `sales_raw`, and missing any one would leave the data in an inconsistent state where the same region shows two different managers.

---

### Task 4.3
**Identify and fix the second 3NF violation: `store_state` depends on `city`, not on `store_id`. Prove the transitive chain and show the DDL fix using a `city_states` lookup.**

```sql
-- Prove: city → store_state (not store_id → store_state directly)
SELECT DISTINCT
    city,
    store_state,
    COUNT(DISTINCT store_id) AS stores_in_city
FROM   sales_raw
GROUP BY city, store_state
ORDER BY city;

-- Fix: extract city → state mapping
CREATE TABLE IF NOT EXISTS city_states (
    city        VARCHAR(50)  PRIMARY KEY,
    store_state VARCHAR(100) NOT NULL
);

INSERT INTO city_states (city, store_state)
SELECT DISTINCT city, store_state
FROM   sales_raw
ORDER BY city;
```

**Expected output — city → state proof:**

| city | store_state | stores_in_city |
|---|---|---|
| Adelaide  | South Australia | 1 |
| Brisbane  | Queensland      | 1 |
| Melbourne | Victoria        | 2 |
| Sydney    | New South Wales | 1 |

> **Melbourne has 2 stores** (Urban store_id=1 and Suburban store_id=3), yet both map to the same state. `store_state` is a fact about the city, not the store — the transitive chain is `store_id → city → store_state`.

**Expected output — `SELECT * FROM city_states`:**

| city | store_state |
|---|---|
| Adelaide  | South Australia |
| Brisbane  | Queensland |
| Melbourne | Victoria |
| Sydney    | New South Wales |

---

## Block 5 — Anomalies (Tasks 13–14)

*Anomalies are the practical consequences of normalization violations. There are three kinds: update anomalies, insertion anomalies, and deletion anomalies. These tasks demonstrate each one concretely.*

---

### Task 5.1
**Demonstrate all three anomaly types using `sales_raw`.**

**Update anomaly** — change Brisbane's store_type from `Suburban` to `Metro`. How many rows need updating, and what happens if the update is partial?

```sql
-- How many rows are affected?
SELECT COUNT(*) AS rows_affected
FROM   sales_raw
WHERE  city = 'Brisbane';

-- Partial update (deliberately only updating 3 of 4 rows — simulating a mistake)
UPDATE sales_raw
SET    store_type = 'Metro'
WHERE  city = 'Brisbane'
LIMIT  3;  -- intentionally partial

-- Now Brisbane is inconsistent — 3 rows say Metro, 1 still says Suburban
SELECT sale_id, city, store_type
FROM   sales_raw
WHERE  city = 'Brisbane'
ORDER BY sale_id;

-- Repair it
UPDATE sales_raw SET store_type = 'Suburban' WHERE city = 'Brisbane';
```

**After partial update — inconsistent state:**

| sale_id | city | store_type |
|---|---|---|
| 5  | Brisbane | Metro    |
| 12 | Brisbane | Metro    |
| 15 | Brisbane | Metro    |
| 21 | Brisbane | Suburban |

**Insertion anomaly** — can you add a new store (store_id = 6, Perth, Urban, Western Australia) to the system before it has made any sales?

```sql
-- In sales_raw, store facts only exist inside sale rows.
-- You cannot INSERT a store without also having a sale.
-- This INSERT will fail because store_id 6 has no matching sales context.
-- The only way to record Perth is to invent a fake sale row:
INSERT INTO sales_raw (sale_id, sale_date, year, quarter, quarter_label, month,
    customer_id, customer_segment, customer_region, region_manager,
    product_id, product_name, category, product_tags,
    store_id, city, store_type, store_state, quantity, revenue)
VALUES (99, NULL, NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    6, 'Perth', 'Urban', 'Western Australia', 0, 0.00);
-- This pollutes the sales table with a fake row just to store a store.
```

**Deletion anomaly** — what happens if we delete sale_id = 10 (Adelaide's only sale)?

```sql
-- Adelaide only appears in sale 10 and sale 18
SELECT sale_id, city, store_type, store_state, revenue
FROM   sales_raw
WHERE  city = 'Adelaide';

-- If we delete sale 10, Adelaide still exists via sale 18.
-- But: what if we deleted ALL Adelaide sales?
-- The entire fact that Adelaide is a Rural store in South Australia disappears.
DELETE FROM sales_raw WHERE city = 'Adelaide';  -- DO NOT RUN — demonstration only
-- After this, there is no record that store_id 5 in Adelaide ever existed.
```

> **All three anomalies stem from the same root cause**: facts about stores, products, customers, and regions are not stored in their own tables. They exist only as attributes of a sale, so they can only be inserted, updated, or deleted as part of a sale.

---

### Task 5.2
**The double-counting trap. Join `sales_raw` to `product_tags` and try to calculate total revenue per region. Show why the result is wrong, explain the cause, and fix it.**

```sql
-- WRONG: joining to product_tags inflates revenue
SELECT
    sr.customer_region,
    SUM(sr.revenue) AS wrong_revenue
FROM   sales_raw    sr
JOIN   product_tags pt ON sr.product_id = pt.product_id
GROUP BY sr.customer_region
ORDER BY sr.customer_region;

-- CORRECT: aggregate sales_raw first, then join
SELECT
    customer_region,
    SUM(revenue) AS correct_revenue
FROM   sales_raw
GROUP BY customer_region
ORDER BY customer_region;
```

**Wrong output (revenue tripled because each sale joins to 3 tag rows):**

| customer_region | wrong_revenue |
|---|---|
| East  | 18600.00 |
| North |  8940.00 |
| South | 13890.00 |
| West  | 18330.00 |

**Correct output:**

| customer_region | correct_revenue |
|---|---|
| East  | 6200.00 |
| North | 2980.00 |
| South | 4630.00 |
| West  | 6110.00 |

> **Each sale joins to 3 product_tag rows**, so its revenue is summed 3 times. Wrong total: 59,760. Correct total: 19,920. The ratio is exactly 3×. This is a classic fan-out problem — joining a fact table to a many-row child table before aggregating always inflates results.

---

## Block 6 — Full Decomposition (Tasks 15–16)

*Build the complete normalized schema and verify that no data is lost in the process.*

---

### Task 6.1
**Write the complete DDL to create the fully normalized schema. Create all tables with proper primary keys and foreign keys, then populate each table from `sales_raw`.**

```sql
-- ── 1. Regions (fixes 3NF: region_manager) ───────────────
CREATE TABLE regions (
    region         VARCHAR(50)  PRIMARY KEY,
    region_manager VARCHAR(100) NOT NULL
);
INSERT INTO regions
SELECT DISTINCT customer_region, region_manager FROM sales_raw;

-- ── 2. Customers ─────────────────────────────────────────
CREATE TABLE customers (
    customer_id INT         PRIMARY KEY,
    segment     VARCHAR(50) NOT NULL,
    region      VARCHAR(50) NOT NULL,
    FOREIGN KEY (region) REFERENCES regions(region)
);
INSERT INTO customers
SELECT DISTINCT customer_id, customer_segment, customer_region FROM sales_raw;

-- ── 3. Products ──────────────────────────────────────────
CREATE TABLE products (
    product_id   INT          PRIMARY KEY,
    category     VARCHAR(50)  NOT NULL,
    product_name VARCHAR(100) NOT NULL
);
INSERT INTO products
SELECT DISTINCT product_id, category, product_name FROM sales_raw;

-- ── 4. Product tags (fixes 1NF) ──────────────────────────
CREATE TABLE product_tags_norm (
    product_id INT          NOT NULL,
    tag        VARCHAR(100) NOT NULL,
    PRIMARY KEY (product_id, tag),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);
INSERT INTO product_tags_norm
SELECT DISTINCT product_id, TRIM(SUBSTRING_INDEX(product_tags,',',1))  FROM sales_raw UNION
SELECT DISTINCT product_id, TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(product_tags,',',2),',',-1)) FROM sales_raw UNION
SELECT DISTINCT product_id, TRIM(SUBSTRING_INDEX(product_tags,',',-1)) FROM sales_raw;

-- ── 5. City → State lookup (fixes 3NF: store_state) ──────
CREATE TABLE city_states (
    city        VARCHAR(50)  PRIMARY KEY,
    store_state VARCHAR(100) NOT NULL
);
INSERT INTO city_states
SELECT DISTINCT city, store_state FROM sales_raw;

-- ── 6. Stores ────────────────────────────────────────────
CREATE TABLE stores (
    store_id   INT         PRIMARY KEY,
    city       VARCHAR(50) NOT NULL,
    store_type VARCHAR(50) NOT NULL,
    FOREIGN KEY (city) REFERENCES city_states(city)
);
INSERT INTO stores
SELECT DISTINCT store_id, city, store_type FROM sales_raw;

-- ── 7. Dates (quarter_label removed — derivable from quarter) ─
CREATE TABLE dates (
    date_id   INT  PRIMARY KEY AUTO_INCREMENT,
    full_date DATE NOT NULL,
    year      INT  NOT NULL,
    quarter   INT  NOT NULL,
    month     INT  NOT NULL
);
INSERT INTO dates (full_date, year, quarter, month)
SELECT DISTINCT sale_date, year, quarter, month FROM sales_raw ORDER BY sale_date;

-- ── 8. Sales (fact table — only FKs + measures) ──────────
CREATE TABLE sales (
    sale_id     INT            PRIMARY KEY,
    date_id     INT            NOT NULL,
    customer_id INT            NOT NULL,
    product_id  INT            NOT NULL,
    store_id    INT            NOT NULL,
    quantity    INT            NOT NULL,
    revenue     DECIMAL(10,2)  NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (product_id)  REFERENCES products(product_id),
    FOREIGN KEY (store_id)    REFERENCES stores(store_id),
    FOREIGN KEY (date_id)     REFERENCES dates(date_id)
);
INSERT INTO sales (sale_id, date_id, customer_id, product_id, store_id, quantity, revenue)
SELECT
    sr.sale_id,
    d.date_id,
    sr.customer_id,
    sr.product_id,
    sr.store_id,
    sr.quantity,
    sr.revenue
FROM       sales_raw sr
JOIN       dates     d ON d.full_date = sr.sale_date
              AND d.year = sr.year AND d.quarter = sr.quarter AND d.month = sr.month;
```

**Verification row counts:**

| Table | Expected rows |
|---|---|
| `regions` | 4 |
| `customers` | 8 |
| `products` | 9 |
| `product_tags_norm` | 27 |
| `city_states` | 4 |
| `stores` | 5 |
| `dates` | 7 |
| `sales` | 22 |

---

### Task 6.2
**Verify that normalization preserved every fact. Write a query that reconstructs the full `sales_raw` view from the normalized tables and confirm the grand total revenue matches.**

```sql
-- Reconstruct and compare totals
SELECT
    s.sale_id,
    d.full_date                                           AS sale_date,
    c.segment                                             AS customer_segment,
    c.region                                              AS customer_region,
    r.region_manager,
    p.product_name,
    p.category,
    GROUP_CONCAT(pt.tag ORDER BY pt.tag SEPARATOR ',')    AS product_tags,
    st.city,
    st.store_type,
    cs.store_state,
    s.quantity,
    s.revenue
FROM       sales         s
JOIN       dates         d  ON s.date_id     = d.date_id
JOIN       customers     c  ON s.customer_id = c.customer_id
JOIN       regions       r  ON c.region      = r.region
JOIN       products      p  ON s.product_id  = p.product_id
JOIN       product_tags_norm pt ON p.product_id = pt.product_id
JOIN       stores        st ON s.store_id    = st.store_id
JOIN       city_states   cs ON st.city       = cs.city
GROUP BY
    s.sale_id, d.full_date, c.segment, c.region, r.region_manager,
    p.product_name, p.category, st.city, st.store_type, cs.store_state,
    s.quantity, s.revenue
ORDER BY s.sale_id;

-- Grand total check
SELECT
    SUM(revenue)              AS normalized_total,
    (SELECT SUM(revenue) FROM sales_raw) AS raw_total,
    SUM(revenue) = (SELECT SUM(revenue) FROM sales_raw) AS totals_match
FROM sales;
```

**Expected grand total verification:**

| normalized_total | raw_total | totals_match |
|---|---|---|
| 19920.00 | 19920.00 | 1 |

**First 5 reconstructed rows:**

| sale_id | sale_date | customer_segment | customer_region | region_manager | product_name | category | product_tags | city | store_type | store_state | quantity | revenue |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 2025-01-10 | Corporate | East | Alice Chen | Laptop | Electronics | business,high-performance,portable | Melbourne | Urban | Victoria | 1 | 1500.00 |
| 2 | 2025-01-10 | Consumer | West | Bob Park | Paper | Stationery | a4,bulk,recycled | Sydney | Urban | New South Wales | 3 | 900.00 |
| 3 | 2025-01-25 | Consumer | East | Alice Chen | Printer | Electronics | colour,office,wireless | Melbourne | Urban | Victoria | 2 | 1800.00 |
| 4 | 2025-01-25 | Consumer | East | Alice Chen | Phone | Electronics | portable,touchscreen,wireless | Melbourne | Suburban | Victoria | 1 | 850.00 |
| 5 | 2025-02-05 | Home Office | North | Carol Singh | Desk | Furniture | assembly-required,office,wood | Brisbane | Suburban | Queensland | 2 | 1200.00 |

> **`totals_match = 1` confirms no data was lost.** The normalized schema is informationally equivalent to `sales_raw` — it can reconstruct every fact through joins — but each fact now lives in exactly one place. Updating a region manager, renaming a city, or adding a new store now requires changing exactly one row in one table.

---

## Normal Forms — Quick Reference

| Normal Form | Rule | Violation in `sales_raw` | Fix |
|---|---|---|---|
| **1NF** | Every column contains one atomic value | `product_tags` stores multiple tags in one cell | Extract to `product_tags(product_id, tag)` junction table |
| **2NF** | Every non-key column depends on the whole PK | `product_name`, `category`, `city`, `store_type`, `customer_segment`, `customer_region` depend on their FK, not `sale_id` | Extract to `products`, `stores`, `customers` |
| **3NF** | No non-key column depends on another non-key column | `region_manager` depends on `customer_region`; `store_state` depends on `city`; `quarter_label` depends on `quarter` | Extract to `regions`, `city_states`; drop `quarter_label` |

**The practical test for each form:**

- **1NF** — Can you filter on a single value in this column with `=` rather than `LIKE '%...%'`?
- **2NF** — If you changed the PK (`sale_id`), would this column's value change too? If not, it belongs in another table.
- **3NF** — Is this column's value determined by another non-key column? If yes, extract that dependency into a lookup table.
