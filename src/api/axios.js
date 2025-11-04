import axios from 'axios';


const api = axios.create({
  baseURL: 'http://34.50.38.218/badge', // 실제 백엔드 주소
  withCredentials: true, // 쿠키 인증
});


export default api;