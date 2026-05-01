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

const tags = route.query.tags; // 搜索页通过路由传来的数据
const userList = ref([]); //存放用户列表
onMounted(async () => {
  // myAxios 请求 url + 请求参数
  const userListData = await myAxios
    .get("/user/recommend", {
      withCredentials: false,
      params: {},
    })
    .then(function (response) {
      console.log("/user/recommend succeed", response);
      // 在搜索请求成功/失败时弹出轻量提示（toast）
      showToast({ type: "success", message: "请求成功" });
      //返回数据  ?.可选链操作符，避免数据为null或undefined时报错
      return response?.data;
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
