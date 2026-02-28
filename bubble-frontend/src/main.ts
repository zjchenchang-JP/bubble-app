import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
// 1. 引入需要的组件
import { Button, NavBar } from 'vant';
// 2. 引入组件样式
import Vant from 'vant';// 全局引入
import 'vant/lib/index.css';


const app = createApp(App)
app.use(Vant)
// app.use(Button)
// app.use(NavBar)
app.mount('#app')
