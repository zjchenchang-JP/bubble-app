import Index from '../pages/Index.vue';
import SearchPage from '../pages/searchPage.vue';
import SearchResultPage from '../pages/searchResultPage.vue';
import TeamAddPage from '../pages/TeamAddPage.vue';
import TeamUpdatePage from '../pages/TeamUpdatePage.vue';
import TeamPage from '../pages/TeamPage.vue';
import UserEditPage from '../pages/UserEditPage.vue';
import UserLoginPage from '../pages/UserLoginPage.vue';
import UserPage from '../pages/UserPage.vue';
import type { RouteRecordRaw } from 'vue-router';
import UserUpdatePage from '../pages/UserUpdatePage.vue';
import UserTeamJoinPage from '../pages/UserTeamJoinPage.vue';
import UserTeamCreatePage from '../pages/UserTeamCreatePage.vue';

// 定义路由规则
const routes: RouteRecordRaw[] = [
  // {path: '/',component: Index},
  // {path: '/team',component: TeamPage},
  // {path: '/user',component: UserPage},
  // {path: '/search',component: SearchPage},
  // {path: '/user/list',component: SearchResultPage},
  // {path: '/user/edit',component: UserEditPage},
  // {path: '/user/update',component: UserUpdatePage},
  // {path: '/user/login',component: UserLoginPage},
  // {path: '/team/add',component: TeamAddPage},
  // {path: '/team/update',component: TeamUpdatePage},
  // {path: '/user/team/join',component: UserTeamJoinPage},
  // {path: '/user/team/create',component: UserTeamCreatePage},
  { path: '/', component: Index },
  { path: '/team', meta: { title: '找队伍' }, component: TeamPage },
  { path: '/team/add', meta: { title: '创建队伍' }, component: TeamAddPage },
  { path: '/team/update', meta: { title: '更新队伍' }, component: TeamUpdatePage },
  { path: '/user', meta: { title: '个人信息' }, component: UserPage },
  { path: '/search', meta: { title: '找伙伴' }, component: SearchPage },
  { path: '/user/list', meta: { title: '用户列表' }, component: SearchResultPage },
  { path: '/user/edit', meta: { title: '编辑信息' }, component: UserEditPage },
  { path: '/user/login', meta: { title: '登录' }, component: UserLoginPage },
  { path: '/user/update', meta: { title: '更新信息' }, component: UserUpdatePage },
  { path: '/user/team/join', meta: { title: '加入队伍' }, component: UserTeamJoinPage },
  { path: '/user/team/create', meta: { title: '我创建的队伍' }, component: UserTeamCreatePage },

]

export default routes