<template>
    <div id="teamPage">
      <van-button type="primary" @click="doJoinTeam">加入队伍</van-button>
      <team-card-list :teamList="teamList"/>
    </div>
    
</template>

<script setup>
import { ref } from 'process';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import myAxios from '../plugins/myAxios';
import TeamCardList from '../components/TeamCardList.vue';

const router = useRouter()
const teamList =ref([])
onMounted(async ()=>{
  const res = await myAxios.post('/team/list')
})

const doJoinTeam = () =>{
  router.push({
    path:"/team/add"
  })
}

</script>

<style scoped></style>