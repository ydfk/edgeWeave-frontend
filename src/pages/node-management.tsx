import { Server } from "lucide-react";
import { PagePlaceholder } from "./page-placeholder";

export function NodeManagement() {
  return (
    <PagePlaceholder 
      title="节点管理" 
      description="在此管理您的边缘计算节点，监控状态，配置参数以及进行远程维护。"
      icon={Server}
    />
  );
}
