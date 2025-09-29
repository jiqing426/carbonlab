'use client';

import React, { useState, useMemo, forwardRef, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Type,
  Hash,
  ToggleLeft,
  Folder,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  JsonValue,
  JsonObject,
  getValueType,
  getTypeIcon,
  getTypeColor,
  formatValue,
  parseValue,
  updateNestedValue,
  deleteNestedValue,
  getNestedValue,
  generateDefaultExpandedPaths,
} from '@/lib/json-editor-utils';

interface JsonVisualEditorProps {
  /** JSON 数据对象 */
  data: JsonObject;
  /** 数据变更回调函数 */
  onDataChange: (data: JsonObject) => void;
  /** 自定义样式类名 */
  className?: string;
  /** 是否为只读模式 */
  readOnly?: boolean;
  /** 默认展开的路径 */
  defaultExpandedPaths?: string[];
  /** 最大展开深度 */
  maxDepth?: number;
  /** 是否显示类型图标 */
  showTypeIcons?: boolean;
  /** 是否显示添加按钮 */
  showAddButtons?: boolean;
  /** 是否显示删除按钮 */
  showDeleteButtons?: boolean;
  /** 错误处理回调 */
  onError?: (error: Error, context?: string) => void;
  /** 自定义主题配置 */
  theme?: {
    containerClass?: string;
    nodeClass?: string;
    keyClass?: string;
    valueClass?: string;
  };
}

