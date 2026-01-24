import {
  Activity,
  Server,
  ShieldCheck,
  Zap,
  Workflow as WorkflowIcon,
} from "lucide-react"
import { Card, CardBody, CardHeader } from "@heroui/react"
import { Button } from "../components/ui/button"

export function Dashboard() {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between reveal">
        <h1 className="text-3xl font-bold tracking-tight">仪表盘</h1>
        <div className="flex gap-2">
          <Button>添加节点</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 reveal reveal-delay-100">
        {[
          {
            title: "运行中节点",
            value: "12",
            icon: Server,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/20",
            trend: "+2",
          },
          {
            title: "活跃规则",
            value: "24",
            icon: WorkflowIcon,
            color: "text-purple-500",
            bg: "bg-purple-50 dark:bg-purple-900/20",
            trend: "+5",
          },
          {
            title: "系统负载",
            value: "45%",
            icon: Activity,
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
            trend: "-12%",
          },
          {
            title: "安全警报",
            value: "0",
            icon: ShieldCheck,
            color: "text-red-500",
            bg: "bg-red-50 dark:bg-red-900/20",
            trend: "0",
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="h-[140px] relative overflow-hidden group border-none shadow-md hover:shadow-lg transition-all"
          >
            <CardBody className="p-6 flex flex-col justify-between overflow-visible">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500 pointer-events-none">
                 <stat.icon className={`h-24 w-24 ${stat.color}`} />
              </div>

              <div className="flex items-center justify-between z-10">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <div className="z-10">
                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <span className={`${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'} font-medium mr-1`}>
                     {stat.trend.startsWith("+") ? "↑" : "↓"} {stat.trend}
                  </span>
                  较上周
                </p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 reveal reveal-delay-200">
        {/* Main Chart Placeholder */}
        <Card className="col-span-4 p-6 shadow-sm border-none">
          <CardHeader className="p-0 pb-6 flex-col items-start gap-1">
            <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              流量趋势
            </h3>
            <p className="text-sm text-muted-foreground">实时网络数据吞吐量监控</p>
          </CardHeader>
          <CardBody className="p-0 h-[300px] w-full bg-gradient-to-b from-primary/5 to-transparent rounded-xl border border-primary/10 flex items-center justify-center relative overflow-hidden group">
            {/* Fake Chart Wave */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-primary/10 blur-3xl opacity-50 group-hover:h-40 transition-all duration-700"></div>
            <div className="text-muted-foreground/50 flex flex-col items-center z-10">
              <div className="h-12 w-12 rounded-full bg-background shadow-sm flex items-center justify-center mb-3 text-primary animate-pulse">
                <Activity className="h-6 w-6" />
              </div>
              <span className="font-medium text-sm">图表可视化区域</span>
            </div>
          </CardBody>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3 overflow-hidden flex flex-col shadow-sm border-none">
          <CardHeader className="p-6 border-b border-border/40 bg-muted/20">
            <div className="flex flex-col gap-1">
              <h3 className="font-bold tracking-tight">最近活动</h3>
              <p className="text-sm text-muted-foreground">系统操作日志审计</p>
            </div>
          </CardHeader>
          <CardBody className="p-0 flex-1 overflow-y-auto">
            <div className="divide-y divide-border/40">
              {[
                { time: "10:24", user: "Admin", action: "更新了节点配置 #001", type: "update" },
                { time: "09:12", user: "System", action: "自动备份完成", type: "success" },
                { time: "昨天", user: "Admin", action: "新增规则引擎 v2", type: "create" },
                { time: "昨天", user: "User1", action: "登录系统", type: "login" },
                { time: "2天前", user: "System", action: "检测到高负载告警", type: "warning" },
              ].map((log, i) => (
                <div key={i} className="flex items-center p-4 hover:bg-muted/30 transition-colors">
                  <div className={`h-2 w-2 rounded-full mr-4 flex-shrink-0 ${
                    log.type === 'warning' ? 'bg-orange-500' :
                    log.type === 'success' ? 'bg-emerald-500' :
                    log.type === 'create' ? 'bg-blue-500' : 'bg-slate-300'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate mb-1">
                      {log.action}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground/70 mr-2">{log.user}</span>
                      <span>{log.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
          <div className="p-3 border-t border-border/40 bg-muted/20 text-center">
            <Button variant="link" size="sm" className="text-xs text-muted-foreground h-auto p-0">查看全部日志</Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3 reveal reveal-delay-300">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            isPressable
            className="p-4 flex flex-row items-center gap-4 hover:border-primary/40 hover:shadow-md transition-all group shadow-sm"
          >
             <CardBody className="flex flex-row items-center gap-4 p-0 overflow-visible">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">快捷操作 {i}</h3>
                <p className="text-xs text-muted-foreground">
                  一键执行预设任务
                </p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}
