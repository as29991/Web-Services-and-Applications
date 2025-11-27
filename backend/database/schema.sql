-- Create Roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Genders table
CREATE TABLE genders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Brands table
CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Colors table
CREATE TABLE colors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    hex_code VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Sizes table
CREATE TABLE sizes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    sort_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL,
    gender_id INTEGER REFERENCES genders(id) ON DELETE SET NULL,
    color_id INTEGER REFERENCES colors(id) ON DELETE SET NULL,
    size_id INTEGER REFERENCES sizes(id) ON DELETE SET NULL,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (price >= 0),
    CHECK (quantity >= 0)
);

-- Create Discounts table
CREATE TABLE discounts (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    discount_percentage DECIMAL(5, 2),
    discount_amount DECIMAL(10, 2),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    CHECK (start_date < end_date)
);

-- Create Clients table
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    shipping_address TEXT,
    notes TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (total_amount >= 0),
    CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'))
);

-- Create Order Items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    discount_applied DECIMAL(10, 2) DEFAULT 0,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (quantity > 0),
    CHECK (unit_price >= 0),
    CHECK (subtotal >= 0)
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_gender ON products(gender_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_orders_client ON orders(client_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('admin', 'Full access to all features'),
('advanced_user', 'Can manage products, view orders, and generate reports'),
('simple_user', 'Can manage products with limited privileges');

-- Insert default genders
INSERT INTO genders (name, description) VALUES
('Men', 'Men''s clothing'),
('Women', 'Women''s clothing'),
('Children', 'Children''s clothing'),
('Unisex', 'Unisex clothing');

-- Insert default sizes
INSERT INTO sizes (name, description, sort_order) VALUES
('XS', 'Extra Small', 1),
('S', 'Small', 2),
('M', 'Medium', 3),
('L', 'Large', 4),
('XL', 'Extra Large', 5),
('XXL', 'Double Extra Large', 6);

-- Insert sample colors
INSERT INTO colors (name, hex_code) VALUES
('Red', '#FF0000'),
('Blue', '#0000FF'),
('Green', '#00FF00'),
('Black', '#000000'),
('White', '#FFFFFF'),
('Yellow', '#FFFF00'),
('Pink', '#FFC0CB'),
('Purple', '#800080'),
('Orange', '#FFA500'),
('Gray', '#808080');

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
('Shirts', 'Various types of shirts'),
('Pants', 'Trousers and jeans'),
('Jackets', 'Outerwear and jackets'),
('Shoes', 'Footwear'),
('Accessories', 'Belts, hats, and other accessories'),
('Dresses', 'Women''s dresses'),
('Sportswear', 'Athletic and sports clothing');

-- Insert sample brands
INSERT INTO brands (name, description) VALUES
('Nike', 'Sportswear brand'),
('Adidas', 'Sports and casual wear'),
('Zara', 'Fashion retailer'),
('H&M', 'Fast fashion'),
('Tommy Hilfiger', 'Premium casual wear'),
('Levi''s', 'Denim specialist'),
('Under Armour', 'Performance apparel');

-- Create a view for products with current quantity (real-time calculation)
CREATE OR REPLACE VIEW product_inventory AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.quantity AS initial_quantity,
    COALESCE(SUM(oi.quantity), 0) AS sold_quantity,
    (p.quantity - COALESCE(SUM(oi.quantity), 0)) AS current_quantity,
    c.name AS category,
    b.name AS brand,
    g.name AS gender,
    col.name AS color,
    s.name AS size,
    p.is_active
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN genders g ON p.gender_id = g.id
LEFT JOIN colors col ON p.color_id = col.id
LEFT JOIN sizes s ON p.size_id = s.id
GROUP BY p.id, c.name, b.name, g.name, col.name, s.name;

-- Create a view for active discounts
CREATE OR REPLACE VIEW active_discounts AS
SELECT 
    d.id,
    d.product_id,
    p.name AS product_name,
    d.discount_percentage,
    d.discount_amount,
    d.start_date,
    d.end_date,
    p.price AS original_price,
    CASE 
        WHEN d.discount_amount IS NOT NULL THEN p.price - d.discount_amount
        ELSE p.price * (1 - d.discount_percentage / 100)
    END AS discounted_price
FROM discounts d
JOIN products p ON d.product_id = p.id
WHERE d.is_active = true 
    AND CURRENT_TIMESTAMP BETWEEN d.start_date AND d.end_date;
