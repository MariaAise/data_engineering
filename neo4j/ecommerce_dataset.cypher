// ==========================================================
// Neo4j Aura Demo Dataset: E-commerce Graph
// Load by running this file in Neo4j Browser
// ==========================================================

// Optional cleanup for fresh demo environment
MATCH (n) DETACH DELETE n;

// Constraints
CREATE CONSTRAINT customer_id IF NOT EXISTS FOR (c:Customer) REQUIRE c.customerId IS UNIQUE;
CREATE CONSTRAINT product_id IF NOT EXISTS FOR (p:Product) REQUIRE p.productId IS UNIQUE;
CREATE CONSTRAINT order_id IF NOT EXISTS FOR (o:Order) REQUIRE o.orderId IS UNIQUE;
CREATE CONSTRAINT category_name IF NOT EXISTS FOR (cat:Category) REQUIRE cat.name IS UNIQUE;
CREATE CONSTRAINT supplier_id IF NOT EXISTS FOR (s:Supplier) REQUIRE s.supplierId IS UNIQUE;

// Categories
CREATE
  (:Category {name: 'Electronics'}),
  (:Category {name: 'Home'}),
  (:Category {name: 'Fitness'}),
  (:Category {name: 'Fashion'}),
  (:Category {name: 'Books'});

// Suppliers
CREATE
  (:Supplier {supplierId: 'S001', name: 'TechSource', country: 'USA'}),
  (:Supplier {supplierId: 'S002', name: 'HomeCraft', country: 'Germany'}),
  (:Supplier {supplierId: 'S003', name: 'FitLife Goods', country: 'Canada'}),
  (:Supplier {supplierId: 'S004', name: 'StyleWave', country: 'Italy'}),
  (:Supplier {supplierId: 'S005', name: 'ReadMore Publishing', country: 'UK'});

// Products
CREATE
  (:Product {productId: 'P001', name: 'Smartphone X', price: 899.0, stock: 42}),
  (:Product {productId: 'P002', name: 'Wireless Earbuds', price: 129.0, stock: 120}),
  (:Product {productId: 'P003', name: 'Robot Vacuum', price: 349.0, stock: 35}),
  (:Product {productId: 'P004', name: 'Air Fryer', price: 149.0, stock: 58}),
  (:Product {productId: 'P005', name: 'Yoga Mat Pro', price: 39.0, stock: 200}),
  (:Product {productId: 'P006', name: 'Adjustable Dumbbells', price: 299.0, stock: 28}),
  (:Product {productId: 'P007', name: 'Denim Jacket', price: 89.0, stock: 75}),
  (:Product {productId: 'P008', name: 'Running Shoes', price: 119.0, stock: 94}),
  (:Product {productId: 'P009', name: 'Graph Databases 101', price: 49.0, stock: 300}),
  (:Product {productId: 'P010', name: 'Cypher in Practice', price: 59.0, stock: 220});

// Customers
CREATE
  (:Customer {customerId: 'C001', name: 'Alice Brown', email: 'alice@example.com', city: 'New York', joinedOn: date('2023-01-15')}),
  (:Customer {customerId: 'C002', name: 'Ben Carter', email: 'ben@example.com', city: 'Chicago', joinedOn: date('2023-03-02')}),
  (:Customer {customerId: 'C003', name: 'Chloe Davis', email: 'chloe@example.com', city: 'Seattle', joinedOn: date('2023-07-21')}),
  (:Customer {customerId: 'C004', name: 'Daniel Evans', email: 'daniel@example.com', city: 'Austin', joinedOn: date('2024-01-09')}),
  (:Customer {customerId: 'C005', name: 'Emma Flores', email: 'emma@example.com', city: 'Boston', joinedOn: date('2024-02-19')}),
  (:Customer {customerId: 'C006', name: 'Farah Green', email: 'farah@example.com', city: 'Miami', joinedOn: date('2024-04-11')});

