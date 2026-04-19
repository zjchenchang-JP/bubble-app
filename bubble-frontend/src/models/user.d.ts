/**
 * 用户类别
 */
export type CurrentUser = {
    id: number;
    username: string;
    userAccount: string;
    // 问号 ? 表示该属性在对象中可以存在也可以缺失。
    // 若存在，其值必须为字符串；若缺失，值为 undefined。
    // 常用于接口或类型定义中描述非必填的用户头像链接。
    avatarUrl?: string;
    gender: number;
    phone: string;
    email: string;
    userStatus: number;
    userRole: number;
    planetCode: string;
    tags: string[];
    createTime: Date;
};