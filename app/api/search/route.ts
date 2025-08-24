import { NextResponse } from "next/server"
import { smartSearch, searchDatabase, SearchItem } from '@/lib/utils/search'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q") || ""
  const type = searchParams.get("type") || "all"

  try {
    let results: SearchItem[] = []

    // 使用智能搜索（结合结巴分词和模糊搜索）
    if (query.trim()) {
      results = smartSearch(query, searchDatabase)
    } else {
      results = searchDatabase
    }

    // 如果指定了类型，进行类型过滤
    if (type !== "all") {
      results = results.filter(item => item.type === type)
    }

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300))

    return NextResponse.json({
      success: true,
      results,
      total: results.length,
      query,
      type,
      searchMethod: query.trim() ? 'jieba_smart_search' : 'all_items'
    })
  } catch (error) {
    console.error('搜索API错误:', error)
    return NextResponse.json(
      { success: false, error: '搜索失败' },
      { status: 500 }
    )
  }
} 