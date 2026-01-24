import { useState } from "react"
import {
  Workflow,
  RefreshCw,
  Plus,
  FileJson,
  Pencil,
  Trash2,
  Search,
} from "lucide-react"
import { useRequest } from "alova/client"
import {
  getRuleSets,
  createRuleSet,
  updateRuleSet,
  deleteRuleSet,
  getRuleTemplates,
} from "../lib/api/methods/rules"
import { Button } from "../components/ui/button"
import { SimpleModal } from "../components/ui/simple-modal"
import { Label } from "../components/ui/label"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"

export function RuleManagement() {
  const {
    loading,
    data,
    error,
    send: refresh,
  } = useRequest(getRuleSets, {
    initialData: [],
  })

  const { data: templates } = useRequest(getRuleTemplates, { initialData: [] })

  const { send: create, loading: creating } = useRequest(createRuleSet, {
    immediate: false,
  })
  const { send: update, loading: updating } = useRequest(updateRuleSet, {
    immediate: false,
  })
  const { send: remove, loading: removing } = useRequest(deleteRuleSet, {
    immediate: false,
  })

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    templateId: "",
    rawContent: "",
  })
  const [tplSearch, setTplSearch] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredData = data.filter(
    (rule: any) =>
      (rule.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rule.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (rule.id || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleRefresh = () => {
    setSelectedIds(new Set())
    refresh()
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (filteredData.length === 0) return
    const allSelected = filteredData.every((rule: any) =>
      selectedIds.has(rule.id),
    )
    const newSelected = new Set(selectedIds)

    if (allSelected) {
      filteredData.forEach((rule: any) => newSelected.delete(rule.id))
    } else {
      filteredData.forEach((rule: any) => newSelected.add(rule.id))
    }
    setSelectedIds(newSelected)
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`确定要删除选中的 ${selectedIds.size} 个规则集吗？`)) return

    setIsBulkDeleting(true)
    try {
      const results = await Promise.allSettled(
        Array.from(selectedIds).map((id) => deleteRuleSet(id).send()),
      )
      const success = results.filter(
        (item) => item.status === "fulfilled",
      ).length
      const failed = results.length - success
      handleRefresh()
      alert(`批量删除完成：成功 ${success}，失败 ${failed}`)
    } catch (e: any) {
      alert("批量删除失败: " + (e.message || "部分删除可能失败"))
      handleRefresh()
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const handleEdit = (rule: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(rule.id)
    setFormData({
      name: rule.name || "",
      description: rule.description || "",
      templateId: rule.templateId || "",
      rawContent: rule.rawContent || "",
    })
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditingId(null)
    setFormData({ name: "", description: "", templateId: "", rawContent: "" })
    setTplSearch("")
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("确定要删除该规则集吗？")) return
    try {
      await remove(id)
      handleRefresh()
    } catch (err: any) {
      alert("删除失败: " + (err.message || "未知错误"))
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.rawContent) {
      alert("请填写必要字段 (名称, 规则内容)")
      return
    }
    try {
      const payload: any = { ...formData }
      if (!payload.templateId) delete payload.templateId
      if (!payload.description) delete payload.description

      if (editingId) {
        await update(editingId, payload)
      } else {
        await create(payload)
      }

      handleClose()
      handleRefresh()
    } catch (e: any) {
      alert(
        (editingId ? "更新" : "创建") + "失败: " + (e.message || "未知错误"),
      )
    }
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 delay-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            规则管理
          </h1>
          {filteredData.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                id="select-all-rules"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={
                  filteredData.length > 0 &&
                  filteredData.every((rule: any) => selectedIds.has(rule.id))
                }
                onChange={toggleSelectAll}
              />
              <label
                htmlFor="select-all-rules"
                className="text-sm text-muted-foreground cursor-pointer select-none"
              >
                全选
              </label>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索规则集..."
              className="pl-9 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            刷新
          </Button>
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              批量删除 ({selectedIds.size})
            </Button>
          )}
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新建规则集
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading && data.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-xl border bg-card p-6 shadow-sm animate-pulse space-y-4"
            >
              <div className="h-12 w-12 rounded-lg bg-muted"></div>
              <div className="h-4 w-3/4 rounded bg-muted"></div>
              <div className="h-4 w-1/2 rounded bg-muted"></div>
            </div>
          ))
        ) : error ? (
          <div className="col-span-full py-10 text-center text-red-500 bg-red-50/50 rounded-lg border border-red-100">
            <p>加载规则集失败: {error.message}</p>
            <Button variant="link" onClick={() => refresh()}>
              重试
            </Button>
          </div>
        ) : data.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground border border-dashed rounded-xl">
            <Workflow className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>暂无规则集，开始配置您的第一个规则</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground border border-dashed rounded-xl">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>未找到匹配的规则集</p>
            <Button variant="link" onClick={() => setSearchTerm("")}>
              清除搜索
            </Button>
          </div>
        ) : (
          filteredData.map((rule: any, index: number) => (
            <div
              key={rule.id || index}
              className={`floating-card group relative overflow-hidden cursor-pointer hover:border-primary/50 ${
                selectedIds.has(rule.id)
                  ? "ring-2 ring-primary border-primary"
                  : ""
              }`}
              onClick={() => {
                // Clicking card body can toggle selection or open edit? Usually cards have explicit actions.
                // Let's make card click toggle selection for better UX if not clicking buttons
                toggleSelect(rule.id)
              }}
            >
              <div className="absolute top-3 left-3 z-10">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary shadow-sm"
                  checked={selectedIds.has(rule.id)}
                  onChange={(e) => {
                    e.stopPropagation()
                    toggleSelect(rule.id)
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="p-6 space-y-4 pt-8">
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
                      onClick={(e) => handleDelete(rule.id, e)}
                      disabled={removing}
                      title="删除规则集"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg tracking-tight">
                    {rule.name || "未命名规则集"}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {rule.description || "无描述信息"}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-4 text-xs text-muted-foreground font-mono">
                  <span>ID: {rule.id ? rule.id.substring(0, 6) : "N/A"}</span>
                  <span>•</span>
                  <span>
                    {rule.updatedAt
                      ? new Date(rule.updatedAt).toLocaleDateString()
                      : "刚刚"}
                  </span>
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
            <Button variant="outline" onClick={handleClose}>
              取消
            </Button>
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
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="规则集名称"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="desc">描述 (可选)</Label>
            <Input
              id="desc"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="简要描述"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tplId">模板 (可选)</Label>
            <Input
              placeholder="搜索模板..."
              value={tplSearch}
              onChange={(e) => setTplSearch(e.target.value)}
              className="mb-1 h-8 text-xs"
            />
            <select
              id="tplId"
              value={formData.templateId}
              onChange={(e) =>
                setFormData({ ...formData, templateId: e.target.value })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">不使用模板</option>
              {templates
                ?.filter(
                  (tpl: any) =>
                    (tpl.name || "")
                      .toLowerCase()
                      .includes(tplSearch.toLowerCase()) ||
                    (tpl.id || "")
                      .toLowerCase()
                      .includes(tplSearch.toLowerCase()),
                )
                .map((tpl: any) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name || tpl.id}
                  </option>
                ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">规则内容 *</Label>
            <Textarea
              id="content"
              value={formData.rawContent}
              onChange={(e) =>
                setFormData({ ...formData, rawContent: e.target.value })
              }
              placeholder="规则配置内容"
              className="font-mono text-xs"
              rows={8}
            />
          </div>
        </div>
      </SimpleModal>
    </div>
  )
}
