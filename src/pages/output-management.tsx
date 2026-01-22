import { useState } from "react";
import { useState } from "react";
import { Download, RefreshCw, Play, Clock, Plus, Pencil, Trash2 } from "lucide-react";
import { useRequest } from "alova/client";
import { getOutputs, renderOutput, createOutput } from "../lib/api/methods/outputs";
import { Button } from "../components/ui/button";
import { SimpleModal } from "../components/ui/simple-modal";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

export function OutputManagement() {
  const { loading, data, error, send: refresh } = useRequest(getOutputs, {
    initialData: [],
  });

  const { send: generate, loading: generating } = useRequest(renderOutput, { immediate: false });
  const { send: create, loading: creating } = useRequest(createOutput, { immediate: false });

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    format: "mihomo",
    ruleSetId: "",
    nodeIds: "[]",
    options: "{}"
  });

  const handleGenerate = async (id: string) => {
      try {
          await generate(id);
          refresh();
      } catch (e) {
          console.error(e);
      }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      alert("请填写输出名称");
      return;
    }
    try {
      const payload: any = { ...formData };
      if (!payload.ruleSetId) delete payload.ruleSetId;
      
      try {
        JSON.parse(formData.nodeIds);
        JSON.parse(formData.options);
      } catch (e) {
        alert("节点列表或选项必须是有效的 JSON 格式");
        return;
      }

      await create(payload);
      setOpen(false);
      setFormData({ name: "", format: "mihomo", ruleSetId: "", nodeIds: "[]", options: "{}" });
      refresh();
    } catch (e: any) {
      alert("创建失败: " + (e.message || "未知错误"));
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in duration-500 delay-300">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">输出管理</h1>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={() => refresh()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新建输出
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         {loading && data.length === 0 ? (
             Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-32 rounded-xl border bg-card p-6 shadow-sm animate-pulse flex flex-col justify-between">
                   <div className="h-6 w-1/3 bg-muted rounded"></div>
                   <div className="space-y-2">
                       <div className="h-4 w-full bg-muted rounded"></div>
                       <div className="h-4 w-2/3 bg-muted rounded"></div>
                   </div>
                </div>
             ))
         ) : error ? (
            <div className="col-span-full py-10 text-center text-red-500 bg-red-50/50 rounded-lg">
                <p>无法获取输出列表: {error.message}</p>
                <Button variant="link" onClick={() => refresh()}>重试</Button>
            </div>
         ) : data.length === 0 ? (
             <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed border-muted rounded-xl">
                 <Download className="h-12 w-12 mx-auto mb-4 opacity-20" />
                 <p>暂无输出配置</p>
             </div>
         ) : (
             data.map((output: any, index: number) => (
                 <div key={output.id || index} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between hover:border-primary/50 transition-colors">
                     <div className="flex justify-between items-start mb-4">
                         <div>
                             <h3 className="font-semibold text-lg">{output.name || '未命名输出'}</h3>
                             <p className="text-sm text-muted-foreground">{output.description || '无描述'}</p>
                         </div>
                         <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                             <Download className="h-5 w-5" />
                         </div>
                     </div>
                     
                     <div className="flex items-center justify-between mt-4 pt-4 border-t">
                         <div className="text-xs text-muted-foreground flex items-center gap-2">
                             <Clock className="h-3 w-3" />
                             <span>最后生成: {output.lastGenerated ? new Date(output.lastGenerated).toLocaleDateString() : '从未'}</span>
                         </div>
                         <div className="flex gap-2">
                             <Button 
                                 size="sm" 
                                 variant="ghost" 
                                 className="h-8 w-8 p-0"
                                 disabled
                                 title="待后端支持"
                             >
                                 <Pencil className="h-4 w-4 text-muted-foreground" />
                             </Button>
                             <Button 
                                 size="sm" 
                                 variant="ghost" 
                                 className="h-8 w-8 p-0"
                                 disabled
                                 title="待后端支持"
                             >
                                 <Trash2 className="h-4 w-4 text-muted-foreground" />
                             </Button>
                             <div className="w-px h-4 bg-border mx-1 self-center"></div>
                             <Button size="sm" variant="outline" onClick={() => handleGenerate(output.id)} disabled={generating}>
                                 <Play className="h-3 w-3 mr-2" />
                                 生成
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
        title="新建输出配置"
        description="创建一个新的订阅输出文件配置"
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
              placeholder="输出配置名称" 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="format">格式 *</Label>
            <Input 
              id="format" 
              value={formData.format} 
              onChange={(e) => setFormData({...formData, format: e.target.value})} 
              placeholder="mihomo" 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ruleSetId">规则集 ID (可选)</Label>
            <Input 
              id="ruleSetId" 
              value={formData.ruleSetId} 
              onChange={(e) => setFormData({...formData, ruleSetId: e.target.value})} 
              placeholder="绑定的规则集 ID" 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="nodeIds">节点列表 (JSON ID 数组)</Label>
            <Textarea 
              id="nodeIds" 
              value={formData.nodeIds} 
              onChange={(e) => setFormData({...formData, nodeIds: e.target.value})} 
              placeholder='["node-id-1", "node-id-2"]' 
              className="font-mono text-xs"
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="options">高级选项 (JSON 对象)</Label>
            <Textarea 
              id="options" 
              value={formData.options} 
              onChange={(e) => setFormData({...formData, options: e.target.value})} 
              placeholder='{"udpn": true}' 
              className="font-mono text-xs"
              rows={3}
            />
          </div>
        </div>
      </SimpleModal>
    </div>
  );
}
