<template>
  <div id="teamPage">
    <van-button type="primary" @click="doJoinTeam">创建队伍</van-button>
    <!-- 挂载子组件 -->
    <team-card-list :teamList="teamList" />
  </div>
</template>

<script setup>
import { ref,onMounted } from "vue";
import { useRouter } from "vue-router";
import myAxios from "../plugins/myAxios";
import TeamCardList from "../components/TeamCardList.vue";
import { showFailToast } from "vant";

const router = useRouter();
const teamList = ref([]);
onMounted(async () => {
  const res = await myAxios.post("/team/list");
  if (res?.code === 0) {
    teamList.value = res.data;
  } else {
    showFailToast("队伍信息加载失败");
  }
});

const doJoinTeam = () => {
  router.push({
    path: "/team/add",
  });
};
</script>

<style scoped></style>
