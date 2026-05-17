<template>
  <div id="teamPage">
    <van-search v-model="searchText" placeholder="搜索队伍" @search="onSearch" />
    <van-tabs v-model:active="active" @change="onTabChange">
      <van-tab title="公开" name="public" />
      <van-tab title="加密" name="private" />
    </van-tabs>
    <van-button class="add-button" type="primary" icon="plus" @click="toAddTeam" />
    <!-- 挂载子组件，监听 refresh 事件：子组件操作成功后触发，父组件重新请求列表实现即时更新 -->
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
import '../global.css'

const router = useRouter();
const teamList = ref([]);
const searchText = ref('')
const active = ref('public') // 页面默认显示公开队伍

/**
 * 切换页面队伍状态
 */
const onTabChange = (name) =>{
  // 查询 公开房间
  if(name === 'public'){
    listTeam(searchText.value,0)
  } else {
    // 查加密
    listTeam(searchText.value,2)
  }
}

const toAddTeam = () => {
  router.push({
    path: "/team/add",
  });
};

// 抽取公共函数；搜索框和挂载本质都是按条件查询队伍
const listTeam = async (val = '', status) => {
  const params = { searchText: val, pageNum: 1 }
  // 如果请求不带 status → 后端 statusEnum == null → 有 searchText 查公开+加密
  if (status !== undefined) {
    params.status = status
  }
  const res = await myAxios.post('/team/list', params)
  if(res?.code===0){
    teamList.value = res.data;  } else {
    showFailToast("队伍信息加载失败");
  }
}

// 搜索队伍
const onSearch = (val) => {
  // @search 事件回调提供的 val 参数（它本身就是输入的文本
  // const status = active.value === 'public' ? 0 : 2
  // listTeam(val, status)
  listTeam(val)
}


// 进入页面 挂载队伍信息
onMounted(()=>{
  listTeam()
});

</script>

<style scoped></style>
