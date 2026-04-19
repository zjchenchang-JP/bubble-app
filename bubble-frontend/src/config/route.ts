import Index from '../pages/Index.vue';
import SearchPage from '../pages/searchPage.vue';
import TeamPage from '../pages/TeamPage.vue';
import UserEditPage from '../pages/UserEditPage.vue';
import UserPage from '../pages/UserPage.vue';
import type { RouteRecordRaw } from 'vue-router';

// 定义路由规则
const routes: RouteRecordRaw[] = [
    {path: '/',component: Index},
    {path: '/team',component: TeamPage},
    {path: '/user',component: UserPage},
    {path: '/search',component: SearchPage},
    {path: '/user/edit',component: UserEditPage},
]

export default routes