import { alovaInstance } from "..";

// 健康检查
export const getHealth = alovaInstance.Get("/system/health");

// 版本信息
export const getVersion = alovaInstance.Get("/system/version");
