// 给枚举加上索引签名：
// 告诉 TypeScript：这个对象的 key 可以是任意 number，值都是 string。
// 这样 teamStatusEnum[team.status] 就不会报错了
export const teamStatusEnum: Record<number, string> = {
  0:'公开',
  1:'私有',
  2:'加密',
}