# Session 6
## Retail Analytics Warehouse · MySQL 8.0

**Schema:** `sales` (22 rows) · `customers` (10) · `products` (10) · `stores` (5) · `dates` (14)  
**Grand total revenue:** 19,920.00 · **Date range:** 2025-01-10 → 2025-07-19

---

## Schema Reference

```
customers  (customer_id, segment, region)
products   (product_id, category, product_name)
stores     (store_id, city, store_type)
dates      (date_id, full_date, year, quarter, month)
sales      (sale_id, date_id, customer_id, product_id, store_id, quantity, revenue)
```

---

# Chapter 1 — CTEs & Multi-Step Logic

**Concept:** A CTE names an intermediate result set. Use `WITH name AS (SELECT ...)` before your main query. Chain multiple CTEs with commas. Reference earlier CTEs by name in later ones.

---

### Task 1.1
**Find customers whose total revenue exceeds the average customer revenue. Return customer_id, segment, region, total_revenue.**

```sql
WITH customer_totals AS (
    SELECT
        customer_id,
        SUM(revenue) AS total_revenue
    FROM   sales
    GROUP BY customer_id
),
avg_spend AS (
    SELECT AVG(total_revenue) AS avg_revenue
    FROM   customer_totals         -- CTE referencing another CTE
)
SELECT
    ct.customer_id,
    c.segment,
    c.region,
    ct.total_revenue
FROM       customer_totals ct
JOIN       customers        c  ON ct.customer_id = c.customer_id
CROSS JOIN avg_spend        a
WHERE  ct.total_revenue > a.avg_revenue
ORDER BY   ct.total_revenue DESC;
```

**Expected output** (avg = 2490.00, 4 customers qualify):

| customer_id | segment     | region | total_revenue |
|-------------|-------------|--------|---------------|
| 6           | Home Office | West   | 4000.00       |
| 1           | Corporate   | East   | 3250.00       |
| 4           | Corporate   | South  | 2980.00       |
| 5           | Consumer    | East   | 2950.00       |

---

### Task 1.2
**For each product category, show total revenue and its percentage share of the 19,920.00 grand total. Order by revenue descending.**

```sql
WITH cat_revenue AS (
    SELECT
        p.category,
        SUM(s.revenue) AS revenue
    FROM   sales    s
    JOIN   products p ON s.product_id = p.product_id
    GROUP BY p.category
),
grand_total AS (
    SELECT SUM(revenue) AS total
    FROM   cat_revenue
)
SELECT
    cr.category,
    cr.revenue,
    ROUND(cr.revenue / gt.total * 100, 1) AS pct_of_total
FROM       cat_revenue cr
CROSS JOIN grand_total  gt
ORDER BY   cr.revenue DESC;
```

**Expected output:**

| category    | revenue  | pct_of_total |
|-------------|----------|--------------|
| Electronics | 12060.00 | 60.5         |
| Furniture   | 4750.00  | 23.8         |
| Stationery  | 1650.00  | 8.3          |
| Clothing    | 1460.00  | 7.3          |

---

### Task 1.3
**Find stores whose total revenue exceeds the average store revenue. Return store_id, city, store_type, total_revenue.**

```sql
WITH store_totals AS (
    SELECT
        store_id,
        SUM(revenue) AS total_revenue
    FROM   sales
    GROUP BY store_id
),
avg_store AS (
    SELECT AVG(total_revenue) AS avg_rev
    FROM   store_totals
)
SELECT
    st.store_id,
    s.city,
    s.store_type,
    st.total_revenue
FROM       store_totals st
JOIN       stores        s  ON st.store_id = s.store_id
CROSS JOIN avg_store     a
WHERE  st.total_revenue > a.avg_rev
ORDER BY   st.total_revenue DESC;
```

**Expected output** (avg = 3984.00):

| store_id | city      | store_type | total_revenue |
|----------|-----------|------------|---------------|
| 1        | Melbourne | Urban      | 7850.00       |
| 2        | Sydney    | Urban      | 5490.00       |

---

### Task 1.4
**For each segment, show total revenue and the number of distinct customers in that segment who made at least one purchase.**

```sql
WITH seg_sales AS (
    SELECT
        c.segment,
        s.customer_id,
        s.revenue
    FROM   sales     s
    JOIN   customers c ON s.customer_id = c.customer_id
)
SELECT
    segment,
    COUNT(DISTINCT customer_id) AS active_customers,
    SUM(revenue)                AS total_revenue
FROM   seg_sales
GROUP BY segment
ORDER BY total_revenue DESC;
```

**Expected output:**

| segment     | active_customers | total_revenue |
|-------------|------------------|---------------|
| Corporate   | 3                | 7110.00       |
| Consumer    | 3                | 6710.00       |
| Home Office | 2                | 6100.00       |

---

### Task 1.5
**Find the single highest-revenue sale per store. Return store city, sale_id, product_name, and revenue.**

```sql
WITH store_max AS (
    SELECT
        store_id,
        MAX(revenue) AS max_revenue
    FROM   sales
    GROUP BY store_id
)
SELECT
    st.city,
    s.sale_id,
    p.product_name,
    s.revenue
FROM   sales     s
JOIN   store_max sm ON s.store_id = sm.store_id
                    AND s.revenue  = sm.max_revenue
JOIN   stores    st ON s.store_id = st.store_id
JOIN   products  p  ON s.product_id = p.product_id
ORDER BY s.revenue DESC;
```

**Expected output:**

| city      | sale_id | product_name | revenue |
|-----------|---------|--------------|---------|
| Melbourne | 13      | Laptop       | 2200.00 |
| Sydney    | 7       | Laptop       | 1600.00 |
| Adelaide  | 18      | Laptop       | 1450.00 |
| Brisbane  | 22      | Desk         | 1300.00 |
| Melbourne | 3       | Printer      | 1800.00 |

---

### Task 1.6
**List months (by number) where revenue was below the average monthly revenue across all months with sales.**

```sql
WITH monthly AS (
    SELECT
        d.month,
        SUM(s.revenue) AS monthly_rev
    FROM   sales s
    JOIN   dates d ON s.date_id = d.date_id
    GROUP BY d.month
),
avg_month AS (
    SELECT AVG(monthly_rev) AS avg_rev
    FROM   monthly
)
SELECT
    m.month,
    m.monthly_rev
FROM       monthly   m
CROSS JOIN avg_month a
WHERE  m.monthly_rev < a.avg_rev
ORDER BY   m.month;
```

**Expected output** (avg monthly = 3320.00):

| month | monthly_rev |
|-------|-------------|
| 3     | 2150.00     |
| 5     | 3340.00     |
| 7     | 1500.00     |

---

### Task 1.7
**For each region, find the customer in that region with the highest total revenue. Return region, customer_id, segment, and their total.**

```sql
WITH cust_totals AS (
    SELECT
        s.customer_id,
        SUM(s.revenue) AS total_rev
    FROM   sales s
    GROUP BY s.customer_id
),
region_max AS (
    SELECT
        c.region,
        MAX(ct.total_rev) AS max_rev
    FROM   cust_totals ct
    JOIN   customers   c ON ct.customer_id = c.customer_id
    GROUP BY c.region
)
SELECT
    c.region,
    ct.customer_id,
    c.segment,
    ct.total_rev
FROM   cust_totals  ct
JOIN   customers    c  ON ct.customer_id  = c.customer_id
JOIN   region_max   rm ON c.region        = rm.region
                       AND ct.total_rev   = rm.max_rev
ORDER BY c.region;
```

**Expected output:**

| region | customer_id | segment     | total_rev |
|--------|-------------|-------------|-----------|
| East   | 1           | Corporate   | 3250.00   |
| North  | 3           | Home Office | 2100.00   |
| South  | 4           | Corporate   | 2980.00   |
| West   | 6           | Home Office | 4000.00   |

---

### Task 1.8
**Find products that have never been sold. Return product_id, category, product_name.**

```sql
WITH sold_products AS (
    SELECT DISTINCT product_id
    FROM   sales
)
SELECT
    p.product_id,
    p.category,
    p.product_name
FROM       products     p
LEFT JOIN  sold_products sp ON p.product_id = sp.product_id
WHERE      sp.product_id IS NULL;
```

**Expected output:**

| product_id | category  | product_name |
|------------|-----------|--------------|
| 10         | Furniture | Bookshelf    |

---

### Task 1.9
**Show each store's revenue as a percentage of its store_type group total. Return store_id, city, store_type, revenue, and pct_of_type.**

```sql
WITH store_rev AS (
    SELECT
        store_id,
        SUM(revenue) AS revenue
    FROM   sales
    GROUP BY store_id
),
type_rev AS (
    SELECT
        s.store_type,
        SUM(sr.revenue) AS type_total
    FROM   store_rev sr
    JOIN   stores    s ON sr.store_id = s.store_id
    GROUP BY s.store_type
)
SELECT
    s.store_id,
    s.city,
    s.store_type,
    sr.revenue,
    ROUND(sr.revenue / tr.type_total * 100, 1) AS pct_of_type
FROM   store_rev  sr
JOIN   stores     s  ON sr.store_id  = s.store_id
JOIN   type_rev   tr ON s.store_type = tr.store_type
ORDER BY s.store_type, sr.revenue DESC;
```

**Expected output:**

| store_id | city      | store_type | revenue | pct_of_type |
|----------|-----------|------------|---------|-------------|
| 1        | Melbourne | Urban      | 7850.00 | 58.8        |
| 2        | Sydney    | Urban      | 5490.00 | 41.2        |
| 3        | Melbourne | Suburban   | 1730.00 | 35.1        |
| 4        | Brisbane  | Suburban   | 3200.00 | 64.9        |
| 5        | Adelaide  | Rural      | 1650.00 | 100.0       |

---

### Task 1.10
**Identify products sold at more than one store. Return product_name, category, and how many distinct stores each was sold at.**

