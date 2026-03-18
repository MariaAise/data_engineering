-- ============================================================
-- STAR SCHEMA QUERIES — MySQL Workbench
-- ============================================================
-- Run these after importing the star schema.
-- Each query demonstrates a specific OLAP concept.

USE coffee_star;

-- ============================================================
-- Q1: BASIC AGGREGATION
-- Total revenue by product category
-- ============================================================
SELECT 
    p.category,
    COUNT(*) AS transactions,
    SUM(f.quantity) AS units_sold,
    SUM(f.line_total) AS revenue
FROM fact_sales f
JOIN dim_product p ON f.product_key = p.product_key
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
FROM fact_sales f
JOIN dim_date d ON f.date_key = d.date_key
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
FROM fact_sales f
JOIN dim_store s ON f.store_key = s.store_key
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
FROM fact_sales f
JOIN dim_date d    ON f.date_key = d.date_key
JOIN dim_product p ON f.product_key = p.product_key
JOIN dim_store s   ON f.store_key = s.store_key
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
FROM fact_sales f
JOIN dim_date d    ON f.date_key = d.date_key
JOIN dim_product p ON f.product_key = p.product_key
JOIN dim_store s   ON f.store_key = s.store_key
WHERE p.category = 'Coffee'
  AND s.city IN ('Melbourne', 'Sydney')
  AND d.quarter = 'Q4'
GROUP BY s.city, p.subcategory, d.quarter
ORDER BY s.city, revenue DESC;


-- ============================================================
-- Q6: PIVOT — categories as columns
-- Monthly revenue pivot by category (manual pivot in MySQL)
-- ============================================================
SELECT 
    d.year,
    d.month_name,
    SUM(CASE WHEN p.category = 'Coffee'   THEN f.line_total ELSE 0 END) AS coffee,
    SUM(CASE WHEN p.category = 'Tea'      THEN f.line_total ELSE 0 END) AS tea,
    SUM(CASE WHEN p.category = 'Pastry'   THEN f.line_total ELSE 0 END) AS pastry,
    SUM(CASE WHEN p.category = 'Sandwich' THEN f.line_total ELSE 0 END) AS sandwich,
    SUM(CASE WHEN p.category = 'Beverage' THEN f.line_total ELSE 0 END) AS beverage,
    SUM(f.line_total) AS total
FROM fact_sales f
JOIN dim_date d    ON f.date_key = d.date_key
JOIN dim_product p ON f.product_key = p.product_key
GROUP BY d.year, d.month, d.month_name
ORDER BY d.year, d.month;


-- ============================================================
-- Q7: SQL ROLLUP — automatic subtotals and grand total
-- Revenue by city and store with subtotals
-- ============================================================
SELECT 
    COALESCE(s.city, '** ALL CITIES **') AS city,
    COALESCE(s.store_name, '** City Total **') AS store,
    SUM(f.line_total) AS revenue
FROM fact_sales f
JOIN dim_store s ON f.store_key = s.store_key
GROUP BY s.city, s.store_name WITH ROLLUP
ORDER BY s.city, s.store_name;


-- ============================================================
-- Q8: LOYALTY ANALYSIS — dimension attribute as filter
-- Revenue and avg ticket: loyalty members vs walk-ins
-- ============================================================
SELECT 
    c.loyalty_tier,
    COUNT(DISTINCT f.sale_id) AS transactions,
    SUM(f.line_total) AS revenue,
    ROUND(AVG(f.line_total), 2) AS avg_line_total
FROM fact_sales f
JOIN dim_customer c ON f.customer_key = c.customer_key
GROUP BY c.loyalty_tier
ORDER BY revenue DESC;


-- ============================================================
-- Q9: PEAK HOUR ANALYSIS — time dimension
-- Revenue by time period and peak/off-peak
-- ============================================================
SELECT 
    t.period,
    CASE WHEN t.is_peak_hour = 1 THEN 'Peak' ELSE 'Off-Peak' END AS peak_status,
    COUNT(*) AS transactions,
    SUM(f.line_total) AS revenue,
    ROUND(AVG(f.line_total), 2) AS avg_item_value
FROM fact_sales f
JOIN dim_time t ON f.time_key = t.time_key
GROUP BY t.period, t.is_peak_hour
ORDER BY FIELD(t.period, 'morning', 'afternoon', 'evening'), t.is_peak_hour DESC;


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
    FROM fact_sales f
    JOIN dim_date d ON f.date_key = d.date_key
    GROUP BY d.year, d.month, d.month_name
) monthly
ORDER BY year, month;
