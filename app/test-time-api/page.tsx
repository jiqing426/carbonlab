'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function TestTimeAPI() {
  const [repositoryId, setRepositoryId] = useState('repo_003');
  const [fileId, setFileId] = useState('data-1');
  const [displayTime, setDisplayTime] = useState('2025-07-18');
  const [result, setResult] = useState<any>(null);

  const handleUpdateTime = async () => {
    try {
      const response = await fetch('/api/update-file-time', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repositoryId,
          fileId,
          displayTime
        })
      });

      const data = await response.json();
      setResult(data);
      
      if (response.ok) {
        toast.success('时间更新成功！');
      } else {
        toast.error(`更新失败：${data.error}`);
      }
    } catch (error) {
      console.error('更新失败:', error);
      toast.error('更新失败');
    }
  };

  const handleGetTime = async () => {
    try {
      const response = await fetch(`/api/update-file-time?repositoryId=${repositoryId}&fileId=${fileId}`);
      const data = await response.json();
      setResult(data);
      
      if (response.ok) {
        toast.success('获取时间成功！');
        setDisplayTime(data.data.displayTime);
      } else {
        toast.error(`获取失败：${data.error}`);
      }
    } catch (error) {
      console.error('获取失败:', error);
      toast.error('获取失败');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>测试文件显示时间API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repositoryId">资料库ID</Label>
            <Input
              id="repositoryId"
              value={repositoryId}
              onChange={(e) => setRepositoryId(e.target.value)}
              placeholder="输入资料库ID"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fileId">文件ID</Label>
            <Input
              id="fileId"
              value={fileId}
              onChange={(e) => setFileId(e.target.value)}
              placeholder="输入文件ID"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="displayTime">显示时间</Label>
            <Input
              id="displayTime"
              type="date"
              value={displayTime}
              onChange={(e) => setDisplayTime(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleUpdateTime}>
              更新显示时间
            </Button>
            <Button variant="outline" onClick={handleGetTime}>
              获取显示时间
            </Button>
          </div>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">API响应结果：</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">使用说明：</h3>
            <ul className="text-sm space-y-1">
              <li>• 默认测试 repo_003 资料库中的 data-1 文件</li>
              <li>• 可以修改资料库ID和文件ID来测试其他文件</li>
              <li>• 显示时间格式：YYYY-MM-DD</li>
              <li>• 更新后，主页的"最新数据发布"部分会显示新的时间</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