```sql
WITH product_stores AS (
    SELECT
        product_id,
        COUNT(DISTINCT store_id) AS store_count
    FROM   sales
    GROUP BY product_id
)
SELECT
    p.product_name,
    p.category,
    ps.store_count
FROM   product_stores ps
JOIN   products       p ON ps.product_id = p.product_id
WHERE  ps.store_count > 1
ORDER BY ps.store_count DESC, p.product_name;
```

**Expected output:**

| product_name | category    | store_count |
|--------------|-------------|-------------|
| Desk         | Furniture   | 3           |
| Laptop       | Electronics | 3           |
| Printer      | Electronics | 3           |
| Pen          | Stationery  | 2           |
| Phone        | Electronics | 2           |

---

# Chapter 2 — Window Functions

**Concept:** Add `OVER()` to any aggregate or ranking function. `PARTITION BY` restarts the calculation per group. `ORDER BY` inside OVER defines row order within the window. Original rows are never removed.

---

### Task 2.1
**Rank all products by total revenue (highest = 1). Show product_name, category, total_revenue, and rank.**

```sql
WITH prod_rev AS (
    SELECT
        s.product_id,
        SUM(s.revenue) AS total_revenue
    FROM   sales s
    GROUP BY s.product_id
)
SELECT
    p.product_name,
    p.category,
    pr.total_revenue,
    RANK() OVER (ORDER BY pr.total_revenue DESC) AS revenue_rank
FROM   prod_rev  pr
JOIN   products  p ON pr.product_id = p.product_id
ORDER BY revenue_rank;
```

**Expected output:**

| product_name | category    | total_revenue | revenue_rank |
|--------------|-------------|---------------|--------------|
| Laptop       | Electronics | 6750.00       | 1            |
| Printer      | Electronics | 3760.00       | 2            |
| Desk         | Furniture   | 3600.00       | 3            |
| Phone        | Electronics | 1550.00       | 4            |
| Paper        | Stationery  | 1200.00       | 5            |
| Chair        | Furniture   | 1150.00       | 6            |
| Jacket       | Clothing    | 1080.00       | 7            |
| Pen          | Stationery  | 450.00        | 8            |
| Pants        | Clothing    | 380.00        | 9            |

---

### Task 2.2
**Rank products within each category by total revenue. Show category, product_name, total_revenue, rank_in_category, and dense_rank_in_category.**

```sql
WITH prod_rev AS (
    SELECT
        s.product_id,
        SUM(s.revenue) AS total_revenue
    FROM   sales s
    GROUP BY s.product_id
)
SELECT
    p.category,
    p.product_name,
    pr.total_revenue,
    RANK() OVER (
        PARTITION BY p.category
        ORDER BY     pr.total_revenue DESC
    ) AS rank_in_category,
    DENSE_RANK() OVER (
        PARTITION BY p.category
        ORDER BY     pr.total_revenue DESC
    ) AS dense_rank_in_category
FROM   prod_rev  pr
JOIN   products  p ON pr.product_id = p.product_id
ORDER BY p.category, rank_in_category;
```

**Expected output:**

| category    | product_name | total_revenue | rank_in_category | dense_rank_in_category |
|-------------|--------------|---------------|------------------|------------------------|
| Clothing    | Jacket       | 1080.00       | 1                | 1                      |
| Clothing    | Pants        | 380.00        | 2                | 2                      |
| Electronics | Laptop       | 6750.00       | 1                | 1                      |
| Electronics | Printer      | 3760.00       | 2                | 2                      |
| Electronics | Phone        | 1550.00       | 3                | 3                      |
| Furniture   | Desk         | 3600.00       | 1                | 1                      |
| Furniture   | Chair        | 1150.00       | 2                | 2                      |
| Stationery  | Paper        | 1200.00       | 1                | 1                      |
| Stationery  | Pen          | 450.00        | 2                | 2                      |

---

### Task 2.3
**For each sale, show the previous sale's revenue for the same store (ordered by date_id). Include store city, sale_id, date_id, revenue, and prev_revenue.**

```sql
SELECT
    st.city,
    s.sale_id,
    s.date_id,
    s.revenue,
    LAG(s.revenue, 1) OVER (
        PARTITION BY s.store_id
        ORDER BY     s.date_id
    ) AS prev_revenue,
    s.revenue - LAG(s.revenue, 1, s.revenue) OVER (
        PARTITION BY s.store_id
        ORDER BY     s.date_id
    ) AS delta
FROM   sales  s
JOIN   stores st ON s.store_id = st.store_id
ORDER BY st.city, s.date_id;
```

**Expected output (Melbourne Urban — store 1):**

| city      | sale_id | date_id | revenue | prev_revenue | delta   |
|-----------|---------|---------|---------|--------------|---------|
| Melbourne | 1       | 1       | 1500.00 | NULL         | 0.00    |
| Melbourne | 6       | 3       | 600.00  | 1500.00      | -900.00 |
| Melbourne | 9       | 5       | 1000.00 | 600.00       | +400.00 |
| Melbourne | 13      | 7       | 2200.00 | 1000.00      | +1200.00|
| Melbourne | 17      | 9       | 750.00  | 2200.00      | -1450.00|

---

### Task 2.4
**For each month that has sales, show monthly revenue and the next month's revenue using LEAD. Where no next month exists, show NULL.**

```sql
WITH monthly AS (
    SELECT
        d.month,
        SUM(s.revenue) AS monthly_rev
    FROM   sales s
    JOIN   dates d ON s.date_id = d.date_id
    GROUP BY d.month
)
SELECT
    month,
    monthly_rev,
    LEAD(monthly_rev, 1) OVER (ORDER BY month) AS next_month_rev
FROM   monthly
ORDER BY month;
```

**Expected output:**

| month | monthly_rev | next_month_rev |
|-------|-------------|----------------|
| 1     | 5050.00     | 3800.00        |
| 2     | 3800.00     | 2150.00        |
| 3     | 2150.00     | 4080.00        |
| 4     | 4080.00     | 3340.00        |
| 5     | 3340.00     | 1500.00        |
| 7     | 1500.00     | NULL           |

---

### Task 2.5
**Divide customers (who have made purchases) into 3 spend tiers using NTILE. Return customer_id, segment, region, total_revenue, and tier.**

```sql
WITH cust_totals AS (
    SELECT
        s.customer_id,
        SUM(s.revenue) AS total_revenue
    FROM   sales s
    GROUP BY s.customer_id
)
SELECT
    c.customer_id,
    c.segment,
    c.region,
    ct.total_revenue,
    NTILE(3) OVER (ORDER BY ct.total_revenue ASC) AS spend_tier
FROM   cust_totals ct
JOIN   customers   c ON ct.customer_id = c.customer_id
ORDER BY ct.total_revenue;
```

**Expected output** (8 customers, ~2-3 per tier):

| customer_id | segment     | region | total_revenue | spend_tier |
|-------------|-------------|--------|---------------|------------|
| 7           | Corporate   | North  | 880.00        | 1          |
| 8           | Consumer    | South  | 1650.00       | 1          |
| 3           | Home Office | North  | 2100.00       | 1          |
| 2           | Consumer    | West   | 2110.00       | 2          |
| 5           | Consumer    | East   | 2950.00       | 2          |
| 4           | Corporate   | South  | 2980.00       | 2          |
| 1           | Corporate   | East   | 3250.00       | 3          |
| 6           | Home Office | West   | 4000.00       | 3          |

---

### Task 2.6
**For each sale, show its revenue and what percentage of that store's total revenue it represents.**

```sql
SELECT
    s.sale_id,
    st.city,
    p.product_name,
    s.revenue,
    ROUND(
        s.revenue / SUM(s.revenue) OVER (PARTITION BY s.store_id) * 100
    , 1) AS pct_of_store_total
FROM   sales    s
JOIN   stores   st ON s.store_id   = st.store_id
JOIN   products p  ON s.product_id = p.product_id
ORDER BY st.city, s.revenue DESC;
```

**Expected output (store 1 Melbourne):**

| sale_id | city      | product_name | revenue | pct_of_store_total |
|---------|-----------|--------------|---------|--------------------|
| 13      | Melbourne | Laptop       | 2200.00 | 28.0               |
| 3       | Melbourne | Printer      | 1800.00 | 22.9               |
| 1       | Melbourne | Laptop       | 1500.00 | 19.1               |
| 9       | Melbourne | Printer      | 1000.00 | 12.7               |
| 17      | Melbourne | Chair        | 750.00  | 9.6                |
| 6       | Melbourne | Jacket       | 600.00  | 7.6                |

---

### Task 2.7
**For each sale, show a running total of revenue ordered by sale_id (global, not partitioned).**

```sql
SELECT
    s.sale_id,
    d.full_date,
    p.product_name,
    s.revenue,
    SUM(s.revenue) OVER (
        ORDER BY s.sale_id
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_total
FROM   sales    s
JOIN   dates    d ON s.date_id    = d.date_id
JOIN   products p ON s.product_id = p.product_id
ORDER BY s.sale_id;
```

**Expected output (first 5 rows):**

| sale_id | full_date  | product_name | revenue | running_total |
|---------|------------|--------------|---------|---------------|
| 1       | 2025-01-10 | Laptop       | 1500.00 | 1500.00       |
| 2       | 2025-01-10 | Paper        | 900.00  | 2400.00       |
| 3       | 2025-01-25 | Printer      | 1800.00 | 4200.00       |
| 4       | 2025-01-25 | Phone        | 850.00  | 5050.00       |
| 5       | 2025-02-05 | Desk         | 1200.00 | 6250.00       |

---

### Task 2.8
**For each sale, show its revenue rank within its month (highest = 1). Include month, sale_id, revenue, and monthly_rank.**

