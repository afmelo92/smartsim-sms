import axios from 'axios';

const SSApi = axios.create({
  baseURL: 'http://localhost:3333',
});

export default SSApi;
