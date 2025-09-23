import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { experiments } from "@/lib/database"
import { Edit, Eye } from "lucide-react"

export default function ExperimentsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">实验管理</h1>
            <p className="text-muted-foreground">
              查看和编辑所有实验项目的内容和状态
            </p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {experiments.map((experiment) => (
            <Card key={experiment.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{experiment.title}</CardTitle>
                  <Badge variant={experiment.status === "已上线" ? "default" : "secondary"}>
                    {experiment.status}
                  </Badge>
                </div>
                <CardDescription>
                  {experiment.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{experiment.difficulty}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {experiment.module}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" title="查看详情">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="编辑实验">
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