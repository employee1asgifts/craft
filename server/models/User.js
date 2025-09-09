import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'manager', 'designer', 'user'),
    defaultValue: 'user'
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastActive: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  joinDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

export default User; 