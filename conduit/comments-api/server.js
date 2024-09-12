const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

let comments = [];

// GET /comments - Lấy tất cả bình luận
app.get('/comments', (req, res) => {
  res.json(comments);
});

// POST /comments - Gửi bình luận mới
app.post('/comments', (req, res) => {
  const { body } = req.body;
  if (body) {
    const newComment = { id: comments.length + 1, body };
    comments.push(newComment);
    res.status(201).json(newComment);
  } else {
    res.status(400).json({ error: 'Comment body is required' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
