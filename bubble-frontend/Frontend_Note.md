# 2026/04/30
```vue
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";

// useRoute() — 返回当前路由信息（只读）; 用于读取当前页面的路由状态
// Route = 当前在哪（读），Router = 去哪里（写）
/**
const route = useRoute()
console.log(route.params.id)   // /user/:id → 获取 id
console.log(route.query.page)  // /user?page=1 → 获取查询参数

 */
const route = useRoute();
//  返回路由器实例（可执行导航）; 用于编程式导航，如跳转、前进、后退
/**
const router = useRouter()
router.push('/user/123')       // 跳转到指定路径
router.replace('/login')       // 替换当前历史记录
router.back()                  // 后退
router.go(-1)                  // 后退一步
 */
const router = useRouter();
```
- JavaScript对象的动态属性访问语法
```vue
const obj = { name: '张三', age: 20 }

// 1. 点语法 — key 必须是写死的字符串
obj.name        // '张三'
obj.age         // 20

// 2. 括号语法 — key 可以是变量
const key = 'name'
obj[key]        // '张三'
obj['age']      // 20

```
- 区别就在于：
             点语法 obj.key	                  括号语法 obj[key]
key是变量时	  不行，obj.key 找的是字面量"key"	  可以
key是字符串时	合法标识符（不能有空格、中文等）	 可以，obj['user name']


- // 跳转到 /home，当前页面的历史记录被替换, 不会留下历史记录
```vue 
router.replace('/home')

// 退到上一页，如果已是第一页则无效果
router.back()

```

---

## 拦截器解包导致页面空白排查记录

### 问题现象
登录成功后跳转到个人页，页面白屏，控制台报错：
```
Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'username')
```

### 根因
改了 axios 响应拦截器，从 `return response` 改为 `return response.data`，提前解包了一层。
但页面模板**没有同步修改**，导致两个问题：

1. **`user = ref()` 无初始值** — API 返回前 `user.value` 是 `undefined`，模板直接访问 `user.username` 就报错了
2. **`response.data?.data` 多取了一层** — 拦截器已返回 `data`，`.then` 里再 `.data` 就取到了 `undefined`

### 修复方式
```js
// 1. 拦截器解包后，调用处直接用 res.code / res.data，不要再 .data
// 改前（拦截器返回 response 时）:
return response.data?.data

// 改后（拦截器返回 response.data 时）:
return response?.data

// 2. ref 无初始值时，模板必须加 v-if 保护
const user = ref()  // 初始值是 undefined

// 模板中：
<template v-if="user">
  <van-cell :value="user.username" />
</template>
```

### 经验总结
- 拦截器 `return response.data` 后，**所有调用处的 `.data` 都要去掉一层**
- `ref()` 不传初始值时值是 `undefined`，模板里直接访问属性会报错，**必须用 `v-if` 保护**
- 这类改拦截器的操作影响面是全局的，改完要排查所有 API 调用处

---

## 2026/04/30 — 全链路排查：拦截器改动引发的连环问题

### 背景
在 `myAxios.ts` 响应拦截器中做了两处改动：
```js
// 改动1：新增携带Cookie
myAxios.defaults.withCredentials = true;

// 改动2：响应拦截器解包
// 改前
return response;
// 改后
return response.data;
```

改动2 导致前端所有页面的 API 调用返回值少了一层 `.data`，引发了一系列连锁问题。

---

### 问题一：searchResultPage 页面无数据

#### 现象
搜索用户页面无法正常显示用户列表。

#### 原因
拦截器已返回 `response.data`（即响应体 `{code: 0, data: [...]}`），但 `.then` 里又取了一层 `.data`：
```js
// 改前（拦截器返回 response 时）
return response.data?.data;  // response.data 是响应体，再 .data 取到数组

// 改后（拦截器返回 response.data 时）
return response?.data;       // response 就是响应体，直接 .data 取到数组
```

#### 修复
`response.data?.data` → `response?.data`，去掉多余的一层。

