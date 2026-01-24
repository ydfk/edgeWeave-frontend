import { createAlova } from "alova"

import { createServerTokenAuthentication } from "alova/client"

import ReactHook from "alova/react"

import adapterFetch from "alova/fetch"

import { mockAdapter } from "./mock/index"

const { onAuthRequired, onResponseRefreshToken } =
  createServerTokenAuthentication({
    async login(response) {
      const data = await response.clone().json()
      const token = data?.data?.token
      if (token) {
        localStorage.setItem("token", token)
      }
    },

    assignToken: (method) => {
      const token = localStorage.getItem("token")
      if (token) {
        method.config.headers.Authorization = `Bearer ${token}`
      }
    },

    logout() {
      localStorage.removeItem("token")
    },
  })

const useMock = import.meta.env.VITE_USE_MOCK === "true"

console.log("🚀 ~ useMock:", useMock)

export const alovaInstance = createAlova({
  baseURL: "/api",

  statesHook: ReactHook,

  requestAdapter: useMock ? mockAdapter : adapterFetch(),

  beforeRequest: onAuthRequired(),

  responded: onResponseRefreshToken((response) => {
    if (response.status >= 400) throw new Error(response.statusText)
    return response.json ? response.json() : response
  }),
})