```sql
SELECT
    d.month,
    s.sale_id,
    p.product_name,
    s.revenue,
    ROW_NUMBER() OVER (
        PARTITION BY d.month
        ORDER BY     s.revenue DESC
    ) AS monthly_rank
FROM   sales    s
JOIN   dates    d ON s.date_id    = d.date_id
JOIN   products p ON s.product_id = p.product_id
ORDER BY d.month, monthly_rank;
```

**Expected output (months 1 and 2):**

| month | sale_id | product_name | revenue | monthly_rank |
|-------|---------|--------------|---------|--------------|
| 1     | 3       | Printer      | 1800.00 | 1            |
| 1     | 1       | Laptop       | 1500.00 | 2            |
| 1     | 2       | Paper        | 900.00  | 3            |
| 1     | 4       | Phone        | 850.00  | 4            |
| 2     | 7       | Laptop       | 1600.00 | 1            |
| 2     | 5       | Desk         | 1200.00 | 2            |
| 2     | 12      | Phone        | 700.00  | 3            |
| 2     | 6       | Jacket       | 600.00  | 4            |
| 2     | 8       | Chair        | 400.00  | 5            |

---

### Task 2.9
**Show each sale's revenue and how it compares to the average revenue of all sales in the same quarter. Include quarter, sale_id, revenue, quarter_avg, and diff_from_avg.**

```sql
SELECT
    d.quarter,
    s.sale_id,
    p.product_name,
    s.revenue,
    ROUND(AVG(s.revenue) OVER (PARTITION BY d.quarter), 2) AS quarter_avg,
    ROUND(s.revenue - AVG(s.revenue) OVER (PARTITION BY d.quarter), 2) AS diff_from_avg
FROM   sales    s
JOIN   dates    d ON s.date_id    = d.date_id
JOIN   products p ON s.product_id = p.product_id
ORDER BY d.quarter, s.sale_id;
```

**Expected output (Q1 subset — quarter avg = 1021.43):**

| quarter | sale_id | product_name | revenue | quarter_avg | diff_from_avg |
|---------|---------|--------------|---------|-------------|---------------|
| 1       | 1       | Laptop       | 1500.00 | 1021.43     | +478.57       |
| 1       | 2       | Paper        | 900.00  | 1021.43     | -121.43       |
| 1       | 3       | Printer      | 1800.00 | 1021.43     | +778.57       |

---

### Task 2.10
**For each customer, show their sales in date order along with a running count of how many sales they have made so far (cumulative per customer).**

```sql
SELECT
    c.customer_id,
    c.segment,
    d.full_date,
    s.sale_id,
    s.revenue,
    COUNT(*) OVER (
        PARTITION BY s.customer_id
        ORDER BY     d.full_date, s.sale_id
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS sales_so_far
FROM   sales     s
JOIN   customers c ON s.customer_id = c.customer_id
JOIN   dates     d ON s.date_id     = d.date_id
ORDER BY c.customer_id, d.full_date;
```

**Expected output (customer 1 — 3 sales):**

| customer_id | segment   | full_date  | sale_id | revenue | sales_so_far |
|-------------|-----------|------------|---------|---------|--------------|
| 1           | Corporate | 2025-01-10 | 1       | 1500.00 | 1            |
| 1           | Corporate | 2025-03-08 | 9       | 1000.00 | 2            |
| 1           | Corporate | 2025-05-07 | 17      | 750.00  | 3            |

---

# Chapter 3 — Top-N Per Group

**Concept:** `LIMIT` gives global top-N. For top-N within each group: use `ROW_NUMBER() OVER (PARTITION BY group ORDER BY metric DESC)` inside a CTE, then `WHERE rn <= N` in the outer query.

---

### Task 3.1
**Find the top 2 products by total revenue within each category. Return category, product_name, total_revenue, and rank_in_category.**

```sql
WITH prod_rev AS (
    SELECT
        s.product_id,
        SUM(s.revenue) AS total_revenue
    FROM   sales s
    GROUP BY s.product_id
),
ranked AS (
    SELECT
        p.category,
        p.product_name,
        pr.total_revenue,
        ROW_NUMBER() OVER (
            PARTITION BY p.category
            ORDER BY     pr.total_revenue DESC
        ) AS rn
    FROM   prod_rev pr
    JOIN   products p ON pr.product_id = p.product_id
)
SELECT category, product_name, total_revenue, rn AS rank_in_category
FROM   ranked
WHERE  rn <= 2
ORDER BY category, rn;
```

**Expected output:**

| category    | product_name | total_revenue | rank_in_category |
|-------------|--------------|---------------|------------------|
| Clothing    | Jacket       | 1080.00       | 1                |
| Clothing    | Pants        | 380.00        | 2                |
| Electronics | Laptop       | 6750.00       | 1                |
| Electronics | Printer      | 3760.00       | 2                |
| Furniture   | Desk         | 3600.00       | 1                |
| Furniture   | Chair        | 1150.00       | 2                |
| Stationery  | Paper        | 1200.00       | 1                |
| Stationery  | Pen          | 450.00        | 2                |

---

### Task 3.2
**Find the single most recent sale per store. Return store city, sale_id, full_date, product_name, and revenue.**

```sql
WITH ranked AS (
    SELECT
        s.store_id,
        s.sale_id,
        s.product_id,
        s.revenue,
        s.date_id,
        ROW_NUMBER() OVER (
            PARTITION BY s.store_id
            ORDER BY     s.date_id DESC, s.sale_id DESC
        ) AS rn
    FROM sales s
)
SELECT
    st.city,
    r.sale_id,
    d.full_date,
    p.product_name,
    r.revenue
FROM   ranked   r
JOIN   stores   st ON r.store_id   = st.store_id
JOIN   dates    d  ON r.date_id    = d.date_id
JOIN   products p  ON r.product_id = p.product_id
WHERE  r.rn = 1
ORDER BY d.full_date DESC;
```

**Expected output:**

| city      | sale_id | full_date  | product_name | revenue |
|-----------|---------|------------|--------------|---------|
| Sydney    | 22      | 2025-07-19 | Desk         | 1300.00 |
| Brisbane  | 21      | 2025-07-04 | Pen          | 200.00  |
| Melbourne | 17      | 2025-05-07 | Chair        | 750.00  |
| Adelaide  | 18      | 2025-05-07 | Laptop       | 1450.00 |
| Melbourne | 20      | 2025-05-29 | Pants        | 180.00  |

---

### Task 3.3
**Find the top 3 customers by revenue within each region. Return region, customer rank, customer_id, segment, and total_revenue.**

```sql
WITH cust_rev AS (
    SELECT
        s.customer_id,
        SUM(s.revenue) AS total_revenue
    FROM   sales s
    GROUP BY s.customer_id
),
ranked AS (
    SELECT
        c.region,
        c.customer_id,
        c.segment,
        cr.total_revenue,
        ROW_NUMBER() OVER (
            PARTITION BY c.region
            ORDER BY     cr.total_revenue DESC
        ) AS rn
    FROM   cust_rev cr
    JOIN   customers c ON cr.customer_id = c.customer_id
)
SELECT region, rn AS rank_in_region, customer_id, segment, total_revenue
FROM   ranked
WHERE  rn <= 3
ORDER BY region, rn;
```

**Expected output:**

| region | rank_in_region | customer_id | segment     | total_revenue |
|--------|----------------|-------------|-------------|---------------|
| East   | 1              | 1           | Corporate   | 3250.00       |
| East   | 2              | 5           | Consumer    | 2950.00       |
| North  | 1              | 3           | Home Office | 2100.00       |
| North  | 2              | 7           | Corporate   | 880.00        |
| South  | 1              | 4           | Corporate   | 2980.00       |
| South  | 2              | 8           | Consumer    | 1650.00       |
| West   | 1              | 6           | Home Office | 4000.00       |
| West   | 2              | 2           | Consumer    | 2110.00       |

---

### Task 3.4
**For each store, return the 2 highest-revenue sales. Return store city, rank, sale_id, product_name, and revenue.**

```sql
WITH ranked AS (
    SELECT
        s.store_id,
        s.sale_id,
        s.product_id,
        s.revenue,
        ROW_NUMBER() OVER (
            PARTITION BY s.store_id
            ORDER BY     s.revenue DESC
        ) AS rn
    FROM sales s
)
SELECT
    st.city,
    r.rn   AS store_rank,
    r.sale_id,
    p.product_name,
    r.revenue
FROM   ranked   r
JOIN   stores   st ON r.store_id   = st.store_id
JOIN   products p  ON r.product_id = p.product_id
WHERE  r.rn <= 2
ORDER BY st.city, r.rn;
```

**Expected output:**

| city      | store_rank | sale_id | product_name | revenue |
|-----------|------------|---------|--------------|---------|
| Adelaide  | 1          | 18      | Laptop       | 1450.00 |
| Adelaide  | 2          | 10      | Pants        | 200.00  |
| Brisbane  | 1          | 22      | Desk         | 1300.00 |
| Brisbane  | 2          | 5       | Desk         | 1200.00 |
| Melbourne | 1          | 13      | Laptop       | 2200.00 |
| Melbourne | 2          | 3       | Printer      | 1800.00 |
| Sydney    | 1          | 7       | Laptop       | 1600.00 |
| Sydney    | 2          | 22      | Desk         | 1300.00 |

---

### Task 3.5
**Find the earliest (first) sale per customer. Return customer_id, segment, first sale_id, full_date, and product_name.**

```sql
WITH ranked AS (
    SELECT
        s.customer_id,
        s.sale_id,
        s.product_id,
        s.date_id,
        ROW_NUMBER() OVER (
            PARTITION BY s.customer_id
            ORDER BY     s.date_id ASC, s.sale_id ASC
        ) AS rn
    FROM sales s
)
SELECT
    c.customer_id,
    c.segment,
    r.sale_id   AS first_sale_id,
    d.full_date AS first_sale_date,
    p.product_name
FROM   ranked    r
JOIN   customers c ON r.customer_id = c.customer_id
JOIN   dates     d ON r.date_id     = d.date_id
JOIN   products  p ON r.product_id  = p.product_id
WHERE  r.rn = 1
ORDER BY d.full_date, c.customer_id;
```

