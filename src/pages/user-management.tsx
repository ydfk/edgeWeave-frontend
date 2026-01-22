import { Users } from "lucide-react";
import { PagePlaceholder } from "./page-placeholder";

export function UserManagement() {
  return (
    <PagePlaceholder 
      title="用户管理" 
      description="管理系统用户，配置角色权限，以及查看用户活动日志。"
      icon={Users}
    />
  );
}
