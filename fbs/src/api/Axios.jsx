import axios from 'axios';

const API = axios.create({
  baseURL: "https://veeerix-production.up.railway.app",
  withCredentials: true, // if you're using cookies for auth
});

export default API;
