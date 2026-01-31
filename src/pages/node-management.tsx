import { useState, useMemo } from "react"
import { RefreshCw, Plus, Pencil, Trash2, Server, Globe } from "lucide-react"
import { useRequest } from "alova/client"
import {
  Chip,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  Tabs,
  Tab,
} from "@heroui/react"
import {
  getNodes,
  createNode,
  updateNode,
  deleteNode,
  getNodeTags,
} from "../lib/api/methods/nodes"
import { getSubscriptionSources } from "../lib/api/methods/subscriptions"
import { Button } from "../components/ui/button"
import { SimpleModal } from "../components/ui/simple-modal"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { PageHeader } from "../components/ui/page-header"
import { GridCard } from "../components/ui/grid-card"
import { EmptyState } from "../components/ui/empty-state"
import { Skeleton } from "../components/ui/skeleton"
import { useToast } from "../components/ui/toast-provider"
import { useConfirm } from "../components/ui/confirm-dialog"
import { ProtocolFilter } from "../components/node/protocol-filter"
import { TagCloud } from "../components/node/tag-cloud"

export function NodeManagement() {
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const {
    loading,
    data,
    error,
    send: refresh,
  } = useRequest(getNodes, {
    initialData: [],
  })

  const { data: subSources } = useRequest(getSubscriptionSources, {
    initialData: [],
  })

  const { data: tagsData } = useRequest(getNodeTags, {
    initialData: [],
  })
  const tagsList = Array.isArray(tagsData) ? tagsData : tagsData?.data || []

  const { send: create, loading: creating } = useRequest(createNode, {
    immediate: false,
  })
  const { send: update, loading: updating } = useRequest(updateNode, {
    immediate: false,
  })
  const { send: remove } = useRequest(deleteNode, {
    immediate: false,
  })
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  // Use Set<string> for selection state
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]))
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    rawContent: "",
    subscriptionSourceId: "",
  })
  const subSourceList = Array.isArray(subSources) ? subSources : subSources?.data || []
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<string>("all")

  const nodeList = Array.isArray(data) ? data : data?.data || []

  const filteredData = useMemo(() => {
    return nodeList.filter((node: any) => {
      const matchesSearch =
        (node.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (node.type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (node.id || "").toLowerCase().includes(searchTerm.toLowerCase())

      const matchesProtocol = selectedProtocol === null || node.type === selectedProtocol

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((selectedTag) => {
          try {
            const nodeTags = node.tags ? JSON.parse(node.tags) : []
            return nodeTags.includes(selectedTag)
          } catch {
            return false
          }
        })

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "manual" && !node.subscriptionSourceId) ||
        node.subscriptionSourceId === activeTab

      return matchesSearch && matchesProtocol && matchesTags && matchesTab
    })
  }, [nodeList, searchTerm, selectedProtocol, selectedTags, activeTab])

  const handleRefresh = () => {
    setSelectedKeys(new Set([]))
    setSelectedProtocol(null)
    setSelectedTags([])
    setActiveTab("all")
    refresh()
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleBulkDelete = async () => {
    // Use Set directly, no "all" special case needed
    const keysToDelete = selectedKeys

    if (keysToDelete.size === 0) return
    
    const confirmed = await confirm({
      title: `确认删除 ${keysToDelete.size} 个节点`,
      description: "此操作无法撤销，确定要继续吗？",
      isDestructive: true,
    })
    if (!confirmed) return

    setIsBulkDeleting(true)
    try {
      const results = await Promise.allSettled(
        Array.from(keysToDelete).map((id) => deleteNode(id as string).send()),
      )
      const success = results.filter(
        (item) => item.status === "fulfilled",
      ).length
      const failed = results.length - success
      handleRefresh()
      toast({
        variant: "success",
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

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "确认删除",
      description: "此操作无法撤销，确定要删除该节点吗？",
      isDestructive: true,
    })
    if (!confirmed) return
    
    try {
      await remove(id)
      handleRefresh()
      toast({
        variant: "success",
        message: "节点已删除",
      })
    } catch (e: any) {
      toast({
        variant: "error",
        message: "删除失败: " + (e.message || "未知错误"),
      })
    }
  }

  const handleEdit = (node: any) => {
    setEditingId(node.id)
    setFormData({
      name: node.name || "",
      type: node.type || "",
      rawContent: node.rawContent || "",
      subscriptionSourceId: node.subscriptionSourceId || "",
    })
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditingId(null)
    setFormData({
      name: "",
      type: "",
      rawContent: "",
      subscriptionSourceId: "",
    })
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.type || !formData.rawContent) {
      toast({
        variant: "error",
        message: "请填写必要字段 (名称, 类型, 内容)",
      })
      return
    }
    try {
      const payload: any = { ...formData }
      if (!payload.subscriptionSourceId) delete payload.subscriptionSourceId

      if (editingId) {
        await update(editingId, payload)
        toast({
          variant: "success",
          message: "节点已更新",
        })
      } else {
        await create(payload)
        toast({
          variant: "success",
          message: "节点已创建",
        })
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

  // Selection helpers
  const isSelected = (id: string) => {
    return selectedKeys.has(id)
  }

  const toggleSelection = (id: string) => {
    setSelectedKeys((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedKeys(new Set(filteredData.map((n: any) => n.id)))
    } else {
      setSelectedKeys(new Set([]))
    }
  }

  const allSelected = useMemo(() => {
    if (filteredData.length === 0) return false
    return filteredData.every((n: any) => selectedKeys.has(n.id))
  }, [selectedKeys, filteredData])

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="节点管理"
        description="管理您的代理节点配置"
        search={{
          value: searchTerm,
          onChange: setSearchTerm,
          placeholder: "搜索节点..."
        }}
        selectAll={
          filteredData.length > 0
            ? {
                checked: allSelected,
                onChange: handleSelectAll,
                label: `全选 (${filteredData.length})`
              }
            : undefined
        }
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
            {(selectedKeys.size > 0) && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="bg-red-500 hover:bg-red-600 text-white shadow-sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                批量删除 ({selectedKeys.size})
              </Button>
            )}
            <Button size="sm" onClick={() => setOpen(true)} className="shadow-sm shadow-primary/20">
              <Plus className="h-4 w-4 mr-2" />
              新建节点
            </Button>
          </>
        }
      />

      {/* 筛选区域 */}
      <div className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-800/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProtocolFilter selectedProtocol={selectedProtocol} onProtocolChange={setSelectedProtocol} />
          <div>
            <span className="text-sm font-medium mb-2 block">标签筛选</span>
            <TagCloud tags={tagsList} selectedTags={selectedTags} onTagToggle={handleTagToggle} />
          </div>
        </div>
      </div>

      {/* 订阅源分组 Tabs */}
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
        variant="underlined"
        classNames={{
          tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-0 h-12",
          tabContent: "group-data-[selected=true]:text-primary"
        }}
      >
        <Tab key="all" title="全部" />
        {subSourceList.map((source: any) => (
          <Tab key={source.id} title={source.name} />
        ))}
        <Tab key="manual" title="手动" />
      </Tabs>

      {error ? (
        <div className="py-10 text-center text-red-500 bg-red-50/50 rounded-lg border border-red-100">
          <p>加载失败: {error.message}</p>
          <Button variant="link" onClick={() => refresh()}>
            重试
          </Button>
        </div>
      ) : loading ? (
        <Skeleton variant="grid" count={6} />
      ) : filteredData.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="暂无节点"
          description={searchTerm ? "未找到匹配的节点" : "开始添加您的第一个代理节点"}
          action={
            !searchTerm && (
              <Button onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                新建节点
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 reveal reveal-delay-100">
          {filteredData.map((node: any) => (
            <GridCard
              key={node.id}
              icon={Server}
              title={node.name || "未命名节点"}
              description={node.type}
              isSelected={isSelected(node.id)}
              onSelect={() => toggleSelection(node.id)}
              isPressable
              onPress={() => handleEdit(node)}
              footer={
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono opacity-50">{node.id.substring(0, 8)}...</span>
                  <Chip
                    size="sm"
                    color={node.status === "online" ? "success" : "default"}
                    variant="flat"
                    className="h-5 text-[10px]"
                  >
                    {node.status || "未知"}
                  </Chip>
                </div>
              }
              actions={
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-default-400 hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(node)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-default-400 hover:text-danger"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(node.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              }
            />
          ))}
        </div>
      )}

      <SimpleModal
        isOpen={open}
        onClose={handleClose}
        title={editingId ? "编辑节点" : "新建节点"}
        description={
          editingId ? "修改现有节点配置" : "手动添加一个新的节点配置"
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
              placeholder="节点名称"
            />
          </div>
          <div className="grid gap-2">
            <Autocomplete
              label="类型 *"
              labelPlacement="outside"
              placeholder="输入或选择类型"
              defaultItems={[
                { label: "vmess", value: "vmess" },
                { label: "vless", value: "vless" },
                { label: "trojan", value: "trojan" },
                { label: "ss", value: "ss" },
                { label: "ssr", value: "ssr" },
                { label: "manual", value: "manual" },
                { label: "subscription", value: "subscription" },
              ]}
              inputValue={formData.type}
              onInputChange={(value) => setFormData({ ...formData, type: value })}
              allowsCustomValue
            >
              {(item) => (
                <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>
              )}
            </Autocomplete>
          </div>
          <div className="grid gap-2">
            <Select
              label="订阅源 (可选)"
              labelPlacement="outside"
              placeholder="无关联订阅源"
              selectedKeys={
                formData.subscriptionSourceId
                  ? new Set([formData.subscriptionSourceId])
                  : new Set([])
              }
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string | undefined
                setFormData({
                  ...formData,
                  subscriptionSourceId: value || "",
                })
              }}
            >
              {subSourceList.map((sub: any) => (
                <SelectItem key={sub.id}>
                  {sub.name || sub.id}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="grid gap-2">
            <Textarea
              id="content"
              label="原始内容 *"
              labelPlacement="outside"
              value={formData.rawContent}
              onChange={(e) =>
                setFormData({ ...formData, rawContent: e.target.value })
              }
              placeholder="节点配置内容 (JSON/YAML/Link)"
              className="font-mono text-xs"
              minRows={5}
            />
          </div>
        </div>
      </SimpleModal>
    </div>
  )
}

