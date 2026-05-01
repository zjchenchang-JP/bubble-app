<template>
  <user-card-list :user-list="userList"/>
  <van-empty v-if="!userList || userList.length < 1" description="没有数据" />
</template>

<script setup>
import { onMounted, ref } from "vue";
import { showToast } from "vant";
import { useRoute } from "vue-router";
import myAxios from "../plugins/myAxios";
import UserCardList from "../components/UserCardList.vue";
const route = useRoute();

const tags = route.query
const userList = ref([]); //存放用户列表
onMounted(async () => {
  // myAxios 请求 url + 请求参数
  const userListData = await myAxios.get("/user/recommend", {
    // false（默认值）：跨域请求不带 Cookie，更安全
    // 一般前后端分离项目、
    // 用 Token 认证（header 里带 token）时，设为 false 就够了  
    withCredentials: false, 
    // GET 请求传参只能用 params，不能用 data; 
    // Axios 会自动把 params 对象拼接到 URL 查询字符串上
      params: { 
        pageSize:8,
        pageNum:1,
      },
    })
    .then(function (response) {
      console.log("/user/recommend succeed", response);
      // 在搜索请求成功/失败时弹出轻量提示（toast）
      showToast({ type: "success", message: "请求成功" });
      //返回数据  ?.可选链操作符，避免数据为null或undefined时报错
      return response?.data?.records;
    })
    .catch(function (error) {
      console.log("/user/recommend error", error);
      showToast({ type: "fail", message: "请求失败" });
    });
    if (userListData) {
      // undefined 也是false
      userListData.forEach((user) => {
        if (user.tags) {
          user.tags = JSON.parse(user.tags);
        }
      });
      userList.value = userListData;
    }
});
</script>

<style scoped></style>
