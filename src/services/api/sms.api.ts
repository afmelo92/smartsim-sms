import axios from 'axios';

const SMSDevApi = axios.create({
  baseURL: 'https://cors-anywhere.herokuapp.com/https://api.smsdev.com.br/v1/',
});

export default SMSDevApi;
