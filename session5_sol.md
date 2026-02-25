---
layout: default
title: MySQL Tasks solutions
---

-- ============================================================
--  Retail Analytics Warehouse — Solutions (MySQL 8.0)
--  All 30 tasks, organised by section.
--  Expected output rows shown in comments above each query.
-- ============================================================


-- ════════════════════════════════════════════════════════════
--  A) FILTERING & CONDITIONS
-- ════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────
-- Task 1 · Basic filter (WHERE)
-- Return sale_id, quantity, revenue where quantity >= 2
-- Expected: 14 rows
-- ────────────────────────────────────────────────────────────
SELECT
    sale_id,
    quantity,
    revenue
FROM sales
WHERE quantity >= 2
ORDER BY sale_id;


-- ────────────────────────────────────────────────────────────
-- Task 2 · Filter by dimension attribute (JOIN + WHERE)
-- sales made in Melbourne → join sales to stores, filter city
-- Expected: 10 rows (stores 1 and 3 are both Melbourne)
-- ────────────────────────────────────────────────────────────
SELECT
    s.sale_id,
    st.city,
    s.revenue
FROM  sales  s
JOIN  stores st ON s.store_id = st.store_id
WHERE st.city = 'Melbourne'
ORDER BY s.sale_id;


-- ────────────────────────────────────────────────────────────
-- Task 3 · IN condition
-- sales where store_id IN (1, 3)
-- Expected: 10 rows
-- ────────────────────────────────────────────────────────────
SELECT
    sale_id,
    store_id,
    revenue
FROM sales
WHERE store_id IN (1, 3)
ORDER BY sale_id;


-- ────────────────────────────────────────────────────────────
-- Task 4 · BETWEEN on dates
-- sales between 2025-02-01 and 2025-04-30 (inclusive)
-- Expected: 12 rows (date_ids 3–8, i.e., Feb, Mar, Apr)
-- ────────────────────────────────────────────────────────────
SELECT
    s.sale_id,
    d.full_date,
    s.revenue
FROM  sales s
JOIN  dates d ON s.date_id = d.date_id
WHERE d.full_date BETWEEN '2025-02-01' AND '2025-04-30'
ORDER BY d.full_date, s.sale_id;


-- ────────────────────────────────────────────────────────────
-- Task 5 · Multiple conditions (AND / OR)
-- (quantity >= 2 AND revenue >= 500) OR (quantity = 1 AND revenue >= 1400)
-- Expected: 13 rows
-- ────────────────────────────────────────────────────────────
SELECT
    sale_id,
    revenue
FROM sales
WHERE (quantity >= 2 AND revenue >= 500)
   OR (quantity  = 1 AND revenue >= 1400)
ORDER BY sale_id;


-- ────────────────────────────────────────────────────────────
-- Task 6 · Pattern match (LIKE)
-- Products whose name starts with 'P'
-- Expected: 5 rows — Printer, Phone, Paper, Pen, Pants
-- ────────────────────────────────────────────────────────────
SELECT
    product_id,
    product_name
FROM products
WHERE product_name LIKE 'P%'
ORDER BY product_name;


-- ════════════════════════════════════════════════════════════
--  B) ORDERING & LIMITING
-- ════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────
-- Task 7 · ORDER BY single column
-- All products ordered by category ASC then product_name ASC
-- Expected: 10 rows
-- ────────────────────────────────────────────────────────────
SELECT
    product_id,
    category,
    product_name
FROM products
ORDER BY category ASC, product_name ASC;


-- ────────────────────────────────────────────────────────────
-- Task 8 · ORDER BY computed value
-- Return sale_id, revenue, quantity, unit_price DESC
-- ────────────────────────────────────────────────────────────
SELECT
    sale_id,
    revenue,
    quantity,
    ROUND(revenue / quantity, 2) AS unit_price
FROM sales
ORDER BY unit_price DESC;


-- ────────────────────────────────────────────────────────────
-- Task 9 · Top-N (LIMIT)
-- Top 3 sales by revenue — return sale_id, revenue, full_date
-- Expected: sale_ids 13 (2200), 3 (1800), 7 (1600)
-- ────────────────────────────────────────────────────────────
SELECT
    s.sale_id,
    s.revenue,
    d.full_date
