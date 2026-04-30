import myAxios from "../plugins/myAxios";
import {getCurrentUserState, setCurrentUserState} from "../states/user";

/**
 * 获取用户信息
 * 每个页面都要获取当前的用户信息，所以我们把这个方法提取出来
 * 在src目录下建立services包，并创建user.ts编写代码
 * @returns {Promise<null|any>}
 */
export const getCurrentUser = async () => {
    // 这段代码 有缓存就直接返回，不发请求。
    // 第一次加载 UserPage 时从 API 拿了数据，
    // 之后每次回来都返回缓存里的旧数据，所以编辑后页面不更新
    // const user = getCurrentUserState();
    // if (user) {
    //     return user;
    // }
    
    //从远程处获取用户信息
    const res = await myAxios.get("/user/current");
    if (res.code == 0 ) {
        // setCurrentUserState(res.data);
        return res.data;
    }
    return null;
}