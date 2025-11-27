const db = require("../config/database");

// Get all discounts
exports.getAllDiscounts = async (req, res) => {
  try {
    const { is_active, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `
            SELECT d.*, 
                   p.name as product_name,
                   p.price as product_price,
                   u.username as created_by_username
            FROM discounts d
            LEFT JOIN products p ON d.product_id = p.id
            LEFT JOIN users u ON d.created_by = u.id
        `;

    const queryParams = [];
    if (is_active !== undefined) {
      queryText += " WHERE d.is_active = $1";
      queryParams.push(is_active === "true");
    }

    queryText +=
      " ORDER BY d.created_at DESC LIMIT $" +
      (queryParams.length + 1) +
      " OFFSET $" +
      (queryParams.length + 2);
    queryParams.push(limit, offset);

    const result = await db.query(queryText, queryParams);

    // Get total count
    let countQuery = "SELECT COUNT(*) FROM discounts";
    if (is_active !== undefined) {
      countQuery += " WHERE is_active = $1";
      const countResult = await db.query(countQuery, [is_active === "true"]);
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
    console.error("Get all discounts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving discounts",
      error: error.message,
    });
  }
};

// Get discount by ID
exports.getDiscountById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT d.*, 
                    p.name as product_name,
                    p.price as product_price,
                    u.username as created_by_username
             FROM discounts d
             LEFT JOIN products p ON d.product_id = p.id
             LEFT JOIN users u ON d.created_by = u.id
             WHERE d.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Discount not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Get discount by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving discount",
      error: error.message,
    });
  }
};

// Get discounts for a specific product
exports.getProductDiscounts = async (req, res) => {
  try {
    const { productId } = req.params;
    const { is_active } = req.query;

    let queryText = `
            SELECT d.*, 
                   u.username as created_by_username
            FROM discounts d
            LEFT JOIN users u ON d.created_by = u.id
            WHERE d.product_id = $1
        `;

    const queryParams = [productId];

    if (is_active !== undefined) {
      queryText += " AND d.is_active = $2";
      queryParams.push(is_active === "true");
    }

    queryText += " ORDER BY d.created_at DESC";

    const result = await db.query(queryText, queryParams);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get product discounts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving product discounts",
      error: error.message,
    });
  }
};

// Apply discount to product
exports.applyDiscount = async (req, res) => {
  try {
    const {
      product_id,
      discount_percentage,
      discount_amount,
      start_date,
      end_date,
    } = req.body;

    // Verify product exists
    const productCheck = await db.query(
      "SELECT id, name FROM products WHERE id = $1",
      [product_id]
    );
    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Validate that either discount_percentage or discount_amount is provided, not both
    if (discount_percentage && discount_amount) {
      return res.status(400).json({
        success: false,
        message:
          "Provide either discount_percentage or discount_amount, not both",
      });
    }

    if (!discount_percentage && !discount_amount) {
      return res.status(400).json({
        success: false,
        message: "Either discount_percentage or discount_amount is required",
      });
    }

    // Validate date range
    if (new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({
        success: false,
        message: "Start date must be before end date",
      });
    }

    const result = await db.query(
      `INSERT INTO discounts 
             (product_id, discount_percentage, discount_amount, start_date, end_date, is_active, created_by)
             VALUES ($1, $2, $3, $4, $5, true, $6)
             RETURNING *`,
      [
        product_id,
        discount_percentage,
        discount_amount,
        start_date,
        end_date,
        req.user.id,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Discount applied successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Apply discount error:", error);
    res.status(500).json({
      success: false,
      message: "Server error applying discount",
      error: error.message,
    });
  }
};

// Update discount
exports.updateDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      discount_percentage,
      discount_amount,
      start_date,
      end_date,
      is_active,
    } = req.body;

    // Check if discount exists
    const checkDiscount = await db.query(
      "SELECT id FROM discounts WHERE id = $1",
      [id]
    );
    if (checkDiscount.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Discount not found",
      });
    }

    // Validate that either discount_percentage or discount_amount is provided, not both
    if (discount_percentage && discount_amount) {
      return res.status(400).json({
        success: false,
        message:
          "Provide either discount_percentage or discount_amount, not both",
      });
    }

    // Validate date range if provided
    if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({
        success: false,
        message: "Start date must be before end date",
      });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCounter = 1;

    if (discount_percentage !== undefined) {
      updates.push(`discount_percentage = $${paramCounter}`);
      values.push(discount_percentage);
      paramCounter++;
      updates.push(`discount_amount = NULL`);
    }
    if (discount_amount !== undefined) {
      updates.push(`discount_amount = $${paramCounter}`);
      values.push(discount_amount);
      paramCounter++;
      updates.push(`discount_percentage = NULL`);
    }
    if (start_date !== undefined) {
      updates.push(`start_date = $${paramCounter}`);
      values.push(start_date);
      paramCounter++;
    }
    if (end_date !== undefined) {
      updates.push(`end_date = $${paramCounter}`);
      values.push(end_date);
      paramCounter++;
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCounter}`);
      values.push(is_active);
      paramCounter++;
    }

    values.push(id);

    const query = `UPDATE discounts SET ${updates.join(
      ", "
    )} WHERE id = $${paramCounter} RETURNING *`;
    const result = await db.query(query, values);

    res.json({
      success: true,
      message: "Discount updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update discount error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating discount",
      error: error.message,
    });
  }
};

// Deactivate discount
exports.deactivateDiscount = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `UPDATE discounts 
             SET is_active = false 
             WHERE id = $1 
             RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Discount not found",
      });
    }

    res.json({
      success: true,
      message: "Discount deactivated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Deactivate discount error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deactivating discount",
      error: error.message,
    });
  }
};

// Delete discount
exports.deleteDiscount = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM discounts WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Discount not found",
      });
    }

    res.json({
      success: true,
      message: "Discount deleted successfully",
    });
  } catch (error) {
    console.error("Delete discount error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting discount",
      error: error.message,
    });
  }
};