FROM  sales s
JOIN  dates d ON s.date_id = d.date_id
ORDER BY s.revenue DESC
LIMIT 3;


-- ────────────────────────────────────────────────────────────
-- Task 10 · Bottom-N with tie awareness
-- Bottom 3 sales by quantity; tie-break by revenue ASC
-- Expected: sale_ids 20 (qty=1 rev=180), 10 (qty=1 rev=200), 4 (qty=1 rev=850)
-- ────────────────────────────────────────────────────────────
SELECT
    sale_id,
    quantity,
    revenue
FROM sales
ORDER BY quantity ASC, revenue ASC
LIMIT 3;


-- ════════════════════════════════════════════════════════════
--  C) AGGREGATION
-- ════════════════════════════════════════════════════════════

-- ── C1: COUNT ────────────────────────────────────────────────

-- ────────────────────────────────────────────────────────────
-- Task 11 · COUNT rows by store_type
-- Expected: Urban=12, Suburban=8, Rural=2
-- ────────────────────────────────────────────────────────────
SELECT
    st.store_type,
    COUNT(s.sale_id) AS sales_count
FROM  sales  s
JOIN  stores st ON s.store_id = st.store_id
GROUP BY st.store_type
ORDER BY sales_count DESC;


-- ────────────────────────────────────────────────────────────
-- Task 12 · COUNT DISTINCT customers per region
-- Only customers with at least one sale are counted
-- Expected: East=2, West=2, North=2, South=2
-- ────────────────────────────────────────────────────────────
SELECT
    c.region,
    COUNT(DISTINCT s.customer_id) AS distinct_customers
FROM  sales     s
JOIN  customers c ON s.customer_id = c.customer_id
GROUP BY c.region
ORDER BY c.region;


-- ── C2: SUM ──────────────────────────────────────────────────

-- ────────────────────────────────────────────────────────────
-- Task 13 · Total revenue by category
-- Expected: Electronics=12060, Furniture=4750, Stationery=1650, Clothing=1460
-- ────────────────────────────────────────────────────────────
SELECT
    p.category,
    SUM(s.revenue) AS total_revenue
FROM  sales    s
JOIN  products p ON s.product_id = p.product_id
GROUP BY p.category
ORDER BY total_revenue DESC;


-- ────────────────────────────────────────────────────────────
-- Task 14 · Total quantity by month (2025 only)
-- Expected: Jan=7, Feb=10, Mar=10, Apr=7, May=7, Jul=6
-- (June has no sales)
-- ────────────────────────────────────────────────────────────
SELECT
    d.month,
    SUM(s.quantity) AS total_quantity
FROM  sales s
JOIN  dates d ON s.date_id = d.date_id
WHERE d.year = 2025
GROUP BY d.month
ORDER BY d.month;


-- ── C3: AVG ──────────────────────────────────────────────────

-- ────────────────────────────────────────────────────────────
-- Task 15 · Average revenue per sale by segment
-- Expected: Corporate≈888.75, Consumer≈838.75, Home Office≈1016.67
-- ────────────────────────────────────────────────────────────
SELECT
    c.segment,
    ROUND(AVG(s.revenue), 2) AS avg_revenue_per_sale
FROM  sales     s
JOIN  customers c ON s.customer_id = c.customer_id
GROUP BY c.segment
ORDER BY avg_revenue_per_sale DESC;


-- ────────────────────────────────────────────────────────────
-- Task 16 · Average unit price by category (computed AVG)
-- AVG(revenue / quantity) per category
-- Expected: Electronics≈1092.22, Furniture=540, Clothing=205, Stationery=125
-- ────────────────────────────────────────────────────────────
SELECT
    p.category,
    ROUND(AVG(s.revenue / s.quantity), 2) AS avg_unit_price
FROM  sales    s
JOIN  products p ON s.product_id = p.product_id
GROUP BY p.category
ORDER BY avg_unit_price DESC;


