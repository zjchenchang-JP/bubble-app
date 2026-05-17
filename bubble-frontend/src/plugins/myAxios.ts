import axios from "axios";

/**
 * 
 * const isDev = import.meta.env.DEV; // true = 开发环境, false = 生产环境
 * const myAxios = axios.create({
    baseURL: isDev ? 'http://localhost:8080/api' : '线上生产环境地址',
});
 */

// Set config defaults when creating the instance
const myAxios = axios.create({
  // 多环境配置
  baseURL: import.meta.env.VITE_APP_BASE_URL,
});

// 前端请求携带Cookie
myAxios.defaults.withCredentials = true;

// 添加请求拦截器
myAxios.interceptors.request.use(function (config) {
    console.log("我要发送请求了,",config)
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 添加响应拦截器
myAxios.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    console.log("我收到你的响应了,",response)
    // 未登录则跳转到登录页
    if(response?.data?.code === 40100){
      const redirectUrl = window.location.href
      window.location.href = `/user/login?redirectUrl=${redirectUrl}`
    }
    return response.data;
}, function (error) {
    // 响应错误处理
    return Promise.reject(error);
});

export default myAxios;