## Dataset to use 

Use the **Retail Analytics Warehouse** dataset already defined: `sales` (fact), `customers`, `products`, `stores`, `dates` (dimensions). MySQL **8.0**.

---


## A) Filtering & Conditions (6 tasks)

### 1) Basic filter (WHERE)

**Task:** List all rows in `sales` where `quantity >= 2`. Return `sale_id, quantity, revenue`.

### 2) Filter by dimension attribute (JOIN + WHERE)

**Task:** List `sale_id, city, revenue` for sales made in **Melbourne**.

### 3) IN condition

**Task:** Return `sale_id, store_id, revenue` for sales in stores with `store_id IN (1,3)`.

### 4) BETWEEN on dates

**Task:** Return `sale_id, full_date, revenue` for sales between **2025-02-01** and **2025-04-30**.

### 5) Multiple conditions (AND/OR)

**Task:** Return `sale_id, revenue` where `(quantity >= 2 AND revenue >= 500) OR (quantity = 1 AND revenue >= 1400)`.

### 6) Pattern match (LIKE)

**Task:** Return product rows where `product_name` starts with `P` (e.g., Printer, Paper). Return `product_id, product_name`.

---

## B) Ordering & Limiting (4 tasks)

### 7) ORDER BY single column

**Task:** Return all products ordered by `category` then `product_name` ascending.

### 8) ORDER BY computed value

**Task:** Return `sale_id, revenue, quantity, revenue/quantity AS unit_price` ordered by `unit_price` descending.

### 9) Top-N (LIMIT)

**Task:** Return the top 3 sales by `revenue` (sale_id, revenue, full_date).

### 10) Bottom-N with tie awareness (simple)

**Task:** Return the bottom 3 sales by `quantity` (sale_id, quantity, revenue). If ties exist, order by revenue ascending.

---

## C) Aggregation (at least 2 examples each), incl. variations (10 tasks)

### C1) COUNT (2 examples)

#### 11) Count rows by store_type

**Task:** Count number of sales per `store_type`. Return `store_type, sales_count`.

#### 12) Count distinct customers per region

**Task:** For each customer `region`, count distinct customers who have at least one sale. Return `region, distinct_customers`.

---

### C2) SUM (2 examples)

#### 13) Total revenue by category

**Task:** Return `category, total_revenue` using products.category.

#### 14) Total quantity by month

**Task:** Return `month, total_quantity` for 2025, ordered by month.

---

### C3) AVG (2 examples)

#### 15) Average revenue per sale by segment

**Task:** Return `segment, avg_revenue_per_sale`.

#### 16) Average unit price by category (computed AVG)

**Task:** Compute average `revenue/quantity` per category. Return `category, avg_unit_price`.

---

### C4) MIN/MAX (2 examples)

#### 17) First and last sales date (MIN/MAX)

**Task:** Return earliest and latest `full_date` present in sales.

#### 18) Max revenue sale per store (group-level MAX)

**Task:** For each `store_id`, return the maximum sale revenue. Return `store_id, max_revenue`.

---

### C5) HAVING (2 examples)

#### 19) Categories with revenue above threshold

**Task:** Return categories where total revenue > 1000. Return `category, total_revenue`.

#### 20) Stores with at least 3 sales

**Task:** Return stores with `sales_count >= 3`. Return `store_id, sales_count`.

---

## D) Joins (2+ examples for each join type + brief explanation) (10 tasks)

### Join type: INNER JOIN

**Meaning:** keep only rows where there is a match in both tables.

#### 21) INNER JOIN sales + products

**Task:** Return `sale_id, product_name, revenue` for all sales.

#### 22) INNER JOIN across multiple dimensions

**Task:** Return `sale_id, full_date, city, product_name, revenue` by joining `sales` to `dates`, `stores`, and `products`.

---

### Join type: LEFT JOIN

**Meaning:** keep all rows from the left table, even if there is no match on the right (unmatched columns become NULL).
*(In this dataset, matches should exist due to FKs, but LEFT JOIN is still assessed as a skill.)*

#### 23) LEFT JOIN customers to sales (show customers with/without sales)

**Task:** Return `customer_id, segment, COUNT(sale_id) AS sales_count` for all customers (including those with zero sales).

#### 24) LEFT JOIN products to sales (show products with/without sales)

**Task:** Return `product_id, product_name, COALESCE(SUM(quantity),0) AS qty_sold` for all products, including products with zero sales.

---

### Join type: CROSS JOIN (optional but useful)

**Meaning:** Cartesian product (all combinations). Common use: generate a grid, then LEFT JOIN facts.

#### 25) Region × Category grid (then fill with revenue)

**Task:** Produce all combinations of `region` and `category`, and show revenue for each combination (0 if none).
Return `region, category, total_revenue`.

---

### Join type: SELF JOIN (optional; demonstrates relational reasoning)

**Meaning:** join a table to itself to compare rows.

#### 26) Duplicate-check style self-join on sales (same customer, same date)

**Task:** Find pairs of sales for the same customer on the same `date_id` where `sale_id` differs. Return both sale_ids and customer_id.
*(This demonstrates a “potential duplicate event” check.)*

---

## E) Troubleshooting / “business problem” patterns (4 tasks)

### 27) Unit price anomaly flag (CASE)

**Task:** Return `sale_id, revenue, quantity, unit_price, price_flag` where `price_flag` is:

* 'HIGH' if unit_price > 800
* 'NORMAL' otherwise

### 28) Compare segment share of revenue

**Task:** Return `segment, segment_revenue, total_revenue, pct_of_total`.
(Use a subquery/CTE or window function if allowed.)

### 29) Find “missing month” check

**Task:** List months present in `dates` table that have **no sales** (month with zero facts).
Return `month`.

### 30) Reconciliation check (two ways)

**Task:** Compute total revenue in two ways and return both in one row:

* (A) `SUM(sales.revenue)`
* (B) `SUM(quantity * (revenue/quantity))` (should equal A)
  Return `total_a, total_b, diff`.

---

# Notes for building questions to extend 

* “Only include **Urban** stores”
* “Only include **Quarter 1**”
* “Exclude category = 'Furniture'”
* “Require `ORDER BY` exactly”
* “Return columns with these exact names (aliases)”

---
