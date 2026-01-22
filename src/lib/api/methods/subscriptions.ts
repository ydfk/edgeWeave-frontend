import { alovaInstance } from ".."

// 订阅源列表
export const getSubscriptionSources = alovaInstance.Get("/subscription-sources")

// 创建订阅源
export const createSubscriptionSource = (payload: Record<string, unknown>) =>
  alovaInstance.Post("/subscription-sources", payload)

// 更新订阅源
export const updateSubscriptionSource = (
  id: string,
  payload: Record<string, unknown>,
) => alovaInstance.Put(`/subscription-sources/${id}`, payload)

// 删除订阅源
export const deleteSubscriptionSource = (id: string) =>
  alovaInstance.Delete(`/subscription-sources/${id}`)

// 同步订阅源
export const syncSubscriptionSource = (id: string) =>
  alovaInstance.Post(`/subscription-sources/${id}/sync`)

// 同步记录
export const getSubscriptionSyncs = (
  id: string,
  params?: Record<string, unknown>,
) => alovaInstance.Get(`/subscription-sources/${id}/syncs`, { params })
