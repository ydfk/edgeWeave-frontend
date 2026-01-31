import { useState, useMemo, useEffect, useRef } from "react"
import { RefreshCw, Plus, Globe } from "lucide-react"
import { useRequest } from "alova/client"
import {
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
  parseNodes,
} from "../lib/api/methods/nodes"
import { getSubscriptionSources } from "../lib/api/methods/subscriptions"
import { Button } from "../components/ui/button"
import { SimpleModal } from "../components/ui/simple-modal"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { PageHeader } from "../components/ui/page-header"
import { EmptyState } from "../components/ui/empty-state"
import { Skeleton } from "../components/ui/skeleton"
import { useToast } from "../components/ui/toast-provider"
import { useConfirm } from "../components/ui/confirm-dialog"
import { ProtocolFilter } from "../components/node/protocol-filter"
import { TagCloud } from "../components/node/tag-cloud"
import { ImportPanel } from "../components/node/import-panel"
import { NodeCompactList } from "../components/node/node-compact-list"
import type { NodeWithParsed } from "../components/node/node-compact-list"

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
  const parseTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 自动解析 rawContent 中的 URI
  useEffect(() => {
    // 清除之前的定时器
    if (parseTimeoutRef.current) {
      clearTimeout(parseTimeoutRef.current)
    }

    // 只在有内容且看起来像 URI 时才解析
    const content = formData.rawContent.trim()
    if (!content || !content.match(/^(vmess|vless|trojan|ss|ssr):\/\//)) {
      return
    }

    // 防抖：500ms 后执行解析
    parseTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await parseNodes(content, "uri")
        const parsed = (result as any)?.data?.data?.[0]
        
        if (parsed) {
          // 自动填充 name 和 type
          setFormData((prev) => ({
            ...prev,
            name: prev.name || parsed.name || "",
            type: prev.type || parsed.type || "",
          }))
        }
      } catch (error) {
        // 静默失败，不影响用户输入
        console.warn("Auto-parse failed:", error)
      }
    }, 500)

    return () => {
      if (parseTimeoutRef.current) {
        clearTimeout(parseTimeoutRef.current)
      }
    }
  }, [formData.rawContent])

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
    setSelectedProtocol(null)
    setSelectedTags([])
    setActiveTab("all")
    refresh()
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
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

  return (
    <div className="w-full space-y-3">
      <PageHeader
        title="节点管理"
        description="管理您的代理节点配置"
        search={{
          value: searchTerm,
          onChange: setSearchTerm,
          placeholder: "搜索节点..."
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
            <Button size="sm" onClick={() => setOpen(true)} className="shadow-sm shadow-primary/20">
              <Plus className="h-4 w-4 mr-2" />
              新建节点
            </Button>
          </>
        }
      />

      {/* 导入面板 */}
      <ImportPanel
        onImportSuccess={() => {
          toast({
            variant: "success",
            message: "节点导入成功",
          })
          refresh()
        }}
        onImportError={(error) => {
          toast({
            variant: "error",
            message: `导入失败: ${error}`,
          })
        }}
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
        <NodeCompactList
          nodes={filteredData as NodeWithParsed[]}
          loading={loading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedProtocol={selectedProtocol}
          onProtocolChange={setSelectedProtocol}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
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

