# 2026-02-28 标签搜索两种方式对比分析

## 背景

在 `UserServiceImpl` 中有两种按标签搜索用户的实现方式：

1. `searchUsersByTags` - 数据库查询方式
2. `searchUsersByTagsMemory` - 内存查询方式

## 两种实现对比

### `searchUsersByTags`（数据库查询方式）

**实现原理**：直接在 SQL 层面使用 `LIKE` 查询

```java
QueryWrapper<User> queryWrapper = new QueryWrapper<>();
for (String tagName : tagNameList) {
    queryWrapper.like("tags", tagName);
}
List<User> userList = userMapper.selectList(queryWrapper);
```

### `searchUsersByTagsMemory`（内存查询方式）

**实现原理**：查出所有用户，在内存中 JSON 反序列化后匹配

```java
// 1. 查询所有用户
List<User> allUsers = userMapper.selectList(new QueryWrapper<>());

// 2. 在内存中过滤（OR查询：包含任一标签即可）
List<User> resultUsers = allUsers.stream()
    .filter(user -> {
        List<String> userTags = gson.fromJson(user.getTags(), ...);
        return tagNameList.stream().anyMatch(userTags::contains);
    })
    .map(this::getSafetyUser)
    .collect(Collectors.toList());
```

## 优劣对比表

| 维度 | searchUsersByTags | searchUsersByTagsMemory |
|------|-------------------|------------------------|
| **数据量小时** | ✅ 快，一次查询返回结果 | ❌ 需全表查询 + 反序列化 |
| **数据量大时** | ✅ 利用索引，性能稳定 | ❌ 全表加载，内存爆炸 |
| **准确性** | ❌ `LIKE` 可能误匹配（如 "java" 匹配 "javascript"） | ✅ 精确匹配标签值 |
| **内存消耗** | ✅ 低，只返回匹配结果 | ❌ 高，需加载所有用户 |
| **网络IO** | ✅ 一次数据库调用 | ✅ 一次数据库调用 |
| **语义清晰** | ❌ 模糊匹配语义不明确 | ✅ 代码意图清晰 |
| **扩展性** | ✅ 可添加分页、排序 | ❌ 内存分页效率低 |

## 关于 JOIN 的误解澄清

### `searchUsersByTags` 不需要 JOIN

**原因**：`tags` 字段直接存储在 `user` 表中（JSON 字符串格式），直接查 `user` 表即可：

```sql
-- 生成的 SQL 类似这样
SELECT * FROM user
WHERE tags LIKE '%java%'
  AND tags LIKE '%python%';
```

**单表查询**，不需要 JOIN 其他表。

### 为什么会有"需要 JOIN"的误解？

另一种常见设计是 **标签关联表设计**：

```
user 表          user_tag 表           tag 表
-------         --------------         -------
id              user_id               id
...             tag_id                name
```

这种设计**确实需要 JOIN**：
```sql
SELECT u.* FROM user u
JOIN user_tag ut ON u.id = ut.user_id
JOIN tag t ON ut.tag_id = t.id
WHERE t.name IN ('java', 'python')
```

## 两种存储设计对比

| 设计 | 当前实现（JSON字段） | 标签关联表 |
|------|---------------------|-----------|
| 查询方式 | 单表 LIKE | 多表 JOIN |
| 准确性 | 模糊匹配 | 精确匹配 |
| 索引支持 | ❌ LIKE 效率低 | ✅ 索引高效 |
| 扩展性 | ❌ 难以统计/排序 | ✅ 灵活查询 |

## 结论与建议

1. **当前 `searchUsersByTags`**：单表查询，无 JOIN，但 `LIKE` 效率低且可能误匹配
2. **内存方式**：避免 `LIKE` 误匹配，但全表加载更糟
3. **推荐方案**：
   - 短期：使用 `searchUsersByTags`，但优化 LIKE 模式避免误匹配
     ```java
     queryWrapper.like("tags", "\"" + tagName + "\"");  // 匹配 "java" 格式
     ```
   - 长期：如果标签查询是核心功能，建议改用**标签关联表设计**，虽然需要 JOIN，但有索引支持且语义精确

# 2026-05-14 队伍列表查询状态过滤逻辑重构

