import { useState } from "react"
import { Accordion, AccordionItem, Button } from "@heroui/react"
import { useRequest } from "alova/client"

import { importNodes } from "../../lib/api/methods/nodes"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"

export interface ImportPanelProps {
  onImportSuccess?: () => void
  onImportError?: (error: string) => void
}

export function ImportPanel({ onImportSuccess, onImportError }: ImportPanelProps) {
  const [subscriptionUrl, setSubscriptionUrl] = useState("")
  const [subscriptionName, setSubscriptionName] = useState("")
  const [syncInterval, setSyncInterval] = useState("60")
  const [manualContent, setManualContent] = useState("")
  const [tags, setTags] = useState("")

  const { send: doImport, loading: importing } = useRequest(importNodes, {
    immediate: false,
  })

  const handleImport = async () => {
    try {
      // 验证至少有一种输入方式
      if (!subscriptionUrl && !manualContent) {
        onImportError?.("请输入订阅URL或手动内容")
        return
      }

      // 解析标签（逗号分隔）
      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0)

      // 构造API请求负载
      const payload: Record<string, unknown> = {}

      if (subscriptionUrl) {
        // 订阅模式
        payload.type = "subscription"
        payload.rawContent = subscriptionUrl
        payload.namePrefix = subscriptionName || undefined
        payload.syncInterval = parseInt(syncInterval) || 60
        if (tagArray.length > 0) {
          payload.tags = tagArray
        }
      } else if (manualContent) {
        // 手动输入模式
        payload.type = "manual"
        payload.rawContent = manualContent
        payload.splitLines = true
        payload.namePrefix = subscriptionName || undefined
        if (tagArray.length > 0) {
          payload.tags = tagArray
        }
      }

      const result = await doImport(payload)

      // 显示导入结果
      const count = (result as { data?: { count?: number } })?.data?.count || 0
      onImportSuccess?.()
      if (count > 0) {
        onImportError?.(`导入成功: ${count} 个节点`)
      }

      // 清空表单
      setSubscriptionUrl("")
      setSubscriptionName("")
      setSyncInterval("60")
      setManualContent("")
      setTags("")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "导入失败"
      onImportError?.(errorMessage)
    }
  }

  return (
    <Accordion>
      <AccordionItem
        key="import"
        aria-label="导入节点"
        title="导入节点或订阅"
        subtitle="点击展开导入表单"
      >
        <div className="grid gap-4 py-4">
          {/* 订阅源部分 */}
          <div className="grid gap-2">
            <Input
              id="subscription-url"
              label="订阅 URL"
              labelPlacement="outside"
              placeholder="https://..."
              value={subscriptionUrl}
              onChange={(e) => setSubscriptionUrl(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="subscription-name"
              label="订阅名称"
              labelPlacement="outside"
              placeholder="机场A"
              value={subscriptionName}
              onChange={(e) => setSubscriptionName(e.target.value)}
            />
            <Input
              id="sync-interval"
              label="同步间隔 (分钟)"
              labelPlacement="outside"
              type="number"
              placeholder="60"
              value={syncInterval}
              onChange={(e) => setSyncInterval(e.target.value)}
            />
          </div>

          <div className="my-4 border-t border-gray-200 dark:border-gray-700" />

          {/* 手动输入部分 */}
          <div className="grid gap-2">
            <Textarea
              id="manual-content"
              label="手动输入节点"
              labelPlacement="outside"
              placeholder="支持多行节点URL或Clash YAML配置"
              minRows={10}
              value={manualContent}
              onChange={(e) => setManualContent(e.target.value)}
            />
          </div>

          {/* 标签输入 */}
          <div className="grid gap-2">
            <Input
              id="tags"
              label="标签 (逗号分隔)"
              labelPlacement="outside"
              placeholder="测试,机场A,高速"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <Button onClick={handleImport} disabled={importing} color="primary" className="w-full">
            {importing ? "导入中..." : "保存节点"}
          </Button>
        </div>
      </AccordionItem>
    </Accordion>
  )
}
