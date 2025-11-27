const db = require("../config/database");

// Get daily earnings
exports.getDailyEarnings = async (req, res) => {
  try {
    const { date } = req.query;

    let queryDate = date || new Date().toISOString().split("T")[0];

    const result = await db.query(
      `SELECT 
                DATE(order_date) as date,
                COUNT(*) as total_orders,
                SUM(total_amount) as total_earnings
             FROM orders
             WHERE DATE(order_date) = $1
                AND status IN ('confirmed', 'processing', 'shipped', 'delivered')
             GROUP BY DATE(order_date)`,
      [queryDate]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          date: queryDate,
          total_orders: 0,
          total_earnings: 0,
        },
      });
    }

    res.json({
      success: true,
      data: {
        date: result.rows[0].date,
        total_orders: parseInt(result.rows[0].total_orders),
        total_earnings: parseFloat(result.rows[0].total_earnings),
      },
    });
  } catch (error) {
    console.error("Get daily earnings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving daily earnings",
      error: error.message,
    });
  }
};

// Get monthly earnings
exports.getMonthlyEarnings = async (req, res) => {
  try {
    const { month, year } = req.query;

    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth() + 1;
    const targetYear = year || currentDate.getFullYear();

    const result = await db.query(
      `SELECT 
                EXTRACT(MONTH FROM order_date) as month,
                EXTRACT(YEAR FROM order_date) as year,
                COUNT(*) as total_orders,
                SUM(total_amount) as total_earnings
             FROM orders
             WHERE EXTRACT(MONTH FROM order_date) = $1
                AND EXTRACT(YEAR FROM order_date) = $2
                AND status IN ('confirmed', 'processing', 'shipped', 'delivered')
             GROUP BY EXTRACT(MONTH FROM order_date), EXTRACT(YEAR FROM order_date)`,
      [targetMonth, targetYear]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          month: parseInt(targetMonth),
          year: parseInt(targetYear),
          total_orders: 0,
          total_earnings: 0,
        },
      });
    }

    res.json({
      success: true,
      data: {
        month: parseInt(result.rows[0].month),
        year: parseInt(result.rows[0].year),
        total_orders: parseInt(result.rows[0].total_orders),
        total_earnings: parseFloat(result.rows[0].total_earnings),
      },
    });
  } catch (error) {
    console.error("Get monthly earnings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving monthly earnings",
      error: error.message,
    });
  }
};

// Get earnings by date range
exports.getEarningsByDateRange = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "start_date and end_date are required",
      });
    }

    const result = await db.query(
      `SELECT 
                DATE(order_date) as date,
                COUNT(*) as total_orders,
                SUM(total_amount) as total_earnings
             FROM orders
             WHERE DATE(order_date) BETWEEN $1 AND $2
                AND status IN ('confirmed', 'processing', 'shipped', 'delivered')
             GROUP BY DATE(order_date)
             ORDER BY DATE(order_date)`,
      [start_date, end_date]
    );

    // Calculate totals
    const totals = await db.query(
      `SELECT 
                COUNT(*) as total_orders,
                SUM(total_amount) as total_earnings
             FROM orders
             WHERE DATE(order_date) BETWEEN $1 AND $2
                AND status IN ('confirmed', 'processing', 'shipped', 'delivered')`,
      [start_date, end_date]
    );

    res.json({
      success: true,
      data: {
        start_date,
        end_date,
        daily_breakdown: result.rows.map((row) => ({
          date: row.date,
          total_orders: parseInt(row.total_orders),
          total_earnings: parseFloat(row.total_earnings),
        })),
        summary: {
          total_orders: parseInt(totals.rows[0].total_orders) || 0,
          total_earnings: parseFloat(totals.rows[0].total_earnings) || 0,
        },
      },
    });
  } catch (error) {
    console.error("Get earnings by date range error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving earnings by date range",
      error: error.message,
    });
  }
};

// Get top selling products
exports.getTopSellingProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const result = await db.query(
      `SELECT 
                p.id,
                p.name,
                p.price,
                p.image_url,
                c.name as category_name,
                b.name as brand_name,
                SUM(oi.quantity) as total_sold,
                SUM(oi.subtotal) as total_revenue
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             JOIN orders o ON oi.order_id = o.id
             LEFT JOIN categories c ON p.category_id = c.id
             LEFT JOIN brands b ON p.brand_id = b.id
             WHERE o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
             GROUP BY p.id, p.name, p.price, p.image_url, c.name, b.name
             ORDER BY total_sold DESC
             LIMIT $1`,
      [limit]
    );

    res.json({
      success: true,
      data: result.rows.map((row) => ({
        product_id: row.id,
        product_name: row.name,
        price: parseFloat(row.price),
        category: row.category_name,
        brand: row.brand_name,
        image_url: row.image_url,
        total_sold: parseInt(row.total_sold),
        total_revenue: parseFloat(row.total_revenue),
      })),
    });
  } catch (error) {
    console.error("Get top selling products error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving top selling products",
      error: error.message,
    });
  }
};