// Orders
CREATE
  (:Order {orderId: 'O1001', orderedAt: datetime('2024-05-01T10:15:00'), status: 'Delivered', total: 1028.0}),
  (:Order {orderId: 'O1002', orderedAt: datetime('2024-05-03T15:40:00'), status: 'Delivered', total: 188.0}),
  (:Order {orderId: 'O1003', orderedAt: datetime('2024-05-08T09:05:00'), status: 'Shipped', total: 358.0}),
  (:Order {orderId: 'O1004', orderedAt: datetime('2024-05-11T20:12:00'), status: 'Processing', total: 119.0}),
  (:Order {orderId: 'O1005', orderedAt: datetime('2024-05-14T13:18:00'), status: 'Delivered', total: 108.0}),
  (:Order {orderId: 'O1006', orderedAt: datetime('2024-05-19T17:50:00'), status: 'Cancelled', total: 299.0}),
  (:Order {orderId: 'O1007', orderedAt: datetime('2024-05-22T11:30:00'), status: 'Delivered', total: 408.0}),
  (:Order {orderId: 'O1008', orderedAt: datetime('2024-05-27T08:22:00'), status: 'Shipped', total: 49.0});

// Product-to-category relationships
MATCH (p:Product {productId: 'P001'}), (c:Category {name: 'Electronics'}) CREATE (p)-[:IN_CATEGORY]->(c);
MATCH (p:Product {productId: 'P002'}), (c:Category {name: 'Electronics'}) CREATE (p)-[:IN_CATEGORY]->(c);
MATCH (p:Product {productId: 'P003'}), (c:Category {name: 'Home'}) CREATE (p)-[:IN_CATEGORY]->(c);
MATCH (p:Product {productId: 'P004'}), (c:Category {name: 'Home'}) CREATE (p)-[:IN_CATEGORY]->(c);
MATCH (p:Product {productId: 'P005'}), (c:Category {name: 'Fitness'}) CREATE (p)-[:IN_CATEGORY]->(c);
MATCH (p:Product {productId: 'P006'}), (c:Category {name: 'Fitness'}) CREATE (p)-[:IN_CATEGORY]->(c);
MATCH (p:Product {productId: 'P007'}), (c:Category {name: 'Fashion'}) CREATE (p)-[:IN_CATEGORY]->(c);
MATCH (p:Product {productId: 'P008'}), (c:Category {name: 'Fashion'}) CREATE (p)-[:IN_CATEGORY]->(c);
MATCH (p:Product {productId: 'P009'}), (c:Category {name: 'Books'}) CREATE (p)-[:IN_CATEGORY]->(c);
MATCH (p:Product {productId: 'P010'}), (c:Category {name: 'Books'}) CREATE (p)-[:IN_CATEGORY]->(c);

// Supplier-to-product relationships
MATCH (s:Supplier {supplierId: 'S001'}), (p:Product {productId: 'P001'}) CREATE (s)-[:SUPPLIES]->(p);
MATCH (s:Supplier {supplierId: 'S001'}), (p:Product {productId: 'P002'}) CREATE (s)-[:SUPPLIES]->(p);
MATCH (s:Supplier {supplierId: 'S002'}), (p:Product {productId: 'P003'}) CREATE (s)-[:SUPPLIES]->(p);
MATCH (s:Supplier {supplierId: 'S002'}), (p:Product {productId: 'P004'}) CREATE (s)-[:SUPPLIES]->(p);
MATCH (s:Supplier {supplierId: 'S003'}), (p:Product {productId: 'P005'}) CREATE (s)-[:SUPPLIES]->(p);
MATCH (s:Supplier {supplierId: 'S003'}), (p:Product {productId: 'P006'}) CREATE (s)-[:SUPPLIES]->(p);
MATCH (s:Supplier {supplierId: 'S004'}), (p:Product {productId: 'P007'}) CREATE (s)-[:SUPPLIES]->(p);
MATCH (s:Supplier {supplierId: 'S004'}), (p:Product {productId: 'P008'}) CREATE (s)-[:SUPPLIES]->(p);
MATCH (s:Supplier {supplierId: 'S005'}), (p:Product {productId: 'P009'}) CREATE (s)-[:SUPPLIES]->(p);
MATCH (s:Supplier {supplierId: 'S005'}), (p:Product {productId: 'P010'}) CREATE (s)-[:SUPPLIES]->(p);

// Customer placed orders
MATCH (c:Customer {customerId: 'C001'}), (o:Order {orderId: 'O1001'}) CREATE (c)-[:PLACED]->(o);
MATCH (c:Customer {customerId: 'C002'}), (o:Order {orderId: 'O1002'}) CREATE (c)-[:PLACED]->(o);
MATCH (c:Customer {customerId: 'C003'}), (o:Order {orderId: 'O1003'}) CREATE (c)-[:PLACED]->(o);
MATCH (c:Customer {customerId: 'C004'}), (o:Order {orderId: 'O1004'}) CREATE (c)-[:PLACED]->(o);
MATCH (c:Customer {customerId: 'C005'}), (o:Order {orderId: 'O1005'}) CREATE (c)-[:PLACED]->(o);
MATCH (c:Customer {customerId: 'C001'}), (o:Order {orderId: 'O1006'}) CREATE (c)-[:PLACED]->(o);
MATCH (c:Customer {customerId: 'C006'}), (o:Order {orderId: 'O1007'}) CREATE (c)-[:PLACED]->(o);
MATCH (c:Customer {customerId: 'C002'}), (o:Order {orderId: 'O1008'}) CREATE (c)-[:PLACED]->(o);

