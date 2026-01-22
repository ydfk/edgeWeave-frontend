import { alovaInstance } from "..";

// 规则模板列表
export const getRuleTemplates = alovaInstance.Get("/rule-templates");

// 创建规则模板
export const createRuleTemplate = (payload: Record<string, unknown>) =>
  alovaInstance.Post("/rule-templates", payload);

// 同步ACL4SSR模板
export const syncAcl4ssrTemplate = alovaInstance.Post("/rule-templates/acl4ssr/sync");

// 规则集列表
export const getRuleSets = alovaInstance.Get("/rule-sets");

// 创建规则集
export const createRuleSet = (payload: Record<string, unknown>) =>
  alovaInstance.Post("/rule-sets", payload);

// 更新规则集
export const updateRuleSet = (id: string, payload: Record<string, unknown>) =>
  alovaInstance.Put(`/rule-sets/${id}`, payload);
