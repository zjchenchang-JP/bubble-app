import Index from '../pages/Index.vue';
import Team from '../pages/Team.vue';
import User from '../pages/User.vue';
import type { RouteRecordRaw } from 'vue-router';

// 定义路由规则
const routes: RouteRecordRaw[] = [
    {path: '/',component: Index},
    {path: '/team',component: Team},
    {path: '/user',component: User},
]

export default routes