import { NextRequest, NextResponse } from 'next/server';

interface Class {
  id: string;
  name: string;
  description?: string;
  maxStudents: number;
  currentStudents: number;
  grade: string;
  remark?: string;
  createdAt: string;
  status: 'ongoing' | 'completed' | 'pending';
  students: string[];
  taleGroupId?: string;
  lastSyncTime?: string;
  syncStatus?: 'synced' | 'pending' | 'error';
  syncError?: string;
}

// 模拟数据库 - 在实际应用中，这应该从数据库或其他存储中获取
let classes: Class[] = [
  {
    id: "1",
    name: "碳经济管理1班",
    description: "专注于碳经济管理的实验班",
    maxStudents: 30,
    currentStudents: 0,
    grade: "2025级",
    remark: "重点培养碳经济管理人才",
    createdAt: "2024-01-01",
    status: 'ongoing',
    students: []
  },
  {
    id: "2",
    name: "碳交易模拟2班",
    description: "碳交易模拟实验班",
    maxStudents: 25,
    currentStudents: 0,
    grade: "2025级",
    remark: "培养碳交易实践能力",
    createdAt: "2024-01-02",
    status: 'ongoing',
    students: []
  },
  {
    id: "3",
    name: "碳足迹计算3班",
    description: "碳足迹计算与分析班",
    maxStudents: 35,
    currentStudents: 0,
    grade: "2025级",
    remark: "注重碳足迹计算技能",
    createdAt: "2024-01-03",
    status: 'pending',
    students: []
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const classId = params.id;
    const cls = classes.find(c => c.id === classId);

    if (!cls) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(cls);
  } catch (error) {
    console.error('Error fetching class:', error);
    return NextResponse.json(
      { error: 'Failed to fetch class' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const classId = params.id;
    const body = await request.json();

    const classIndex = classes.findIndex(c => c.id === classId);

    if (classIndex === -1) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    const updatedClass = {
      ...classes[classIndex],
      ...body,
      id: classId, // 确保ID不被修改
      createdAt: classes[classIndex].createdAt, // 确保创建日期不被修改
    };

    classes[classIndex] = updatedClass;

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json(
      { error: 'Failed to update class' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const classId = params.id;
    const classIndex = classes.findIndex(c => c.id === classId);

    if (classIndex === -1) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    classes.splice(classIndex, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json(
      { error: 'Failed to delete class' },
      { status: 500 }
    );
  }
}