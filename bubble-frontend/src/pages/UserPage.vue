<template>
    <van-cell title="昵称" is-link to='/user/edit' :value="user.username" @click="toEdit('username','昵称',user.username)"/>
    <van-cell title="账号" is-link to='/user/edit' :value="user.userAccount" />
    <van-cell title="头像" is-link to='/user/edit'>
        <img style="height: 45px" :src="user.avatarUrl" />
    </van-cell>
    <van-cell title="性别" is-link to='/user/edit' :value="user.gender" @click="toEdit('gender','性别',user.gender)" />
    <van-cell title="电话" is-link to='/user/edit' :value="user.phone" @click="toEdit('phone','电话',user.phone)"/>
    <van-cell title="邮箱" is-link to='/user/edit' :value="user.email" @click="toEdit('email','邮箱',user.email)"/>
    <van-cell title="星球编号" :value="user.planetCode" />
    <van-cell title="注册时间" :value="user.createTime.toISOString()" />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { CurrentUser } from '../models/user';

const user = {
    id: 1,
    username: 'ZJCC',
    userAccount: 'admin',
    avatarUrl: 'http://43.163.195.79/images/img1.png',
    gender: '男',
    phone: '12131133313',
    email: '243302992@qq.com',
    planetCode: '2220',
    createTime: new Date(),
}
const router = useRouter()
// 类型约束 — 之前 toEdit 的 editKey 参数是 string
// 没有任何校验。可以把它约束为 CurrentUser 的 key，避免拼写错误
// 如果传入一个不存在的字段名（比如 'userName' 拼错了），TypeScript 编译时就会直接报错
const toEdit = (editKey: keyof CurrentUser,editName: string,currentValue: string) => {
    router.push({
        path: '/user/edit',
        // params:
        // 路由传参
        query: {
            editKey,
            editName,
            currentValue,
        }
    })
}

</script>

<style scoped></style>