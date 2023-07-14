const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 1000000 },
  portfolio: {
    type: Map,
    of: Number,
    default: {
      Reliance: 0,
      HDFC: 0,
      Tata: 0,
      ITC: 0,
      Adani: 0
    }
  }
});

const StockSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true }
});

const User = mongoose.model('User', UserSchema);
const Stock = mongoose.model('Stock', StockSchema);

module.exports = { User, Stock };
