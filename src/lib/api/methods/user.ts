import { alovaInstance } from ".."

// 用户登录
export const login = (payload: Record<string, unknown>) =>
  alovaInstance.Post("/auth/login", payload, {
    meta: {
      authRole: "login",
    },
  })

// 获取用户信息
export const getProfile = alovaInstance.Get("/auth/profile")
