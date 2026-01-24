import { useState, useMemo } from "react"
import { RefreshCw, Plus, Pencil, Trash2, Search } from "lucide-react"
import { useRequest } from "alova/client"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tooltip,
  Card,
  CardBody,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  Selection
} from "@heroui/react"
import {
  getNodes,
  createNode,
  updateNode,
  deleteNode,
} from "../lib/api/methods/nodes"
import { getSubscriptionSources } from "../lib/api/methods/subscriptions"
import { Button } from "../components/ui/button"
import { SimpleModal } from "../components/ui/simple-modal"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"

export function NodeManagement() {
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
  // Use HeroUI Selection type
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]))
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    rawContent: "",
    subscriptionSourceId: "",
  })
  // const [subSearch, setSubSearch] = useState("") // Not needed with Autocomplete/Select searchable?
  const subSourceList = Array.isArray(subSources) ? subSources : subSources?.data || []
  const [searchTerm, setSearchTerm] = useState("")

  const nodeList = Array.isArray(data) ? data : data?.data || []

  const filteredData = useMemo(() => {
    return nodeList.filter(
      (node: any) =>
        (node.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (node.type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (node.id || "").toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [nodeList, searchTerm])

  const handleRefresh = () => {
    setSelectedKeys(new Set([]))
    refresh()
  }

  const handleBulkDelete = async () => {
    if (selectedKeys === "all") return // Handle all selection if needed, simplified for now
    if (selectedKeys.size === 0) return
    if (!confirm(`确定要删除选中的 ${selectedKeys.size} 个节点吗？`)) return

    setIsBulkDeleting(true)
    try {
      const results = await Promise.allSettled(
        Array.from(selectedKeys).map((id) => deleteNode(id as string).send()),
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

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除该节点吗？")) return
    try {
      await remove(id)
      handleRefresh()
    } catch (e: any) {
      alert("删除失败: " + (e.message || "未知错误"))
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
      alert("请填写必要字段 (名称, 类型, 内容)")
      return
    }
    try {
      const payload: any = { ...formData }
      if (!payload.subscriptionSourceId) delete payload.subscriptionSourceId

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

  const renderCell = (node: any, columnKey: React.Key) => {
    switch (columnKey) {
      case "id":
        return <span className="font-mono text-xs text-muted-foreground">{node.id.substring(0, 8)}...</span>
      case "name":
        return (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
            <span className="font-medium">{node.name || "未命名节点"}</span>
          </div>
        )
      case "type":
         return <Chip size="sm" variant="flat">{node.type}</Chip>
      case "status":
        return (
          <Chip
            size="sm"
            color={node.status === "online" ? "success" : "default"}
            variant="flat"
          >
            {node.status || "未知"}
          </Chip>
        )
      case "actions":
        return (
          <div className="relative flex items-center gap-2 justify-end">
             <Tooltip content="编辑节点">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => handleEdit(node)}>
                <Pencil className="h-4 w-4" />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="删除节点">
              <span className="text-lg text-danger cursor-pointer active:opacity-50" onClick={() => handleDelete(node.id)}>
                <Trash2 className="h-4 w-4" />
              </span>
            </Tooltip>
          </div>
        )
      default:
        return node[columnKey as keyof typeof node]
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 reveal">
        <h1 className="text-3xl font-bold tracking-tight">
          节点管理
        </h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder="搜索节点..."
            startContent={<Search className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />}
            className="w-full sm:w-64"
            classNames={{
              inputWrapper: "bg-secondary/50 dark:bg-default-500/20 border-border/50 hover:border-primary/50 transition-colors",
            }}
            radius="lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="sm"
          />
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
          {(selectedKeys === "all" || selectedKeys.size > 0) && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="bg-red-500 hover:bg-red-600 text-white shadow-sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              批量删除 ({selectedKeys === "all" ? filteredData.length : selectedKeys.size})
            </Button>
          )}
          <Button size="sm" onClick={() => setOpen(true)} className="shadow-sm shadow-primary/20">
            <Plus className="h-4 w-4 mr-2" />
            新建节点
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-none reveal reveal-delay-100">
        <CardBody className="p-0">
          {error ? (
             <div className="py-10 text-center text-red-500 bg-red-50/50 rounded-lg">
              <p>加载失败: {error.message}</p>
              <Button variant="link" onClick={() => refresh()}>
                重试
              </Button>
            </div>
          ) : (
          <Table
            aria-label="Nodes table"
            selectionMode="multiple"
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
            removeWrapper
            classNames={{
                wrapper: "min-h-[222px]",
                th: "bg-muted/50 text-muted-foreground font-medium",
                td: "py-3 border-b border-border/50",
            }}
          >
            <TableHeader>
              <TableColumn key="id">ID</TableColumn>
              <TableColumn key="name">名称</TableColumn>
              <TableColumn key="type">类型</TableColumn>
              <TableColumn key="status">状态</TableColumn>
              <TableColumn key="actions" align="end">操作</TableColumn>
            </TableHeader>
            <TableBody
              items={filteredData}
              emptyContent={
                loading ? "加载中..." : "暂无节点"
              }
              isLoading={loading}
            >
              {(item: any) => (
                <TableRow key={item.id}>
                  {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                </TableRow>
              )}
            </TableBody>
          </Table>
          )}
        </CardBody>
      </Card>

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