**Expected output:**

| customer_id | segment     | first_sale_id | first_sale_date | product_name |
|-------------|-------------|---------------|-----------------|--------------|
| 1           | Corporate   | 1             | 2025-01-10      | Laptop       |
| 2           | Consumer    | 2             | 2025-01-10      | Paper        |
| 5           | Consumer    | 3             | 2025-01-25      | Printer      |
| 3           | Home Office | 5             | 2025-02-05      | Desk         |
| 4           | Corporate   | 6             | 2025-02-05      | Jacket       |
| 6           | Home Office | 7             | 2025-02-20      | Laptop       |
| 7           | Corporate   | 8             | 2025-02-20      | Chair        |
| 8           | Consumer    | 10            | 2025-03-08      | Pants        |

---

### Task 3.6
**Within each month, find the single highest-revenue sale. Return month, sale_id, customer segment, product_name, revenue.**

```sql
WITH ranked AS (
    SELECT
        d.month,
        s.sale_id,
        s.customer_id,
        s.product_id,
        s.revenue,
        ROW_NUMBER() OVER (
            PARTITION BY d.month
            ORDER BY     s.revenue DESC
        ) AS rn
    FROM   sales s
    JOIN   dates d ON s.date_id = d.date_id
)
SELECT
    r.month,
    r.sale_id,
    c.segment,
    p.product_name,
    r.revenue
FROM   ranked    r
JOIN   customers c ON r.customer_id = c.customer_id
JOIN   products  p ON r.product_id  = p.product_id
WHERE  r.rn = 1
ORDER BY r.month;
```

**Expected output:**

| month | sale_id | segment     | product_name | revenue |
|-------|---------|-------------|--------------|---------|
| 1     | 3       | Consumer    | Printer      | 1800.00 |
| 2     | 7       | Home Office | Laptop       | 1600.00 |
| 3     | 13      | Corporate   | Laptop       | 2200.00 |
| 4     | 18      | Consumer    | Laptop       | 1450.00 |
| 5     | 19      | Consumer    | Printer      | 960.00  |
| 7     | 22      | Home Office | Desk         | 1300.00 |

---

### Task 3.7
**Find the top 1 product (by total revenue) per store_type. Return store_type, product_name, category, and total_revenue.**

```sql
WITH type_prod_rev AS (
    SELECT
        st.store_type,
        s.product_id,
        SUM(s.revenue) AS total_revenue
    FROM   sales  s
    JOIN   stores st ON s.store_id = st.store_id
    GROUP BY st.store_type, s.product_id
),
ranked AS (
    SELECT
        store_type,
        product_id,
        total_revenue,
        ROW_NUMBER() OVER (
            PARTITION BY store_type
            ORDER BY     total_revenue DESC
        ) AS rn
    FROM type_prod_rev
)
SELECT
    r.store_type,
    p.product_name,
    p.category,
    r.total_revenue
FROM   ranked   r
JOIN   products p ON r.product_id = p.product_id
WHERE  r.rn = 1
ORDER BY r.store_type;
```

**Expected output:**

| store_type | product_name | category    | total_revenue |
|------------|--------------|-------------|---------------|
| Rural      | Laptop       | Electronics | 1450.00       |
| Suburban   | Desk         | Furniture   | 2300.00       |
| Urban      | Laptop       | Electronics | 5300.00       |

---

### Task 3.8
**For each segment, show the 2 customers with the fewest total sales (by count). Return segment, customer_id, region, and sale_count.**

```sql
WITH cust_counts AS (
    SELECT
        customer_id,
        COUNT(*) AS sale_count
    FROM   sales
    GROUP BY customer_id
),
ranked AS (
    SELECT
        c.segment,
        c.customer_id,
        c.region,
        cc.sale_count,
        ROW_NUMBER() OVER (
            PARTITION BY c.segment
            ORDER BY     cc.sale_count ASC, c.customer_id ASC
        ) AS rn
    FROM   cust_counts cc
    JOIN   customers   c ON cc.customer_id = c.customer_id
)
SELECT segment, customer_id, region, sale_count
FROM   ranked
WHERE  rn <= 2
ORDER BY segment, sale_count;
```

**Expected output:**

| segment     | customer_id | region | sale_count |
|-------------|-------------|--------|------------|
| Consumer    | 2           | West   | 3          |
| Consumer    | 8           | South  | 2          |
| Corporate   | 7           | North  | 2          |
| Corporate   | 4           | South  | 3          |
| Home Office | 3           | North  | 3          |
| Home Office | 6           | West   | 3          |

---

### Task 3.9
**Find the 3 highest-quantity sales globally. Where quantity ties, break by revenue descending. Return sale_id, product_name, quantity, revenue.**

```sql
WITH ranked AS (
    SELECT
        s.sale_id,
        s.product_id,
        s.quantity,
        s.revenue,
        ROW_NUMBER() OVER (
            ORDER BY s.quantity DESC, s.revenue DESC
        ) AS rn
    FROM sales s
)
SELECT
    r.sale_id,
    p.product_name,
    r.quantity,
    r.revenue
FROM   ranked   r
JOIN   products p ON r.product_id = p.product_id
WHERE  r.rn <= 3
ORDER BY r.rn;
```

**Expected output:**

| sale_id | product_name | quantity | revenue |
|---------|--------------|----------|---------|
| 11      | Pen          | 5        | 250.00  |
| 8       | Chair        | 4        | 400.00  |
| 21      | Pen          | 4        | 200.00  |

---

### Task 3.10
**For each region, return the product that generated the most revenue. Return region, product_name, category, and regional_revenue.**

```sql
WITH region_prod AS (
    SELECT
        c.region,
        s.product_id,
        SUM(s.revenue) AS regional_revenue
    FROM   sales     s
    JOIN   customers c ON s.customer_id = c.customer_id
    GROUP BY c.region, s.product_id
),
ranked AS (
    SELECT
        region,
        product_id,
        regional_revenue,
        ROW_NUMBER() OVER (
            PARTITION BY region
            ORDER BY     regional_revenue DESC
        ) AS rn
    FROM region_prod
)
SELECT
    r.region,
    p.product_name,
    p.category,
    r.regional_revenue
FROM   ranked   r
JOIN   products p ON r.product_id = p.product_id
WHERE  r.rn = 1
ORDER BY r.region;
```

**Expected output:**

| region | product_name | category    | regional_revenue |
|--------|--------------|-------------|------------------|
| East   | Laptop       | Electronics | 3250.00          |
| North  | Desk         | Furniture   | 1600.00          |
| South  | Laptop       | Electronics | 3650.00          |
| West   | Printer      | Electronics | 1760.00          |

---

# Chapter 4 — Running Totals & Period-over-Period

**Concept:** `SUM(col) OVER (ORDER BY …)` accumulates row by row. Add `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` for a rolling window. Use `LAG` for prior-period comparison.

---

### Task 4.1
**Show monthly revenue with a running cumulative total. Return month, monthly_revenue, and cumulative_revenue.**

```sql
WITH monthly AS (
    SELECT
        d.month,
        SUM(s.revenue) AS monthly_revenue
    FROM   sales s
    JOIN   dates d ON s.date_id = d.date_id
    GROUP BY d.month
)
SELECT
    month,
    monthly_revenue,
    SUM(monthly_revenue) OVER (
        ORDER BY month
    ) AS cumulative_revenue
FROM   monthly
ORDER BY month;
```

**Expected output:**

| month | monthly_revenue | cumulative_revenue |
|-------|-----------------|-------------------|
| 1     | 5050.00         | 5050.00            |
| 2     | 3800.00         | 8850.00            |
| 3     | 2150.00         | 11000.00           |
| 4     | 4080.00         | 15080.00           |
| 5     | 3340.00         | 18420.00           |
| 7     | 1500.00         | 19920.00           |

---

### Task 4.2
**Show month-over-month revenue change (absolute and percentage). Return month, monthly_revenue, prev_revenue, change, and pct_change.**

```sql
WITH monthly AS (
    SELECT
        d.month,
        SUM(s.revenue) AS monthly_revenue
    FROM   sales s
    JOIN   dates d ON s.date_id = d.date_id
    GROUP BY d.month
)
SELECT
    month,
    monthly_revenue,
    LAG(monthly_revenue, 1) OVER (ORDER BY month)            AS prev_revenue,
    monthly_revenue
        - LAG(monthly_revenue, 1) OVER (ORDER BY month)      AS change,
    ROUND(
        (monthly_revenue - LAG(monthly_revenue, 1) OVER (ORDER BY month))
        / NULLIF(LAG(monthly_revenue, 1) OVER (ORDER BY month), 0)
        * 100
    , 1)                                                      AS pct_change
FROM   monthly
ORDER BY month;
```

**Expected output:**

| month | monthly_revenue | prev_revenue | change   | pct_change |
|-------|-----------------|--------------|----------|------------|
| 1     | 5050.00         | NULL         | NULL     | NULL       |
| 2     | 3800.00         | 5050.00      | -1250.00 | -24.8      |
| 3     | 2150.00         | 3800.00      | -1650.00 | -43.4      |
| 4     | 4080.00         | 2150.00      | +1930.00 | +89.8      |
| 5     | 3340.00         | 4080.00      | -740.00  | -18.1      |
| 7     | 1500.00         | 3340.00      | -1840.00 | -55.1      |

---

### Task 4.3
**Calculate a 2-month rolling average revenue (current month + 1 prior). Return month, monthly_revenue, and rolling_2m_avg.**

