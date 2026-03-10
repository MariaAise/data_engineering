# Solutions: Neo4j Aura Cypher Practice Tasks

## 1) Return all customers with `customerId`, `name`, and `city`
```cypher
MATCH (c:Customer)
RETURN c.customerId AS customerId, c.name AS name, c.city AS city
ORDER BY c.customerId;
```

## 2) Find all products with `price > 300`
```cypher
MATCH (p:Product)
WHERE p.price > 300
RETURN p.productId AS productId, p.name AS product, p.price AS price
ORDER BY p.price DESC;
```

## 3) List all orders sorted by `orderedAt` descending
```cypher
MATCH (o:Order)
RETURN o.orderId AS orderId, o.orderedAt AS orderedAt, o.status AS status, o.total AS total
ORDER BY o.orderedAt DESC;
```

## 4) Show every product and the category it belongs to
```cypher
MATCH (p:Product)-[:IN_CATEGORY]->(cat:Category)
RETURN p.productId AS productId, p.name AS product, cat.name AS category
ORDER BY category, product;
```

## 5) Find all products supplied by `TechSource`
```cypher
MATCH (:Supplier {name: 'TechSource'})-[:SUPPLIES]->(p:Product)
RETURN p.productId AS productId, p.name AS product, p.price AS price
ORDER BY p.productId;
```

## 6) Count how many orders each customer has placed
```cypher
MATCH (c:Customer)
OPTIONAL MATCH (c)-[:PLACED]->(o:Order)
RETURN c.customerId AS customerId, c.name AS customer, count(o) AS orderCount
ORDER BY orderCount DESC, customer;
```

## 7) Find customers who have not written any review
```cypher
MATCH (c:Customer)
WHERE NOT (c)-[:REVIEWED]->(:Product)
RETURN c.customerId AS customerId, c.name AS customer
ORDER BY c.customerId;
```

## 8) Return orders with status `Delivered`
```cypher
MATCH (o:Order)
WHERE o.status = 'Delivered'
RETURN o.orderId AS orderId, o.orderedAt AS orderedAt, o.total AS total
ORDER BY o.orderedAt;
```

## 9) Calculate the average product price across all products
```cypher
MATCH (p:Product)
RETURN round(avg(p.price), 2) AS avgProductPrice;
```

## 10) Find the top 3 most expensive products
```cypher
MATCH (p:Product)
RETURN p.productId AS productId, p.name AS product, p.price AS price
ORDER BY p.price DESC
LIMIT 3;
```

## 11) Show each order with total quantity of items in that order
```cypher
MATCH (o:Order)-[r:CONTAINS]->(:Product)
RETURN o.orderId AS orderId, sum(r.quantity) AS totalItems
ORDER BY o.orderId;
```

## 12) Compute total revenue from delivered orders only
```cypher
MATCH (o:Order)
WHERE o.status = 'Delivered'
RETURN sum(o.total) AS deliveredRevenue;
```

## 13) Find all reviews with rating >= 4, including customer and product names
```cypher
MATCH (c:Customer)-[r:REVIEWED]->(p:Product)
WHERE r.rating >= 4
RETURN c.name AS customer, p.name AS product, r.rating AS rating, r.comment AS comment
ORDER BY r.rating DESC, customer;
```

## 14) For each category, count number of products in it
```cypher
MATCH (p:Product)-[:IN_CATEGORY]->(cat:Category)
RETURN cat.name AS category, count(p) AS productCount
ORDER BY productCount DESC, category;
```

## 15) Find suppliers and how many products each one supplies
```cypher
MATCH (s:Supplier)
OPTIONAL MATCH (s)-[:SUPPLIES]->(p:Product)
RETURN s.name AS supplier, count(p) AS suppliedProducts
ORDER BY suppliedProducts DESC, supplier;
```

## 16) Return customers who ordered products from the `Books` category
```cypher
MATCH (c:Customer)-[:PLACED]->(:Order)-[:CONTAINS]->(:Product)-[:IN_CATEGORY]->(:Category {name: 'Books'})
RETURN DISTINCT c.customerId AS customerId, c.name AS customer
ORDER BY customerId;
```

## 17) Find products that were never ordered
```cypher
MATCH (p:Product)
WHERE NOT (:Order)-[:CONTAINS]->(p)
RETURN p.productId AS productId, p.name AS product
ORDER BY p.productId;
```

## 18) Update stock of product `P002` by subtracting 5 units
```cypher
MATCH (p:Product {productId: 'P002'})
SET p.stock = p.stock - 5
RETURN p.productId AS productId, p.name AS product, p.stock AS updatedStock;
```

## 19) Create a new customer `C007` named `Grace Hall` in `Denver`
```cypher
CREATE (c:Customer {
  customerId: 'C007',
  name: 'Grace Hall',
  email: 'grace@example.com',
  city: 'Denver',
  joinedOn: date()
})
RETURN c;
```

## 20) Create a new order `O1009` for `C007` with one unit of `P010` and status `Processing`
```cypher
MATCH (c:Customer {customerId: 'C007'}), (p:Product {productId: 'P010'})
CREATE (o:Order {
  orderId: 'O1009',
  orderedAt: datetime(),
  status: 'Processing',
  total: p.price
})
CREATE (c)-[:PLACED]->(o)
CREATE (o)-[:CONTAINS {quantity: 1, unitPrice: p.price}]->(p)
RETURN o.orderId AS orderId, c.name AS customer, p.name AS product, o.total AS total;
```
