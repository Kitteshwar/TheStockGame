const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { User, Stock } = require('./models');

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (user.password != password) { 
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
});

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/portfolio');
  }
);

app.post('/buy', (req, res) => {
  const { stock, quantity } = req.body;

  Stock.findOne({ name: stock }, (err, stockDoc) => {
    if (err) return res.status(500).send('Error occurred while processing your order.');

    const cost = quantity * stockDoc.price;
    const portfolioQuantity = req.user.portfolio.get(stock) || 0;

    if (req.user.balance < cost) {
      return res.status(400).send('Insufficient balance.');
    }

    req.user.balance -= cost;
    req.user.portfolio.set(stock, portfolioQuantity + quantity);
    req.user.save();

    return res.status(200).send('Order processed successfully.');
  });
});

app.post('/sell', (req, res) => {
  const { stock, quantity } = req.body;

  Stock.findOne({ name: stock }, (err, stockDoc) => {
    if (err) return res.status(500).send('Error occurred while processing your order.');

    const portfolioQuantity = req.user.portfolio.get(stock) || 0;

    if (portfolioQuantity < quantity) {
      return res.status(400).send('Insufficient stocks.');
    }

    const earnings = quantity * stockDoc.price;

    req.user.balance += earnings;
    req.user.portfolio.set(stock, portfolioQuantity - quantity);
    req.user.save();

    return res.status(200).send('Order processed successfully.');
  });
});

app.listen(3000, () => console.log('Server started on port 3000'));
