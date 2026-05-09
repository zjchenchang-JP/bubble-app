<template>
  <div id="userTeamCreatePage">
    <van-search v-model="searchText" placeholder="搜索队伍" @search="onSearch" />
    <van-button type="primary" @click="doJoinTeam">创建队伍</van-button>
    <team-card-list :teamList="teamList" />
    <van-empty v-if="!teamList || teamList.length < 1" description="没有数据" />
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
const searchText = ref('')

const doJoinTeam = () => {
  router.push({
    path: "/team/add",
  });
};


// 抽取公共函数；搜索框和挂载本质都是按条件查询队伍
const listTeam = async (val = '') => {
  const res = await myAxios.get('/team/list/my/create',{
    searchText:val,
  })
  if(res?.code===0){
    teamList.value = res.data;
  } else {
    showFailToast("队伍信息加载失败");
  }
}

// 搜索队伍
const onSearch = (val) => {
  // @search 事件回调提供的 val 参数（它本身就是输入的文本
  listTeam(val)
}

// 进入页面 挂载队伍信息
onMounted(()=>{
  listTeam()
});

</script>

<style scoped></style>