-- ── C4: MIN / MAX ────────────────────────────────────────────

-- ────────────────────────────────────────────────────────────
-- Task 17 · First and last sale date
-- Expected: earliest=2025-01-10, latest=2025-07-19
-- ────────────────────────────────────────────────────────────
SELECT
    MIN(d.full_date) AS earliest_sale_date,
    MAX(d.full_date) AS latest_sale_date
FROM  sales s
JOIN  dates d ON s.date_id = d.date_id;


-- ────────────────────────────────────────────────────────────
-- Task 18 · Max revenue per store
-- Expected: store1=2200, store2=1600, store3=850, store4=1200, store5=1450
-- ────────────────────────────────────────────────────────────
SELECT
    store_id,
    MAX(revenue) AS max_revenue
FROM sales
GROUP BY store_id
ORDER BY store_id;


-- ── C5: HAVING ───────────────────────────────────────────────

-- ────────────────────────────────────────────────────────────
-- Task 19 · Categories with total revenue > 1000
-- Expected: all 4 categories (Electronics, Furniture, Stationery, Clothing)
-- ────────────────────────────────────────────────────────────
SELECT
    p.category,
    SUM(s.revenue) AS total_revenue
FROM  sales    s
JOIN  products p ON s.product_id = p.product_id
GROUP BY p.category
HAVING SUM(s.revenue) > 1000
ORDER BY total_revenue DESC;


-- ────────────────────────────────────────────────────────────
-- Task 20 · Stores with at least 3 sales
-- Expected: store1=6, store2=6, store3=4, store4=4 (store5=2, excluded)
-- ────────────────────────────────────────────────────────────
SELECT
    store_id,
    COUNT(*) AS sales_count
FROM sales
GROUP BY store_id
HAVING COUNT(*) >= 3
ORDER BY sales_count DESC, store_id;


-- ════════════════════════════════════════════════════════════
--  D) JOINS
-- ════════════════════════════════════════════════════════════

-- ── INNER JOIN ───────────────────────────────────────────────
-- Meaning: return only rows that have a match in BOTH tables.
-- Rows with no matching key on either side are excluded.

-- ────────────────────────────────────────────────────────────
-- Task 21 · INNER JOIN sales + products
-- Return sale_id, product_name, revenue for all sales
-- Expected: 22 rows (all sales have a matching product)
-- ────────────────────────────────────────────────────────────
SELECT
    s.sale_id,
    p.product_name,
    s.revenue
FROM  sales    s
JOIN  products p ON s.product_id = p.product_id
ORDER BY s.sale_id;


-- ────────────────────────────────────────────────────────────
-- Task 22 · INNER JOIN across multiple dimensions
-- sale_id, full_date, city, product_name, revenue
-- Joins: sales → dates, stores, products
-- Expected: 22 rows
-- ────────────────────────────────────────────────────────────
SELECT
    s.sale_id,
    d.full_date,
    st.city,
    p.product_name,
    s.revenue
FROM  sales    s
JOIN  dates    d  ON s.date_id    = d.date_id
JOIN  stores   st ON s.store_id   = st.store_id
JOIN  products p  ON s.product_id = p.product_id
ORDER BY s.sale_id;


-- ── LEFT JOIN ────────────────────────────────────────────────
-- Meaning: return ALL rows from the left table, plus matching rows
-- from the right. Where there is no match, right-side columns are NULL.

-- ────────────────────────────────────────────────────────────
-- Task 23 · LEFT JOIN customers → sales (include zero-sale customers)
-- customer_id, segment, COUNT(sale_id) AS sales_count
-- Expected: 10 rows — customers 9 & 10 have sales_count = 0
-- ────────────────────────────────────────────────────────────
SELECT
    c.customer_id,
    c.segment,
    COUNT(s.sale_id) AS sales_count
FROM  customers c
LEFT JOIN sales s ON c.customer_id = s.customer_id
GROUP BY c.customer_id, c.segment
ORDER BY c.customer_id;


