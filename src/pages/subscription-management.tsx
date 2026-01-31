import { useState } from "react"
import {
  Rss,
  RefreshCw,
  ExternalLink,
  Calendar,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react"
import { useRequest } from "alova/client"
import { Tooltip } from "@heroui/react"
import {
  getSubscriptionSources,
  syncSubscriptionSource,
  createSubscriptionSource,
  updateSubscriptionSource,
  deleteSubscriptionSource,
} from "../lib/api/methods/subscriptions"
import { Button } from "../components/ui/button"
import { SimpleModal } from "../components/ui/simple-modal"
import { Input } from "../components/ui/input"
import { PageHeader } from "../components/ui/page-header"
import { EmptyState } from "../components/ui/empty-state"
import { Skeleton } from "../components/ui/skeleton"
import { ListCard } from "../components/ui/list-card"
import { useToast } from "../components/ui/toast-provider"
import { useConfirm } from "../components/ui/confirm-dialog"

export function SubscriptionManagement() {
  const { toast } = useToast()
  const { confirm } = useConfirm()
  
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

  const sourceList = Array.isArray(data) ? data : data?.data || []
  const filteredData = sourceList.filter(
    (sub: any) =>
      (sub.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.url || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
    const confirmed = await confirm({
      title: "确认删除",
      description: "此操作无法撤销，确定要删除该订阅源吗？",
      isDestructive: true,
    })
    if (!confirmed) return
    try {
      await remove(id)
      handleRefresh()
      toast({ variant: "success", message: "订阅源已删除" })
    } catch (err: any) {
      toast({ variant: "error", message: "删除失败: " + (err.message || "未知错误") })
    }
  }

  const handleClose = () => {
    setOpen(false)
    setEditingId(null)
    setFormData({ name: "", url: "", updateInterval: "60" })
  }

  const handleSubmit = async () => {
    if (!formData.url) {
      toast({ variant: "error", message: "请填写订阅 URL" })
      return
    }
    try {
      const payload: any = { ...formData }
      if (payload.updateInterval)
        payload.updateInterval = parseInt(payload.updateInterval, 10) * 60
      else delete payload.updateInterval

      if (editingId) {
        await update(editingId, payload)
        toast({ variant: "success", message: "订阅源已更新" })
      } else {
        await create(payload)
        toast({ variant: "success", message: "订阅源已创建" })
      }
      handleClose()
      handleRefresh()
    } catch (e: any) {
      toast({
        variant: "error",
        message: (editingId ? "更新" : "创建") + "失败: " + (e.message || "未知错误"),
      })
    }
  }

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
    
    const confirmed = await confirm({
      title: "批量删除确认",
      description: `确定要删除选中的 ${selectedIds.size} 个订阅源吗？此操作无法撤销。`,
      isDestructive: true,
    })
    if (!confirmed) return

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
      toast({
        variant: success > 0 && failed === 0 ? "success" : "warning",
        message: `批量删除完成：成功 ${success}，失败 ${failed}`,
      })
    } catch (e: any) {
      toast({
        variant: "error",
        message: "批量删除失败: " + (e.message || "部分删除可能失败"),
      })
      handleRefresh()
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const renderActions = () => (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={loading}
        className="hover:bg-secondary/80"
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
          className="bg-red-500 hover:bg-red-600 text-white shadow-sm"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          批量删除 ({selectedIds.size})
        </Button>
      )}
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        className="shadow-sm shadow-primary/20"
      >
        <Plus className="h-4 w-4 mr-2" />
        添加订阅
      </Button>
    </>
  )

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="订阅管理"
        search={{
          value: searchTerm,
          onChange: setSearchTerm,
          placeholder: "搜索订阅...",
        }}
        selectAll={
          filteredData.length > 0
            ? {
                checked:
                  filteredData.length > 0 &&
                  filteredData.every((sub: any) => selectedIds.has(sub.id)),
                onChange: toggleSelectAll,
                label: "全选",
              }
            : undefined
        }
        actions={renderActions()}
      />

      <div className="space-y-4 reveal reveal-delay-100">
        {loading && sourceList.length === 0 ? (
          <Skeleton variant="list" count={3} />
        ) : error ? (
          <div className="p-8 text-center text-red-500 bg-red-50/50 rounded-lg">
            <p>无法获取订阅列表: {error.message}</p>
            <Button variant="link" onClick={() => refresh()}>
              重试
            </Button>
          </div>
        ) : sourceList.length === 0 ? (
          <EmptyState
            icon={Rss}
            title="暂无订阅源"
            description="点击右上角按钮添加您的第一个订阅源"
          />
        ) : filteredData.length === 0 ? (
          <EmptyState
            icon={Rss}
            title="未找到匹配的订阅源"
            action={
              <Button variant="link" onClick={() => setSearchTerm("")}>
                清除搜索
              </Button>
            }
          />
        ) : (
          filteredData.map((sub: any, index: number) => (
            <ListCard
              key={sub.id || index}
              icon={Rss}
              iconClassName="bg-orange-100 text-orange-600"
              title={sub.name || "未命名订阅"}
              description={sub.url || "https://example.com/subscription/feed"}
              isSelected={selectedIds.has(sub.id)}
              onSelect={() => toggleSelect(sub.id)}
              isPressable
              onPress={() => toggleSelect(sub.id)}
              meta={
                <>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    更新于{" "}
                    {sub.updatedAt
                      ? new Date(sub.updatedAt).toLocaleDateString()
                      : "从未"}
                  </span>
                  <span>{sub.count || 0} 个节点</span>
                </>
              }
              actions={
                <>
                  <Tooltip content="同步">
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
                  </Tooltip>
                  <Tooltip content="打开链接">
                    <Button
                      variant="ghost"
                      size="icon"
                      as="a"
                      href={sub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  <div className="w-px h-4 bg-border mx-1" />
                  <Tooltip content="编辑">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={(e) => handleEdit(sub, e)}
                      title="编辑订阅源"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="删除" color="danger">
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
                  </Tooltip>
                </>
              }
            />
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
            <Input
              id="name"
              label="名称 (可选)"
              labelPlacement="outside"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="订阅源名称"
            />
          </div>
          <div className="grid gap-2">
            <Input
              id="url"
              label="订阅 URL *"
              labelPlacement="outside"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              placeholder="https://..."
            />
          </div>
          <div className="grid gap-2">
            <Input
              id="interval"
              label="更新间隔 (分钟)"
              labelPlacement="outside"
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