```sql
WITH monthly AS (
    SELECT
        d.month,
        SUM(s.revenue) AS monthly_revenue
    FROM   sales s
    JOIN   dates d ON s.date_id = d.date_id
    GROUP BY d.month
)
SELECT
    month,
    monthly_revenue,
    ROUND(
        AVG(monthly_revenue) OVER (
            ORDER BY month
            ROWS BETWEEN 1 PRECEDING AND CURRENT ROW
        )
    , 2) AS rolling_2m_avg
FROM   monthly
ORDER BY month;
```

**Expected output:**

| month | monthly_revenue | rolling_2m_avg |
|-------|-----------------|----------------|
| 1     | 5050.00         | 5050.00        |
| 2     | 3800.00         | 4425.00        |
| 3     | 2150.00         | 2975.00        |
| 4     | 4080.00         | 3115.00        |
| 5     | 3340.00         | 3710.00        |
| 7     | 1500.00         | 2420.00        |

---

### Task 4.4
**For each customer, show their sales in date order with a running total of their personal spend.**

```sql
SELECT
    c.customer_id,
    c.segment,
    d.full_date,
    s.sale_id,
    s.revenue,
    SUM(s.revenue) OVER (
        PARTITION BY s.customer_id
        ORDER BY     d.full_date, s.sale_id
    ) AS running_personal_total
FROM   sales     s
JOIN   customers c ON s.customer_id = c.customer_id
JOIN   dates     d ON s.date_id     = d.date_id
ORDER BY c.customer_id, d.full_date, s.sale_id;
```

**Expected output (customer 6 — 3 sales):**

| customer_id | segment     | full_date  | sale_id | revenue | running_personal_total |
|-------------|-------------|------------|---------|---------|------------------------|
| 6           | Home Office | 2025-02-20 | 7       | 1600.00 | 1600.00                |
| 6           | Home Office | 2025-04-18 | 15      | 1100.00 | 2700.00                |
| 6           | Home Office | 2025-07-19 | 22      | 1300.00 | 4000.00                |

---

### Task 4.5
**Show quarterly revenue totals and the difference vs the prior quarter.**

```sql
WITH quarterly AS (
    SELECT
        d.quarter,
        SUM(s.revenue) AS quarterly_revenue
    FROM   sales s
    JOIN   dates d ON s.date_id = d.date_id
    GROUP BY d.quarter
)
SELECT
    quarter,
    quarterly_revenue,
    LAG(quarterly_revenue, 1) OVER (ORDER BY quarter)  AS prev_quarter,
    quarterly_revenue
        - LAG(quarterly_revenue, 1) OVER (ORDER BY quarter) AS qoq_change
FROM   quarterly
ORDER BY quarter;
```

**Expected output:**

| quarter | quarterly_revenue | prev_quarter | qoq_change |
|---------|-------------------|--------------|------------|
| 1       | 11000.00          | NULL         | NULL       |
| 2       | 7420.00           | 11000.00     | -3580.00   |
| 3       | 1500.00           | 7420.00      | -5920.00   |

---

### Task 4.6
**For each store, show monthly revenue and a 2-month rolling average within that store.**

```sql
WITH store_monthly AS (
    SELECT
        s.store_id,
        d.month,
        SUM(s.revenue) AS monthly_revenue
    FROM   sales s
    JOIN   dates d ON s.date_id = d.date_id
    GROUP BY s.store_id, d.month
)
SELECT
    st.city,
    sm.month,
    sm.monthly_revenue,
    ROUND(
        AVG(sm.monthly_revenue) OVER (
            PARTITION BY sm.store_id
            ORDER BY     sm.month
            ROWS BETWEEN 1 PRECEDING AND CURRENT ROW
        )
    , 2) AS rolling_2m_avg
FROM   store_monthly sm
JOIN   stores        st ON sm.store_id = st.store_id
ORDER BY st.city, sm.month;
```

**Expected output (Melbourne Urban — store 1):**

| city      | month | monthly_revenue | rolling_2m_avg |
|-----------|-------|-----------------|----------------|
| Melbourne | 1     | 3300.00         | 3300.00        |
| Melbourne | 2     | 600.00          | 1950.00        |
| Melbourne | 3     | 1000.00         | 800.00         |
| Melbourne | 4     | 2200.00         | 1600.00        |
| Melbourne | 5     | 750.00          | 1475.00        |

---

### Task 4.7
**Show a 3-month rolling sum of revenue (current month + 2 prior). Return month, monthly_revenue, and rolling_3m_sum.**

```sql
WITH monthly AS (
    SELECT
        d.month,
        SUM(s.revenue) AS monthly_revenue
    FROM   sales s
    JOIN   dates d ON s.date_id = d.date_id
    GROUP BY d.month
)
SELECT
    month,
    monthly_revenue,
    SUM(monthly_revenue) OVER (
        ORDER BY month
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS rolling_3m_sum
FROM   monthly
ORDER BY month;
```

**Expected output:**

| month | monthly_revenue | rolling_3m_sum |
|-------|-----------------|----------------|
| 1     | 5050.00         | 5050.00        |
| 2     | 3800.00         | 8850.00        |
| 3     | 2150.00         | 11000.00       |
| 4     | 4080.00         | 10030.00       |
| 5     | 3340.00         | 9570.00        |
| 7     | 1500.00         | 8920.00        |

---

### Task 4.8
**For each month, show the revenue and what percentage of the cumulative total so far it represents.**

```sql
WITH monthly AS (
    SELECT
        d.month,
        SUM(s.revenue) AS monthly_revenue
    FROM   sales s
    JOIN   dates d ON s.date_id = d.date_id
    GROUP BY d.month
)
SELECT
    month,
    monthly_revenue,
    SUM(monthly_revenue) OVER (ORDER BY month) AS cumulative,
    ROUND(
        monthly_revenue
        / SUM(monthly_revenue) OVER () * 100
    , 1) AS pct_of_grand_total,
    ROUND(
        SUM(monthly_revenue) OVER (ORDER BY month)
        / SUM(monthly_revenue) OVER () * 100
    , 1) AS cumulative_pct
FROM   monthly
ORDER BY month;
```

**Expected output:**

| month | monthly_revenue | cumulative | pct_of_grand_total | cumulative_pct |
|-------|-----------------|------------|---------------------|----------------|
| 1     | 5050.00         | 5050.00    | 25.4                | 25.4           |
| 2     | 3800.00         | 8850.00    | 19.1                | 44.4           |
| 3     | 2150.00         | 11000.00   | 10.8                | 55.2           |
| 4     | 4080.00         | 15080.00   | 20.5                | 75.7           |
| 5     | 3340.00         | 18420.00   | 16.8                | 92.5           |
| 7     | 1500.00         | 19920.00   | 7.5                 | 100.0          |

---

### Task 4.9
**For each category, show monthly revenue and compare to the previous month within that category.**

```sql
WITH cat_monthly AS (
    SELECT
        p.category,
        d.month,
        SUM(s.revenue) AS monthly_revenue
    FROM   sales    s
    JOIN   products p ON s.product_id = p.product_id
    JOIN   dates    d ON s.date_id    = d.date_id
    GROUP BY p.category, d.month
)
SELECT
    category,
    month,
    monthly_revenue,
    LAG(monthly_revenue, 1) OVER (
        PARTITION BY category
        ORDER BY     month
    ) AS prev_month,
    ROUND(
        (monthly_revenue - LAG(monthly_revenue, 1) OVER (
            PARTITION BY category ORDER BY month
        ))
        / NULLIF(LAG(monthly_revenue, 1) OVER (
            PARTITION BY category ORDER BY month
        ), 0) * 100
    , 1) AS pct_change
FROM   cat_monthly
ORDER BY category, month;
```

**Expected output (Electronics subset):**

| category    | month | monthly_revenue | prev_month | pct_change |
|-------------|-------|-----------------|------------|------------|
| Electronics | 1     | 4150.00         | NULL       | NULL       |
| Electronics | 2     | 2600.00         | 4150.00    | -37.3      |
| Electronics | 3     | 3200.00         | 2600.00    | +23.1      |
| Electronics | 4     | 1450.00         | 3200.00    | -54.7      |
| Electronics | 5     | 660.00          | 1450.00    | -54.5      |

---

### Task 4.10
**Show the cumulative quantity sold across all sales, ordered by sale_id. Also show what % of total quantity each sale represents.**

```sql
SELECT
    s.sale_id,
    d.full_date,
    p.product_name,
    s.quantity,
    SUM(s.quantity) OVER (ORDER BY s.sale_id) AS cumulative_qty,
    ROUND(
        s.quantity / SUM(s.quantity) OVER () * 100
    , 1) AS pct_of_total_qty
FROM   sales    s
JOIN   dates    d ON s.date_id    = d.date_id
JOIN   products p ON s.product_id = p.product_id
ORDER BY s.sale_id;
```

**Expected output (first 5 rows; total quantity = 50):**

| sale_id | full_date  | product_name | quantity | cumulative_qty | pct_of_total_qty |
|---------|------------|--------------|----------|----------------|------------------|
| 1       | 2025-01-10 | Laptop       | 1        | 1              | 2.0              |
| 2       | 2025-01-10 | Paper        | 3        | 4              | 6.0              |
| 3       | 2025-01-25 | Printer      | 2        | 6              | 4.0              |
| 4       | 2025-01-25 | Phone        | 1        | 7              | 2.0              |
| 5       | 2025-02-05 | Desk         | 2        | 9              | 4.0              |

---

# Chapter 5 — Conditional Aggregation (Pivot-style)

**Concept:** `SUM(CASE WHEN category = 'X' THEN value ELSE 0 END)` turns a category row value into a column. Repeat for each category. Use `COUNT(CASE WHEN … THEN 1 END)` for counting (omit ELSE so non-matches become NULL, which COUNT ignores).

---