## 背景

前端 `TeamPage` 页面需要展示队伍列表，后端 `TeamServiceImpl.listTeams` 根据前端传入的 `status` 和 `userId` 进行过滤。

## 现象

在前端队伍页面通过关键词搜索时，查不到自己创建的加密队伍。

## 发现的问题

### 1. `queryUserId` 职责耦合

后端用 `queryUserId`（前端传入的查询条件）同时承担了**搜索过滤**和**权限判断**两个职责：

```java
// 搜索过滤（line 196-199）
Long userId = teamQuery.getUserId();
if (userId != null && userId > 0) {
    queryWrapper.eq(Team::getUserId, userId);
}

// 权限判断（line 211-216）
if (Objects.equals(queryUserId, loginUserId)) {
    // 不限制状态
} else {
    // 只查公开房间
}
```

当 `queryUserId` 为 null（前端没传）时，`Objects.equals(null, loginUserId)` 永远为 false，导致用户搜不到自己创建的非公开队伍。

### 2. 前端搜索丢失 tab 状态

`onSearch` 只传搜索文本，没传当前 tab 的 status，导致在"加密"tab 下搜索实际查的是公开房间。

## 最终方案

### 队伍可见性规则

| 状态 | 可见性 | 说明 |
|------|--------|------|
| 公开 (0) | 所有人 | 默认查询 |
| 加密 (2) | 所有人 | 需密码加入 |
| 私密 (1) | 仅管理员 | 创建者通过 `listMyCreateTeams` 单独查询 |

### 后端逻辑（版本二）

```java
if (statusEnum == null) {
    // 未传 status，默认公开
    statusEnum = TeamStatusEnum.PUBLIC;
    queryWrapper.eq(Team::getStatus, statusEnum.getValue());
} else {
    // 传了 status
    if (!isAdmin && statusEnum.equals(TeamStatusEnum.PRIVATE)) {
        throw new BusinessException(ErrorCode.NO_AUTH, "只有管理员才能查看私有队伍");
    }
    queryWrapper.eq(Team::getStatus, statusEnum.getValue());
}
```

### 前端修复

```js
// 搜索时携带当前 tab 的 status
const onSearch = (val) => {
  const status = active.value === 'public' ? 0 : 2
  listTeam(val, status)
}
```

## 经验总结

- **不要用请求参数做权限判断**：`queryUserId` 是搜索条件，`loginUserId`（ThreadLocal）才是身份标识，两者不应混用
- **前端搜索需携带筛选状态**：切换 tab 后搜索，必须把当前 tab 对应的 status 传给后端，否则搜索结果和页面展示不一致
- **JS 默认参数 ≠ 不传参数**：`status = 0` 让"不传"和"传 0"无法区分，导致后端 `statusEnum == null` 分支永远无法进入

```js
// 错误：status=0 导致 onSearch(val) 实际发送 { status: 0 }
const listTeam = async (val = '', status=0) => {
  const res = await myAxios.post('/team/list', { searchText: val, pageNum: 1, status })
}

// 正确：status 不设默认值，仅在明确传值时才加入请求
const listTeam = async (val = '', status) => {
  const params = { searchText: val, pageNum: 1 }
  if (status !== undefined) {
    params.status = status
  }
  const res = await myAxios.post('/team/list', params)
}
```

- **前后端接口约定要明确"不传"的语义**：后端通过 `status == null` 做分支判断时，前端必须确保不传时请求体中不包含该字段，否则 JS 默认参数会静默补值，导致后端分支逻辑失效

```java
// 后端依赖 status == null 走关键词搜索（公开+加密），如果前端始终传 0 则永远不进入此分支
if (statusEnum == null) {
    String searchText = (teamQuery != null) ? teamQuery.getSearchText() : null;
    if (StringUtils.isNotBlank(searchText)) {
        queryWrapper.and(qw -> qw.eq(Team::getStatus, TeamStatusEnum.PUBLIC.getValue())
                .or().eq(Team::getStatus, TeamStatusEnum.ENCRYPTED.getValue()));
    } else {
        queryWrapper.eq(Team::getStatus, TeamStatusEnum.PUBLIC.getValue());
    }
}
```
