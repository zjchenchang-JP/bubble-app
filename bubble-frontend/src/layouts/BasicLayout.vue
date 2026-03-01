<template>
    <van-nav-bar
        title="标题"
        left-text=""
        left-arrow
        @click-left="onClickLeft"
        @click-right="onClickRight"
    >
        <template #right>
            <van-icon name="search" size="18" />
        </template>
    </van-nav-bar>
    <div id="content">
        <router-view />
    </div>
    <van-tabbar route @change="onChange">
        <van-tabbar-item icon="home-o" name="index" to="/">主页</van-tabbar-item>
        <van-tabbar-item icon="search" name="team" to="/team">队伍</van-tabbar-item>
        <van-tabbar-item icon="friends-o" name="user" to="/user">个人</van-tabbar-item>
    </van-tabbar>
</template>

<script setup lang="ts">
import { showToast } from 'vant';
import { ref } from 'vue';

const onClickLeft = () => alert("左");
const onClickRight = () => alert("右");

// 默认选中 高亮
const onChange = (index: any) => showToast(`标签 ${index}`);

</script>


<style scoped>

</style>