---

### 问题二：UserPage 白屏 — `Cannot read properties of undefined`

#### 现象
登录成功后跳转到个人页，页面白屏，控制台报错：
```
Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'username')
```

#### 原因
UserPage 从静态 mock 数据改为 API 动态获取：
```js
// 改前：静态对象，模板直接访问属性不会报错
const user = { id: 1, username: 'ZJCC', ... };

// 改后：ref() 无初始值，首次渲染时 user.value 是 undefined
const user = ref();
```
模板中直接使用 `user.username`，在 API 返回前 `user` 是 `undefined`，访问属性就报错。

#### 修复
1. 模板加 `v-if="user"` 保护，API 返回数据后才渲染：
```html
<template v-if="user">
  <van-cell :value="user.username" />
</template>
```

2. 顺手修正模板中的字段名 `user.userName` → `user.username`（和后端字段保持一致）

---

### 问题三：TypeScript 报错 `verbatimModuleSyntax`

#### 现象
```ts
"CurrentUser"是一种类型，必须在启用 "verbatimModuleSyntax" 时使用仅类型导入进行导入。ts(1484)
```

#### 原因
`CurrentUser` 是 `interface`（类型），但用了值导入语法：
```ts
import { CurrentUser } from "../models/user";  // ❌ 值导入
```

#### 修复
```ts
import type { CurrentUser } from "../models/user";  // ✅ 类型导入
```
开启 `verbatimModuleSyntax` 后，类型必须用 `import type` 导入，否则 TypeScript 编译报错。

---

### 问题四：编辑用户名后页面不更新

#### 现象
修改用户名成功（后端返回成功、数据库已更新），`router.back()` 回到个人页还是旧数据，F5 刷新也没用。

#### 排查过程
1. **怀疑前端 service 层缓存** → `getCurrentUser()` 中有内存缓存逻辑，注释掉后问题依旧
2. **怀疑 `onMounted` 不重新执行** → 加了 `watch` 监听路由变化，确保 `router.back()` 回来时重新请求数据：
```js
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const fetchUser = async () => {
  const res = await getCurrentUser();
  if (res) { user.value = res; }
};
onMounted(fetchUser);
watch(() => route.path, () => {
  if (route.path === "/user") fetchUser();
});
```
3. **打开 F12 → Network 面板** → 发现 `/user/current` 返回的 Response 本身就是旧数据 → **确认是后端问题**

#### 后端根因
`getCurrentUser` 接口从 **Session** 中直接取用户对象返回，没有查数据库：
```java
// 登录时：把 User 对象存进 Session（登录时的快照）
session.setAttribute(USER_LOGIN_STATE, loginUser);

// 获取当前用户时：直接从 Session 取，返回的是旧快照
User currentUser = (User) session.getAttribute(USER_LOGIN_STATE);
return ResponseResult.ok(currentUser);
```
`/user/update` 更新了数据库，但 Session 里的对象没变，所以每次都拿到旧数据。

#### 后端修复
用 Session 中的 userId 去数据库查最新数据，并同步更新 Session：
```java
User sessionUser = (User) session.getAttribute(USER_LOGIN_STATE);
User freshUser = userService.getById(sessionUser.getId());
if (freshUser != null) {
    session.setAttribute(USER_LOGIN_STATE, freshUser);
    return ResponseResult.ok(freshUser);
}
```
`freshUser == null` 的极端情况（用户被并发删除/注销后 Session 残留）：直接抛 `NOT_LOGIN` 让前端重新登录。

---

### 经验总结

