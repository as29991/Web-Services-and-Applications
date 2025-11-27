const db = require("../config/database");

// ============ CATEGORIES ============

exports.getAllCategories = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM categories ORDER BY name");
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving categories",
      error: error.message,
    });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const result = await db.query(
      "INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *",
      [name, description]
    );

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Category name already exists",
      });
    }
    console.error("Create category error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating category",
      error: error.message,
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const result = await db.query(
      "UPDATE categories SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
      [name, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      message: "Category updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Category name already exists",
      });
    }
    console.error("Update category error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating category",
      error: error.message,
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM categories WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting category",
      error: error.message,
    });
  }
};

// ============ BRANDS ============

exports.getAllBrands = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM brands ORDER BY name");
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get brands error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving brands",
      error: error.message,
    });
  }
};

exports.createBrand = async (req, res) => {
  try {
    const { name, description } = req.body;

    const result = await db.query(
      "INSERT INTO brands (name, description) VALUES ($1, $2) RETURNING *",
      [name, description]
    );

    res.status(201).json({
      success: true,
      message: "Brand created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Brand name already exists",
      });
    }
    console.error("Create brand error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating brand",
      error: error.message,
    });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const result = await db.query(
      "UPDATE brands SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
      [name, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    res.json({
      success: true,
      message: "Brand updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Brand name already exists",
      });
    }
    console.error("Update brand error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating brand",
      error: error.message,
    });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM brands WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    res.json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    console.error("Delete brand error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting brand",
      error: error.message,
    });
  }
};

// ============ COLORS ============

exports.getAllColors = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM colors ORDER BY name");
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get colors error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving colors",
      error: error.message,
    });
  }
};

exports.createColor = async (req, res) => {
  try {
    const { name, hex_code } = req.body;

    const result = await db.query(
      "INSERT INTO colors (name, hex_code) VALUES ($1, $2) RETURNING *",
      [name, hex_code]
    );

    res.status(201).json({
      success: true,
      message: "Color created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Color name already exists",
      });
    }
    console.error("Create color error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating color",
      error: error.message,
    });
  }
};

exports.updateColor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, hex_code } = req.body;

    const result = await db.query(
      "UPDATE colors SET name = $1, hex_code = $2 WHERE id = $3 RETURNING *",
      [name, hex_code, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Color not found",
      });
    }

    res.json({
      success: true,
      message: "Color updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Color name already exists",
      });
    }
    console.error("Update color error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating color",
      error: error.message,
    });
  }
};

exports.deleteColor = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM colors WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Color not found",
      });
    }

    res.json({
      success: true,
      message: "Color deleted successfully",
    });
  } catch (error) {
    console.error("Delete color error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting color",
      error: error.message,
    });
  }
};

// ============ SIZES ============

exports.getAllSizes = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM sizes ORDER BY sort_order, name"
    );
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get sizes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving sizes",
      error: error.message,
    });
  }
};

exports.createSize = async (req, res) => {
  try {
    const { name, description, sort_order } = req.body;

    const result = await db.query(
      "INSERT INTO sizes (name, description, sort_order) VALUES ($1, $2, $3) RETURNING *",
      [name, description, sort_order]
    );

    res.status(201).json({
      success: true,
      message: "Size created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Size name already exists",
      });
    }
    console.error("Create size error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating size",
      error: error.message,
    });
  }
};

exports.updateSize = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, sort_order } = req.body;

    const result = await db.query(
      "UPDATE sizes SET name = $1, description = $2, sort_order = $3 WHERE id = $4 RETURNING *",
      [name, description, sort_order, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Size not found",
      });
    }

    res.json({
      success: true,
      message: "Size updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Size name already exists",
      });
    }
    console.error("Update size error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating size",
      error: error.message,
    });
  }
};

exports.deleteSize = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM sizes WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Size not found",
      });
    }

    res.json({
      success: true,
      message: "Size deleted successfully",
    });
  } catch (error) {
    console.error("Delete size error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting size",
      error: error.message,
    });
  }
};

// ============ GENDERS ============

exports.getAllGenders = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM genders ORDER BY name");
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get genders error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving genders",
      error: error.message,
    });
  }
};

exports.createGender = async (req, res) => {
  try {
    const { name, description } = req.body;

    const result = await db.query(
      "INSERT INTO genders (name, description) VALUES ($1, $2) RETURNING *",
      [name, description]
    );

    res.status(201).json({
      success: true,
      message: "Gender created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Gender name already exists",
      });
    }
    console.error("Create gender error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating gender",
      error: error.message,
    });
  }
};

exports.updateGender = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const result = await db.query(
      "UPDATE genders SET name = $1, description = $2 WHERE id = $3 RETURNING *",
      [name, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Gender not found",
      });
    }

    res.json({
      success: true,
      message: "Gender updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Gender name already exists",
      });
    }
    console.error("Update gender error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating gender",
      error: error.message,
    });
  }
};

exports.deleteGender = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM genders WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Gender not found",
      });
    }

    res.json({
      success: true,
      message: "Gender deleted successfully",
    });
  } catch (error) {
    console.error("Delete gender error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting gender",
      error: error.message,
    });
  }
};
