import { alovaInstance } from ".."

// 解析后的节点数据结构
export interface ParsedNode {
  name: string
  type: string
  address: string
  port: number
  raw: string
  extra?: Record<string, unknown>
}

// 解析结果（包含成功和失败）
export interface ParseResult {
  data: ParsedNode[]
  failed: Array<{ line: number; error: string; raw: string }>
}

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

// 解析节点内容（预览）
export const parseNodes = (content: string, format?: "auto" | "uri" | "yaml") =>
  alovaInstance.Post("/nodes/parse", { content, format: format || "auto" })
