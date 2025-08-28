import { NextResponse } from 'next/server';

// 模拟用户数据
const mockUsers = [
  {
    user_id: 'user_001',
    username: '张三',
    phone: '13800138001',
    email: 'zhangsan@example.com',
    is_frozen: false,
    created_at: '2024-01-15T10:00:00Z',
    user_roles: ['student'],
    user_groups: []
  },
  {
    user_id: 'user_002',
    username: '李四',
    phone: '13800138002',
    email: 'lisi@example.com',
    is_frozen: false,
    created_at: '2024-01-16T10:00:00Z',
    user_roles: ['student'],
    user_groups: []
  },
  {
    user_id: 'user_003',
    username: '王五',
    phone: '13800138003',
    email: 'wangwu@example.com',
    is_frozen: false,
    created_at: '2024-01-17T10:00:00Z',
    user_roles: ['student'],
    user_groups: []
  },
  {
    user_id: 'user_004',
    username: '赵六',
    phone: '13800138004',
    email: 'zhaoliu@example.com',
    is_frozen: false,
    created_at: '2024-01-18T10:00:00Z',
    user_roles: ['student'],
    user_groups: []
  },
  {
    user_id: 'user_005',
    username: '钱七',
    phone: '13800138005',
    email: 'qianqi@example.com',
    is_frozen: false,
    created_at: '2024-01-19T10:00:00Z',
    user_roles: ['student'],
    user_groups: []
  },
  {
    user_id: 'user_006',
    username: '孙八',
    phone: '13800138006',
    email: 'sunba@example.com',
    is_frozen: false,
    created_at: '2024-01-20T10:00:00Z',
    user_roles: ['student'],
    user_groups: []
  },
  {
    user_id: 'user_007',
    username: '周九',
    phone: '13800138007',
    email: 'zhoujiu@example.com',
    is_frozen: false,
    created_at: '2024-01-21T10:00:00Z',
    user_roles: ['student'],
    user_groups: []
  },
  {
    user_id: 'user_008',
    username: '吴十',
    phone: '13800138008',
    email: 'wushi@example.com',
    is_frozen: false,
    created_at: '2024-01-22T10:00:00Z',
    user_roles: ['student'],
    user_groups: []
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '10');
    const search = searchParams.get('search') || '';

    // 过滤用户
    let filteredUsers = mockUsers;
    if (search) {
      filteredUsers = mockUsers.filter(user => 
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.phone.includes(search) ||
        user.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 分页
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // 构建响应
    const response = {
      data: {
        content: paginatedUsers,
        total: filteredUsers.length,
        pageable: {
          pageNumber: page,
          pageSize: size,
          totalElements: filteredUsers.length,
          totalPages: Math.ceil(filteredUsers.length / size)
        }
      },
      code: 200,
      msg: 'OK'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('模拟用户API错误:', error);
    return NextResponse.json(
      { error: '获取用户列表失败' },
      { status: 500 }
    );
  }
}
