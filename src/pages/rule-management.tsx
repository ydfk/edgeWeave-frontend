import { useState, useMemo } from "react"
import {
  Workflow,
  RefreshCw,
  Plus,
  FileJson,
  Pencil,
  Trash2,
} from "lucide-react"
import { useRequest } from "alova/client"
import { Autocomplete, AutocompleteItem, Tooltip } from "@heroui/react"
import {
  getRuleSets,
  createRuleSet,
  updateRuleSet,
  deleteRuleSet,
  getRuleTemplates,
} from "../lib/api/methods/rules"
import { Button } from "../components/ui/button"
import { SimpleModal } from "../components/ui/simple-modal"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { PageHeader } from "../components/ui/page-header"
import { EmptyState } from "../components/ui/empty-state"
import { Skeleton } from "../components/ui/skeleton"
import { GridCard } from "../components/ui/grid-card"
import { useToast } from "../components/ui/toast-provider"
import { useConfirm } from "../components/ui/confirm-dialog"

export function RuleManagement() {
  const { toast } = useToast()
  const { confirm } = useConfirm()
  
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
  const [searchTerm, setSearchTerm] = useState("")

  const ruleSetList = Array.isArray(data) ? data : data?.data || []
  const templateList = Array.isArray(templates) ? templates : templates?.data || []

  const filteredData = useMemo(() => {
    return ruleSetList.filter(
      (rule: any) =>
        (rule.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rule.description || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (rule.id || "").toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [ruleSetList, searchTerm])

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
    
    const confirmed = await confirm({
      title: "批量删除确认",
      description: `确定要删除选中的 ${selectedIds.size} 个规则集吗？此操作无法撤销。`,
      isDestructive: true,
    })
    if (!confirmed) return

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
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    const confirmed = await confirm({
      title: "确认删除",
      description: "此操作无法撤销，确定要删除该规则集吗？",
      isDestructive: true,
    })
    if (!confirmed) return
    
    try {
      await remove(id)
      handleRefresh()
      toast({ variant: "success", message: "规则集已删除" })
    } catch (err: any) {
      toast({ variant: "error", message: "删除失败: " + (err.message || "未知错误") })
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.rawContent) {
      toast({ variant: "error", message: "请填写必要字段 (名称, 规则内容)" })
      return
    }
    try {
      const payload: any = { ...formData }
      if (!payload.templateId) delete payload.templateId
      if (!payload.description) delete payload.description

      if (editingId) {
        await update(editingId, payload)
        toast({ variant: "success", message: "规则集已更新" })
      } else {
        await create(payload)
        toast({ variant: "success", message: "规则集已创建" })
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
        新建规则集
      </Button>
    </>
  )

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="规则管理"
        search={{
          value: searchTerm,
          onChange: setSearchTerm,
          placeholder: "搜索规则集...",
        }}
        selectAll={
          filteredData.length > 0
            ? {
                checked:
                  filteredData.length > 0 &&
                  filteredData.every((rule: any) => selectedIds.has(rule.id)),
                onChange: toggleSelectAll,
                label: "全选",
              }
            : undefined
        }
        actions={renderActions()}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 reveal reveal-delay-100">
        {loading && ruleSetList.length === 0 ? (
          <Skeleton variant="grid" count={3} />
        ) : error ? (
          <div className="col-span-full py-10 text-center text-red-500 bg-red-50/50 rounded-lg border border-red-100">
            <p>加载规则集失败: {error.message}</p>
            <Button variant="link" onClick={() => refresh()}>
              重试
            </Button>
          </div>
        ) : ruleSetList.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={Workflow}
              title="暂无规则集"
              description="开始配置您的第一个规则"
            />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={Workflow}
              title="未找到匹配的规则集"
              action={
                <Button variant="link" onClick={() => setSearchTerm("")}>
                  清除搜索
                </Button>
              }
            />
          </div>
        ) : (
          filteredData.map((rule: any, index: number) => (
            <GridCard
              key={rule.id || index}
              icon={FileJson}
              title={rule.name || "未命名规则集"}
              description={rule.description || "无描述信息"}
              isSelected={selectedIds.has(rule.id)}
              onSelect={() => toggleSelect(rule.id)}
              isPressable
              onPress={() => toggleSelect(rule.id)}
              footer={
                <>
                  <span>ID: {rule.id ? rule.id.substring(0, 6) : "N/A"}</span>
                  <span>•</span>
                  <span>
                    {rule.updatedAt
                      ? new Date(rule.updatedAt).toLocaleDateString()
                      : "刚刚"}
                  </span>
                </>
              }
              actions={
                <>
                  <Tooltip content="编辑">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={(e) => handleEdit(rule, e)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="删除" color="danger">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500"
                      onClick={(e) => handleDelete(rule.id, e)}
                      disabled={removing}
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
        title={editingId ? "编辑规则集" : "新建规则集"}
        description={
          editingId ? "修改现有的规则配置" : "创建一个新的规则集合"
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
              label="名称 *"
              labelPlacement="outside"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="规则集名称"
            />
          </div>
          <div className="grid gap-2">
            <Input
              id="desc"
              label="描述 (可选)"
              labelPlacement="outside"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="简要描述"
            />
          </div>
          <div className="grid gap-2">
            <Autocomplete
              label="模板 (可选)"
              labelPlacement="outside"
              placeholder="搜索模板..."
              defaultItems={templateList}
              selectedKey={formData.templateId || undefined}
              onSelectionChange={(key) =>
                setFormData({ ...formData, templateId: (key as string) || "" })
              }
            >
              {(item: any) => (
                <AutocompleteItem key={item.id}>{item.name}</AutocompleteItem>
              )}
            </Autocomplete>
          </div>
          <div className="grid gap-2">
            <Textarea
              id="content"
              label="规则内容 *"
              labelPlacement="outside"
              value={formData.rawContent}
              onChange={(e) =>
                setFormData({ ...formData, rawContent: e.target.value })
              }
              placeholder="规则配置内容"
              className="font-mono text-xs"
              minRows={8}
            />
          </div>
        </div>
      </SimpleModal>
    </div>
  )
}
