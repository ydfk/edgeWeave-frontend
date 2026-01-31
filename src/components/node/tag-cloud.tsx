import { Chip } from "@heroui/react"

// 标签云组件的Props接口
export interface TagCloudProps {
  tags: string[]
  selectedTags: string[]
  onTagToggle: (tag: string) => void
}

export function TagCloud({ tags, selectedTags, onTagToggle }: TagCloudProps) {
  // 当无标签时显示提示信息
  if (tags.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 px-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
        <span className="text-gray-500 dark:text-gray-400">无可用标签</span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag)
        return (
          <Chip
            key={tag}
            // 根据选中状态改变颜色
            color={isSelected ? "primary" : "default"}
            variant="flat"
            onClick={() => onTagToggle(tag)}
            className="cursor-pointer"
          >
            {tag}
          </Chip>
        )
      })}
    </div>
  )
}
