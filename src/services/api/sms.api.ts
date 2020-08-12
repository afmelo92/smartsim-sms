import axios from 'axios';

const SMSDevApi = axios.create({
  baseURL: 'https://api.smsdev.com.br/',
});

export default SMSDevApi;