1. **改拦截器是全局操作**，`return response.data` 后所有调用处的 `.data` 都要去掉一层，必须逐个排查每个 API 调用点
2. **`ref()` 不传初始值时值是 `undefined`**，模板里直接访问属性会报错，必须用 `v-if` 保护或给初始值
3. **`onMounted` 只在首次挂载时执行**，`router.back()` 不一定触发重新挂载，需要 `watch` 路由变化来重新请求数据
4. **排查"数据不更新"问题**：先看 Network 面板确认是前端还是后端返回了旧数据，不要在前端盲猜
5. **Session 中存储的 Java 对象是登录时的快照**，不会随数据库变化自动更新，涉及用户信息修改的接口要注意同步 Session
6. **TypeScript `verbatimModuleSyntax`** 要求类型导入必须用 `import type`，值导入和类型导入不能混用

---
# 2026/05/01

## Axios 传参详解：params vs data

### withCredentials

`withCredentials` 控制跨域请求是否携带 Cookie 和 HTTP 认证信息：

- `true`：跨域请求带上 Cookie，后端需配置 `Access-Control-Allow-Credentials: true`，且 `Allow-Origin` 不能是 `*`
- `false`（默认值）：跨域请求不带 Cookie，更安全，后端配置更简单

前后端分离项目用 Token 认证（header 里带 token）时，设为 `false` 就够了。

---

### GET 请求：只有 params

GET 没有请求体，参数只能通过 `params` 拼接到 URL 查询字符串：

```js
// axios.get(url, config)
axios.get("/user/recommend", {
  params: {
    pageSize: 8,
    pageNum: 1,
  },
  withCredentials: false
})

// 实际发出的请求：GET /user/recommend?pageSize=8&pageNum=1
```

---

### POST 请求：data（请求体） + params（URL查询参数）

POST 可以同时用 `data` 和 `params`：

```js
// axios.post(url, data, config)
axios.post("/user/search", {
  username: "zhangsan",
  password: "123456"
}, {
  params: {
    pageNum: 1,
    pageSize: 10
  },
  withCredentials: false
})

// 实际发出的请求：
// POST /user/search?pageNum=1&pageSize=10
// Content-Type: application/json
//
// {"username":"zhangsan","password":"123456"}
```
- data → 放在请求体里
- params → 拼到 URL 查询字符串上
典型场景： 比如搜索接口，查询条件（关键词、筛选器）放 data 里，分页参数（pageNum、pageSize）放 params 里

后端接收方式：

```java
@PostMapping("/search")
public Result search(
    @RequestBody UserQuery query,    // 对应 data（请求体）
    @RequestParam Integer pageNum,    // 对应 params（URL查询参数）
    @RequestParam Integer pageSize    // 对应 params
) { ... }
```

---

### data 的常见语法形式

```js
// 1. JSON 对象（默认，Content-Type: application/json）
data: { username: "zhangsan", password: "123456" }

// 2. URLSearchParams（Content-Type: application/x-www-form-urlencoded）
data: new URLSearchParams({ username: "zhangsan", password: "123456" })

// 3. FormData（用于上传文件，Content-Type: multipart/form-data）
const fd = new FormData();
fd.append("username", "zhangsan");
fd.append("avatar", file);
data: fd

// 4. 直接传字符串（少见）
data: JSON.stringify({ username: "zhangsan" })
```

---

### 对比总结

| 属性 | GET | POST |
|---|---|---|
| `params` | 拼接到 URL 查询字符串（`?key=value`） | 同左，拼到 URL 上 |
| `data` | 被忽略，GET 没有请求体 | 放到请求体（request body）里 |
| 惯例 | 只用 `params` | 用 `data`，分页参数可放 `params` |

--- 
# 2026/05/04
## bubble-app项目涉及路由（router、route）知识

### 一、项目路由架构总览

```
main.ts (创建并挂载 router)
  └── config/route.ts (路由表定义)
       └── App.vue
            └── BasicLayout.vue (布局组件)
                 ├── <router-view /> (页面出口)
                 ├── <van-tabbar route> (声明式导航)
                 └── 各页面组件 (编程式导航)
```

---

### 二、路由创建与挂载 — main.ts

```typescript
import * as VueRouter from 'vue-router'
import routes from "./config/route"

// 创建路由实例，使用 Hash 模式
const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),  // URL 中带 # 号
    routes,                                      // 路由规则
})
app.use(router)  // 注册到 Vue 应用
```

