require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const connectToDB = require('./config/db');

// Import Routers (Fixed the path for accountRouter)
const authRouter = require('./routers/auth.route');
const accountRouter = require('./routers/account.route'); 
const transactionRoutes = require('./routers/transaction.route');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// Connect to Database
connectToDB();

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/accounts', accountRouter); // Handles /, /balance/:accountId
app.use('/api/transaction', transactionRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
