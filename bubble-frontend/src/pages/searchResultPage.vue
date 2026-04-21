<template>
    <van-card 
        v-for="user in userList" 
        :desc="`个人简介：${user.profile}`" 
        :title="`${user.username} (${user.planetCode})`"
        :thumb="user.avatarUrl"
    >
        <template #tags>
            <van-tag plain type="danger" v-for="tag in tags" style="margin-right: 8px; margin-top: 10px">
                {{ tag }}
            </van-tag>
        </template>
        <template #footer>
            <van-button size="mini">联系我</van-button>
        </template>
    </van-card>

</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from "vue-router";
const route = useRoute();

const mockUser = {
    id: 2767,
    username: 'ZJCC',
    userAccount: 'admin',
    avatarUrl: 'https://img1.baidu.com/it/u=467212011,1034521901&fm=253&fmt=auto&app=120&f=JPEG?w=500&h=500',
    gender: 0,
    profile: '赵客缦胡缨，吴钩霜雪明。个人对阅读比较感兴趣，喜欢火锅😎',
    phone: '121311313',
    email: '23432@qq.com',
    planetCode: '2767',
    userRole: '管理员',
    createTime: new Date(),
    tags: ['java', '前端', 'AI练习生', '后端', '开卷'],
};

// 当取消所有标签后，route.query.tags 为 [] 显示默认数据。
const tags = (route.query.tags && route.query.tags.length > 0) ? route.query.tags : mockUser.tags;
const userList = ref([mockUser]);

</script>

<style scoped></style>