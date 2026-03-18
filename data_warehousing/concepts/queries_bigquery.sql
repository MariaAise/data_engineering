-- ============================================================
-- STAR SCHEMA QUERIES — Google BigQuery
-- ============================================================
-- Upload the CSVs into a BigQuery dataset called `coffee_star`
-- then run these queries. Same logic as MySQL with BQ dialect.

-- ============================================================
-- Q1: BASIC AGGREGATION
-- Total revenue by product category
-- ============================================================
SELECT 
    p.category,
    COUNT(*) AS transactions,
    SUM(f.quantity) AS units_sold,
    SUM(f.line_total) AS revenue
FROM `coffee_star.fact_sales` f
JOIN `coffee_star.dim_product` p ON f.product_key = p.product_key
GROUP BY p.category
ORDER BY revenue DESC;


-- ============================================================
-- Q2: ROLL-UP — traverse the time hierarchy
-- Revenue by year → quarter → month
-- ============================================================
SELECT 
    d.year,
    d.quarter,
    d.month_name,
    SUM(f.line_total) AS revenue
FROM `coffee_star.fact_sales` f
JOIN `coffee_star.dim_date` d ON f.date_key = d.date_key
GROUP BY d.year, d.quarter, d.month_name
ORDER BY d.year, d.quarter, d.month_name;


-- ============================================================
-- Q3: DRILL-DOWN — geographic hierarchy
-- Revenue: country → state → city → store
-- ============================================================
SELECT 
    s.country,
    s.state,
    s.city,
    s.store_name,
    SUM(f.line_total) AS revenue
FROM `coffee_star.fact_sales` f
JOIN `coffee_star.dim_store` s ON f.store_key = s.store_key
GROUP BY s.country, s.state, s.city, s.store_name
ORDER BY s.state, s.city, revenue DESC;


-- ============================================================
-- Q4: SLICE — fix one dimension
-- All sales in December 2024 only
-- ============================================================
SELECT 
    p.category,
    s.city,
    SUM(f.line_total) AS revenue
FROM `coffee_star.fact_sales` f
JOIN `coffee_star.dim_date` d    ON f.date_key = d.date_key
JOIN `coffee_star.dim_product` p ON f.product_key = p.product_key
JOIN `coffee_star.dim_store` s   ON f.store_key = s.store_key
WHERE d.month = 12 AND d.year = 2024
GROUP BY p.category, s.city
ORDER BY s.city, revenue DESC;


-- ============================================================
-- Q5: DICE — filter on multiple dimensions
-- Coffee sales in Melbourne and Sydney, Q4 only
-- ============================================================
SELECT 
    s.city,
    p.subcategory,
    d.quarter,
    SUM(f.quantity) AS units,
    SUM(f.line_total) AS revenue
FROM `coffee_star.fact_sales` f
JOIN `coffee_star.dim_date` d    ON f.date_key = d.date_key
JOIN `coffee_star.dim_product` p ON f.product_key = p.product_key
JOIN `coffee_star.dim_store` s   ON f.store_key = s.store_key
WHERE p.category = 'Coffee'
  AND s.city IN ('Melbourne', 'Sydney')
  AND d.quarter = 'Q4'
GROUP BY s.city, p.subcategory, d.quarter
ORDER BY s.city, revenue DESC;


-- ============================================================
-- Q6: PIVOT — categories as columns (BigQuery syntax)
-- ============================================================
SELECT 
    d.year,
    d.month_name,
    SUM(IF(p.category = 'Coffee',   f.line_total, 0)) AS coffee,
    SUM(IF(p.category = 'Tea',      f.line_total, 0)) AS tea,
    SUM(IF(p.category = 'Pastry',   f.line_total, 0)) AS pastry,
    SUM(IF(p.category = 'Sandwich', f.line_total, 0)) AS sandwich,
    SUM(IF(p.category = 'Beverage', f.line_total, 0)) AS beverage,
    SUM(f.line_total) AS total
FROM `coffee_star.fact_sales` f
JOIN `coffee_star.dim_date` d    ON f.date_key = d.date_key
JOIN `coffee_star.dim_product` p ON f.product_key = p.product_key
GROUP BY d.year, d.month, d.month_name
ORDER BY d.year, d.month;


-- ============================================================
-- Q7: GROUPING SETS — BigQuery supports full ROLLUP
-- Revenue by city and store with subtotals
-- ============================================================
SELECT 
    COALESCE(s.city, '** ALL CITIES **') AS city,
    COALESCE(s.store_name, '** City Total **') AS store,
    SUM(f.line_total) AS revenue
FROM `coffee_star.fact_sales` f
JOIN `coffee_star.dim_store` s ON f.store_key = s.store_key
GROUP BY ROLLUP(s.city, s.store_name)
ORDER BY s.city, s.store_name;


-- ============================================================
-- Q8: LOYALTY ANALYSIS
-- ============================================================
SELECT 
    c.loyalty_tier,
    COUNT(DISTINCT f.sale_id) AS transactions,
    SUM(f.line_total) AS revenue,
    ROUND(AVG(f.line_total), 2) AS avg_line_total
FROM `coffee_star.fact_sales` f
JOIN `coffee_star.dim_customer` c ON f.customer_key = c.customer_key
GROUP BY c.loyalty_tier
ORDER BY revenue DESC;


-- ============================================================
-- Q9: PEAK HOUR ANALYSIS
-- ============================================================
SELECT 
    t.period,
    CASE WHEN t.is_peak_hour = 1 THEN 'Peak' ELSE 'Off-Peak' END AS peak_status,
    COUNT(*) AS transactions,
    SUM(f.line_total) AS revenue,
    ROUND(AVG(f.line_total), 2) AS avg_item_value
FROM `coffee_star.fact_sales` f
JOIN `coffee_star.dim_time` t ON f.time_key = t.time_key
GROUP BY t.period, t.is_peak_hour
ORDER BY 
  CASE t.period WHEN 'morning' THEN 1 WHEN 'afternoon' THEN 2 ELSE 3 END,
  t.is_peak_hour DESC;


-- ============================================================
-- Q10: WINDOW FUNCTION — monthly trend with running total
-- ============================================================
SELECT 
    year,
    month,
    month_name,
    monthly_revenue,
    SUM(monthly_revenue) OVER (PARTITION BY year ORDER BY month) AS ytd_revenue,
    ROUND(
        (monthly_revenue - LAG(monthly_revenue) OVER (ORDER BY year, month)) 
        / LAG(monthly_revenue) OVER (ORDER BY year, month) * 100, 1
    ) AS mom_growth_pct
FROM (
    SELECT 
        d.year,
        d.month,
        d.month_name,
        SUM(f.line_total) AS monthly_revenue
    FROM `coffee_star.fact_sales` f
    JOIN `coffee_star.dim_date` d ON f.date_key = d.date_key
    GROUP BY d.year, d.month, d.month_name
) monthly
ORDER BY year, month;


-- ============================================================
-- BIGQUERY-SPECIFIC: PARTITIONING AND CLUSTERING
-- ============================================================
-- When creating the fact table in BigQuery for production use,
-- you would partition and cluster for cost and performance:
--
-- CREATE TABLE coffee_star.fact_sales_optimized
-- PARTITION BY RANGE_BUCKET(date_key, GENERATE_ARRAY(20230101, 20250101, 100))
-- CLUSTER BY store_key, product_key
-- AS SELECT * FROM coffee_star.fact_sales;
--
-- Partitioning: BigQuery only scans date partitions matching your WHERE clause
-- Clustering: physically co-locates rows by store and product for faster filtering
-- Cost impact: pay-per-bytes-scanned means scanning less = paying less
