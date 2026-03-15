+----------------------+
|     branchdetails    |
+----------------------+
| PK branch_id         |
|    branch_name       |
|    location          |
+----------------------+
          |
          | 1
          | 
          |<--------------------+
          |                     |
          |                     | M
+----------------------+   +----------------------+
|  staffshiftdetails   |   |        sales         |
+----------------------+   +----------------------+
| PK/FK staff_id*      |   | PK sale_id           |
| PK/FK branch_id      |   |    sale_date         |
| PK    shift_date     |   | FK product_id        |
|    start_time        |   |    quantity          |
|    end_time          |   | FK customer_id       |
+----------------------+   | FK branch_id         |
                           +----------------------+
                                    |   ^
                                  M |   | M
                                    |   |
                                    |   |
                    +---------------+   +----------------+
                    |                                    |
                    |                                    |
                    |                                    |
                    v                                    v
          +----------------------+             +----------------------+
          |    productdetails    |             |   customerdetails    |
          +----------------------+             +----------------------+
          | PK product_id        |             | PK customer_id       |
          |    name              |             |    name              |
          |    category          |             |    contact_details   |
          |    price             |             |    loyalty_program...|
          |    stock_level       |             +----------------------+
          +----------------------+                      ^
                    ^                                   |
                    |                                   |
                  1 |                                   | 1
                    |                                   |
                    | M                                 | M
          +----------------------+
          |   complaintdetails   |
          +----------------------+
          | PK complaint_id      |
          | FK customer_id       |
          | FK product_id        |
          |    complaint_date    |
          |    resolution_status |
          +----------------------+


branchdetails
	•	PK branch_id
	•	branch_name
	•	location

productdetails
	•	PK product_id
	•	name
	•	category
	•	price
	•	stock_level

customerdetails
	•	PK customer_id
	•	name
	•	contact_details
	•	loyalty_program_status

sales
	•	PK sale_id
	•	sale_date
	•	FK product_id → productdetails.product_id
	•	quantity
	•	FK customer_id → customerdetails.customer_id
	•	FK branch_id → branchdetails.branch_id

complaintdetails
	•	PK complaint_id
	•	FK customer_id → customerdetails.customer_id
	•	FK product_id → productdetails.product_id
	•	complaint_date
	•	resolution_status

staffshiftdetails
	•	Composite PK (staff_id, branch_id, shift_date)
	•	start_time
	•	end_time
	•	FK branch_id → branchdetails.branch_id

Cardinalities
	•	branchdetails 1 : M sales
	•	productdetails 1 : M sales
	•	customerdetails 1 : M sales
	•	productdetails 1 : M complaintdetails
	•	customerdetails 1 : M complaintdetails
	•	branchdetails 1 : M staffshiftdetails

### Note

staffshiftdetails.staff_id is a key field, but there is no staffdetails table in this schema.
the database currently models staff shifts without a parent staff entity.

