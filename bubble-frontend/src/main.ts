import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
// 1. 引入需要的组件
import { Button, NavBar, Icon} from 'vant'
// 2. 引入组件样式
import Vant from 'vant';// 全局引入 不再需要分别引入Button，Icon之类的。但体积会大
import 'vant/lib/index.css';
import * as VueRouter from 'vue-router'
import routes from "./config/route"

const app = createApp(App)

app.use(Vant)
// app.use(Button)
// app.use(NavBar)



const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,// routes: routes 缩写
})
app.use(router)

app.mount('#app')
