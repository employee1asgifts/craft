import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'postgres',
  logging: true, // Enable logging to see SQL queries
});

// Define User model
const User = sequelize.define('User', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  role: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'user',
  },
}, {
  tableName: 'users',
});

// Define Customer model
const Customer = sequelize.define('Customer', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  address: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  pincode: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  totalOrders: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  totalSpent: {
    type: Sequelize.STRING,
    defaultValue: '₹0',
  },
  lastOrder: {
    type: Sequelize.STRING,
    defaultValue: 'N/A',
  },
}, {
  tableName: 'customers',
});

// Define Order model
const Order = sequelize.define('Order', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  invoiceNumber: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  date: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  shippingCost: {
    type: Sequelize.DECIMAL(10, 2),
    defaultValue: 0,
  },
  totalAmount: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
  },
  paidAmount: {
    type: Sequelize.DECIMAL(10, 2),
    defaultValue: 0,
  },
  balance: {
    type: Sequelize.DECIMAL(10, 2),
    defaultValue: 0,
  },
  paymentMethod: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  status: {
    type: Sequelize.STRING,
    defaultValue: 'pending',
  },
}, {
  tableName: 'orders',
});

// Define OrderItem model
const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  quantity: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  price: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
  },
  total: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  tableName: 'order_items',
});

// Define relationships
Order.belongsTo(Customer, { foreignKey: 'customerId' });
Customer.hasMany(Order, { foreignKey: 'customerId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// Initialize database
async function initDatabase() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync all models with the database
    await sequelize.sync({ force: true }); // This will drop existing tables and recreate them
    console.log('Database synchronized successfully');

    // Create a default admin user
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123', // In production, this should be hashed
      role: 'admin',
    });
    console.log('Default admin user created');

    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase(); 