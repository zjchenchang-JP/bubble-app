/**
 * 创建一个方法可获取到的用户信息。相当于java中的get/set
 * 在不引入pinia的状态 共享方法
 * 相当于一个不用 Pinia 的简易状态管理——用 JS 模块的闭包作用域代替了全局 store
 * 但注意：页面刷新后变量就丢了，因为它只存在内存里
 */
import type { CurrentUser } from "../models/user";

let currentUser: CurrentUser;

const setCurrentUserState = (user:CurrentUser) =>{
    currentUser =user;
}

const getCurrentUserState = (): CurrentUser =>{
    return currentUser;
}

export {
    setCurrentUserState,
    getCurrentUserState,
}