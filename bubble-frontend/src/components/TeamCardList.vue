/**
 * 几个页面都用到了列表组件，提取成可复用公共组件
*/
<template>
  <div id="teamCardList">
  <van-card
      v-for="team in props.teamList"
      :thumb="weiwei"
      :desc="team.description"
      :title="`${team.name}`"
  >
    <template #tags>
      <van-tag plain type="danger" style="margin-right: 8px; margin-top: 8px" >
        {{ teamStatusEnum[team.status] }}
      </van-tag>
    </template>
    <template #bottom>
      <div>
        {{ '最大人数: ' + team.maxNum }}
      </div>
      <!-- 有过期时间才展示 -->
      <div v-if="team.expireTime">
        {{ '过期时间: ' + team.expireTime }}
      </div>
      <div>
        {{ '创建时间: ' + team.createTime }}
      </div>
      </template>
    <template #footer>
      <van-button size="small" type="primary"  plain @click="doJoinTeam(team.id)">加入队伍</van-button>
      <!-- 队伍创建人才显示 更新队伍 按钮 -->
      <van-button v-if="team.userId === currentUser?.id" size="small" plain
                    @click="doUpdateTeam(team.id)">更新队伍
      </van-button>
      <!-- 仅已加入队伍 可见 -->
      <van-button v-if="team.hasJoin" size="small" plain @click="doQuitTeam(team.id)">
        退出队伍
      </van-button>
      <!-- 队伍创建人才显示 解散队伍 按钮 -->
      <van-button v-if="team.userId === currentUser?.id" size="small" plain
                    @click="doDeleteTeam(team.id)">解散队伍
      </van-button>
    </template>
  </van-card>
  </div>
</template>

<script setup lang="ts">
import { showFailToast, showSuccessToast } from "vant";
import { teamStatusEnum } from "../constants/team";
import {TeamType} from "../models/team";
import myAxios from "../plugins/myAxios";
import weiwei from "../assets/weiwei.webp";
import { ref,onMounted } from "vue";
import { getCurrentUser } from "../services/user";
import { useRouter } from "vue-router";

// TypeScript 接口，约束组件接收的 props 结构：要求有一个 teamList 属性
// teamList 类型为 UserType[]（UserType 类型的数组）
interface TeamCardListProps{
  teamList: TeamType[];
}

// 子 → 父通信：子组件操作成功后，通过 emit 通知父组件刷新列表
// 用法：const emit = defineEmits(['事件名'])，然后 emit('事件名') 触发
// 加入/退出/解散操作成功后，调用 emit('refresh') 通知父组件
// 数据流：子组件操作成功 → emit('refresh') → 父组件监听到 → 调用各自的 listTeam() 重新请求接口 → teamList 响应式更新 → 页面自动刷新
const emit = defineEmits(['refresh']);

// 父传子，父组件用 :propName="变量" 传递，子组件用 defineProps 接收。数据流向是单向的：TeamPage → TeamCardList
// 给父组件设置默认值，保证数据不为空
// 泛型参数 TeamCardListProps 让 TypeScript 对传入的 props 做类型检查
// withDefaults 是 Vue 3.3+ 提供的函数，用于给泛型形式的 defineProps 设置默认值。
// 作用类似于 Options API 中的 props: { teamList: { default: [] } }
const props= withDefaults(defineProps<TeamCardListProps>(),{ // 编译器宏，用于声明组件的 props
  //@ts-ignore
  // TypeScript 的类型系统无法直接将 []（类型推断为 never[]）赋值给 UserType[]
  // 所以用 @ts-ignore 抑制这个类型错误
  teamList: [] as TeamType[] // 告诉编译器"这个空数组当作 UserType[]
});


/**
 * 加入队伍
 */
const doJoinTeam = async (id:number)=>{
  const res = await myAxios.post('/team/join',{
    teamId:id,
  })
  if(res?.code===0){
    showSuccessToast('加入成功')
    // 加入成功后通知父组件重新请求列表，保证数据即时更新
    emit('refresh')
  }else{
    showFailToast('加入失败' + (res.description?`,${res.description}`:''));
  }
}

/**
 * 更新队伍
 */
const currentUser = ref()
const router = useRouter()
// 跳转到队伍更新页
const doUpdateTeam = (id:number) => {
  router.push({
    path:'/team/update',
    query:{
      id,
    },
  })
}

/**
 * 退出队伍
 */
const doQuitTeam = async (id:number)=>{
  const res = await myAxios.post('/team/quit',{
    teamId:id,
  })
  if(res?.code===0){
    showSuccessToast('退出成功')
    // 退出成功后通知父组件重新请求列表，保证数据即时更新
    emit('refresh')
  }else{
    showFailToast('退出失败' + (res.description?`,${res.description}`:''));
  }
}

/**
 * 解散队伍
 */
const doDeleteTeam = async (id:number)=>{
  const res = await myAxios.delete(`/team/delete/${id}`)
  if(res?.code===0){
    showSuccessToast('解散成功')
    // 解散成功后通知父组件重新请求列表，保证数据即时更新
    emit('refresh')
  }else{
    showFailToast('解散失败' + (res.description?`,${res.description}`:''));
  }
}


onMounted(async () =>{
  currentUser.value = await getCurrentUser();
})



</script>
<style scoped>
  /* 标签颜色*/
  /* .van-tag--danger.van-tag--plain {
    color: #2b00ff;
  } */
  /* 
  scoped 样式穿透，去修改子组件内部 .van-image__img 元素的样式
  scoped 默认只能修改当前组件的元素，子组件内部的样式是改不到的。:deep() 就是用来打破这个限制的
  */
  #teamCardList :deep(.van-image__img) { 
  height: 118px;
  width: 88px;
  object-fit: unset;
}
</style>