import React from 'react';
import { Hash, Type, ToggleLeft, X, Folder, FolderOpen } from 'lucide-react';

// 类型定义
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];

export type JsonValueType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'null'
  | 'object'
  | 'array';

// 获取值的类型
export const getValueType = (value: JsonValue): JsonValueType => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value as JsonValueType;
};

// 获取类型图标
export const getTypeIcon = (type: JsonValueType, isExpanded?: boolean) => {
  switch (type) {
    case 'string':
      return <Type className='h-3 w-3 text-green-600' />;
    case 'number':
      return <Hash className='h-3 w-3 text-blue-600' />;
    case 'boolean':
      return <ToggleLeft className='h-3 w-3 text-purple-600' />;
    case 'null':
      return <X className='h-3 w-3 text-gray-500' />;
    case 'object':
      return isExpanded ? (
        <FolderOpen className='h-3 w-3 text-orange-600' />
      ) : (
        <Folder className='h-3 w-3 text-orange-600' />
      );
    case 'array':
      return (
        <div className='h-3 w-3 border border-indigo-600 rounded-sm bg-indigo-100'></div>
      );
    default:
      return null;
  }
};

// 获取类型颜色
export const getTypeColor = (type: JsonValueType): string => {
  switch (type) {
    case 'string':
      return 'text-green-600 dark:text-green-400';
    case 'number':
      return 'text-blue-600 dark:text-blue-400';
    case 'boolean':
      return 'text-purple-600 dark:text-purple-400';
    case 'null':
      return 'text-gray-500 dark:text-gray-400';
    case 'object':
      return 'text-orange-600 dark:text-orange-400';
    case 'array':
      return 'text-indigo-600 dark:text-indigo-400';
    default:
      return 'text-gray-600 dark:text-gray-300';
  }
};

// 格式化显示值
export const formatValue = (value: JsonValue): string => {
  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'boolean') return value.toString();
  if (typeof value === 'number') return value.toString();
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (typeof value === 'object') return `Object(${Object.keys(value).length})`;
  return String(value);
};

// 解析输入值
export const parseValue = (input: string, type: JsonValueType): JsonValue => {
  switch (type) {
    case 'string':
      return input;
    case 'number':
      const num = parseFloat(input);
      return isNaN(num) ? 0 : num;
    case 'boolean':
      return input.toLowerCase() === 'true';
    case 'null':
      return null;
    case 'array':
      try {
        const parsed = JSON.parse(input);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    case 'object':
      try {
        const parsed = JSON.parse(input);
        return typeof parsed === 'object' &&
          parsed !== null &&
          !Array.isArray(parsed)
          ? parsed
          : {};
      } catch {
        return {};
      }
    default:
      return input;
  }
};

// 更新嵌套对象的值
export const updateNestedValue = (
  obj: JsonObject,
  path: string[],
  value: JsonValue
): JsonObject => {
  if (path.length === 0) return obj;

  const newObj = { ...obj };
  let current: JsonObject = newObj;

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (!(key in current)) {
      current[key] = {};
    }
    current[key] = { ...(current[key] as JsonObject) };
    current = current[key] as JsonObject;
  }

  const lastKey = path[path.length - 1];
  current[lastKey] = value;

  return newObj;
};

// 删除嵌套对象的值
export const deleteNestedValue = (
  obj: JsonObject,
  path: string[]
): JsonObject => {
  if (path.length === 0) return obj;

  const newObj = { ...obj };
  let current: JsonObject = newObj;

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (!(key in current)) return obj;
    current[key] = { ...(current[key] as JsonObject) };
    current = current[key] as JsonObject;
  }

  const lastKey = path[path.length - 1];
  delete current[lastKey];

  return newObj;
};

// 获取嵌套值
export const getNestedValue = (obj: JsonObject, path: string[]): JsonValue => {
  let current: JsonValue = obj;
  for (const key of path) {
    if (
      current &&
      typeof current === 'object' &&
      !Array.isArray(current) &&
      key in current
    ) {
      current = (current as JsonObject)[key];
    } else {
      return null;
    }
  }
  return current;
};

// 验证 JSON 路径
export const isValidPath = (path: string): boolean => {
  return typeof path === 'string' && path.length >= 0;
};

// 生成默认展开路径
export const generateDefaultExpandedPaths = (
  data: JsonObject,
  maxDepth: number = 2
): Set<string> => {
  const expanded = new Set<string>();

  const traverse = (obj: JsonValue, currentPath: string, depth: number) => {
    if (depth >= maxDepth) return;

    if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
      expanded.add(currentPath);
      Object.keys(obj).forEach(key => {
        const newPath = currentPath ? `${currentPath}.${key}` : key;
        traverse((obj as JsonObject)[key], newPath, depth + 1);
      });
    } else if (Array.isArray(obj)) {
      expanded.add(currentPath);
    }
  };

  traverse(data, '', 0);
  return expanded;
};

// 类型守卫
export const isJsonObject = (value: JsonValue): value is JsonObject => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isJsonArray = (value: JsonValue): value is JsonArray => {
  return Array.isArray(value);
};

// 深度克隆 JSON 数据
export const deepCloneJson = (data: JsonValue): JsonValue => {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(deepCloneJson);
  }

  const cloned: JsonObject = {};
  Object.keys(data).forEach(key => {
    cloned[key] = deepCloneJson((data as JsonObject)[key]);
  });

  return cloned;
};
