import { useState } from "react";
import { useState } from "react";
import { Workflow, RefreshCw, Plus, FileJson, Pencil, Trash2 } from "lucide-react";
import { useRequest } from "alova/client";
import { getRuleSets, createRuleSet, updateRuleSet } from "../lib/api/methods/rules";
import { Button } from "../components/ui/button";
import { SimpleModal } from "../components/ui/simple-modal";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

export function RuleManagement() {
  const { loading, data, error, send: refresh } = useRequest(getRuleSets, {
    initialData: [],
  });

  const { send: create, loading: creating } = useRequest(createRuleSet, { immediate: false });
  const { send: update, loading: updating } = useRequest(updateRuleSet, { immediate: false });
  
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    templateId: "",
    rawContent: ""
  });

  const handleEdit = (rule: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(rule.id);
    setFormData({
      name: rule.name || "",
      description: rule.description || "",
      templateId: rule.templateId || "",
      rawContent: rule.rawContent || ""
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setFormData({ name: "", description: "", templateId: "", rawContent: "" });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.rawContent) {
      alert("请填写必要字段 (名称, 规则内容)");
      return;
    }
    try {
      const payload: any = { ...formData };
      if (!payload.templateId) delete payload.templateId;
      if (!payload.description) delete payload.description;

      if (editingId) {
        await update(editingId, payload);
      } else {
        await create(payload);
      }
      
      handleClose();
      refresh();
    } catch (e: any) {
      alert((editingId ? "更新" : "创建") + "失败: " + (e.message || "未知错误"));
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in duration-500 delay-100">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">规则管理</h1>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={() => refresh()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新建规则集
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading && data.length === 0 ? (
           Array.from({ length: 3 }).map((_, i) => (
             <div key={i} className="h-40 rounded-xl border bg-card p-6 shadow-sm animate-pulse space-y-4">
               <div className="h-12 w-12 rounded-lg bg-muted"></div>
               <div className="h-4 w-3/4 rounded bg-muted"></div>
               <div className="h-4 w-1/2 rounded bg-muted"></div>
             </div>
           ))
        ) : error ? (
           <div className="col-span-full py-10 text-center text-red-500 bg-red-50/50 rounded-lg border border-red-100">
              <p>加载规则集失败: {error.message}</p>
              <Button variant="link" onClick={() => refresh()}>重试</Button>
           </div>
        ) : data.length === 0 ? (
            <div className="col-span-full py-20 text-center text-muted-foreground border border-dashed rounded-xl">
               <Workflow className="h-12 w-12 mx-auto mb-4 opacity-20" />
               <p>暂无规则集，开始配置您的第一个规则</p>
            </div>
        ) : (
          data.map((rule: any, index: number) => (
            <div key={rule.id || index} className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <FileJson className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-1 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={(e) => handleEdit(rule, e)}
                      title="编辑规则集"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-red-500"
                      disabled
                      title="待后端支持"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg tracking-tight">{rule.name || '未命名规则集'}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {rule.description || '无描述信息'}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-4 text-xs text-muted-foreground font-mono">
                   <span>ID: {rule.id ? rule.id.substring(0,6) : 'N/A'}</span>
                   <span>•</span>
                   <span>{rule.updatedAt ? new Date(rule.updatedAt).toLocaleDateString() : '刚刚'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <SimpleModal
        isOpen={open}
        onClose={handleClose}
        title={editingId ? "编辑规则集" : "新建规则集"}
        description={editingId ? "修改现有的规则配置" : "创建一个新的规则集合"}
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>取消</Button>
            <Button onClick={handleSubmit} disabled={creating || updating}>
              {creating || updating ? "提交中..." : "提交"}
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
              placeholder="规则集名称" 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="desc">描述 (可选)</Label>
            <Input 
              id="desc" 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              placeholder="简要描述" 
            />
          </div>
          <div className="grid gap-2">
             <Label htmlFor="tplId">模板 ID (可选)</Label>
             <Input 
              id="tplId"
              value={formData.templateId}
              onChange={(e) => setFormData({...formData, templateId: e.target.value})}
              placeholder="基础模板 ID"
             />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">规则内容 *</Label>
            <Textarea 
              id="content"
              value={formData.rawContent}
              onChange={(e) => setFormData({...formData, rawContent: e.target.value})}
              placeholder="规则配置内容"
              className="font-mono text-xs"
              rows={8}
            />
          </div>
        </div>
      </SimpleModal>
    </div>
  );
}