-- ────────────────────────────────────────────────────────────
-- Task 24 · LEFT JOIN products → sales (include zero-sale products)
-- product_id, product_name, qty_sold (0 if never sold)
-- Expected: 10 rows — product 10 (Bookshelf) has qty_sold = 0
-- ────────────────────────────────────────────────────────────
SELECT
    p.product_id,
    p.product_name,
    COALESCE(SUM(s.quantity), 0) AS qty_sold
FROM  products p
LEFT JOIN sales s ON p.product_id = s.product_id
GROUP BY p.product_id, p.product_name
ORDER BY p.product_id;



-- ════════════════════════════════════════════════════════════
--  E) TROUBLESHOOTING / BUSINESS PROBLEM PATTERNS
-- ════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────
-- Task 27 · Unit price anomaly flag (CASE)
-- HIGH if unit_price > 800, NORMAL otherwise
-- Expected: 22 rows; 7 flagged HIGH (sale_ids 1,3,4,7,13,15,18)
-- ────────────────────────────────────────────────────────────
SELECT
    sale_id,
    revenue,
    quantity,
    ROUND(revenue / quantity, 2) AS unit_price,
    CASE
        WHEN revenue / quantity > 800 THEN 'HIGH'
        ELSE 'NORMAL'
    END AS price_flag
FROM sales
ORDER BY unit_price DESC;


-- ────────────────────────────────────────────────────────────
-- Task 28 · Segment share of revenue
-- segment, segment_revenue, total_revenue, pct_of_total
-- Uses a window function (SUM OVER()) to get the grand total
-- in the same pass — no subquery needed.
-- Expected: Corporate≈35.7%, Consumer≈33.7%, Home Office≈30.6%
-- ────────────────────────────────────────────────────────────
SELECT
    c.segment,
    SUM(s.revenue)                             AS segment_revenue,
    SUM(SUM(s.revenue)) OVER ()                AS total_revenue,
    ROUND(
        SUM(s.revenue)
        / SUM(SUM(s.revenue)) OVER ()
        * 100
    , 1)                                       AS pct_of_total
FROM  sales     s
JOIN  customers c ON s.customer_id = c.customer_id
GROUP BY c.segment
ORDER BY segment_revenue DESC;

-- ── Alternative: CTE approach (avoids window functions) ──────
WITH totals AS (
    SELECT SUM(revenue) AS grand_total FROM sales
),
by_seg AS (
    SELECT
        c.segment,
        SUM(s.revenue) AS segment_revenue
    FROM  sales     s
    JOIN  customers c ON s.customer_id = c.customer_id
    GROUP BY c.segment
)
SELECT
    bs.segment,
    bs.segment_revenue,
    t.grand_total        AS total_revenue,
    ROUND(bs.segment_revenue / t.grand_total * 100, 1) AS pct_of_total
FROM  by_seg bs
CROSS JOIN totals t
ORDER BY bs.segment_revenue DESC;


-- ────────────────────────────────────────────────────────────
-- Task 29 · Find months present in dates that have NO sales
-- Strategy: get all months from dates table, LEFT JOIN to sales,
-- keep only months where no sale exists.
-- Expected: 1 row — month = 6 (June)
-- ────────────────────────────────────────────────────────────
SELECT DISTINCT d.month
FROM  dates d
LEFT JOIN sales s ON d.date_id = s.date_id
WHERE s.sale_id IS NULL
ORDER BY d.month;


-- ────────────────────────────────────────────────────────────
-- Task 30 · Reconciliation check
-- Compute total revenue two ways in one row and show the diff.
-- Method A: SUM(revenue)
-- Method B: SUM(quantity * (revenue / quantity))
-- Expected: total_a = total_b = 19920.00, diff = 0.00
-- ────────────────────────────────────────────────────────────
SELECT
    ROUND(SUM(revenue),                          2) AS total_a,
    ROUND(SUM(quantity * (revenue / quantity)),  2) AS total_b,
    ROUND(
        SUM(revenue)
        - SUM(quantity * (revenue / quantity))
    , 2)                                           AS diff
FROM sales;


-- ============================================================
--  END OF SOLUTIONS
-- ============================================================