// Order contains products (with quantity and unitPrice)
MATCH (o:Order {orderId: 'O1001'}), (p:Product {productId: 'P001'}) CREATE (o)-[:CONTAINS {quantity: 1, unitPrice: 899.0}]->(p);
MATCH (o:Order {orderId: 'O1001'}), (p:Product {productId: 'P002'}) CREATE (o)-[:CONTAINS {quantity: 1, unitPrice: 129.0}]->(p);

MATCH (o:Order {orderId: 'O1002'}), (p:Product {productId: 'P004'}) CREATE (o)-[:CONTAINS {quantity: 1, unitPrice: 149.0}]->(p);
MATCH (o:Order {orderId: 'O1002'}), (p:Product {productId: 'P009'}) CREATE (o)-[:CONTAINS {quantity: 1, unitPrice: 49.0}]->(p);

MATCH (o:Order {orderId: 'O1003'}), (p:Product {productId: 'P003'}) CREATE (o)-[:CONTAINS {quantity: 1, unitPrice: 349.0}]->(p);
MATCH (o:Order {orderId: 'O1003'}), (p:Product {productId: 'P005'}) CREATE (o)-[:CONTAINS {quantity: 1, unitPrice: 39.0}]->(p);

MATCH (o:Order {orderId: 'O1004'}), (p:Product {productId: 'P008'}) CREATE (o)-[:CONTAINS {quantity: 1, unitPrice: 119.0}]->(p);

MATCH (o:Order {orderId: 'O1005'}), (p:Product {productId: 'P007'}) CREATE (o)-[:CONTAINS {quantity: 1, unitPrice: 89.0}]->(p);
MATCH (o:Order {orderId: 'O1005'}), (p:Product {productId: 'P005'}) CREATE (o)-[:CONTAINS {quantity: 1, unitPrice: 19.0}]->(p);

MATCH (o:Order {orderId: 'O1006'}), (p:Product {productId: 'P006'}) CREATE (o)-[:CONTAINS {quantity: 1, unitPrice: 299.0}]->(p);

MATCH (o:Order {orderId: 'O1007'}), (p:Product {productId: 'P003'}) CREATE (o)-[:CONTAINS {quantity: 1, unitPrice: 349.0}]->(p);
MATCH (o:Order {orderId: 'O1007'}), (p:Product {productId: 'P009'}) CREATE (o)-[:CONTAINS {quantity: 1, unitPrice: 59.0}]->(p);

MATCH (o:Order {orderId: 'O1008'}), (p:Product {productId: 'P009'}) CREATE (o)-[:CONTAINS {quantity: 1, unitPrice: 49.0}]->(p);

// Reviews
MATCH (c:Customer {customerId: 'C001'}), (p:Product {productId: 'P001'}) CREATE (c)-[:REVIEWED {rating: 5, comment: 'Excellent phone', reviewedAt: date('2024-05-10')}]->(p);
MATCH (c:Customer {customerId: 'C002'}), (p:Product {productId: 'P004'}) CREATE (c)-[:REVIEWED {rating: 4, comment: 'Very useful in kitchen', reviewedAt: date('2024-05-12')}]->(p);
MATCH (c:Customer {customerId: 'C003'}), (p:Product {productId: 'P003'}) CREATE (c)-[:REVIEWED {rating: 5, comment: 'Saves a lot of time', reviewedAt: date('2024-05-15')}]->(p);
MATCH (c:Customer {customerId: 'C005'}), (p:Product {productId: 'P007'}) CREATE (c)-[:REVIEWED {rating: 3, comment: 'Good but runs small', reviewedAt: date('2024-05-21')}]->(p);
MATCH (c:Customer {customerId: 'C006'}), (p:Product {productId: 'P009'}) CREATE (c)-[:REVIEWED {rating: 5, comment: 'Great beginner book', reviewedAt: date('2024-05-29')}]->(p);