### Task 5.1
**Show revenue per region broken out into columns by category. One row per region.**

```sql
SELECT
    c.region,
    SUM(CASE WHEN p.category = 'Electronics' THEN s.revenue ELSE 0 END) AS electronics,
    SUM(CASE WHEN p.category = 'Furniture'   THEN s.revenue ELSE 0 END) AS furniture,
    SUM(CASE WHEN p.category = 'Stationery'  THEN s.revenue ELSE 0 END) AS stationery,
    SUM(CASE WHEN p.category = 'Clothing'    THEN s.revenue ELSE 0 END) AS clothing,
    SUM(s.revenue)                                                        AS total
FROM   sales     s
JOIN   customers c ON s.customer_id = c.customer_id
JOIN   products  p ON s.product_id  = p.product_id
GROUP BY c.region
ORDER BY total DESC;
```

**Expected output:**

| region | electronics | furniture | stationery | clothing | total   |
|--------|-------------|-----------|------------|----------|---------|
| East   | 5150.00     | 750.00    | 300.00     | 0.00     | 6200.00 |
| West   | 2560.00     | 2400.00   | 1150.00    | 0.00     | 6110.00 |
| South  | 3650.00     | 0.00      | 0.00       | 980.00   | 4630.00 |
| North  | 700.00      | 1600.00   | 200.00     | 480.00   | 2980.00 |

---

### Task 5.2
**Show revenue per store_type broken out by month. One row per store_type.**

```sql
SELECT
    st.store_type,
    SUM(CASE WHEN d.month = 1 THEN s.revenue ELSE 0 END) AS month_1,
    SUM(CASE WHEN d.month = 2 THEN s.revenue ELSE 0 END) AS month_2,
    SUM(CASE WHEN d.month = 3 THEN s.revenue ELSE 0 END) AS month_3,
    SUM(CASE WHEN d.month = 4 THEN s.revenue ELSE 0 END) AS month_4,
    SUM(CASE WHEN d.month = 5 THEN s.revenue ELSE 0 END) AS month_5,
    SUM(CASE WHEN d.month = 7 THEN s.revenue ELSE 0 END) AS month_7,
    SUM(s.revenue)                                        AS total
FROM   sales  s
JOIN   stores st ON s.store_id = st.store_id
JOIN   dates  d  ON s.date_id  = d.date_id
GROUP BY st.store_type
ORDER BY total DESC;
```

**Expected output:**

| store_type | month_1 | month_2 | month_3 | month_4 | month_5 | month_7 | total    |
|------------|---------|---------|---------|---------|---------|---------|----------|
| Urban      | 4400.00 | 2200.00 | 1250.00 | 2680.00 | 1960.00 | 1300.00 | 13790.00 |
| Suburban   | 650.00  | 1600.00 | 700.00  | 500.00  | 480.00  | 200.00  | 4130.00  |
| Rural      | 0.00    | 0.00    | 200.00  | 0.00    | 1650.00 | 0.00    | 1850.00  |

---

### Task 5.3
**For each customer with purchases, show how many sales were in each quarter. One row per customer.**

```sql
SELECT
    c.customer_id,
    c.segment,
    COUNT(CASE WHEN d.quarter = 1 THEN 1 END) AS q1_sales,
    COUNT(CASE WHEN d.quarter = 2 THEN 1 END) AS q2_sales,
    COUNT(CASE WHEN d.quarter = 3 THEN 1 END) AS q3_sales,
    COUNT(*)                                   AS total_sales
FROM   sales     s
JOIN   customers c ON s.customer_id = c.customer_id
JOIN   dates     d ON s.date_id     = d.date_id
GROUP BY c.customer_id, c.segment
ORDER BY total_sales DESC, c.customer_id;
```

**Expected output:**

| customer_id | segment     | q1_sales | q2_sales | q3_sales | total_sales |
|-------------|-------------|----------|----------|----------|-------------|
| 5           | Consumer    | 2        | 1        | 0        | 3           |
| 1           | Corporate   | 1        | 1        | 1        | 3           |
| 2           | Consumer    | 1        | 1        | 1        | 3           |
| 3           | Home Office | 1        | 1        | 1        | 3           |
| 6           | Home Office | 1        | 1        | 1        | 3           |
| 4           | Corporate   | 1        | 2        | 0        | 3           |
| 7           | Corporate   | 1        | 1        | 0        | 2           |
| 8           | Consumer    | 1        | 1        | 0        | 2           |

---

### Task 5.4
**For each product category, show total quantity and revenue split by store_type (Urban / Suburban / Rural) as columns.**

```sql
SELECT
    p.category,
    SUM(CASE WHEN st.store_type = 'Urban'    THEN s.quantity ELSE 0 END) AS urban_qty,
    SUM(CASE WHEN st.store_type = 'Suburban' THEN s.quantity ELSE 0 END) AS suburban_qty,
    SUM(CASE WHEN st.store_type = 'Rural'    THEN s.quantity ELSE 0 END) AS rural_qty,
    SUM(CASE WHEN st.store_type = 'Urban'    THEN s.revenue  ELSE 0 END) AS urban_rev,
    SUM(CASE WHEN st.store_type = 'Suburban' THEN s.revenue  ELSE 0 END) AS suburban_rev,
    SUM(CASE WHEN st.store_type = 'Rural'    THEN s.revenue  ELSE 0 END) AS rural_rev
FROM   sales    s
JOIN   products p  ON s.product_id = p.product_id
JOIN   stores   st ON s.store_id   = st.store_id
GROUP BY p.category
ORDER BY p.category;
```

**Expected output:**

| category    | urban_qty | suburban_qty | rural_qty | urban_rev | suburban_rev | rural_rev |
|-------------|-----------|--------------|-----------|-----------|--------------|-----------|
| Clothing    | 5         | 0            | 1         | 1080.00   | 0.00         | 200.00    |
| Electronics | 10        | 5            | 2         | 9550.00   | 1060.00      | 1450.00   |
| Furniture   | 6         | 4            | 3         | 3000.00   | 1750.00      | 0.00      |
| Stationery  | 11        | 7            | 0         | 1150.00   | 500.00       | 0.00      |

---

### Task 5.5
**Show each segment's revenue broken out by region. One row per segment.**

```sql
SELECT
    c.segment,
    SUM(CASE WHEN c.region = 'East'  THEN s.revenue ELSE 0 END) AS east,
    SUM(CASE WHEN c.region = 'West'  THEN s.revenue ELSE 0 END) AS west,
    SUM(CASE WHEN c.region = 'North' THEN s.revenue ELSE 0 END) AS north,
    SUM(CASE WHEN c.region = 'South' THEN s.revenue ELSE 0 END) AS south,
    SUM(s.revenue)                                               AS total
FROM   sales     s
JOIN   customers c ON s.customer_id = c.customer_id
GROUP BY c.segment
ORDER BY total DESC;
```

**Expected output:**

| segment     | east    | west    | north   | south   | total   |
|-------------|---------|---------|---------|---------|---------|
| Corporate   | 3250.00 | 0.00    | 880.00  | 2980.00 | 7110.00 |
| Home Office | 0.00    | 4000.00 | 2100.00 | 0.00    | 6100.00 |
| Consumer    | 2950.00 | 2110.00 | 0.00    | 1650.00 | 6710.00 |

---

### Task 5.6
**For each store, show count of sales split by whether revenue was HIGH (> 800) or NORMAL (≤ 800). One row per store.**

```sql
SELECT
    st.city,
    st.store_type,
    COUNT(CASE WHEN s.revenue >  800 THEN 1 END) AS high_count,
    COUNT(CASE WHEN s.revenue <= 800 THEN 1 END) AS normal_count,
    COUNT(*)                                      AS total_count,
    SUM(CASE WHEN s.revenue >  800 THEN s.revenue ELSE 0 END) AS high_revenue,
    SUM(CASE WHEN s.revenue <= 800 THEN s.revenue ELSE 0 END) AS normal_revenue
FROM   sales  s
JOIN   stores st ON s.store_id = st.store_id
GROUP BY st.store_id, st.city, st.store_type
ORDER BY total_count DESC;
```

**Expected output:**

| city      | store_type | high_count | normal_count | total_count | high_revenue | normal_revenue |
|-----------|------------|------------|--------------|-------------|--------------|----------------|
| Melbourne | Urban      | 4          | 2            | 6           | 6550.00      | 1300.00        |
| Sydney    | Urban      | 4          | 2            | 6           | 5350.00      | 390.00         |  
| Melbourne | Suburban   | 2          | 3            | 5           | 1850.00      | 680.00         |
| Brisbane  | Suburban   | 2          | 2            | 4           | 2300.00      | 900.00         |
| Adelaide  | Rural      | 1          | 1            | 2           | 1450.00      | 200.00         |

---

### Task 5.7
**Create a revenue heatmap: one row per product, with columns showing revenue in each month (1, 2, 3, 4, 5, 7).**

```sql
SELECT
    p.product_name,
    p.category,
    SUM(CASE WHEN d.month = 1 THEN s.revenue ELSE 0 END) AS m1,
    SUM(CASE WHEN d.month = 2 THEN s.revenue ELSE 0 END) AS m2,
    SUM(CASE WHEN d.month = 3 THEN s.revenue ELSE 0 END) AS m3,
    SUM(CASE WHEN d.month = 4 THEN s.revenue ELSE 0 END) AS m4,
    SUM(CASE WHEN d.month = 5 THEN s.revenue ELSE 0 END) AS m5,
    SUM(CASE WHEN d.month = 7 THEN s.revenue ELSE 0 END) AS m7,
    SUM(s.revenue)                                        AS total
FROM   sales    s
JOIN   products p ON s.product_id = p.product_id
JOIN   dates    d ON s.date_id    = d.date_id
GROUP BY p.product_id, p.product_name, p.category
ORDER BY total DESC;
```

