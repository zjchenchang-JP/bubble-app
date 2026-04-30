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