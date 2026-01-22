import { useState } from "react";
import { useState } from "react";
import { Rss, RefreshCw, ExternalLink, Calendar, Plus, Pencil, Trash2 } from "lucide-react";
import { useRequest } from "alova/client";
import { getSubscriptionSources, syncSubscriptionSource, createSubscriptionSource } from "../lib/api/methods/subscriptions";
import { Button } from "../components/ui/button";
import { SimpleModal } from "../components/ui/simple-modal";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";

export function SubscriptionManagement() {
  const { loading, data, error, send: refresh } = useRequest(getSubscriptionSources, {
    initialData: [],
  });

  const { send: sync, loading: syncing } = useRequest(syncSubscriptionSource, { immediate: false });
  const { send: create, loading: creating } = useRequest(createSubscriptionSource, { immediate: false });

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    updateInterval: "60"
  });

  const handleSync = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await sync(id);
      refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async () => {
    if (!formData.url) {
      alert("请填写订阅 URL");
      return;
    }
    try {
      const payload: any = { ...formData };
      if (payload.updateInterval) payload.updateInterval = parseInt(payload.updateInterval, 10) * 60;
      else delete payload.updateInterval;
      
      await create(payload);
      setOpen(false);
      setFormData({ name: "", url: "", updateInterval: "60" });
      refresh();
    } catch (e: any) {
      alert("创建失败: " + (e.message || "未知错误"));
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in duration-500 delay-200">
       <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">订阅管理</h1>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={() => refresh()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            添加订阅
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm divide-y divide-border">
        {loading && data.length === 0 ? (
           <div className="p-8 text-center space-y-4">
             <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
             <p className="text-muted-foreground animate-pulse">正在获取订阅源...</p>
           </div>
        ) : error ? (
           <div className="p-8 text-center text-red-500 bg-red-50/50">
             <p>无法获取订阅列表: {error.message}</p>
             <Button variant="link" onClick={() => refresh()}>重试</Button>
           </div>
        ) : data.length === 0 ? (
           <div className="p-20 text-center text-muted-foreground">
              <Rss className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>暂无订阅源</p>
           </div>
        ) : (
          data.map((sub: any, index: number) => (
            <div key={sub.id || index} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors group">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Rss className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                   <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">{sub.name || '未命名订阅'}</h3>
                      {sub.status && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-medium uppercase tracking-wider">
                          {sub.status}
                        </span>
                      )}
                   </div>
                   <p className="text-sm text-muted-foreground line-clamp-1 break-all font-mono">
                     {sub.url || 'https://example.com/subscription/feed'}
                   </p>
                </div>
              </div>

              <div className="flex items-center gap-4 pl-14 md:pl-0">
                 <div className="flex flex-col items-end text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      更新于 {sub.updatedAt ? new Date(sub.updatedAt).toLocaleDateString() : '从未'}
                    </span>
                    <span>{sub.count || 0} 个节点</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={(e) => handleSync(e, sub.id)} disabled={syncing}>
                      <RefreshCw className={`h-3 w-3 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                      同步
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={sub.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <div className="w-px h-4 bg-border mx-1"></div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground"
                      disabled
                      title="待后端支持"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground"
                      disabled
                      title="待后端支持"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>

      <SimpleModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="添加订阅源"
        description="添加一个新的订阅链接以获取节点"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button onClick={handleSubmit} disabled={creating}>
              {creating ? "添加中..." : "添加"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">名称 (可选)</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              placeholder="订阅源名称" 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="url">订阅 URL *</Label>
            <Input 
              id="url" 
              value={formData.url} 
              onChange={(e) => setFormData({...formData, url: e.target.value})} 
              placeholder="https://..." 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="interval">更新间隔 (分钟)</Label>
            <Input 
              id="interval" 
              type="number"
              value={formData.updateInterval} 
              onChange={(e) => setFormData({...formData, updateInterval: e.target.value})} 
              placeholder="60" 
            />
          </div>
        </div>
      </SimpleModal>
    </div>
  );
}