**Expected output:**

| product_name | category    | m1      | m2      | m3      | m4      | m5      | m7      | total   |
|--------------|-------------|---------|---------|---------|---------|---------|---------|---------|
| Laptop       | Electronics | 1500.00 | 1600.00 | 2200.00 | 1450.00 | 0.00    | 0.00    | 6750.00 |
| Printer      | Electronics | 1800.00 | 0.00    | 1000.00 | 0.00    | 960.00  | 0.00    | 3760.00 |
| Desk         | Furniture   | 0.00    | 1200.00 | 0.00    | 1100.00 | 0.00    | 1300.00 | 3600.00 |

---

### Task 5.8
**For each region, show whether revenue grew or shrank month-over-month using conditional columns. Compare month 1 vs month 2, and month 4 vs month 5.**

```sql
WITH region_monthly AS (
    SELECT
        c.region,
        d.month,
        SUM(s.revenue) AS rev
    FROM   sales s
    JOIN   customers c ON s.customer_id = c.customer_id
    JOIN   dates     d ON s.date_id     = d.date_id
    GROUP BY c.region, d.month
)
SELECT
    region,
    SUM(CASE WHEN month = 1 THEN rev ELSE 0 END) AS m1_rev,
    SUM(CASE WHEN month = 2 THEN rev ELSE 0 END) AS m2_rev,
    CASE
        WHEN SUM(CASE WHEN month = 2 THEN rev ELSE 0 END)
           > SUM(CASE WHEN month = 1 THEN rev ELSE 0 END)
        THEN 'GREW' ELSE 'SHRANK'
    END AS m1_to_m2,
    SUM(CASE WHEN month = 4 THEN rev ELSE 0 END) AS m4_rev,
    SUM(CASE WHEN month = 5 THEN rev ELSE 0 END) AS m5_rev,
    CASE
        WHEN SUM(CASE WHEN month = 5 THEN rev ELSE 0 END)
           > SUM(CASE WHEN month = 4 THEN rev ELSE 0 END)
        THEN 'GREW' ELSE 'SHRANK'
    END AS m4_to_m5
FROM   region_monthly
GROUP BY region
ORDER BY region;
```

**Expected output:**

| region | m1_rev  | m2_rev  | m1_to_m2 | m4_rev  | m5_rev  | m4_to_m5 |
|--------|---------|---------|-----------|---------|---------|-----------|
| East   | 2350.00 | 0.00    | SHRANK    | 2500.00 | 1950.00 | SHRANK    |
| North  | 400.00  | 1600.00 | GREW      | 480.00  | 0.00    | SHRANK    |
| South  | 0.00    | 1200.00 | GREW      | 2380.00 | 180.00  | SHRANK    |
| West   | 2300.00 | 1000.00 | SHRANK    | 1100.00 | 1210.00 | GREW      |

---

### Task 5.9
**For each customer, show total sales count and revenue split into "before April" vs "April onward".**

```sql
SELECT
    c.customer_id,
    c.segment,
    c.region,
    COUNT(CASE WHEN d.month < 4  THEN 1 END)          AS pre_april_count,
    COUNT(CASE WHEN d.month >= 4 THEN 1 END)          AS april_onward_count,
    SUM(CASE WHEN d.month < 4  THEN s.revenue ELSE 0 END) AS pre_april_rev,
    SUM(CASE WHEN d.month >= 4 THEN s.revenue ELSE 0 END) AS april_onward_rev,
    SUM(s.revenue)                                        AS total_rev
FROM   sales     s
JOIN   customers c ON s.customer_id = c.customer_id
JOIN   dates     d ON s.date_id     = d.date_id
GROUP BY c.customer_id, c.segment, c.region
ORDER BY total_rev DESC;
```

**Expected output:**

| customer_id | segment     | region | pre_april_count | april_onward_count | pre_april_rev | april_onward_rev | total_rev |
|-------------|-------------|--------|-----------------|-------------------|---------------|-----------------|-----------|
| 6           | Home Office | West   | 1               | 2                 | 1600.00       | 2400.00         | 4000.00   |
| 1           | Corporate   | East   | 1               | 2                 | 1500.00       | 1750.00         | 3250.00   |
| 4           | Corporate   | South  | 1               | 2                 | 600.00        | 2380.00         | 2980.00   |
| 5           | Consumer    | East   | 2               | 1                 | 2650.00       | 300.00          | 2950.00   |

---

### Task 5.10
**Show for each category: total revenue, count of sales with quantity = 1 (single-unit sales), and count of sales with quantity > 1 (multi-unit sales).**

```sql
SELECT
    p.category,
    SUM(s.revenue)                                      AS total_revenue,
    COUNT(CASE WHEN s.quantity = 1 THEN 1 END)          AS single_unit_sales,
    COUNT(CASE WHEN s.quantity > 1 THEN 1 END)          AS multi_unit_sales,
    SUM(CASE WHEN s.quantity = 1 THEN s.revenue ELSE 0 END) AS single_unit_rev,
    SUM(CASE WHEN s.quantity > 1 THEN s.revenue ELSE 0 END) AS multi_unit_rev
FROM   sales    s
JOIN   products p ON s.product_id = p.product_id
GROUP BY p.category
ORDER BY total_revenue DESC;
```

**Expected output:**

| category    | total_revenue | single_unit_sales | multi_unit_sales | single_unit_rev | multi_unit_rev |
|-------------|---------------|-------------------|------------------|-----------------|----------------|
| Electronics | 12060.00      | 5                 | 4                | 6800.00         | 5260.00        |
| Furniture   | 4750.00       | 2                 | 4                | 2100.00         | 2650.00        |
| Stationery  | 1650.00       | 0                 | 4                | 0.00            | 1650.00        |
| Clothing    | 1460.00       | 3                 | 1                | 1130.00         | 330.00         |

---

# Chapter 6 — Date Arithmetic & Time-Series Gaps

**Concept:** `DATEDIFF(date1, date2)` returns days between dates. `DATE_ADD(date, INTERVAL n DAY)` shifts a date. Gap detection: build a complete date spine with a recursive CTE, LEFT JOIN to actuals, filter `IS NULL` for gaps.

---

### Task 6.1
**For each customer with sales, calculate the number of days between their first and last sale.**

```sql
WITH cust_range AS (
    SELECT
        s.customer_id,
        MIN(d.full_date) AS first_sale,
        MAX(d.full_date) AS last_sale
    FROM   sales s
    JOIN   dates d ON s.date_id = d.date_id
    GROUP BY s.customer_id
)
SELECT
    c.customer_id,
    c.segment,
    c.region,
    cr.first_sale,
    cr.last_sale,
    DATEDIFF(cr.last_sale, cr.first_sale) AS active_span_days
FROM   cust_range cr
JOIN   customers  c ON cr.customer_id = c.customer_id
ORDER BY active_span_days DESC;
```

**Expected output:**

| customer_id | segment     | region | first_sale | last_sale  | active_span_days |
|-------------|-------------|--------|------------|------------|------------------|
| 3           | Home Office | North  | 2025-02-05 | 2025-07-04 | 149              |
| 6           | Home Office | West   | 2025-02-20 | 2025-07-19 | 149              |
| 2           | Consumer    | West   | 2025-01-10 | 2025-05-29 | 139              |
| 1           | Corporate   | East   | 2025-01-10 | 2025-05-07 | 117              |
| 4           | Corporate   | South  | 2025-02-05 | 2025-05-29 | 113              |
| 8           | Consumer    | South  | 2025-03-08 | 2025-05-07 | 60               |
| 7           | Corporate   | North  | 2025-02-20 | 2025-04-18 | 57               |
| 5           | Consumer    | East   | 2025-01-25 | 2025-04-03 | 68               |

---

### Task 6.2
**List all months in the dates table (months 1–7) that had no sales. Use a LEFT JOIN gap-detection pattern.**

```sql
WITH all_months AS (
    SELECT DISTINCT month
    FROM   dates
),
months_with_sales AS (
    SELECT DISTINCT d.month
    FROM   sales s
    JOIN   dates d ON s.date_id = d.date_id
)
SELECT
    am.month AS missing_month
FROM       all_months       am
LEFT JOIN  months_with_sales ms ON am.month = ms.month
WHERE      ms.month IS NULL
ORDER BY   am.month;
```

**Expected output:**

| missing_month |
|---------------|
| 6             |

---

### Task 6.3
**For each sale, calculate how many days it occurred after the very first sale in the entire dataset (2025-01-10).**

```sql
WITH first_sale_date AS (
    SELECT MIN(d.full_date) AS baseline
    FROM   sales s
    JOIN   dates d ON s.date_id = d.date_id
)
SELECT
    s.sale_id,
    d.full_date,
    p.product_name,
    s.revenue,
    DATEDIFF(d.full_date, fsd.baseline) AS days_from_start
FROM   sales            s
JOIN   dates            d   ON s.date_id    = d.date_id
JOIN   products         p   ON s.product_id = p.product_id
CROSS JOIN first_sale_date  fsd
ORDER BY d.full_date, s.sale_id;
```

**Expected output (first 5 rows):**

| sale_id | full_date  | product_name | revenue | days_from_start |
|---------|------------|--------------|---------|-----------------|
| 1       | 2025-01-10 | Laptop       | 1500.00 | 0               |
| 2       | 2025-01-10 | Paper        | 900.00  | 0               |
| 3       | 2025-01-25 | Printer      | 1800.00 | 15              |
| 4       | 2025-01-25 | Phone        | 850.00  | 15              |
| 5       | 2025-02-05 | Desk         | 1200.00 | 26              |

---

### Task 6.4
**For customers with multiple sales, calculate the average days between consecutive sales (using LAG + DATEDIFF).**

