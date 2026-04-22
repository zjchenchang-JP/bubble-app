<template>
    <van-card 
        v-for="user in userList" 
        :desc="`个人简介：${user.profile}`" 
        :title="`${user.username} (${user.planetCode})`"
        :thumb="user.avatarUrl"
    >
        <template #tags>
            <van-tag plain type="danger" v-for="tag in tags" style="margin-right: 8px; margin-top: 10px">
                {{ tag }}
            </van-tag>
        </template>
        <template #footer>
            <van-button size="mini">联系我</van-button>
        </template>
    </van-card>

</template>

<script setup>
import { onMounted, ref } from 'vue';
import { showToast } from 'vant';
import { useRoute } from "vue-router";
import myAxios from '../plugins/myAxios';
import qs from 'qs';
const route = useRoute();

const mockUser = {
    id: 2767,
    username: 'ZJCC',
    userAccount: 'admin',
    avatarUrl: 'https://img1.baidu.com/it/u=467212011,1034521901&fm=253&fmt=auto&app=120&f=JPEG?w=500&h=500',
    gender: 0,
    profile: '赵客缦胡缨，吴钩霜雪明。个人对阅读比较感兴趣，喜欢火锅😎',
    phone: '121311313',
    email: '23432@qq.com',
    planetCode: '2767',
    userRole: '管理员',
    createTime: new Date(),
    tags: ['java', '前端', 'AI练习生', '后端', '开卷'],
};

// 当取消所有标签后，route.query.tags 变为[]，此时如下代码可以让 显示mock的默认数据。
// const tags = (route.query.tags && route.query.tags.length > 0) ? route.query.tags : mockUser.tags;
// const userList = ref([mockUser]);
const tags = route.query.tags // 搜索页通过路由传来的数据
const userList = ref([]) //存放用户列表
onMounted(async() =>{
        // myAxios 请求 url + 请求参数
    const userListData = await myAxios.get('/user/search/tags', {
            params: {
                tagNameList: tags
            },
            //序列化
            /**
             * 为什么需要 paramsSerializer
             * Axios 默认把数组序列化为带方括号的形式：
                    tagNameList[0]=java&tagNameList[1]=python&tagNameList[2]=AI
                Spring Boot 不认识这种格式，无法正确绑定参数。加了 qs.stringify(params, { indices: false }) 后变成：
                    tagNameList=java&tagNameList=python&tagNameList=AI
                这是重复 key 的形式，Spring Boot 可以识别
                Spring Boot 看到 tagNameList=java&tagNameList=python&tagNameList=AI 这种重复 key 时，
                会自动把同名参数收集到一个 List 里  tagNameList = ["java", "python", "AI"]
            */
            paramsSerializer: {
                serialize: params => qs.stringify(params, { indices: false}),
            }

        })
        .then(function (response) {
            console.log('/user/search/tags succeed',response);
            // 在搜索请求成功/失败时弹出轻量提示（toast）
            showToast({ type: 'success', message: '请求成功' });
            //返回数据  ?.可选链操作符，避免数据为null或undefined时报错
            return response.data?.data; 
        })
        .catch(function (error) {
            console.log('/user/search/tags error',error);
            showToast({ type: 'fail', message: '请求失败' });
        });
        if(userListData){ // undefined 也是false
            userListData.forEach(user => {
                if(user.tags){
                    // JSON.parse()  解析（字符串 → 对象/数组）
                    // JSON.stringify()  字符串化（对象/数组 → 字符串）
                    /**
                     * JSON.parse('["java", "前端"]')    // → 数组
                        JSON.parse('{"name": "张三"}')     // → 对象
                        JSON.parse('123')                  // → 数字
                        JSON.parse('"hello"')              // → 字符串
                        JSON.parse('true')                 // → 布尔值 true
                        JSON.parse('null')                 // → null
                     */
                    // 后端 User.tags  →  JSON: {"tags": "[\"java\"]"}  →  前端 user.tags
                    // 如果前端想用不同的名字，比如 userLabels，就需要手动映射
                    // user.userLabels = JSON.parse(user.tags)
                    // 或者让后端返回时用 @JsonProperty("userLabels") 改名字
                    // 又或者定义一个前端 VO（视图对象）来做字段映射。
                    // 但最简单的做法就是前后端字段名保持一致，省去转换的麻烦
                    user.tags = JSON.parse(user.tags);
                }
            });
            userList.value = userListData;
        }

})



</script>

<style scoped></style>