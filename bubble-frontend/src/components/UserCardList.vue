<template>
  <van-skeleton title avatar :row="3" :loading="props.loading" v-for="user in props.userList">
    <van-card
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
  </van-skeleton>
</template>

<script setup lang="ts">
import {CurrentUser} from "../models/user";

// TypeScript 接口，约束组件接收的 props 结构：要求有一个 userList 属性
// userList 类型为 UserType[]（UserType 类型的数组）
interface UserCardListProps{
  loading: boolean;
  userList: CurrentUser[];
}

// 给父组件设置默认值，保证数据不为空
// 泛型参数 UserCardListProps 让 TypeScript 对传入的 props 做类型检查
// withDefaults 是 Vue 3.3+ 提供的函数，用于给泛型形式的 defineProps 设置默认值。
// 作用类似于 Options API 中的 props: { userList: { default: [] } }
const props= withDefaults(defineProps<UserCardListProps>(),{ // 编译器宏，用于声明组件的 props
  //@ts-ignore
  // TypeScript 的类型系统无法直接将 []（类型推断为 never[]）赋值给 UserType[]
  // 所以用 @ts-ignore 抑制这个类型错误
  userList: [] as CurrentUser[], // 告诉编译器"这个空数组当作 UserType[]
  loading: true,
});

</script>
<style scoped>
  /* 标签颜色*/
  /* .van-tag--danger.van-tag--plain {
    color: #2b00ff;
  } */
</style>