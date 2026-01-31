import { useState, useMemo } from "react"
import {
  Download,
  RefreshCw,
  Play,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Search,
  AlertCircle,
} from "lucide-react"
import { useRequest } from "alova/client"
import {
  Checkbox,
  Chip,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  Tooltip,
} from "@heroui/react"
import {
  getOutputs,
  renderOutput,
  createOutput,
  updateOutput,
  deleteOutput,
} from "../lib/api/methods/outputs"
import { getRuleSets } from "../lib/api/methods/rules"
import { getNodes } from "../lib/api/methods/nodes"
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

export function OutputManagement() {
  const { toast } = useToast()
  const { confirm } = useConfirm()
  
  const {
    loading,
    data,
    error,
    send: refresh,
  } = useRequest(getOutputs, {
    initialData: [],
  })

  const { data: ruleSets } = useRequest(getRuleSets, { initialData: [] })
  const { data: nodes } = useRequest(getNodes, { initialData: [] })

  const { send: generate, loading: generating } = useRequest(renderOutput, {
    immediate: false,
  })
  const { send: create, loading: creating } = useRequest(createOutput, {
    immediate: false,
  })
  const { send: update, loading: updating } = useRequest(updateOutput, {
    immediate: false,
  })
  const { send: remove, loading: removing } = useRequest(deleteOutput, {
    immediate: false,
  })

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    format: "mihomo",
    ruleSetId: "",
    nodeIds: "[]",
    options: "{}",
  })
  // const [ruleSetSearch, setRuleSetSearch] = useState("") // handled by Autocomplete
  const [nodeSearch, setNodeSearch] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showSelectedOnly, setShowSelectedOnly] = useState(false)

  const outputList = Array.isArray(data) ? data : data?.data || []
  const ruleSetList = Array.isArray(ruleSets) ? ruleSets : ruleSets?.data || []
  const nodeList = Array.isArray(nodes) ? nodes : nodes?.data || []

  const selectedNodeIds: string[] = useMemo(() => {
    try {
      return JSON.parse(formData.nodeIds) || []
    } catch {
      return []
    }
  }, [formData.nodeIds])

  const toggleNode = (id: string) => {
    const current = selectedNodeIds
    const next = current.includes(id)
      ? current.filter((n: string) => n !== id)
      : [...current, id]
    setFormData({ ...formData, nodeIds: JSON.stringify(next) })
  }

  const handleSelectAllNodes = () => {
    if (nodeList.length === 0) return
    const nodesToSelect = nodeList.filter(
      (node: any) =>
        (node.name || "").toLowerCase().includes(nodeSearch.toLowerCase()) ||
        (node.type || "").toLowerCase().includes(nodeSearch.toLowerCase()) ||
        (node.id || "").toLowerCase().includes(nodeSearch.toLowerCase()),
    )
    const newIds = new Set(selectedNodeIds)
    nodesToSelect.forEach((n: any) => newIds.add(n.id))
    setFormData({ ...formData, nodeIds: JSON.stringify(Array.from(newIds)) })
  }

  const handleClearNodeSelection = () => {
    setFormData({ ...formData, nodeIds: "[]" })
  }

  const handleGenerate = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
      await generate(id)
      refresh()
    } catch (e) {
      console.error(e)
    }
  }

  const handleEdit = (output: any, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setEditingId(output.id)
    setFormData({
      name: output.name || "",
      format: output.format || "mihomo",
      ruleSetId: output.ruleSetId || "",
      nodeIds: output.nodeIds || "[]",
      options: output.options || "{}",
    })
    setOpen(true)
  }

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    
    const confirmed = await confirm({
      title: "确认删除",
      description: "此操作无法撤销，确定要删除该输出配置吗？",
      isDestructive: true,
    })
    if (!confirmed) return
    
    try {
      await remove(id)
      handleRefresh()
      toast({ variant: "success", message: "输出配置已删除" })
    } catch (err: any) {
      toast({ variant: "error", message: "删除失败: " + (err.message || "未知错误") })
    }
  }

  const handleClose = () => {
    setOpen(false)
    setEditingId(null)
    setFormData({
      name: "",
      format: "mihomo",
      ruleSetId: "",
      nodeIds: "[]",
      options: "{}",
    })
    // setRuleSetSearch("")
    setNodeSearch("")
    setShowSelectedOnly(false)
  }

  const handleSubmit = async () => {
    if (!formData.name) {
      toast({ variant: "error", message: "请填写输出名称" })
      return
    }
    try {
      const payload: any = { ...formData }
      if (!payload.ruleSetId) delete payload.ruleSetId

      try {
        JSON.parse(formData.nodeIds)
        JSON.parse(formData.options)
      } catch (e) {
        toast({ variant: "error", message: "节点列表或选项必须是有效的 JSON 格式" })
        return
      }

      if (editingId) {
        await update(editingId, payload)
        toast({ variant: "success", message: "输出配置已更新" })
      } else {
        await create(payload)
        toast({ variant: "success", message: "输出配置已创建" })
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

  const filteredData = outputList.filter(
    (output: any) =>
      (output.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (output.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
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
    const allSelected = filteredData.every((output: any) =>
      selectedIds.has(output.id),
    )
    const newSelected = new Set(selectedIds)

    if (allSelected) {
      filteredData.forEach((output: any) => newSelected.delete(output.id))
    } else {
      filteredData.forEach((output: any) => newSelected.add(output.id))
    }
    setSelectedIds(newSelected)
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    
    const confirmed = await confirm({
      title: "批量删除确认",
      description: `确定要删除选中的 ${selectedIds.size} 个输出配置吗？此操作无法撤销。`,
      isDestructive: true,
    })
    if (!confirmed) return

    setIsBulkDeleting(true)
    try {
      const results = await Promise.allSettled(
        Array.from(selectedIds).map((id) => deleteOutput(id).send()),
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

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="输出管理"
        search={{
          value: searchTerm,
          onChange: setSearchTerm,
          placeholder: "搜索输出配置...",
        }}
        selectAll={{
          checked:
            filteredData.length > 0 &&
            filteredData.every((output: any) => selectedIds.has(output.id)),
          onChange: toggleSelectAll,
          label: "全选",
        }}
        actions={
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
              新建输出
            </Button>
          </>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 reveal reveal-delay-100">
        {loading && outputList.length === 0 ? (
          <div className="col-span-full">
            <Skeleton variant="grid" count={6} />
          </div>
        ) : error ? (
          <div className="col-span-full">
            <EmptyState
              icon={AlertCircle}
              title="无法获取输出列表"
              description={error.message}
              className="text-red-500 bg-red-50/50"
              action={
                <Button variant="link" onClick={() => refresh()}>
                  重试
                </Button>
              }
            />
          </div>
        ) : outputList.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={Download}
              title="暂无输出配置"
              description="创建一个新的输出配置来生成订阅文件"
            />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={Search}
              title="未找到匹配的输出配置"
              description="尝试调整搜索关键词"
              action={
                <Button variant="link" onClick={() => setSearchTerm("")}>
                  清除搜索
                </Button>
              }
            />
          </div>
        ) : (
          filteredData.map((output: any, index: number) => (
            <GridCard
              key={output.id || index}
              icon={Download}
              iconClassName="bg-blue-50 text-blue-600"
              title={output.name || "未命名输出"}
              description={output.description || "无描述"}
              isSelected={selectedIds.has(output.id)}
              onSelect={() => toggleSelect(output.id)}
              isPressable
              onPress={() => toggleSelect(output.id)}
              footer={
                <>
                  <Clock className="h-3 w-3 mr-1" />
                  <span>
                    {output.lastGenerated
                      ? new Date(output.lastGenerated).toLocaleDateString()
                      : "从未"}
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
                      onClick={(e) => handleEdit(output, e)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="删除" color="danger">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500"
                      onClick={(e) => handleDelete(output.id, e)}
                      disabled={removing}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  <div className="w-px h-4 bg-border mx-1 self-center"></div>
                  <Tooltip content="生成配置">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => handleGenerate(output.id, e)}
                      disabled={generating}
                      className="h-8"
                    >
                      <Play className="h-3 w-3 mr-2" />
                      生成
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
        title={editingId ? "编辑输出配置" : "新建输出配置"}
        description={
          editingId ? "修改现有输出文件配置" : "创建一个新的订阅输出文件配置"
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
              placeholder="输出配置名称"
            />
          </div>
          <div className="grid gap-2">
            <Select
              label="格式 *"
              labelPlacement="outside"
              selectedKeys={new Set([formData.format])}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string | undefined
                setFormData({ ...formData, format: value || "mihomo" })
              }}
            >
              <SelectItem key="mihomo">Mihomo</SelectItem>
              <SelectItem key="sing-box">Sing-box</SelectItem>
              <SelectItem key="clash">Clash</SelectItem>
            </Select>
          </div>
          <div className="grid gap-2">
            <Autocomplete
              label="规则集 (可选)"
              labelPlacement="outside"
              placeholder="搜索规则集..."
              defaultItems={ruleSetList}
              selectedKey={formData.ruleSetId || undefined}
              onSelectionChange={(key) =>
                setFormData({ ...formData, ruleSetId: (key as string) || "" })
              }
            >
              {(item: any) => (
                <AutocompleteItem key={item.id}>{item.name}</AutocompleteItem>
              )}
            </Autocomplete>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">
                包含节点
                <span className="text-xs font-normal text-muted-foreground ml-2">
                  ({selectedNodeIds.length} 已选)
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={handleSelectAllNodes}
                >
                  全选
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={handleClearNodeSelection}
                >
                  清空
                </Button>
                <div className="w-px h-3 bg-border mx-1"></div>
                <Button
                  type="button"
                  size="sm"
                  variant={showSelectedOnly ? "secondary" : "ghost"}
                  className={`h-6 px-2 text-xs ${
                    showSelectedOnly
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : ""
                  }`}
                  onClick={() => setShowSelectedOnly(!showSelectedOnly)}
                >
                  {showSelectedOnly ? "显示全部" : "仅看已选"}
                </Button>
              </div>
            </div>
            <Input
              placeholder="搜索节点 (名称/类型/ID)..."
              value={nodeSearch}
              onChange={(e) => setNodeSearch(e.target.value)}
              className="mb-1 h-8 text-xs"
            />
            <div className="h-48 overflow-y-auto rounded-md border border-input bg-background p-2 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted">
              {nodeList.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2 text-center">
                  无可用节点
                </div>
              ) : (
                (() => {
                  const filtered = nodeList.filter((node: any) => {
                    const match =
                      (node.name || "")
                        .toLowerCase()
                        .includes(nodeSearch.toLowerCase()) ||
                      (node.type || "").toLowerCase().includes(nodeSearch.toLowerCase()) ||
                      (node.id || "").toLowerCase().includes(nodeSearch.toLowerCase())

                    if (showSelectedOnly) {
                      return match && selectedNodeIds.includes(node.id)
                    }
                    return match
                  })
                  if (filtered.length === 0) {
                    return (
                      <div className="text-sm text-muted-foreground p-2 text-center">
                        未找到匹配节点
                      </div>
                    )
                  }
                  return filtered.map((node: any) => (
                    <div
                      key={node.id}
                      className="flex items-center space-x-2 py-1.5 px-1 hover:bg-muted/50 rounded transition-colors"
                    >
                      <Checkbox
                        id={`node-${node.id}`}
                        isSelected={selectedNodeIds.includes(node.id)}
                        onValueChange={() => toggleNode(node.id)}
                        size="sm"
                      >
                        <div className="flex items-center justify-between w-full min-w-[200px]">
                          <span className="text-sm font-medium">{node.name || node.id}</span>
                          <Chip size="sm" variant="flat" className="ml-2 h-5 text-[10px]">{node.type}</Chip>
                        </div>
                      </Checkbox>
                    </div>
                  ))
                })()
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Textarea
              id="options"
              label="高级选项 (JSON 对象)"
              labelPlacement="outside"
              value={formData.options}
              onChange={(e) =>
                setFormData({ ...formData, options: e.target.value })
              }
              placeholder='{"udpn": true}'
              className="font-mono text-xs"
              minRows={3}
            />
          </div>
        </div>
      </SimpleModal>
    </div>
  )
}