```sql
WITH sale_gaps AS (
    SELECT
        s.customer_id,
        d.full_date,
        DATEDIFF(
            d.full_date,
            LAG(d.full_date) OVER (
                PARTITION BY s.customer_id
                ORDER BY     d.full_date, s.sale_id
            )
        ) AS days_since_prev
    FROM   sales s
    JOIN   dates d ON s.date_id = d.date_id
)
SELECT
    sg.customer_id,
    c.segment,
    c.region,
    ROUND(AVG(sg.days_since_prev), 0) AS avg_days_between_sales,
    COUNT(sg.days_since_prev)         AS gap_count
FROM   sale_gaps sg
JOIN   customers c ON sg.customer_id = c.customer_id
GROUP BY sg.customer_id, c.segment, c.region
HAVING COUNT(sg.days_since_prev) >= 1
ORDER BY avg_days_between_sales DESC;
```

**Expected output:**

| customer_id | segment     | region | avg_days_between_sales | gap_count |
|-------------|-------------|--------|------------------------|-----------|
| 2           | Consumer    | West   | 70                     | 2         |
| 1           | Corporate   | East   | 59                     | 2         |
| 3           | Home Office | North  | 75                     | 2         |
| 6           | Home Office | West   | 75                     | 2         |
| 4           | Corporate   | South  | 57                     | 2         |
| 5           | Consumer    | East   | 34                     | 2         |
| 7           | Corporate   | North  | 57                     | 1         |
| 8           | Consumer    | South  | 60                     | 1         |

---

### Task 6.5
**Generate a date spine for months 1–7 using a recursive CTE. LEFT JOIN to actual sales data. Show each month with its revenue (0 if no sales).**

```sql
WITH RECURSIVE month_spine AS (
    SELECT 1 AS month
    UNION ALL
    SELECT month + 1
    FROM   month_spine
    WHERE  month < 7
),
actual_monthly AS (
    SELECT
        d.month,
        SUM(s.revenue) AS revenue
    FROM   sales s
    JOIN   dates d ON s.date_id = d.date_id
    GROUP BY d.month
)
SELECT
    ms.month,
    COALESCE(am.revenue, 0) AS monthly_revenue,
    CASE WHEN am.revenue IS NULL THEN 'NO SALES' ELSE 'HAS SALES' END AS status
FROM       month_spine   ms
LEFT JOIN  actual_monthly am ON ms.month = am.month
ORDER BY   ms.month;
```

**Expected output:**

| month | monthly_revenue | status    |
|-------|-----------------|-----------|
| 1     | 5050.00         | HAS SALES |
| 2     | 3800.00         | HAS SALES |
| 3     | 2150.00         | HAS SALES |
| 4     | 4080.00         | HAS SALES |
| 5     | 3340.00         | HAS SALES |
| 6     | 0.00            | NO SALES  |
| 7     | 1500.00         | HAS SALES |

---

### Task 6.6
**For each sale, show how many days remain until the end of that sale's month.**

```sql
SELECT
    s.sale_id,
    d.full_date,
    p.product_name,
    LAST_DAY(d.full_date)                              AS month_end,
    DATEDIFF(LAST_DAY(d.full_date), d.full_date)       AS days_until_month_end
FROM   sales    s
JOIN   dates    d ON s.date_id    = d.date_id
JOIN   products p ON s.product_id = p.product_id
ORDER BY d.full_date, s.sale_id;
```

**Expected output (first 6 rows):**

| sale_id | full_date  | product_name | month_end  | days_until_month_end |
|---------|------------|--------------|------------|----------------------|
| 1       | 2025-01-10 | Laptop       | 2025-01-31 | 21                   |
| 2       | 2025-01-10 | Paper        | 2025-01-31 | 21                   |
| 3       | 2025-01-25 | Printer      | 2025-01-31 | 6                    |
| 4       | 2025-01-25 | Phone        | 2025-01-31 | 6                    |
| 5       | 2025-02-05 | Desk         | 2025-02-28 | 23                   |
| 6       | 2025-02-05 | Jacket       | 2025-02-28 | 23                   |

---

### Task 6.7
**For each store, find months where the store had no sales, using a cross-join of all stores × all sale months.**

```sql
WITH sale_months AS (
    SELECT DISTINCT d.month
    FROM   sales s
    JOIN   dates d ON s.date_id = d.date_id
),
store_month_grid AS (
    SELECT st.store_id, st.city, st.store_type, sm.month
    FROM   stores     st
    CROSS JOIN sale_months sm
),
store_month_actuals AS (
    SELECT DISTINCT s.store_id, d.month
    FROM   sales s
    JOIN   dates d ON s.date_id = d.date_id
)
SELECT
    g.city,
    g.store_type,
    g.month AS month_without_sales
FROM       store_month_grid    g
LEFT JOIN  store_month_actuals a ON g.store_id = a.store_id
                                AND g.month    = a.month
WHERE      a.store_id IS NULL
ORDER BY   g.city, g.month;
```

**Expected output:**

| city      | store_type | month_without_sales |
|-----------|------------|---------------------|
| Adelaide  | Rural      | 1                   |
| Adelaide  | Rural      | 2                   |
| Adelaide  | Rural      | 4                   |
| Adelaide  | Rural      | 7                   |
| Brisbane  | Suburban   | 1                   |
| Brisbane  | Suburban   | 5                   |
| Melbourne | Suburban   | 3                   |
| Melbourne | Suburban   | 7                   |

---

### Task 6.8
**Calculate how many days ago each sale occurred relative to the latest sale date in the dataset (2025-07-19).**

```sql
WITH latest_date AS (
    SELECT MAX(d.full_date) AS latest
    FROM   sales s
    JOIN   dates d ON s.date_id = d.date_id
)
SELECT
    s.sale_id,
    d.full_date,
    p.product_name,
    s.revenue,
    DATEDIFF(ld.latest, d.full_date) AS days_before_latest
FROM   sales       s
JOIN   dates       d  ON s.date_id    = d.date_id
JOIN   products    p  ON s.product_id = p.product_id
CROSS JOIN latest_date ld
ORDER BY days_before_latest ASC
LIMIT 8;
```

**Expected output:**

| sale_id | full_date  | product_name | revenue | days_before_latest |
|---------|------------|--------------|---------|-------------------|
| 22      | 2025-07-19 | Desk         | 1300.00 | 0                 |
| 21      | 2025-07-04 | Pen          | 200.00  | 15                |
| 19      | 2025-05-29 | Printer      | 960.00  | 51                |
| 20      | 2025-05-29 | Pants        | 180.00  | 51                |
| 17      | 2025-05-07 | Chair        | 750.00  | 73                |
| 18      | 2025-05-07 | Laptop       | 1450.00 | 73                |
| 13      | 2025-04-03 | Laptop       | 2200.00 | 107               |
| 14      | 2025-04-03 | Paper        | 300.00  | 107               |

---

### Task 6.9
**For each customer, show the date of their most recent sale and flag whether they have been inactive for more than 90 days (relative to the dataset's last date: 2025-07-19).**

```sql
WITH last_sales AS (
    SELECT
        s.customer_id,
        MAX(d.full_date) AS last_sale_date
    FROM   sales s
    JOIN   dates d ON s.date_id = d.date_id
    GROUP BY s.customer_id
)
SELECT
    c.customer_id,
    c.segment,
    c.region,
    ls.last_sale_date,
    DATEDIFF('2025-07-19', ls.last_sale_date) AS days_since_last_sale,
    CASE
        WHEN DATEDIFF('2025-07-19', ls.last_sale_date) > 90
        THEN 'INACTIVE'
        ELSE 'ACTIVE'
    END AS status
FROM   last_sales ls
JOIN   customers  c ON ls.customer_id = c.customer_id
ORDER BY days_since_last_sale DESC;
```

**Expected output:**

| customer_id | segment     | region | last_sale_date | days_since_last_sale | status   |
|-------------|-------------|--------|----------------|----------------------|----------|
| 7           | Corporate   | North  | 2025-04-18     | 92                   | INACTIVE |
| 5           | Consumer    | East   | 2025-04-03     | 107                  | INACTIVE |
| 8           | Consumer    | South  | 2025-05-07     | 73                   | ACTIVE   |
| 1           | Corporate   | East   | 2025-05-07     | 73                   | ACTIVE   |
| 4           | Corporate   | South  | 2025-05-29     | 51                   | ACTIVE   |
| 2           | Consumer    | West   | 2025-05-29     | 51                   | ACTIVE   |
| 3           | Home Office | North  | 2025-07-04     | 15                   | ACTIVE   |
| 6           | Home Office | West   | 2025-07-19     | 0                    | ACTIVE   |

---

### Task 6.10
**Find the longest gap (in days) between consecutive sales dates in the entire dataset. Show the gap start date, gap end date, and number of days.**

```sql
WITH sale_dates AS (
    SELECT DISTINCT d.full_date
    FROM   sales s
    JOIN   dates d ON s.date_id = d.date_id
),
date_gaps AS (
    SELECT
        full_date                                               AS gap_start,
        LEAD(full_date, 1) OVER (ORDER BY full_date)           AS gap_end,
        DATEDIFF(
            LEAD(full_date, 1) OVER (ORDER BY full_date),
            full_date
        )                                                       AS gap_days
    FROM sale_dates
)
SELECT
    gap_start,
    gap_end,
    gap_days
FROM   date_gaps
WHERE  gap_end IS NOT NULL
ORDER BY gap_days DESC
LIMIT 3;
```

**Expected output:**

| gap_start  | gap_end    | gap_days |
|------------|------------|----------|
| 2025-05-29 | 2025-07-04 | 36       |
| 2025-04-18 | 2025-05-07 | 19       |
| 2025-04-03 | 2025-04-18 | 15       |

---

*End of Level 2 SQL Tasks — 60 tasks across 6 chapters.*
*Schema: Retail Analytics Warehouse · MySQL 8.0*
*Grand total revenue verified: 19,920.00*
