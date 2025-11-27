const db = require("../config/database");

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `
            SELECT o.*, 
                   c.first_name, 
                   c.last_name, 
                   c.email as client_email,
                   u.username as created_by_username
            FROM orders o
            LEFT JOIN clients c ON o.client_id = c.id
            LEFT JOIN users u ON o.created_by = u.id
        `;

    const queryParams = [];
    if (status) {
      queryText += " WHERE o.status = $1";
      queryParams.push(status);
    }

    queryText +=
      " ORDER BY o.order_date DESC LIMIT $" +
      (queryParams.length + 1) +
      " OFFSET $" +
      (queryParams.length + 2);
    queryParams.push(limit, offset);

    const result = await db.query(queryText, queryParams);

    // Get total count
    let countQuery = "SELECT COUNT(*) FROM orders";
    if (status) {
      countQuery += " WHERE status = $1";
      const countResult = await db.query(countQuery, [status]);
      var totalCount = parseInt(countResult.rows[0].count);
    } else {
      const countResult = await db.query(countQuery);
      var totalCount = parseInt(countResult.rows[0].count);
    }

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving orders",
      error: error.message,
    });
  }
};

// Get order by ID with items
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get order details
    const orderResult = await db.query(
      `SELECT o.*, 
                    c.first_name, 
                    c.last_name, 
                    c.email as client_email,
                    c.phone,
                    u.username as created_by_username
             FROM orders o
             LEFT JOIN clients c ON o.client_id = c.id
             LEFT JOIN users u ON o.created_by = u.id
             WHERE o.id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Get order items
    const itemsResult = await db.query(
      `SELECT oi.*, 
                    p.name as product_name,
                    p.image_url as product_image
             FROM order_items oi
             LEFT JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = $1`,
      [id]
    );

    const order = orderResult.rows[0];
    order.items = itemsResult.rows;

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving order",
      error: error.message,
    });
  }
};

// Get orders by client
exports.getOrdersByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT o.*, 
                    c.first_name, 
                    c.last_name
             FROM orders o
             LEFT JOIN clients c ON o.client_id = c.id
             WHERE o.client_id = $1
             ORDER BY o.order_date DESC
             LIMIT $2 OFFSET $3`,
      [clientId, limit, offset]
    );

    // Get total count
    const countResult = await db.query(
      "SELECT COUNT(*) FROM orders WHERE client_id = $1",
      [clientId]
    );
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Get orders by client error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving client orders",
      error: error.message,
    });
  }
};

// Create new order
exports.createOrder = async (req, res) => {
  const client = await db.pool.connect();

  try {
    const { client_id, items, shipping_address, notes } = req.body;

    await client.query("BEGIN");

    // Verify client exists
    const clientCheck = await client.query(
      "SELECT id FROM clients WHERE id = $1",
      [client_id]
    );
    if (clientCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Calculate total amount and verify product availability
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const productResult = await client.query(
        `SELECT p.id, p.name, p.price, p.quantity,
                        (p.quantity - COALESCE((
                            SELECT SUM(oi.quantity) 
                            FROM order_items oi
                            JOIN orders o ON oi.order_id = o.id
                            WHERE oi.product_id = p.id 
                            AND o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
                        ), 0)) as current_quantity,
                        d.discount_percentage,
                        d.discount_amount
                 FROM products p
                 LEFT JOIN discounts d ON p.id = d.product_id 
                     AND d.is_active = true 
                     AND CURRENT_TIMESTAMP BETWEEN d.start_date AND d.end_date
                 WHERE p.id = $1 AND p.is_active = true`,
        [item.product_id]
      );

      if (productResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product_id} not found or inactive`,
        });
      }

      const product = productResult.rows[0];

      // Check stock availability
      if (product.current_quantity < item.quantity) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.name}. Available: ${product.current_quantity}, Requested: ${item.quantity}`,
        });
      }

      // Calculate price with discount
      let unitPrice = parseFloat(product.price);
      let discountApplied = 0;

      if (product.discount_amount) {
        discountApplied = parseFloat(product.discount_amount);
        unitPrice = unitPrice - discountApplied;
      } else if (product.discount_percentage) {
        discountApplied =
          unitPrice * (parseFloat(product.discount_percentage) / 100);
        unitPrice = unitPrice - discountApplied;
      }

      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: parseFloat(product.price),
        discount_applied: discountApplied,
        subtotal: subtotal,
      });
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Insert order
    const orderResult = await client.query(
      `INSERT INTO orders 
             (client_id, order_number, order_date, status, total_amount, shipping_address, notes, created_by)
             VALUES ($1, $2, CURRENT_TIMESTAMP, 'pending', $3, $4, $5, $6)
             RETURNING *`,
      [
        client_id,
        orderNumber,
        totalAmount,
        shipping_address,
        notes,
        req.user.id,
      ]
    );

    const order = orderResult.rows[0];

    // Insert order items
    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items 
                 (order_id, product_id, quantity, unit_price, discount_applied, subtotal)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          order.id,
          item.product_id,
          item.quantity,
          item.unit_price,
          item.discount_applied,
          item.subtotal,
        ]
      );
    }

    await client.query("COMMIT");

    // Fetch complete order with items
    const completeOrder = await db.query(
      `SELECT o.*, 
                    c.first_name, 
                    c.last_name, 
                    c.email as client_email
             FROM orders o
             LEFT JOIN clients c ON o.client_id = c.id
             WHERE o.id = $1`,
      [order.id]
    );

    const itemsResult = await db.query(
      `SELECT oi.*, 
                    p.name as product_name
             FROM order_items oi
             LEFT JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = $1`,
      [order.id]
    );

    const finalOrder = completeOrder.rows[0];
    finalOrder.items = itemsResult.rows;

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: finalOrder,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating order",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await db.query(
      `UPDATE orders 
             SET status = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating order status",
      error: error.message,
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if order can be cancelled
    const orderCheck = await db.query(
      "SELECT status FROM orders WHERE id = $1",
      [id]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const currentStatus = orderCheck.rows[0].status;
    if (["shipped", "delivered", "cancelled"].includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${currentStatus}`,
      });
    }

    const result = await db.query(
      `UPDATE orders 
             SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
             WHERE id = $1 
             RETURNING *`,
      [id]
    );

    res.json({
      success: true,
      message: "Order cancelled successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Server error cancelling order",
      error: error.message,
    });
  }
};
