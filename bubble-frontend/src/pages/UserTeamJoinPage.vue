<template>
  <div id="userTeamJoinPage">
    <van-search v-model="searchText" placeholder="搜索队伍" @search="onSearch" />
    <!-- 监听 refresh 事件：子组件操作成功后触发，父组件重新请求列表实现即时更新 -->
    <team-card-list :teamList="teamList" @refresh="listTeam" />
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


const listTeam = async (val = '') => {
  const res = await myAxios.get('/team/list/my/join',{
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
// 页面加载时只触发一次
onMounted( () => {
  listTeam();
})

</script>

<style scoped>
#teamPage{

}
</style>
