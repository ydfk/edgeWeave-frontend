import { useState } from "react"
import {
  Rss,
  RefreshCw,
  ExternalLink,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Search,
} from "lucide-react"
import { useRequest } from "alova/client"
import {
  getSubscriptionSources,
  syncSubscriptionSource,
  createSubscriptionSource,
  updateSubscriptionSource,
  deleteSubscriptionSource,
} from "../lib/api/methods/subscriptions"
import { Button } from "../components/ui/button"
import { SimpleModal } from "../components/ui/simple-modal"
import { Label } from "../components/ui/label"
import { Input } from "../components/ui/input"

export function SubscriptionManagement() {
  const {
    loading,
    data,
    error,
    send: refresh,
  } = useRequest(getSubscriptionSources, {
    initialData: [],
  })

  const { send: sync, loading: syncing } = useRequest(syncSubscriptionSource, {
    immediate: false,
  })
  const { send: create, loading: creating } = useRequest(
    createSubscriptionSource,
    { immediate: false },
  )
  const { send: update, loading: updating } = useRequest(
    updateSubscriptionSource,
    { immediate: false },
  )
  const { send: remove, loading: removing } = useRequest(
    deleteSubscriptionSource,
    { immediate: false },
  )

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    updateInterval: "60",
  })

  const handleSync = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await sync(id)
      refresh()
    } catch (e) {
      console.error(e)
    }
  }

  const handleEdit = (sub: any, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setEditingId(sub.id)
    setFormData({
      name: sub.name || "",
      url: sub.url || "",
      updateInterval: sub.updateInterval
        ? String(Math.floor(sub.updateInterval / 60))
        : "",
    })
    setOpen(true)
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm("确定要删除该订阅源吗？")) return
    try {
      await remove(id)
      handleRefresh()
    } catch (err: any) {
      alert("删除失败: " + (err.message || "未知错误"))
    }
  }

  const handleClose = () => {
    setOpen(false)
    setEditingId(null)
    setFormData({ name: "", url: "", updateInterval: "60" })
  }

  const handleSubmit = async () => {
    if (!formData.url) {
      alert("请填写订阅 URL")
      return
    }
    try {
      const payload: any = { ...formData }
      if (payload.updateInterval)
        payload.updateInterval = parseInt(payload.updateInterval, 10) * 60
      else delete payload.updateInterval

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

  const filteredData = data.filter(
    (sub: any) =>
      (sub.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.url || "").toLowerCase().includes(searchTerm.toLowerCase()),
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
    const allSelected = filteredData.every((sub: any) =>
      selectedIds.has(sub.id),
    )
    const newSelected = new Set(selectedIds)

    if (allSelected) {
      filteredData.forEach((sub: any) => newSelected.delete(sub.id))
    } else {
      filteredData.forEach((sub: any) => newSelected.add(sub.id))
    }
    setSelectedIds(newSelected)
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`确定要删除选中的 ${selectedIds.size} 个订阅源吗？`)) return

    setIsBulkDeleting(true)
    try {
      const results = await Promise.allSettled(
        Array.from(selectedIds).map((id) =>
          deleteSubscriptionSource(id).send(),
        ),
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

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in duration-500 delay-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            订阅管理
          </h1>
          {filteredData.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                id="select-all-subs"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={
                  filteredData.length > 0 &&
                  filteredData.every((sub: any) => selectedIds.has(sub.id))
                }
                onChange={toggleSelectAll}
              />
              <label
                htmlFor="select-all-subs"
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
              placeholder="搜索订阅..."
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
            添加订阅
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm divide-y divide-border">
        {loading && data.length === 0 ? (
          <div className="p-8 text-center space-y-4">
            <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground animate-pulse">
              正在获取订阅源...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 bg-red-50/50">
            <p>无法获取订阅列表: {error.message}</p>
            <Button variant="link" onClick={() => refresh()}>
              重试
            </Button>
          </div>
        ) : data.length === 0 ? (
          <div className="p-20 text-center text-muted-foreground">
            <Rss className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>暂无订阅源</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-20 text-center text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>未找到匹配的订阅源</p>
            <Button variant="link" onClick={() => setSearchTerm("")}>
              清除搜索
            </Button>
          </div>
        ) : (
          filteredData.map((sub: any, index: number) => (
            <div
              key={sub.id || index}
              className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors group cursor-pointer ${
                selectedIds.has(sub.id) ? "bg-muted/50" : ""
              }`}
              onClick={() => toggleSelect(sub.id)}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex items-center self-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={selectedIds.has(sub.id)}
                    onChange={() => toggleSelect(sub.id)}
                  />
                </div>
                <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Rss className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">
                      {sub.name || "未命名订阅"}
                    </h3>
                    {sub.status && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-medium uppercase tracking-wider">
                        {sub.status}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1 break-all font-mono">
                    {sub.url || "https://example.com/subscription/feed"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 pl-14 md:pl-0">
                <div className="flex flex-col items-end text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    更新于{" "}
                    {sub.updatedAt
                      ? new Date(sub.updatedAt).toLocaleDateString()
                      : "从未"}
                  </span>
                  <span>{sub.count || 0} 个节点</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleSync(e, sub.id)}
                    disabled={syncing}
                  >
                    <RefreshCw
                      className={`h-3 w-3 mr-2 ${
                        syncing ? "animate-spin" : ""
                      }`}
                    />
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
                    onClick={(e) => handleEdit(sub, e)}
                    title="编辑订阅源"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    onClick={(e) => handleDelete(e, sub.id)}
                    disabled={removing}
                    title="删除订阅源"
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
        onClose={handleClose}
        title={editingId ? "编辑订阅源" : "添加订阅源"}
        description={
          editingId ? "修改现有订阅信息" : "添加一个新的订阅链接以获取节点"
        }
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
            <Label htmlFor="name">名称 (可选)</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="订阅源名称"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="url">订阅 URL *</Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              placeholder="https://..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="interval">更新间隔 (分钟)</Label>
            <Input
              id="interval"
              type="number"
              value={formData.updateInterval}
              onChange={(e) =>
                setFormData({ ...formData, updateInterval: e.target.value })
              }
              placeholder="60"
            />
          </div>
        </div>
      </SimpleModal>
    </div>
  )
}
