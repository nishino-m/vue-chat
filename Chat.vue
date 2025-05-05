<template>
    <div>
      <div v-for="m in messages" :key="m.id">{{ m.text }}</div>
      <input v-model="text" @keyup.enter="sendMessage" placeholder="メッセージ" />
      <button @click="sendMessage">送信</button>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import { io } from 'socket.io-client';
  
  const socket = io('http://3.26.208.186:3000');
  
  const text = ref('');
  const messages = ref([]);
  
  const loadMessages = async () => {
    const res = await axios.get('http://3.26.208.186:3000/messages');
    messages.value = res.data;
  };
  
  const sendMessage = () => {
    if (text.value.trim() !== '') {
      socket.emit('sendMessage', { text: text.value });
      text.value = '';
    }
  };
  
  onMounted(() => {
    loadMessages();
    socket.on('newMessage', (msg) => {
      messages.value.push(msg);
    });
  });
  </script>
  
  <style>
  /* お好みで */
  input {
    padding: 8px;
    margin-right: 8px;
  }
  button {
    padding: 8px;
  }
  </style>