**History 模式对比：**

| History 模式 | URL 样式 | 特点 |
|---|---|---|
| `createWebHashHistory()` | `http://xxx/#/user` | 无需后端配置，项目当前使用 |
| `createWebHistory()` | `http://xxx/user` | URL 更美观，但需要后端配合配置 Nginx 回退 |
| `createMemoryHistory()` | 无 URL 变化 | 适用于非浏览器环境 (SSR / 嵌入式) |

**延伸：** 如果要切换为 History 模式，将 `createWebHashHistory()` 改为 `createWebHistory()`，同时在 `vite.config.ts` 中配置开发服务器：
```typescript
server: { historyApiFallback: true }
```

---

### 三、路由表定义 — config/route.ts

```typescript
import type { RouteRecordRaw } from 'vue-router';
import Index from '../pages/Index.vue';
// ... 其他页面导入

const routes: RouteRecordRaw[] = [
    { path: '/',        component: Index },
    { path: '/team',    component: TeamPage },
    { path: '/user',    component: UserPage },
    { path: '/search',  component: SearchPage },
    { path: '/user/list',  component: SearchResultPage },
    { path: '/user/edit',  component: UserEditPage },
    { path: '/user/login', component: UserLoginPage },
]
export default routes
```

项目中使用了最基础的静态路由配置。延伸的配置项：

```typescript
// 1. 嵌套路由（子路由）
{
  path: '/user',
  component: BasicLayout,
  children: [
    { path: '',         component: UserPage },      // /user
    { path: 'edit',     component: UserEditPage },   // /user/edit
    { path: 'login',    component: UserLoginPage },  // /user/login
  ]
}

// 2. 动态路由（路径参数）
{ path: '/user/:id', component: UserProfile }
// 访问 /user/2767 → route.params.id === '2767'

// 3. 命名路由 + 重定向
{
  path: '/home',
  redirect: '/'       // 访问 /home 自动跳转到 /
}
{
  path: '/user/:id',
  name: 'userDetail',
  component: UserProfile
}

// 4. 懒加载（按需加载，减小首屏体积）
{ path: '/team', component: () => import('../pages/TeamPage.vue') }

// 5. 路由元信息（配合路由守卫使用）
{
  path: '/user',
  component: UserPage,
  meta: { requiresAuth: true, title: '个人中心' }
}
```

---

### 四、`<router-view />` — 路由出口

BasicLayout.vue:
```vue
<div id="content">
    <router-view />  <!-- 当前路由匹配的组件渲染在这里 -->
</div>
```

`<router-view />` 是路由匹配组件的渲染出口。当 URL 变为 `/user` 时，`UserPage.vue` 就渲染在这个位置。

延伸用法：

```vue
<!-- 命名视图：同一页面渲染多个 router-view -->
<router-view />              <!-- 默认出口 -->
<router-view name="sidebar" /> <!-- 侧边栏出口 -->

<!-- transition 包裹实现路由切换动画 -->
<router-view v-slot="{ Component }">
  <transition name="fade" mode="out-in">
    <component :is="Component" />
  </transition>
</router-view>
```

---

### 五、声明式导航 — `<router-link>` / Vant Tabbar

BasicLayout.vue:
```vue
<!-- Vant 的 Tabbar 组件，添加 route 属性即可使用路由模式 -->
<van-tabbar route>
    <van-tabbar-item icon="home-o" to="/">主页</van-tabbar-item>
    <van-tabbar-item icon="search" name="team" to="/team">队伍</van-tabbar-item>
    <van-tabbar-item icon="friends-o" name="user" to="/user">个人</van-tabbar-item>
</van-tabbar>
```

`to` 属性支持字符串或对象形式：

