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
