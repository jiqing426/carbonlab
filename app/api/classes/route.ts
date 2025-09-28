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

interface ClassesResponse {
  total: number;
  content: Class[];
  pageable: {
    sort: { orders: unknown[] };
    pageNumber: number;
    pageSize: number;
  };
}

interface CreateClassRequest {
  name: string;
  description?: string;
  maxStudents: number;
  grade: string;
  remark?: string;
}

// 模拟数据库
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '10');
    const keyword = searchParams.get('keyword') || '';

    let filteredClasses = classes;

    if (keyword) {
      filteredClasses = classes.filter(cls =>
        cls.name.toLowerCase().includes(keyword.toLowerCase()) ||
        cls.description?.toLowerCase().includes(keyword.toLowerCase()) ||
        cls.grade.includes(keyword)
      );
    }

    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedClasses = filteredClasses.slice(startIndex, endIndex);

    const response: ClassesResponse = {
      total: filteredClasses.length,
      content: paginatedClasses,
      pageable: {
        sort: { orders: [] },
        pageNumber: page,
        pageSize: size,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateClassRequest = await request.json();

    const newClass: Class = {
      id: Date.now().toString(),
      name: body.name,
      description: body.description,
      maxStudents: body.maxStudents,
      currentStudents: 0,
      grade: body.grade,
      remark: body.remark,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'pending',
      students: [],
      syncStatus: 'pending'
    };

    classes.unshift(newClass);

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { error: 'Failed to create class' },
      { status: 500 }
    );
  }
}