```vue
<!-- 字符串形式 -->
<van-tabbar-item to="/user">个人</van-tabbar-item>

<!-- 对象形式（可携带参数） -->
<van-tabbar-item :to="{ path: '/user', query: { from: 'tab' } }">个人</van-tabbar-item>

<!-- 命名路由形式 -->
<van-tabbar-item :to="{ name: 'userDetail', params: { id: 2767 } }">个人</van-tabbar-item>
```

**注意：** Vant 的 `<van-tabbar>` 加上 `route` 属性后，其内部的 `<van-tabbar-item>` 会自动渲染为 `<router-link>`，无需手动包裹。

---

### 六、编程式导航 — `useRouter()`

`router` 实例用于**执行跳转**（写操作），在本项目中有三种典型用法：

#### 1. `router.push()` — 跳转到新页面（保留历史记录）

BasicLayout.vue — 导航到搜索页：
```typescript
const router = useRouter()
const onClickSearch = () => {
    router.push('/search')   // 等价于 router.push({ path: '/search' })
}
```

UserPage.vue — 携带 query 参数跳转：
```typescript
const toEdit = (editKey: keyof CurrentUser, editName: string, currentValue: string) => {
  router.push({
    path: "/user/edit",
    query: {
      editKey,      // 编辑字段名
      editName,     // 编辑字段中文名
      currentValue, // 当前值
    },
  });
};
```

searchPage.vue — 携带数组参数：
```typescript
const doSearchResult = () => {
    router.push({
        path: '/user/list',
        query: { tags: activeIds.value }   // 数组: tags=男&tags=大一
    })
}
```

**`push` 的三种参数格式：**

```typescript
// (1) 字符串
router.push('/user')

// (2) 对象 — path 形式（注意：path 和 params 不能同时用）
router.push({ path: '/user', query: { id: 1 } })

// (3) 对象 — name 形式（可以搭配 params）
router.push({ name: 'userDetail', params: { id: 1 } })
```

**重要区别：** `query` 参数显示在 URL 上 (`?editKey=username&editName=昵称`)，`params` 参数不显示在 URL 上。本项目全部使用 `query`。

#### 2. `router.back()` — 返回上一页

BasicLayout.vue：
```typescript
const onClickLeft = () => {
    router.back()   // 等价于 router.go(-1)，返回浏览器历史栈的上一页
}
```

UserEditPage.vue — 修改成功后返回：
```typescript
if (res.code === 0 && res.data > 0) {
    showSuccessToast("修改成功");
    router.back()    // 编辑完成 → 返回个人页
}
```

#### 3. `router.replace()` — 替换当前页面（不保留历史记录）

UserLoginPage.vue — 登录后跳转：
```typescript
const onSubmit = async () => {
  // ...
  if (res.code === 0 && res.data) {
    showSuccessToast("登录成功");
    router.replace("/")   // 替换：用户无法通过"后退"回到登录页
  }
};
```

**push vs replace 核心区别：**
- `push` → 在历史栈中**新增**一条记录，用户可以点浏览器"后退"回到之前的页面
- `replace` → **替换**当前历史记录，用户"后退"时不会回到被替换的页面

**登录成功用 `replace` 的原因：** 登录页不应该出现在浏览器历史中，否则用户登录后点后退又会回到登录页。

---

### 七、路由信息读取 — `useRoute()`

`route` 对象用于**读取**当前路由信息（只读），在本项目中有三个典型用法：

#### 1. UserEditPage.vue — 读取 query 参数并用于表单
```typescript
const route = useRoute();

const editUser = ref({
  editKey: route.query.editKey,      // "username"
  currentValue: route.query.currentValue,  // "ZJCC"
  editName: route.query.editName,    // "昵称"
});
```

#### 2. searchResultPage.vue — 读取搜索标签
```typescript
const route = useRoute();
const tags = route.query.tags   // ['男', '大一'] — 从搜索页传来的标签数组
```

#### 3. UserPage.vue — 监听路由变化，重新请求数据
```typescript
const route = useRoute();

watch(() => route.path, () => {
  if (route.path === "/user") fetchUser();
});
```

