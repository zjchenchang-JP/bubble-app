import {CurrentUser} from "./user";

/**
 * 队伍类别 
 * 对应 后端 TeamUserVO 规范数据类型 编译期发现错误
 * 哪些字段可用，避免每次都要翻后端代码或接口文档
 * 后端的接口文档内嵌到前端代码里，不用靠人记、靠文档查，编辑器直接提示数据长什么样
 */
export type TeamType = {
    id: number;
    userId:number;
    name: string;
    description: string;
    expireTime?: Date; 
    maxNum: number;
    password?: string,
    // todo 定义枚举值类型，更规范
    status: number;
    createTime: Date;
    updateTime: Date;
    createUser?: UserType;
    // 已加入队伍人数
    hasJoinNum?: number;
    // 当前用户是否已加入队伍
    hasJoin?:boolean
};