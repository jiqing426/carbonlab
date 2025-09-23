import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { courses } from "@/lib/database"
import { Edit, Eye } from "lucide-react"

export default function CoursesPage() {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "初级"
      case "intermediate":
        return "中级"
      case "advanced":
        return "高级"
      default:
        return difficulty
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "published":
        return "已发布"
      case "draft":
        return "草稿"
      case "archived":
        return "已归档"
      default:
        return status
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">课程管理</h1>
            <p className="text-muted-foreground">
              查看和编辑所有课程内容和发布状态
            </p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <Badge variant={course.status === "published" ? "default" : "secondary"}>
                    {getStatusText(course.status)}
                  </Badge>
                </div>
                <CardDescription>
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getDifficultyColor(course.difficulty)}>
                      {getDifficultyText(course.difficulty)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {course.module}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" title="查看详情">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="编辑课程">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
  )
} 