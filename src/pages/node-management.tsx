import { useState } from "react";
import { useState } from "react";
import { Server, RefreshCw, Plus, Pencil, Trash2 } from "lucide-react";
import { useRequest } from "alova/client";
import { getNodes, createNode, deleteNode } from "../lib/api/methods/nodes";
import { Button } from "../components/ui/button";
import { SimpleModal } from "../components/ui/simple-modal";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

export function NodeManagement() {
  const { loading, data, error, send: refresh } = useRequest(getNodes, {
    initialData: [],
  });

  const { send: create, loading: creating } = useRequest(createNode, { immediate: false });
  const { send: remove, loading: removing } = useRequest(deleteNode, { immediate: false });
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    rawContent: "",
    subscriptionSourceId: ""
  });

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除该节点吗？")) return;
    try {
      await remove(id);
      refresh();
    } catch (e: any) {
      alert("删除失败: " + (e.message || "未知错误"));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.type || !formData.rawContent) {
      alert("请填写必要字段 (名称, 类型, 内容)");
      return;
    }
    try {
      const payload: any = { ...formData };
      if (!payload.subscriptionSourceId) delete payload.subscriptionSourceId;
      
      await create(payload);
      setOpen(false);
      setFormData({ name: "", type: "", rawContent: "", subscriptionSourceId: "" });
      refresh();
    } catch (e: any) {
      alert("创建失败: " + (e.message || "未知错误"));
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">节点管理</h1>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={() => refresh()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新建节点
          </Button>
        </div>
      </div>
      
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-semibold flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                节点列表
             </h2>
             <span className="text-sm text-muted-foreground">共 {data?.length || 0} 个节点</span>
          </div>

          {error ? (
             <div className="py-10 text-center text-red-500 bg-red-50/50 rounded-lg">
                <p>加载失败: {error.message}</p>
                <Button variant="link" onClick={() => refresh()}>重试</Button>
             </div>
          ) : loading && data.length === 0 ? (
             <div className="py-20 text-center space-y-4">
                <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
                <p className="text-muted-foreground animate-pulse">正在获取节点状态...</p>
             </div>
          ) : data.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
               <Server className="h-12 w-12 mx-auto mb-4 opacity-20" />
               <p>暂无节点，请点击右上角创建</p>
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 font-medium">ID</th>
                    <th className="px-6 py-3 font-medium">名称</th>
                    <th className="px-6 py-3 font-medium">状态</th>
                    <th className="px-6 py-3 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.map((node: any, index: number) => (
                    <tr key={node.id || index} className="hover:bg-muted/50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        {node.id ? node.id.substring(0, 8) : '-'}...
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                         <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                            {node.name || '未命名节点'}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${
                          node.status === 'online' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 
                          'bg-slate-50 text-slate-700 ring-slate-600/20'
                        }`}>
                          {node.status || '未知'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            disabled
                            title="待后端支持"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-red-500"
                            onClick={() => handleDelete(node.id)}
                            disabled={removing}
                            title="删除节点"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <SimpleModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="新建节点"
        description="手动添加一个新的节点配置"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button onClick={handleSubmit} disabled={creating}>
              {creating ? "创建中..." : "创建"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">名称 *</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              placeholder="节点名称" 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">类型 *</Label>
            <Input 
              id="type" 
              value={formData.type} 
              onChange={(e) => setFormData({...formData, type: e.target.value})} 
              placeholder="例如: vmess, trojan, ss" 
            />
          </div>
          <div className="grid gap-2">
             <Label htmlFor="subId">订阅源 ID (可选)</Label>
             <Input 
              id="subId"
              value={formData.subscriptionSourceId}
              onChange={(e) => setFormData({...formData, subscriptionSourceId: e.target.value})}
              placeholder="关联的订阅源 ID"
             />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">原始内容 *</Label>
            <Textarea 
              id="content"
              value={formData.rawContent}
              onChange={(e) => setFormData({...formData, rawContent: e.target.value})}
              placeholder="节点配置内容 (JSON/YAML/Link)"
              className="font-mono text-xs"
              rows={5}
            />
          </div>
        </div>
      </SimpleModal>
    </div>
  );
}
