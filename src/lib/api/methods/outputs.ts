import { alovaInstance } from "..";

// 输出列表
export const getOutputs = alovaInstance.Get("/outputs");

// 创建输出
export const createOutput = (payload: Record<string, unknown>) =>
  alovaInstance.Post("/outputs", payload);

// 更新输出
export const updateOutput = (id: string, payload: Record<string, unknown>) =>
  alovaInstance.Put(`/outputs/${id}`, payload);

// 删除输出
export const deleteOutput = (id: string) => alovaInstance.Delete(`/outputs/${id}`);

// 输出预览
export const previewOutput = (id: string) => alovaInstance.Get(`/outputs/${id}/preview`);

// 输出生成
export const renderOutput = (id: string) => alovaInstance.Get(`/outputs/${id}/render`);

// 输出版本列表
export const getOutputVersions = (id: string, params?: Record<string, unknown>) =>
  alovaInstance.Get(`/outputs/${id}/versions`, { params });