// Get sales by category
exports.getSalesByCategory = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
                c.id as category_id,
                c.name as category_name,
                COUNT(DISTINCT o.id) as total_orders,
                SUM(oi.quantity) as total_units_sold,
                SUM(oi.subtotal) as total_revenue
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             JOIN orders o ON oi.order_id = o.id
             JOIN categories c ON p.category_id = c.id
             WHERE o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
             GROUP BY c.id, c.name
             ORDER BY total_revenue DESC`
    );

    res.json({
      success: true,
      data: result.rows.map((row) => ({
        category_id: row.category_id,
        category_name: row.category_name,
        total_orders: parseInt(row.total_orders),
        total_units_sold: parseInt(row.total_units_sold),
        total_revenue: parseFloat(row.total_revenue),
      })),
    });
  } catch (error) {
    console.error("Get sales by category error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving sales by category",
      error: error.message,
    });
  }
};

// Get sales by brand
exports.getSalesByBrand = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
                b.id as brand_id,
                b.name as brand_name,
                COUNT(DISTINCT o.id) as total_orders,
                SUM(oi.quantity) as total_units_sold,
                SUM(oi.subtotal) as total_revenue
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             JOIN orders o ON oi.order_id = o.id
             JOIN brands b ON p.brand_id = b.id
             WHERE o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
             GROUP BY b.id, b.name
             ORDER BY total_revenue DESC`
    );

    res.json({
      success: true,
      data: result.rows.map((row) => ({
        brand_id: row.brand_id,
        brand_name: row.brand_name,
        total_orders: parseInt(row.total_orders),
        total_units_sold: parseInt(row.total_units_sold),
        total_revenue: parseFloat(row.total_revenue),
      })),
    });
  } catch (error) {
    console.error("Get sales by brand error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving sales by brand",
      error: error.message,
    });
  }
};

// Get low stock products
exports.getLowStockProducts = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;

    const result = await db.query(
      `SELECT 
                p.id,
                p.name,
                p.price,
                p.quantity as initial_quantity,
                c.name as category_name,
                b.name as brand_name,
                COALESCE(SUM(oi.quantity), 0) as sold_quantity,
                (p.quantity - COALESCE(SUM(oi.quantity), 0)) as current_quantity
             FROM products p
             LEFT JOIN order_items oi ON p.id = oi.product_id
             LEFT JOIN orders o ON oi.order_id = o.id 
                 AND o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
             LEFT JOIN categories c ON p.category_id = c.id
             LEFT JOIN brands b ON p.brand_id = b.id
             WHERE p.is_active = true
             GROUP BY p.id, p.name, p.price, p.quantity, c.name, b.name
             HAVING (p.quantity - COALESCE(SUM(oi.quantity), 0)) <= $1
             ORDER BY current_quantity ASC`,
      [threshold]
    );

    res.json({
      success: true,
      data: result.rows.map((row) => ({
        product_id: row.id,
        product_name: row.name,
        price: parseFloat(row.price),
        category: row.category_name,
        brand: row.brand_name,
        initial_quantity: parseInt(row.initial_quantity),
        sold_quantity: parseInt(row.sold_quantity),
        current_quantity: parseInt(row.current_quantity),
      })),
      threshold: parseInt(threshold),
    });
  } catch (error) {
    console.error("Get low stock products error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving low stock products",
      error: error.message,
    });
  }
};

// Get revenue summary
exports.getRevenueSummary = async (req, res) => {
  try {
    // Today's earnings
    const today = await db.query(
      `SELECT 
                COUNT(*) as orders,
                COALESCE(SUM(total_amount), 0) as revenue
             FROM orders
             WHERE DATE(order_date) = CURRENT_DATE
                AND status IN ('confirmed', 'processing', 'shipped', 'delivered')`
    );

    // This month's earnings
    const thisMonth = await db.query(
      `SELECT 
                COUNT(*) as orders,
                COALESCE(SUM(total_amount), 0) as revenue
             FROM orders
             WHERE EXTRACT(MONTH FROM order_date) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(YEAR FROM order_date) = EXTRACT(YEAR FROM CURRENT_DATE)
                AND status IN ('confirmed', 'processing', 'shipped', 'delivered')`
    );

    // This year's earnings
    const thisYear = await db.query(
      `SELECT 
                COUNT(*) as orders,
                COALESCE(SUM(total_amount), 0) as revenue
             FROM orders
             WHERE EXTRACT(YEAR FROM order_date) = EXTRACT(YEAR FROM CURRENT_DATE)
                AND status IN ('confirmed', 'processing', 'shipped', 'delivered')`
    );

    // All time earnings
    const allTime = await db.query(
      `SELECT 
                COUNT(*) as orders,
                COALESCE(SUM(total_amount), 0) as revenue
             FROM orders
             WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')`
    );

    // Order status breakdown
    const statusBreakdown = await db.query(
      `SELECT 
                status,
                COUNT(*) as count
             FROM orders
             GROUP BY status
             ORDER BY count DESC`
    );

    res.json({
      success: true,
      data: {
        today: {
          orders: parseInt(today.rows[0].orders),
          revenue: parseFloat(today.rows[0].revenue),
        },
        this_month: {
          orders: parseInt(thisMonth.rows[0].orders),
          revenue: parseFloat(thisMonth.rows[0].revenue),
        },
        this_year: {
          orders: parseInt(thisYear.rows[0].orders),
          revenue: parseFloat(thisYear.rows[0].revenue),
        },
        all_time: {
          orders: parseInt(allTime.rows[0].orders),
          revenue: parseFloat(allTime.rows[0].revenue),
        },
        order_status_breakdown: statusBreakdown.rows.map((row) => ({
          status: row.status,
          count: parseInt(row.count),
        })),
      },
    });
  } catch (error) {
    console.error("Get revenue summary error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving revenue summary",
      error: error.message,
    });
  }
};
