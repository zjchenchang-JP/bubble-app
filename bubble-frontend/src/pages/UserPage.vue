<template>
  <template v-if="user">
    <van-cell title="当前用户" :value="user?.username" />
    <van-cell title="修改信息" is-link to="/user/update" />
    <van-cell title="我创建的队伍" is-link to="/user/team/create" />
    <van-cell title="我加入的队伍" is-link to="/user/team/join" />
  </template>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import type { CurrentUser } from "../models/user";
import { onMounted, ref, watch } from "vue";
import { showFailToast } from "vant";
import { getCurrentUser } from "../services/user";
const user = ref();
const router = useRouter();
const route = useRoute();

const fetchUser = async () => {
  const res = await getCurrentUser();
  if (res) {
    user.value = res;
  } else {
    showFailToast("获取用户信息失败");
  }
};

onMounted(fetchUser);
watch(() => route.path, () => {
    if (route.path === "/user") fetchUser();
  },
);
// 类型约束 — 之前 toEdit 的 editKey 参数是 string
// 没有任何校验。可以把它约束为 CurrentUser 的 key，避免拼写错误
// 如果传入一个不存在的字段名（比如 'userNme' 拼错了），TypeScript 编译时就会直接报错
const toEdit = (editKey: keyof CurrentUser, editName: string, currentValue: string) => {
  router.push({
    path: "/user/edit",
    // params:
    query: {
      editKey,
      editName,
      currentValue,
    },
  });
};
</script>

<style scoped></style>
