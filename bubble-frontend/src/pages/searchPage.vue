<template>
    <form action="/">
        <van-search
            v-model="searchText"
            show-action
            placeholder="请输入想要搜索的标签"
            @search="onSearch"
            @cancel="onCancel"
        />
    </form>
    <van-divider content-position="left">已选标签</van-divider>
    <van-row gutter="16" style="padding: 0 16px">
        <van-col v-for="tag in activeIds">
            <van-tag closeable size="small" type="primary" @close="doClose(tag)">
                {{tag}}
            </van-tag>
        </van-col>
    </van-row>
    <van-divider content-position="left">选择标签</van-divider>
    <!-- v-model:main-active-index	左侧选中项的索引 -->
    <!-- v-model:active-id	右侧选中项的 id，支持传入数组 -->
    <van-tree-select
        v-model:active-id="activeIds"
        v-model:main-active-index="activeIndex" 
        :items="tagList"
    />
    <div style="padding: 16px">
        <van-button block type="primary" @click="doSearchResult">搜索</van-button>
  </div>

</template>

<script setup>
import { onMounted, ref } from 'vue';
import { showToast } from 'vant';
import { useRouter } from 'vue-router';
const router = useRouter()

const searchText = ref('');
// Tree-select中已选中的标签
const activeIds = ref([]);
const activeIndex = ref(0);
const originTagList = [
    {
        text: '性别',
        children: [
            { text: '男', id: '男' },
            { text: '女', id: '女' }, 
        ],
    },
    {
        text: '年级',
        children: [
            { text: '大一', id: '大一' },
            { text: '大二', id: '大二' },
            { text: '大三', id: '大三' },
            { text: '大四', id: '大四' },
        ],
    },
];

// 标签列表
let tagList = ref(originTagList);
// 搜索过滤 标签


const onSearch = (val) => showToast(val);
const onCancel = () => showToast('取消');

// 移除标签
const doClose = (tag) => {
    activeIds.value = activeIds.value.filter(item => {
        // tag 是被close掉的标签
        // 用户点击标签关闭按钮 → @close 事件触发 → doClose(tag) 被调用
        // → filter 过滤掉该 tag → activeIds.value 更新 
        // → 双向绑定触发 → van-tree-select 自动取消选中该标签
        // filter创建一个新数组, 只保留不等于被点击 tag 的元素
        return item != tag
    })
}

// 点击搜索
const doSearchResult = () => {
    router.push({
        path: '/user/list',
        query: {
            tags: activeIds.value
        }
    })
}



</script>

<style scoped>

</style>