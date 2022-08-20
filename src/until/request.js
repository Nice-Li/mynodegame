import Axios from 'axios'



export default Axios.create({
  // baseURL: 'http://localhost:8080',
  baseURL: 'http://zx.zxyow.com',
  timeout: 1000,
})