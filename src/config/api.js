import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://192.168.0.109:3333/',
  // baseURL: 'http://192.168.0.16:3333/',
  // baseURL: 'http://192.168.0.10:3333/',
  baseURL: 'https://aplicativomaisescola.com.br/fisioresp/',
});
//baseURL: 'http://aplicativomaisescola.com.br/fisioresp/',
//baseURL: 'http://192.168.0.22:8888/',
//
export default api;
