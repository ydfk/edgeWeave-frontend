import { Settings as SettingsIcon } from "lucide-react";
import { PagePlaceholder } from "./page-placeholder";

export function Settings() {
  return (
    <PagePlaceholder 
      title="系统设置" 
      description="配置系统全局参数，外观设置，网络配置以及查看系统信息。"
      icon={SettingsIcon}
    />
  );
}
