const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(cors());

let comments = [];

app.post('/api/comments', (req, res) => {
  const { comment } = req.body;
  if (comment) {
    comments.push(comment);
    res.status(201).send({ message: 'Comment added', comments });
  } else {
    res.status(400).send({ message: 'Comment is required' });
  }
});

app.get('/api/comments', (req, res) => {
  res.status(200).send(comments);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
