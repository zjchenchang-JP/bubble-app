<template>
  <van-form @submit="onSubmit">
    <van-field
      v-model="editUser.currentValue"
      :name="editUser.editKey"
      :label="editUser.editName"
      :placeholder="'请输入${editUser.editName}'"
    />
    <div style="margin: 16px">
      <van-button round block type="primary" native-type="submit">
        提交
      </van-button>
    </div>
  </van-form>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import myAxios from "../plugins/myAxios";
import { showSuccessToast, showFailToast } from "vant/lib/vant.es";
import { showToast } from "vant";
import { getCurrentUser } from "../services/user";

// useRoute() — 返回当前路由信息（只读）; 用于读取当前页面的路由状态
// Route = 当前在哪（读），Router = 去哪里（写）
const route = useRoute();

const router = useRouter();

const editUser = ref({
  editKey: route.query.editKey,
  currentValue: route.query.currentValue,
  editName: route.query.editName,
});
const onSubmit = async () => {
  const currentUser = await getCurrentUser()

  // 把editKey currentValue editName提交到后台
  const res = await myAxios.post("/user/update", {
    id: currentUser.id,
    [editUser.value.editKey]: editUser.value.currentValue, // 动态取值
  });

  if (res.code === 0 && res.data > 0) {
    showSuccessToast("修改成功");
    router.back() // 返回上一页
  } else {
    showFailToast("修改失败");
  }
};
</script>