**`route` 对象的常用属性：**

| 属性 | 类型 | 示例值 | 说明 |
|---|---|---|---|
| `route.path` | `string` | `'/user/edit'` | 当前路径 |
| `route.fullPath` | `string` | `'/user/edit?editKey=username'` | 完整路径含 query |
| `route.query` | `object` | `{ editKey: 'username' }` | URL 问号后的参数 |
| `route.params` | `object` | `{ id: '2767' }` | 路径中的动态参数 |
| `route.name` | `string` | `'userDetail'` | 当前路由的命名 |
| `route.meta` | `object` | `{ requiresAuth: true }` | 路由元信息 |

---

### 八、`route` 与 `router` 的核心区别

**Route = 当前在哪（读），Router = 去哪里（写）**

```
useRoute()  → 当前路由信息对象（只读）
               属性: path, query, params, meta, fullPath, name

useRouter() → 路由器实例（可操作）
               方法: push(), replace(), back(), go(), forward()
               方法: addRoute(), removeRoute()  (动态路由)
```

本项目中所有的路由调用一览：

| 文件 | 使用 | 目的 |
|---|---|---|
| BasicLayout.vue | `useRouter` | `back()`, `push('/search')` |
| UserPage.vue | `useRouter` + `useRoute` | `push({query})`, `watch(route.path)` |
| searchPage.vue | `useRouter` | `push({query: tags})` |
| searchResultPage.vue | `useRoute` | 读取 `route.query.tags` |
| UserEditPage.vue | `useRouter` + `useRoute` | 读取 query, `back()` |
| UserLoginPage.vue | `useRouter` | `replace('/')` |
| Index.vue | `useRoute` | 读取 query |

---

### 九、延伸：项目中尚未使用但值得了解的路由功能

#### 1. 全局路由守卫（本项目的下一步建议）

```typescript
// main.ts 中添加
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = (to.meta.title as string) || 'Bubble 伙伴'

  // 未登录拦截
  if (to.meta.requiresAuth && !isLoggedIn()) {
    next({ path: '/user/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})
```

#### 2. 路由懒加载（优化首屏性能）

```typescript
// 当前：所有页面一次性打包
{ path: '/team', component: TeamPage }

// 优化：按需加载，每个页面单独生成 chunk
{ path: '/team', component: () => import('../pages/TeamPage.vue') }
```

#### 3. 动态路由（权限控制场景）

```typescript
// 根据用户角色动态添加路由
router.addRoute({
  path: '/admin',
  component: () => import('../pages/Admin.vue'),
  meta: { requiresAuth: true, role: 'admin' }
})
```

#### 4. 404 兜底路由

```typescript
// 放在路由表最后
{ path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
```

---
# 2026/05/06
## JavaScript 的展开运算符（spread syntax）。

> {...initFormData} 的作用是把 initFormData 对象里的所有属性复制一份到一个新对象中：
```typescript
const initFormData = {
  name: "",
  description: "",
  maxNum: 0,
}

const addTeamData = ref({...initFormData})
// 等价于：
const addTeamData = ref({
  name: "",
  description: "",
  maxNum: 0,
})

```
> 为什么要用 ... 而不是直接写 ref(initFormData)？
> 为了解耦。直接引用的话，addTeamData 和 initFormData 指向同一个对象，修改其中一个会影响另一个。用 ... 展开后创建的是一个全新的对象，两者互不影响。
> 这样以后可以用 initFormData 来重置表单
> 
```typescript
const resetForm = () => {
  addTeamData.value = {...initFormData}  // 恢复到初始状态
}
```

---
# 2026/05/07
## Vue 页面间传数据的 4 种方式

### 1. URL 路由参数（跳转时携带少量数据）

```js
// 传递
router.push({ path: '/team/detail', query: { id: 123 } })
// 或
router.push({ name: 'teamDetail', params: { id: 123 } })

// 接收
const route = useRoute()
const id = route.query.id  // query 方式
const id = route.params.id // params 方式
```

