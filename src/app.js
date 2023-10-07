const express = require("express");
const mysql = require("mysql2");
const cors = require("cors")
const bodyParser = require("body-parser");

const dbConfig = require("./database.config");
const entRouter = require("./routers/entRouter")
const promotionRouter = require("./routers/promotionRouter")

require('dotenv').config();


const app = express();
const port = 22013;
app.use(cors());

const fs = require('fs');
const path = require('path');
const caPath = path.join(__dirname, 'ca.pem');
// Create a MySQL connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: {
    ca: fs.readFileSync(caPath, 'utf8'),
  },
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the MySQL database:", err);
    process.exit(1); // Exit the application with an error code
  }
  console.log("Connected to the MySQL database");
});
// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

entRouter(app, connection);
promotionRouter(app, connection);

// Start the server
app.listen(process.env.PORT || port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});