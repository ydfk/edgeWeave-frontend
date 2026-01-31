import { Button, Chip, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react"
import { Edit, Trash2 } from "lucide-react"

// 节点数据结构（包含解析后的字段）
export interface NodeWithParsed {
  id: string
  name: string
  type: string
  rawContent: string
  parsedContent: string
  tags: string // JSON array string
  parsed?: {
    name: string
    type: string
    address: string
    port: number
    extra?: Record<string, unknown>
  }
}

// 紧凑列表组件 Props
export interface NodeCompactListProps {
  nodes: NodeWithParsed[]
  loading?: boolean
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedProtocol: string | null
  onProtocolChange: (protocol: string | null) => void
  onEdit: (node: NodeWithParsed) => void
  onDelete: (id: string) => void
}

export function NodeCompactList({ nodes, loading = false, onEdit, onDelete }: NodeCompactListProps) {
  // 解析 tags JSON 字符串
  const parseTags = (tagsStr: string): string[] => {
    try {
      return JSON.parse(tagsStr) || []
    } catch {
      return []
    }
  }

  // 协议颜色映射
  const protocolColors: Record<string, "primary" | "success" | "warning" | "danger" | "secondary"> = {
    vmess: "primary",
    vless: "success",
    trojan: "warning",
    ss: "secondary",
    ssr: "danger",
  }

  return (
    <Table
      aria-label="节点列表"
      classNames={{
        wrapper: "shadow-none border border-divider",
        th: "bg-default-100 h-8",
        td: "h-8 py-1",
      }}
    >
      <TableHeader>
        <TableColumn>协议</TableColumn>
        <TableColumn>名称</TableColumn>
        <TableColumn>服务器地址</TableColumn>
        <TableColumn>标签</TableColumn>
        <TableColumn width={100}>操作</TableColumn>
      </TableHeader>
      <TableBody items={nodes} isLoading={loading} emptyContent="暂无节点">
        {(node) => (
          <TableRow key={node.id} className="group">
            {/* 协议列 */}
            <TableCell>
              <Chip size="sm" color={protocolColors[node.type] || "default"}>
                {node.type.toUpperCase()}
              </Chip>
            </TableCell>

            {/* 名称列 */}
            <TableCell>
              <span className="truncate max-w-[200px] block">{node.name}</span>
            </TableCell>

            {/* 服务器地址列 */}
            <TableCell>
              <span className="font-mono text-sm">{node.parsed?.address || "-"}</span>
            </TableCell>

            {/* 标签列 */}
            <TableCell>
              <div className="flex gap-1 flex-wrap">
                {parseTags(node.tags).map((tag, idx) => (
                  <Chip key={idx} size="sm" variant="flat">
                    {tag}
                  </Chip>
                ))}
              </div>
            </TableCell>

            {/* 操作列 */}
            <TableCell>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button isIconOnly size="sm" variant="light" onPress={() => onEdit(node)} aria-label="编辑">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={() => onDelete(node.id)}
                  aria-label="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
