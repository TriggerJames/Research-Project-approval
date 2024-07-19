const express = require('express');
const app = express();
const unoconv = require('unoconv');
const sqlite3 = require('sqlite3').verbose();
const AWS = require('aws-sdk');

// Set up SQLite database
const db = new sqlite3.Database('file_conversion.db');

// Set up AWS Lambda
AWS.config.update({
  region: 'your-region',
  accessKeyId: 'your-access-key-id',
  secretAccessKey: 'your-secret-access-key',
});

const lambda = new AWS.Lambda({
  region: 'your-region',
});

// Set up Unoconv
unoconv.bin = 'unoconv';

// Define routes
app.post('/convert', (req, res) => {
  const file = req.body.file;
  const format = req.body.format;

  // Convert file using Unoconv
  unoconv.convert(file, format, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send({ error: 'Failed to convert file' });
    } else {
      // Save converted file to SQLite database
      db.run(`INSERT INTO files (file, format) VALUES (?, ?)`, file, format, (err) => {
        if (err) {
          console.error(err);
          res.status(500).send({ error: 'Failed to save file to database' });
        } else {
          res.send({ message: 'File converted successfully' });
        }
      });
    }
  });
});

app.get('/files', (req, res) => {
  // Retrieve files from SQLite database
  db.all(`SELECT * FROM files`, (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send({ error: 'Failed to retrieve files from database' });
    } else {
      res.send(rows);
    }
  });
});

// Set up AWS Lambda function
app.post('/lambda', (req, res) => {
  const file = req.body.file;
  const format = req.body.format;

  // Invoke AWS Lambda function
  lambda.invoke({
    FunctionName: 'file-conversion-lambda',
    Payload: JSON.stringify({ file, format }),
  }, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send({ error: 'Failed to invoke AWS Lambda function' });
    } else {
      res.send({ message: 'File converted successfully using AWS Lambda' });
    }
  });
});

// Start server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});