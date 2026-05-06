<template>
  <div id="teamAddPage">
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="addTeamData.name"
          name="name"
          label="队伍名"
          placeholder="请输入队伍名"
          :rules="[{ required: true, message: '请输入队伍名' }]"
        />
        <van-field
          v-model="addTeamData.description"
          rows="4"
          autosize
          type="textarea"
          name="description"
          label="队伍描述"
          placeholder="请输入队伍描述"
          :rules="[{ required: true, message: '请输入队伍描述' }]"
        />
        <!-- 过期时间 -->
        <van-field
          is-link
          readonly
          name="datetimePicker"
          label="过期时间"
          :placeholder="addTeamData.expireTime ?? '点击选择过期时间'"
          @click="showPicker = true"
        />
        <van-popup v-model:show="showPicker" position="bottom" round>
          <van-date-picker
            title="请选择过期时间"
            :min-date="minDate"
            @confirm="onConfirm"
            @cancel="showPicker = false"
          />
        </van-popup>
        <van-field name="stepper" label="最大人数">
          <template #input>
            <van-stepper v-model="addTeamData.maxNum" max="10" min="3"/>
          </template>
        </van-field>
        <van-field name="radio" label="队伍状态">
          <template #input>
            <van-radio-group v-model="addTeamData.status" direction="horizontal">
              <van-radio name="0">公开</van-radio>
              <van-radio name="1">私有</van-radio>
              <van-radio name="2">加密</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <!-- 
          只有选择加密队伍时，才会显示出密码框
          把状态类型转为Number，因为通过打印可得，状态是字符串类型的。而=== 是强判断
        -->
        <van-field
            v-if="Number(addTeamData.status) === 2"
            v-model="addTeamData.password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入队伍密码"
            :rules="[{ required: true, message: '请填写密码' }]"
        />

      </van-cell-group>
      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit">
          提交
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import myAxios from '../plugins/myAxios';
import { showSuccessToast, showFailToast } from "vant/lib/vant.es";
import { formatNumber } from 'vant/lib/utils';
import dayjs from 'dayjs';

const router = useRouter()

const initFormData={
  "description": "",
  "expireTime": dayjs().format('YYYY-MM-DD'),
  "maxNum": 0,
  "name": "",
  "password": "",
  "status": 0,
  "userId": 0
}
// 需要用户填写的表单数据 对象扩展
// JavaScript 的扩展运算符（spread syntax）
// 把 initFormData 对象里的所有属性复制一份到一个新对象中
const addTeamData = ref({...initFormData})

// 展示日期选择器
const showPicker = ref(false)
const today = new Date()
const minDate = new Date()

//
const onConfirm = ({ selectedValues }) => {
  // const [year, month, day] = selectedValues
  // addTeamData.value.expireTime = `${year}-${month}-${day}`
  addTeamData.value.expireTime = selectedValues.join('-');
  showPicker.value = false
}

// 提交请求
// 点击自动获取van-field name中的值组成的对象。
// 关键是提交所传的的状态也要转换成Number，同时创建成功后跳转到队伍页面
const onSubmit = async () =>{
  const postData = {
    ...addTeamData.value,
    status: Number(addTeamData.value.status),
    // 前端时间格式化：
    // 下载时间 格式化工具 npm i dayjs
    expireTime: dayjs(addTeamData.value.expireTime).format('YYYY-MM-DD HH:mm:ss')
  }
  const res = await myAxios.post('/team/add',postData)
  if (res?.code === 0 && res.data){
    showSuccessToast('队伍创建成功')
    router.push({
      path:'/team',
      replace:true
    })
  } else{
    showFailToast("创建失败")
  }

}


</script>

<style scoped></style>