### 2. 状态管理 Pinia（多组件共享数据，最常用）

```js
// store/teamStore.ts
export const useTeamStore = defineStore('team', () => {
  const teamList = ref([])
  return { teamList }
})

// 页面A：写入
const teamStore = useTeamStore()
teamStore.teamList = [...]

// 页面B：读取
const teamStore = useTeamStore()
console.log(teamStore.teamList)
```

### 3. localStorage / sessionStorage（持久化，刷新不丢失）

```js
// 写入
localStorage.setItem('teamData', JSON.stringify(data))
// 读取
const data = JSON.parse(localStorage.getItem('teamData'))
```

### 4. Provide-Inject（祖先与后代组件通信）

```js
// 祖先组件 provide
provide('teamData', teamList)

// 后代组件 inject
const teamData = inject('teamData')
```

### 选择建议

| 场景 | 推荐方式 |
|---|---|
| 传一两个字段（如 id） | 路由参数 |
| 多个页面共享、频繁更新 | Pinia |
| 需要持久化、刷新不丢 | localStorage |
| 父子组件传数据 | props / emit |

---
# 2026/05/10

## 子组件操作后即时刷新列表 — emit 通知父组件重新请求

### 问题

TeamCardList 子组件中执行加入/退出/解散操作后，虽然接口返回成功，但页面不会即时更新队伍列表，需要手动刷新浏览器才能看到最新数据。

### 原因

子组件的 `teamList` 是通过 `props` 从父组件传入的，Vue 的 props 是**单向数据流**（父 → 子），子组件不能直接修改 props 的值。操作成功后只是 toast 提示，没有任何逻辑去更新列表数据。

### 解决方案：emit 事件通知父组件刷新

核心思路：**子组件操作成功后 `emit('refresh')`，父组件监听到事件后调用自己的 `listTeam()` 重新请求接口**。

```
数据流：子组件操作成功 → emit('refresh') → 父组件监听到 → 调用 listTeam() → teamList 响应式更新 → 页面自动刷新
```

#### 子组件改动（TeamCardList.vue）

```typescript
// 1. 声明子组件可以向父组件发送的事件
const emit = defineEmits(['refresh']);

// 2. 操作成功后触发事件
const doQuitTeam = async (id: number) => {
  const res = await myAxios.post('/team/quit', { teamId: id })
  if (res?.code === 0) {
    showSuccessToast('退出成功')
    emit('refresh')  // 通知父组件：数据变了，重新拉列表
  } else {
    showFailToast('退出失败')
  }
}
// doJoinTeam、doDeleteTeam 同理
```

#### 父组件改动（TeamPage / UserTeamCreatePage / UserTeamJoinPage）

```html
<!-- 父组件监听 refresh 事件，触发时调用 listTeam 重新请求数据 -->
<team-card-list :teamList="teamList" @refresh="listTeam" />
```

三个父页面各自请求不同的接口，互不影响：
- TeamPage → `/team/list`
- UserTeamCreatePage → `/team/list/my/create`
- UserTeamJoinPage → `/team/list/my/join`

### 为什么不直接在前端删数组项

退出队伍可能导致连锁变化：只剩一人时队伍自动解散、解散队伍会删除所有关联记录。前端很难模拟这些后端逻辑，重新拉列表最准确，也最简单。

### 性能

不需要担心。用户最多加入 5 个队伍，列表数据量很小，且只有用户主动操作时才触发一次请求。

### emit 与 props 的关系

```
props：  父 → 子（传递数据）    <team-card-list :teamList="teamList" />
emit：   子 → 父（传递事件）    @refresh="listTeam"
```

两者配合使用，构成 Vue 父子组件通信的标准模式：父组件通过 props 把数据传给子组件，子组件通过 emit 把操作结果通知父组件，父组件再更新数据，数据变化通过 props 自动回流到子组件。