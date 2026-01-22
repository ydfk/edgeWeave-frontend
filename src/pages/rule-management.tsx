import { Workflow } from "lucide-react";
import { PagePlaceholder } from "./page-placeholder";

export function RuleManagement() {
  return (
    <PagePlaceholder 
      title="规则管理" 
      description="配置数据处理规则，定义自动化流程，以及管理事件触发机制。"
      icon={Workflow}
    />
  );
}