const JsonVisualEditor = forwardRef<HTMLDivElement, JsonVisualEditorProps>(
  (
    {
      data,
      onDataChange,
      className = '',
      readOnly = false, // eslint-disable-line @typescript-eslint/no-unused-vars
      defaultExpandedPaths,
      maxDepth = 3,
      showTypeIcons = true, // eslint-disable-line @typescript-eslint/no-unused-vars
      showAddButtons = true, // eslint-disable-line @typescript-eslint/no-unused-vars
      showDeleteButtons = true, // eslint-disable-line @typescript-eslint/no-unused-vars
      onError, // eslint-disable-line @typescript-eslint/no-unused-vars
      theme,
    },
    ref
  ) => {
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState<string>('');
    const [hoveredPath, setHoveredPath] = useState<string | null>(null);

    // 使用 useMemo 优化初始展开状态计算
    const initialExpandedNodes = useMemo(() => {
      if (defaultExpandedPaths) {
        return new Set(defaultExpandedPaths);
      }
      return generateDefaultExpandedPaths(data, maxDepth);
    }, [data, defaultExpandedPaths, maxDepth]);

    const [expandedNodes, setExpandedNodes] =
      useState<Set<string>>(initialExpandedNodes);

    // 添加元素弹框相关状态
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [addDialogType, setAddDialogType] = useState<'object' | 'array'>(
      'object'
    );
    const [addDialogPath, setAddDialogPath] = useState('');
    const [addKey, setAddKey] = useState('');
    const [addValue, setAddValue] = useState('');
    const [addValueType, setAddValueType] = useState<
      'string' | 'number' | 'boolean' | 'null' | 'object' | 'array'
    >('string');

    // 切换节点展开状态
    const toggleExpanded = useCallback((path: string) => {
      setExpandedNodes(prev => {
        const newExpanded = new Set(prev);
        if (newExpanded.has(path)) {
          newExpanded.delete(path);
        } else {
          newExpanded.add(path);
        }
        return newExpanded;
      });
    }, []);

    // 错误处理函数（暂时未使用，保留以备后续功能扩展）
    // const handleError = useCallback(
    //   (error: Error, context?: string) => {
    //     if (onError) {
    //       onError(error, context);
    //     } else {
    //       console.error('JsonVisualEditor error:', error, context);
    //       toast.error(`操作失败: ${error.message}`);
    //     }
    //   },
    //   [onError]
    // );

    // 检查深度限制（暂时未使用，保留以备后续功能扩展）
    // const isMaxDepthReached = useCallback(
    //   (path: string) => {
    //     return path.split('.').length >= maxDepth;
    //   },
    //   [maxDepth]
    // );

    // 编辑值
    const handleEdit = (path: string, currentValue: JsonValue) => {
      setEditingKey(path);
      setEditingValue(
        typeof currentValue === 'object'
          ? JSON.stringify(currentValue, null, 2)
          : String(currentValue)
      );
    };

    // 保存编辑
    const handleSaveEdit = () => {
      if (!editingKey) return;

      const path = editingKey.split('.');
      const currentValue = getNestedValue(data, path);
      const type = getValueType(currentValue);

      try {
        const newValue = parseValue(editingValue, type);
        const updatedData = updateNestedValue(data, path, newValue);
        onDataChange(updatedData);
        setEditingKey(null);
        setEditingValue('');
        toast.success('值已更新');
      } catch {
        toast.error('值格式错误');
      }
    };

    // 取消编辑
    const handleCancelEdit = () => {
      setEditingKey(null);
      setEditingValue('');
    };

    // 删除字段
    const handleDelete = (path: string) => {
      const pathArray = path.split('.');
      const updatedData = deleteNestedValue(data, pathArray);
      onDataChange(updatedData);
      toast.success('字段已删除');
    };

    // 为对象添加新字段
    const handleAddObjectField = (parentPath: string) => {
      setAddDialogType('object');
      setAddDialogPath(parentPath);
      setAddKey('');
      setAddValue('');
      setAddValueType('string');
      setAddDialogOpen(true);
    };

    // 为数组添加新元素
    const handleAddArrayItem = (parentPath: string) => {
      setAddDialogType('array');
      setAddDialogPath(parentPath);
      setAddValue('');
      setAddValueType('string');
      setAddDialogOpen(true);
    };

    // 确认添加元素
    const handleConfirmAdd = () => {
      if (addDialogType === 'object' && !addKey.trim()) {
        toast.error('请输入字段名');
        return;
      }

      if (!addValue.trim() && addValueType !== 'null') {
        toast.error('请输入值');
        return;
      }

      try {
        const newValue = parseValue(addValue, addValueType);
        const pathArray = addDialogPath ? addDialogPath.split('.') : [];

        if (addDialogType === 'object') {
          // 添加到对象
          const newPath = [...pathArray, addKey];
          const updatedData = updateNestedValue(data, newPath, newValue);
          onDataChange(updatedData);
          toast.success('字段已添加');
        } else {
          // 添加到数组
          const currentValue = getNestedValue(data, pathArray);
          if (Array.isArray(currentValue)) {
            const newArray = [...currentValue, newValue];
            const updatedData = updateNestedValue(data, pathArray, newArray);
            onDataChange(updatedData);
            toast.success('元素已添加');
          }
        }

        setAddDialogOpen(false);
        setAddKey('');
        setAddValue('');
        setAddValueType('string');
      } catch {
        toast.error('值格式错误');
      }
    };

    // 渲染 JSON 树
    const renderJsonTree = (
      data: JsonValue,
      path: string = '',
      level: number = 0
    ): React.ReactNode => {
      const isExpanded = expandedNodes.has(path);
      const isHovered = hoveredPath === path;

      if (data === null) {
        return (
          <div
            className={`flex items-center gap-2 py-1 px-2 rounded-md transition-colors ${
              isHovered ? 'bg-muted/50' : ''
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onMouseEnter={() => setHoveredPath(path)}
            onMouseLeave={() => setHoveredPath(null)}
          >
            <div className='flex items-center gap-1'>
              {getTypeIcon('null')}
              <span className='text-gray-500 font-mono text-sm'>null</span>
            </div>
            {path && isHovered && (
              <div className='flex items-center gap-1 ml-auto'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleEdit(path, data)}
                  className='h-6 w-6 p-0 opacity-70 hover:opacity-100'
                >
                  <Edit3 className='h-3 w-3' />
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleDelete(path)}
                  className='h-6 w-6 p-0 opacity-70 hover:opacity-100 text-red-500 hover:text-red-700'
                >
                  <Trash2 className='h-3 w-3' />
                </Button>
              </div>
            )}
          </div>
        );
      }

      if (
        typeof data === 'string' ||
        typeof data === 'number' ||
        typeof data === 'boolean'
      ) {
        const isEditing = editingKey === path;
        const type = getValueType(data);

        return (
          <div
            className={`flex items-center gap-2 py-1 px-2 rounded-md transition-colors ${
              isHovered ? 'bg-muted/50' : ''
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onMouseEnter={() => setHoveredPath(path)}
            onMouseLeave={() => setHoveredPath(null)}
          >
            {isEditing ? (
              <div className='flex items-center gap-2 flex-1'>
                <div className='flex items-center gap-1'>
                  {getTypeIcon(type)}
                  <Badge variant='outline' className='text-xs'>
                    {type}
                  </Badge>
                </div>
                <Input
                  value={editingValue}
                  onChange={e => setEditingValue(e.target.value)}
                  className='h-7 text-sm font-mono'
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSaveEdit();
                    }
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCancelEdit();
                    }
                  }}
                />
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleSaveEdit}
                  className='h-6 w-6 p-0 text-green-600 hover:text-green-700'
                >
                  <Check className='h-3 w-3' />
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleCancelEdit}
                  className='h-6 w-6 p-0 text-gray-500 hover:text-gray-700'
                >
                  <X className='h-3 w-3' />
                </Button>
              </div>
            ) : (
              <>
                <div className='flex items-center gap-1'>
                  {getTypeIcon(type)}
                  <Badge variant='outline' className='text-xs'>
                    {type}
                  </Badge>
                </div>
                <span className={`font-mono text-sm ${getTypeColor(type)}`}>
                  {formatValue(data)}
                </span>
                {path && isHovered && (
                  <div className='flex items-center gap-1 ml-auto'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleEdit(path, data)}
                      className='h-6 w-6 p-0 opacity-70 hover:opacity-100'
                    >
                      <Edit3 className='h-3 w-3' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDelete(path)}
                      className='h-6 w-6 p-0 opacity-70 hover:opacity-100 text-red-500 hover:text-red-700'
                    >
                      <Trash2 className='h-3 w-3' />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      }

      if (Array.isArray(data)) {
        return (
          <div>
            <div
              className={`flex items-center gap-2 py-1 px-2 rounded-md transition-colors cursor-pointer ${
                isHovered ? 'bg-muted/50' : ''
              }`}
              style={{ paddingLeft: `${level * 16 + 8}px` }}
              onMouseEnter={() => setHoveredPath(path)}
              onMouseLeave={() => setHoveredPath(null)}
              onClick={() => toggleExpanded(path)}
            >
              <Button variant='ghost' size='sm' className='h-4 w-4 p-0'>
                {isExpanded ? (
                  <ChevronDown className='h-3 w-3' />
                ) : (
                  <ChevronRight className='h-3 w-3' />
                )}
              </Button>
              <div className='flex items-center gap-1'>
                {getTypeIcon('array')}
                <Badge variant='outline' className='text-xs'>
                  array
                </Badge>
              </div>
              <span className='text-indigo-600 dark:text-indigo-400 font-mono text-sm'>
                [{data.length} 项]
              </span>
              {path && isHovered && (
                <div className='flex items-center gap-1 ml-auto'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddArrayItem(path);
                    }}
                    className='h-6 w-6 p-0 opacity-70 hover:opacity-100 text-green-600 hover:text-green-700'
                    title='添加数组元素'
                  >
                    <Plus className='h-3 w-3' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(path);
                    }}
                    className='h-6 w-6 p-0 opacity-70 hover:opacity-100 text-red-500 hover:text-red-700'
                  >
                    <Trash2 className='h-3 w-3' />
                  </Button>
                </div>
              )}
            </div>
            {isExpanded && (
              <div className='border-l-2 border-muted ml-4'>
                {data.map((item, index) => (
                  <div key={index}>
                    <div
                      className='flex items-center gap-2 py-1 px-2 text-xs text-muted-foreground'
                      style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
                    >
                      <span className='font-mono'>[{index}]</span>
                    </div>
                    {renderJsonTree(
                      item,
                      path ? `${path}.${index}` : String(index),
                      level + 1
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      if (typeof data === 'object' && data !== null) {
        const entries = Object.entries(data);

        return (
          <div>
            <div
              className={`flex items-center gap-2 py-1 px-2 rounded-md transition-colors cursor-pointer ${
                isHovered ? 'bg-muted/50' : ''
              }`}
              style={{ paddingLeft: `${level * 16 + 8}px` }}
              onMouseEnter={() => setHoveredPath(path)}
              onMouseLeave={() => setHoveredPath(null)}
              onClick={() => toggleExpanded(path)}
            >
              <Button variant='ghost' size='sm' className='h-4 w-4 p-0'>
                {isExpanded ? (
                  <ChevronDown className='h-3 w-3' />
                ) : (
                  <ChevronRight className='h-3 w-3' />
                )}
              </Button>
              <div className='flex items-center gap-1'>
                {getTypeIcon('object')}
                <Badge variant='outline' className='text-xs'>
                  object
                </Badge>
              </div>
              <span className='text-orange-600 dark:text-orange-400 font-mono text-sm'>
                {`{${entries.length} 个字段}`}
              </span>
              {(path === '' || (path && isHovered)) && (
                <div className='flex items-center gap-1 ml-auto'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddObjectField(path);
                    }}
                    className='h-6 w-6 p-0 opacity-70 hover:opacity-100 text-green-600 hover:text-green-700'
                    title='添加对象字段'
                  >
                    <Plus className='h-3 w-3' />
                  </Button>
                  {path && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(path);
                      }}
                      className='h-6 w-6 p-0 opacity-70 hover:opacity-100 text-red-500 hover:text-red-700'
                    >
                      <Trash2 className='h-3 w-3' />
                    </Button>
                  )}
                </div>
              )}
            </div>
            {isExpanded && (
              <div className='border-l-2 border-muted ml-4'>
                {entries.map(([key, value]) => (
                  <div key={key}>
                    <div
                      className='flex items-center gap-2 py-1 px-2 text-xs text-muted-foreground'
                      style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
                    >
                      <span className='text-red-600 dark:text-red-400 font-mono font-medium'>
                        &quot;{key}&quot;:
                      </span>
                    </div>
                    {renderJsonTree(
                      value,
                      path ? `${path}.${key}` : key,
                      level + 1
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      return null;
    };

    return (
      <div
        ref={ref}
        className={`json-visual-editor ${className} ${theme?.containerClass || ''}`}
      >
        {/* 主编辑区域 */}
        <div className='border rounded-lg bg-muted/20 min-h-[200px] h-full overflow-auto p-4'>
          {renderJsonTree(data)}
        </div>

        {/* 添加元素弹框 */}
        <Dialog
          open={addDialogOpen}
          onOpenChange={open => {
            if (!open) {
              // 阻止事件冒泡，避免影响外部 Dialog
              setAddDialogOpen(false);
            } else {
              setAddDialogOpen(true);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <Plus className='h-5 w-5' />
                {addDialogType === 'object' ? '添加对象字段' : '添加数组元素'}
              </DialogTitle>
              <DialogDescription>
                {addDialogType === 'object'
                  ? '为对象添加新的字段'
                  : '为数组添加新的元素'}
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={e => {
                e.preventDefault();
                e.stopPropagation();
                handleConfirmAdd();
              }}
              onKeyDown={e => {
                // 阻止 Enter 键触发外部表单提交
                if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            >
              <div className='space-y-4'>
                {addDialogType === 'object' && (
                  <div>
                    <Label htmlFor='add-key'>字段名</Label>
                    <Input
                      id='add-key'
                      value={addKey}
                      onChange={e => setAddKey(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.stopPropagation();
                          handleConfirmAdd();
                        }
                      }}
                      placeholder='输入字段名'
                      className='font-mono'
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor='add-type'>数据类型</Label>
                  <Select
                    value={addValueType}
                    onValueChange={(
                      value:
                        | 'string'
                        | 'number'
                        | 'boolean'
                        | 'null'
                        | 'object'
                        | 'array'
                    ) => setAddValueType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='string'>
                        <div className='flex items-center gap-2'>
                          <Type className='h-3 w-3 text-green-600' />
                          字符串
                        </div>
                      </SelectItem>
                      <SelectItem value='number'>
                        <div className='flex items-center gap-2'>
                          <Hash className='h-3 w-3 text-blue-600' />
                          数字
                        </div>
                      </SelectItem>
                      <SelectItem value='boolean'>
                        <div className='flex items-center gap-2'>
                          <ToggleLeft className='h-3 w-3 text-purple-600' />
                          布尔值
                        </div>
                      </SelectItem>
                      <SelectItem value='null'>
                        <div className='flex items-center gap-2'>
                          <X className='h-3 w-3 text-gray-500' />
                          空值
                        </div>
                      </SelectItem>
                      <SelectItem value='object'>
                        <div className='flex items-center gap-2'>
                          <Folder className='h-3 w-3 text-orange-600' />
                          对象
                        </div>
                      </SelectItem>
                      <SelectItem value='array'>
                        <div className='flex items-center gap-2'>
                          <div className='h-3 w-3 border border-indigo-600 rounded-sm bg-indigo-100'></div>
                          数组
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor='add-value'>值</Label>
                  {addValueType === 'boolean' ? (
                    <Select value={addValue} onValueChange={setAddValue}>
                      <SelectTrigger>
                        <SelectValue placeholder='选择布尔值' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='true'>true</SelectItem>
                        <SelectItem value='false'>false</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : addValueType === 'null' ? (
                    <Input value='null' disabled className='font-mono' />
                  ) : addValueType === 'object' || addValueType === 'array' ? (
                    <Textarea
                      value={addValue}
                      onChange={e => setAddValue(e.target.value)}
                      onKeyDown={e => {
                        // 对于 Textarea，只在 Ctrl+Enter 时提交，避免普通 Enter 触发外部表单
                        if (e.key === 'Enter' && e.ctrlKey) {
                          e.preventDefault();
                          e.stopPropagation();
                          handleConfirmAdd();
                        } else if (e.key === 'Enter' && !e.shiftKey) {
                          // 阻止单独的 Enter 键冒泡到外部表单
                          e.stopPropagation();
                        }
                      }}
                      placeholder={
                        addValueType === 'object'
                          ? '{"key": "value"}'
                          : '["item1", "item2"]'
                      }
                      rows={3}
                      className='font-mono'
                    />
                  ) : (
                    <Input
                      id='add-value'
                      value={addValue}
                      onChange={e => setAddValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.stopPropagation();
                          handleConfirmAdd();
                        }
                      }}
                      placeholder={
                        addValueType === 'string'
                          ? '输入字符串'
                          : addValueType === 'number'
                            ? '输入数字'
                            : '输入值'
                      }
                      type={addValueType === 'number' ? 'number' : 'text'}
                      className='font-mono'
                    />
                  )}
                </div>

                <div className='flex gap-2'>
                  <Button type='submit' className='flex-1'>
                    <Plus className='h-4 w-4 mr-1' />
                    确认添加
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={e => {
                      e.stopPropagation();
                      setAddDialogOpen(false);
                    }}
                    className='flex-1'
                  >
                    取消
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);

JsonVisualEditor.displayName = 'JsonVisualEditor';

export default JsonVisualEditor;
