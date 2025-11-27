const bcrypt = require("bcryptjs");
const db = require("../config/database");

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT u.id, u.username, u.email, r.name as role, u.is_active, u.created_at
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             ORDER BY u.created_at DESC
             LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Get total count
    const countResult = await db.query("SELECT COUNT(*) FROM users");
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
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving users",
      error: error.message,
    });
  }
};

// Get all roles
exports.getAllRoles = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM roles ORDER BY id");

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get all roles error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving roles",
      error: error.message,
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT u.id, u.username, u.email, r.name as role, u.is_active, u.created_at, u.updated_at
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             WHERE u.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving user",
      error: error.message,
    });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await db.query(
      "SELECT id FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Get role_id
    const roleQuery = await db.query("SELECT id FROM roles WHERE name = $1", [
      role || "simple_user",
    ]);

    if (roleQuery.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const roleId = roleQuery.rows[0].id;

    // Insert new user
    const result = await db.query(
      `INSERT INTO users (username, email, password_hash, role_id, is_active)
             VALUES ($1, $2, $3, $4, true)
             RETURNING id, username, email, created_at`,
      [username, email, hashedPassword, roleId]
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        ...result.rows[0],
        role: role || "simple_user",
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating user",
      error: error.message,
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;

    // Check if user exists
    const checkUser = await db.query("SELECT id FROM users WHERE id = $1", [
      id,
    ]);
    if (checkUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if username or email is taken by another user
    if (username || email) {
      const duplicateCheck = await db.query(
        "SELECT id FROM users WHERE (username = $1 OR email = $2) AND id != $3",
        [username || "", email || "", id]
      );
      if (duplicateCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Username or email already in use by another user",
        });
      }
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCounter = 1;

    if (username !== undefined) {
      updates.push(`username = $${paramCounter}`);
      values.push(username);
      paramCounter++;
    }
    if (email !== undefined) {
      updates.push(`email = $${paramCounter}`);
      values.push(email);
      paramCounter++;
    }
    if (role !== undefined) {
      // Get role_id
      const roleQuery = await db.query("SELECT id FROM roles WHERE name = $1", [
        role,
      ]);
      if (roleQuery.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid role",
        });
      }
      updates.push(`role_id = $${paramCounter}`);
      values.push(roleQuery.rows[0].id);
      paramCounter++;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
            UPDATE users 
            SET ${updates.join(", ")} 
            WHERE id = $${paramCounter} 
            RETURNING id, username, email, created_at, updated_at
        `;
    const result = await db.query(query, values);

    // Get role name
    const userWithRole = await db.query(
      `SELECT u.*, r.name as role 
             FROM users u 
             LEFT JOIN roles r ON u.role_id = r.id 
             WHERE u.id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: "User updated successfully",
      data: {
        id: userWithRole.rows[0].id,
        username: userWithRole.rows[0].username,
        email: userWithRole.rows[0].email,
        role: userWithRole.rows[0].role,
        is_active: userWithRole.rows[0].is_active,
        created_at: userWithRole.rows[0].created_at,
        updated_at: userWithRole.rows[0].updated_at,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating user",
      error: error.message,
    });
  }
};

// Reset user password
exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    // Check if user exists
    const checkUser = await db.query("SELECT id FROM users WHERE id = $1", [
      id,
    ]);
    if (checkUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    // Update password
    await db.query(
      "UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [hashedPassword, id]
    );

    res.json({
      success: true,
      message: "User password reset successfully",
    });
  } catch (error) {
    console.error("Reset user password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error resetting password",
      error: error.message,
    });
  }
};

// Toggle user status (activate/deactivate)
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deactivating themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot deactivate your own account",
      });
    }

    const result = await db.query(
      `UPDATE users 
             SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $1 
             RETURNING id, username, email, is_active`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = result.rows[0];
    res.json({
      success: true,
      message: `User ${
        user.is_active ? "activated" : "deactivated"
      } successfully`,
      data: user,
    });
  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error toggling user status",
      error: error.message,
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    const result = await db.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting user",
      error: error.message,
    });
  }
};
