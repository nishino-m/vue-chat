const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const AWS = require('aws-sdk');
const cors = require('cors');

AWS.config.update({ region: 'ap-southeast-2' });
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

const TABLE_NAME = 'suiran';

app.get('/messages', async (req, res) => {
  const data = await dynamoDb.scan({ TableName: TABLE_NAME }).promise();
  res.send(data.Items.sort((a, b) => a.id - b.id));
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('sendMessage', async ({ text }) => {
    const timestamp = Date.now();

    const item = {
      id: timestamp, // 数値型のIDとして使う
      text,
      timestamp
    };

    await dynamoDb.put({
      TableName: TABLE_NAME,
      Item: item
    }).promise();

    io.emit('newMessage', item);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(3000, () => console.log('Server running on port 3000'));