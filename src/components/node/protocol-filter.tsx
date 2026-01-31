import { Select, SelectItem } from "@heroui/react"
import type { Selection } from "@heroui/react"

// 协议筛选组件的Props接口
export interface ProtocolFilterProps {
  selectedProtocol: string | null
  onProtocolChange: (protocol: string | null) => void
}

export function ProtocolFilter({
  selectedProtocol,
  onProtocolChange,
}: ProtocolFilterProps) {
  const handleSelectionChange = (keys: Selection) => {
    // 处理选择变化，"all"表示全部协议
    if (keys instanceof Set) {
      const selected = Array.from(keys)[0] as string | undefined
      if (selected === "all") {
        onProtocolChange(null)
      } else {
        onProtocolChange(selected || null)
      }
    }
  }

  return (
    <Select
      label="协议筛选"
      labelPlacement="outside"
      placeholder="选择协议"
      selectedKeys={selectedProtocol ? new Set([selectedProtocol]) : new Set(["all"])}
      onSelectionChange={handleSelectionChange}
      className="w-full"
    >
      <SelectItem key="all">全部</SelectItem>
      <SelectItem key="vmess">vmess</SelectItem>
      <SelectItem key="vless">vless</SelectItem>
      <SelectItem key="trojan">trojan</SelectItem>
      <SelectItem key="ss">ss</SelectItem>
      <SelectItem key="ssr">ssr</SelectItem>
      <SelectItem key="hysteria">hysteria</SelectItem>
      <SelectItem key="socks">socks</SelectItem>
      <SelectItem key="tuic">tuic</SelectItem>
      <SelectItem key="anytls">anytls</SelectItem>
      <SelectItem key="wireguard">wireguard</SelectItem>
    </Select>
  )
}
