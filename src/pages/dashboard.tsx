import { Activity, Server, ShieldCheck, Zap, Workflow as WorkflowIcon } from "lucide-react";
import { Button } from "../components/ui/button";

export function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">仪表盘</h1>
        <div className="flex gap-2">
           <Button>添加节点</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "运行中节点", value: "12", icon: Server, color: "text-blue-500", trend: "+2" },
          { title: "活跃规则", value: "24", icon: WorkflowIcon, color: "text-purple-500", trend: "+5" },
          { title: "系统负载", value: "45%", icon: Activity, color: "text-green-500", trend: "-12%" },
          { title: "安全警报", value: "0", icon: ShieldCheck, color: "text-red-500", trend: "0" },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div className="flex items-center pt-4">
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="ml-auto text-xs text-muted-foreground">
                {stat.trend.startsWith('+') ? '↑' : ''} {stat.trend} 较上周
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart Placeholder */}
        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="font-semibold leading-none tracking-tight">流量监控</h3>
            <p className="text-sm text-muted-foreground">实时网络数据吞吐量</p>
          </div>
          <div className="p-6 pt-0 h-[300px] flex items-center justify-center bg-muted/20 m-6 rounded-md border border-dashed">
            <div className="text-muted-foreground flex flex-col items-center">
              <Activity className="h-10 w-10 mb-2 opacity-20" />
              <span>图表区域占位符</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm">
           <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="font-semibold leading-none tracking-tight">最近活动</h3>
            <p className="text-sm text-muted-foreground">系统操作日志</p>
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-6">
              {[
                { time: "10:24", user: "Admin", action: "更新了节点配置 #001" },
                { time: "09:12", user: "System", action: "自动备份完成" },
                { time: "Yesterday", user: "Admin", action: "新增规则引擎 v2" },
                { time: "Yesterday", user: "User1", action: "登录系统" },
              ].map((log, i) => (
                <div key={i} className="flex items-center">
                  <span className="relative flex h-2 w-2 mr-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <div className="ml-2 space-y-1">
                    <p className="text-sm font-medium leading-none">{log.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {log.user} - {log.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
         {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Zap className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold">快捷操作 {i}</h3>
                        <p className="text-sm text-muted-foreground">快速执行常用任务</p>
                    </div>
                </div>
            </div>
         ))}
      </div>

    </div>
  );
}
