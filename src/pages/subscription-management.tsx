import { Rss } from "lucide-react";
import { PagePlaceholder } from "./page-placeholder";

export function SubscriptionManagement() {
  return (
    <PagePlaceholder 
      title="订阅管理" 
      description="管理数据订阅源，配置消息推送通道，以及查看订阅状态。"
      icon={Rss}
    />
  );
}
