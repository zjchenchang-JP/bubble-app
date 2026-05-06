/**
 * 几个页面都用到了列表组件，提取成可复用公共组件
*/
<template>
  <van-card
      v-for="user in props.teamList"
      :desc="user.profile"
      :title="`${user.username} (${user.planetCode})`"
      :thumb="user.avatarUrl"
  >
    <template #tags>
      <van-tag plain type="danger" v-for="tag in user.tags" style="margin-right: 8px; margin-top: 8px" >
        {{ tag }}
      </van-tag>
    </template>
    <template #footer>
      <van-button size="mini">联系我</van-button>
    </template>
  </van-card>
</template>

<script setup lang="ts">
import {TeamType} from "../models/team";

// TypeScript 接口，约束组件接收的 props 结构：要求有一个 teamList 属性
// teamList 类型为 UserType[]（UserType 类型的数组）
interface TeamCardListProps{
  teamList: TeamType[];
}

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

</script>
<style scoped>
  /* 标签颜色*/
  /* .van-tag--danger.van-tag--plain {
    color: #2b00ff;
  } */
</style>