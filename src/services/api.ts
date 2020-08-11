import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.smsdev.com.br/'
});

export default api;