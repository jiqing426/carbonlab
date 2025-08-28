import React from 'react';

interface JsonVisualEditorProps {
  data: any;
  onDataChange: (value: any) => void;
  className?: string;
}

const JsonVisualEditor: React.FC<JsonVisualEditorProps> = ({ 
  data, 
  onDataChange, 
  className 
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const parsed = JSON.parse(e.target.value);
      onDataChange(parsed);
    } catch (error) {
      // 如果解析失败，不更新数据
    }
  };

  return (
    <textarea
      className={`w-full h-32 p-2 border border-gray-300 rounded-md font-mono text-sm ${className || ''}`}
      value={JSON.stringify(data, null, 2)}
      onChange={handleChange}
      placeholder="输入JSON数据..."
    />
  );
};

export default JsonVisualEditor;
