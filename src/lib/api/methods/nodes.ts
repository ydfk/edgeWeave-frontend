import { alovaInstance } from ".."

// 节点列表
export const getNodes = alovaInstance.Get("/nodes")

// 创建节点
export const createNode = (payload: Record<string, unknown>) =>
  alovaInstance.Post("/nodes", payload)

// 更新节点
export const updateNode = (id: string, payload: Record<string, unknown>) =>
  alovaInstance.Put(`/nodes/${id}`, payload)

// 删除节点
export const deleteNode = (id: string) => alovaInstance.Delete(`/nodes/${id}`)

// 批量导入节点
export const importNodes = (payload: Record<string, unknown>) =>
  alovaInstance.Post("/nodes/import", payload)

// 上传文件导入节点
export const uploadNodes = (formData: FormData) =>
  alovaInstance.Post("/nodes/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

// 获取所有标签
export const getNodeTags = () => alovaInstance.Get("/nodes/tags")
