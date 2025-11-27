const db = require("../config/database");

// Get all clients
exports.getAllClients = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT * FROM clients 
             ORDER BY created_at DESC 
             LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Get total count
    const countResult = await db.query("SELECT COUNT(*) FROM clients");
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
    console.error("Get all clients error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving clients",
      error: error.message,
    });
  }
};

// Search clients
exports.searchClients = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const result = await db.query(
      `SELECT * FROM clients 
             WHERE first_name ILIKE $1 
                OR last_name ILIKE $1 
                OR email ILIKE $1 
                OR phone ILIKE $1
             ORDER BY created_at DESC 
             LIMIT $2 OFFSET $3`,
      [`%${query}%`, limit, offset]
    );

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM clients 
             WHERE first_name ILIKE $1 
                OR last_name ILIKE $1 
                OR email ILIKE $1 
                OR phone ILIKE $1`,
      [`%${query}%`]
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
    console.error("Search clients error:", error);
    res.status(500).json({
      success: false,
      message: "Server error searching clients",
      error: error.message,
    });
  }
};

// Get client by ID
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query("SELECT * FROM clients WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Get client's order history
    const ordersResult = await db.query(
      `SELECT id, order_number, order_date, status, total_amount 
             FROM orders 
             WHERE client_id = $1 
             ORDER BY order_date DESC 
             LIMIT 10`,
      [id]
    );

    const client = result.rows[0];
    client.recent_orders = ordersResult.rows;

    res.json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error("Get client by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving client",
      error: error.message,
    });
  }
};

// Create new client
exports.createClient = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      postal_code,
      country,
    } = req.body;

    // Check if email already exists
    const existingClient = await db.query(
      "SELECT id FROM clients WHERE email = $1",
      [email]
    );
    if (existingClient.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Client with this email already exists",
      });
    }

    const result = await db.query(
      `INSERT INTO clients 
             (first_name, last_name, email, phone, address, city, postal_code, country)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
      [first_name, last_name, email, phone, address, city, postal_code, country]
    );

    res.status(201).json({
      success: true,
      message: "Client created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create client error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating client",
      error: error.message,
    });
  }
};

// Update client
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      postal_code,
      country,
    } = req.body;

    // Check if client exists
    const checkClient = await db.query("SELECT id FROM clients WHERE id = $1", [
      id,
    ]);
    if (checkClient.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Check if email is taken by another client
    if (email) {
      const emailCheck = await db.query(
        "SELECT id FROM clients WHERE email = $1 AND id != $2",
        [email, id]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email already in use by another client",
        });
      }
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCounter = 1;

    if (first_name !== undefined) {
      updates.push(`first_name = $${paramCounter}`);
      values.push(first_name);
      paramCounter++;
    }
    if (last_name !== undefined) {
      updates.push(`last_name = $${paramCounter}`);
      values.push(last_name);
      paramCounter++;
    }
    if (email !== undefined) {
      updates.push(`email = $${paramCounter}`);
      values.push(email);
      paramCounter++;
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramCounter}`);
      values.push(phone);
      paramCounter++;
    }
    if (address !== undefined) {
      updates.push(`address = $${paramCounter}`);
      values.push(address);
      paramCounter++;
    }
    if (city !== undefined) {
      updates.push(`city = $${paramCounter}`);
      values.push(city);
      paramCounter++;
    }
    if (postal_code !== undefined) {
      updates.push(`postal_code = $${paramCounter}`);
      values.push(postal_code);
      paramCounter++;
    }
    if (country !== undefined) {
      updates.push(`country = $${paramCounter}`);
      values.push(country);
      paramCounter++;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE clients SET ${updates.join(
      ", "
    )} WHERE id = $${paramCounter} RETURNING *`;
    const result = await db.query(query, values);

    res.json({
      success: true,
      message: "Client updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update client error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating client",
      error: error.message,
    });
  }
};

// Delete client
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if client has orders
    const ordersCheck = await db.query(
      "SELECT COUNT(*) FROM orders WHERE client_id = $1",
      [id]
    );
    const orderCount = parseInt(ordersCheck.rows[0].count);

    if (orderCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete client with ${orderCount} existing order(s). Consider archiving instead.`,
      });
    }

    const result = await db.query(
      "DELETE FROM clients WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    res.json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    console.error("Delete client error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting client",
      error: error.message,
    });
  }
};
