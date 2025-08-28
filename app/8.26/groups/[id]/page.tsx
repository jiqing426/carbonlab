'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ArrowLeft,
  Search,
  Plus,
  MoreHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit,
  Save,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getUsers } from '@/lib/api/users';
import {
  addMembersToUserGroup,
  getUserGroup,
  getUserGroupMembers,
  removeMembersFromUserGroup,
  updateUserGroup,
  UpdateUserGroupRequest,
} from '@/lib/api/user-groups';
import type { AppUser, UsersResponse, UserGroup } from '@/types/tale';
import { useTale } from '@/lib/contexts/TaleContext';

// 用户组成员接口
interface UserGroupMember {
  id: string;
  username: string;
  phone: string;
  userGroup: string;
  joinDate: string;
}

// 用户组信息表单验证
const userGroupFormSchema = z.object({
  name: z.string().min(2, { message: '用户组名称至少需要2个字符' }),
  description: z.string().optional(),
  remark: z.string().optional(),
});

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumb } from '@/components/breadcrumb';

export default function UserGroupMembers() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentApp } = useTale();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMemberSidebar, setShowAddMemberSidebar] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [members, setMembers] = useState<UserGroupMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // 用户组信息编辑相关状态
  const [groupInfo, setGroupInfo] = useState<UserGroup | null>(null);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [groupLoading, setGroupLoading] = useState(false);

  // 批量移除相关状态
  const [batchRemoveMode, setBatchRemoveMode] = useState(false);
  const [selectedMembersForRemoval, setSelectedMembersForRemoval] = useState<
    string[]
  >([]);

  // 用户列表相关状态
  const [usersData, setUsersData] = useState<UsersResponse>({
    total: 0,
    content: [],
    pageable: {
      sort: { orders: [] },
      pageNumber: 0,
      pageSize: 10,
    },
  });
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const groupId = params.id as string;
  const groupName = searchParams.get('groupName') || '用户组';

  // 用户组信息编辑表单
  const groupForm = useForm<z.infer<typeof userGroupFormSchema>>({
    resolver: zodResolver(userGroupFormSchema),
    defaultValues: {
      name: '',
      description: '',
      remark: '',
    },
  });

  // API 返回的用户组成员数据结构
  interface ApiUserGroupMember {
    userId?: string;
    username?: string;
    phone?: string;
    isFrozen?: boolean;
    createdAt?: string;
  }

  // 成员列表分页相关状态
  const [membersCurrentPage, setMembersCurrentPage] = useState(0);
  const [membersTotalPages, setMembersTotalPages] = useState(0);
  const [membersTotal, setMembersTotal] = useState(0);
  const membersPageSize = 10;

  // 加载用户组信息
  const loadGroupInfo = useCallback(async () => {
    if (!currentApp?.app_key) {
      console.log('No app key available');
      return;
    }

    try {
      setGroupLoading(true);
      // 调用API获取用户组详情
      const groupData = await getUserGroup(groupId, currentApp.app_key);
      
      setGroupInfo(groupData);
      // 更新表单默认值
      groupForm.reset({
        name: groupData.name,
        description: groupData.description || '',
        remark: groupData.remark || '',
      });
    } catch (error) {
      console.error('Failed to load group info:', error);
      toast.error('无法加载用户组信息');
    } finally {
      setGroupLoading(false);
    }
  }, [groupId, currentApp?.app_key, groupForm]);

  // 修改 loadMembers 函数支持分页
  const loadMembers = useCallback(
    async (page: number = 0) => {
      if (!currentApp?.app_key) {
        console.log('No app key available');
        return;
      }

      try {
        setMembersLoading(true);
        const response = await getUserGroupMembers(
          groupId,
          page,
          membersPageSize,
          currentApp.app_key
        );
        console.log('getUserGroupMembers response:', response);
        if (response && response.data && Array.isArray(response.data.content)) {
          const transformedMembers: UserGroupMember[] =
            response.data.content.map((member: ApiUserGroupMember) => ({
              id: member.userId || '',
              username: member.username || '未知用户',
              phone: member.phone || '未知',
              userGroup: member.isFrozen ? '已冻结' : '正常',
              joinDate: member.createdAt
                ? new Date(member.createdAt).toLocaleDateString('zh-CN')
                : '未知',
            }));
          setMembers(transformedMembers);
          setMembersTotal(response.data.total);
          setMembersTotalPages(
            Math.ceil(response.data.total / membersPageSize)
          );
          setMembersCurrentPage(page);
        } else {
          console.warn('Invalid members data structure:', response);
          setMembers([]);
          setMembersTotal(0);
          setMembersTotalPages(0);
        }
      } catch (error) {
        console.error('Failed to load members:', error);
        setMembers([]);
        setMembersTotal(0);
        setMembersTotalPages(0);
      } finally {
        setMembersLoading(false);
      }
    },
    [groupId, membersPageSize, currentApp?.app_key]
  );

  // 加载用户列表（用于添加成员）
  const loadUsers = useCallback(async () => {
    if (!currentApp?.app_key) {
      console.log('No app key available');
      return;
    }
    setUsersLoading(true);
    try {
      const response = await getUsers(
        {
          page: currentPage,
          size: pageSize,
        },
        currentApp.app_key
      );
      setUsersData(response);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('无法加载用户组成员列表');
    } finally {
      setUsersLoading(false);
    }
  }, [currentPage, pageSize, currentApp?.app_key]);

  useEffect(() => {
    loadGroupInfo();
    loadMembers();
  }, [loadGroupInfo, loadMembers]);

  useEffect(() => {
    if (showAddMemberSidebar) {
      loadUsers();
    }
  }, [loadUsers, showAddMemberSidebar]);

  // 初始化选中的用户（当前成员）
  useEffect(() => {
    const currentMemberIds = members.map(member => member.id);
    setSelectedUsers(currentMemberIds);
  }, [members]);

  // 编辑用户组信息
  const onGroupEditSubmit = async (
    values: z.infer<typeof userGroupFormSchema>
  ) => {
    if (!currentApp?.app_key) {
      toast.error('未选择应用，无法更新用户组');
      return;
    }

    try {
      await updateUserGroup(
        groupId,
        values as UpdateUserGroupRequest,
        currentApp.app_key
      );
      toast.success(`用户组 "${values.name}" 已成功更新。`);
      setIsEditingGroup(false);
      loadGroupInfo(); // 重新加载用户组信息
    } catch (error) {
      console.error('Failed to update user group:', error);
      toast.error('更新用户组失败，请稍后重试');
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setIsEditingGroup(false);
    // 重置表单到原始值
    if (groupInfo) {
      groupForm.reset({
        name: groupInfo.name || '',
        description: groupInfo.description || '',
        remark: groupInfo.remark || '',
      });
    }
  };

  const filteredMembers = members.filter(
    member =>
      member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm)
  );

  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleAddMembers = async () => {
    // 获取新选中的用户（不是已有成员）
    const newMemberIds = selectedUsers.filter(userId => {
      const user = transformedUsers.find(u => u.id === userId);
      if (!user) return false;
      // 检查用户是否已经在当前用户组中
      return !user.userGroups.some(
        (group: { groupId: string }) => group.groupId === groupId
      );
    });

    if (newMemberIds.length === 0) {
      toast.warning('请选择要添加的新成员');
      return;
    }

    if (!currentApp?.app_key) {
      toast.error('未选择应用，无法添加成员');
      return;
    }

    try {
      await addMembersToUserGroup(groupId, newMemberIds, currentApp.app_key);
      toast.success(`已成功添加 ${newMemberIds.length} 个成员到用户组`);
      setShowAddMemberSidebar(false);
      setCurrentPage(0);
      setUserSearchTerm('');
      // 重新加载成员列表，保持当前页
      loadMembers(membersCurrentPage);
    } catch (error) {
      console.error('Failed to add members:', error);
      toast.error('添加成员到用户组失败');
    }
  };

  // 转换用户数据格式
  const transformedUsers = usersData.content.map((apiUser: AppUser) => ({
    id: apiUser.user.user_id,
    username: apiUser.user.username || '',
    phone: apiUser.user.phone || '',
    role: apiUser.user_roles.length > 0 ? apiUser.user_roles[0] : '用户',
    // 添加用户组信息
    userGroups: apiUser.user_groups || [],
  }));

  // 前端搜索过滤
  const filteredUsers = transformedUsers.filter(user => {
    if (!userSearchTerm) return true;
    const searchLower = userSearchTerm.toLowerCase();
    return (
      user.username.toLowerCase().includes(searchLower) ||
      user.phone.toLowerCase().includes(searchLower) ||
      (typeof user.role === 'string'
        ? user.role.toLowerCase()
        : String(user.role).toLowerCase()
      ).includes(searchLower)
    );
  });

  const totalPages = Math.ceil(usersData.total / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleUserSearchChange = (value: string) => {
    setUserSearchTerm(value);
  };

  // 添加一个处理关闭侧边栏的函数
  const handleCloseSidebar = () => {
    setShowAddMemberSidebar(false);
    // 保持selectedUsers状态，不清空
  };

  // 批量移除相关函数
  const handleToggleBatchRemoveMode = () => {
    setBatchRemoveMode(!batchRemoveMode);
    setSelectedMembersForRemoval([]);
  };

  const handleMemberSelectionForRemoval = (
    memberId: string,
    checked: boolean
  ) => {
    if (checked) {
      setSelectedMembersForRemoval(prev => [...prev, memberId]);
    } else {
      setSelectedMembersForRemoval(prev => prev.filter(id => id !== memberId));
    }
  };

  const handleSelectAllMembers = (checked: boolean) => {
    if (checked) {
      setSelectedMembersForRemoval(filteredMembers.map(member => member.id));
    } else {
      setSelectedMembersForRemoval([]);
    }
  };
  //单独移除成员
  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!currentApp?.app_key) {
      toast.error('未选择应用，无法移除成员');
      return;
    }

    try {
      await removeMembersFromUserGroup(groupId, [memberId], currentApp.app_key);
      toast.success(`已成功从用户组移除成员 "${memberName}"`);
      // 重新加载成员列表，保持当前页
      loadMembers(membersCurrentPage);
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error('从用户组移除成员失败，请稍后重试');
    }
  };
  //批量移除成员
  const handleBatchRemoveMembers = async () => {
    if (selectedMembersForRemoval.length === 0) {
      toast.warning('请选择要移除的成员');
      return;
    }

    if (!currentApp?.app_key) {
      toast.error('未选择应用，无法移除成员');
      return;
    }

    try {
      await removeMembersFromUserGroup(
        groupId,
        selectedMembersForRemoval,
        currentApp.app_key
      );
      toast.success(`已成功从用户组移除 ${selectedMembersForRemoval.length} 个成员`);
      setSelectedMembersForRemoval([]);
      setBatchRemoveMode(false);
      // 重新加载成员列表，保持当前页
      loadMembers(membersCurrentPage);
    } catch (error) {
      console.error('Failed to batch remove members:', error);
      toast.error('从用户组批量移除成员失败，请稍后重试');
    }
  };

  return (
    <>
      <div className='flex h-16 items-center border-b px-4'>
        <SidebarTrigger />
        <Breadcrumb />
      </div>
      <div className='mx-auto p-6'>
        <div className='mb-8 flex items-center gap-4'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => router.push('/dashboard/users/groups')}
          >
            <ArrowLeft className='h-10 w-10 ' />
          </Button>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>
              {groupName} - 用户组成员管理
            </h1>
          </div>
        </div>

        {/* 用户组信息编辑区域 */}
        <Card className='mb-6'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>用户组信息</CardTitle>
              {!isEditingGroup ? (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setIsEditingGroup(true)}
                  disabled={groupLoading}
                >
                  <Edit className='h-4 w-4 mr-2' />
                  编辑
                </Button>
              ) : (
                <div className='flex space-x-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleCancelEdit}
                  >
                    <XCircle className='h-4 w-4 mr-2' />
                    取消
                  </Button>
                  <Button
                    type='button'
                    size='sm'
                    disabled={groupForm.formState.isSubmitting}
                    onClick={groupForm.handleSubmit(onGroupEditSubmit)}
                  >
                    <Save className='h-4 w-4 mr-2' />
                    保存
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {groupLoading ? (
              <div className='text-center py-4'>加载中...</div>
            ) : isEditingGroup ? (
              <Form {...groupForm}>
                <form onSubmit={groupForm.handleSubmit(onGroupEditSubmit)} className='space-y-4'>
                  <FormField
                    control={groupForm.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>用户组名称</FormLabel>
                        <FormControl>
                          <Input placeholder='请输入用户组名称' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={groupForm.control}
                    name='description'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>描述</FormLabel>
                        <FormControl>
                          <Input placeholder='请输入描述' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={groupForm.control}
                    name='remark'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>备注</FormLabel>
                        <FormControl>
                          <Input placeholder='请输入备注' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            ) : (
              <div className='space-y-2'>
                <div>
                  <span className='font-medium'>用户组名称：</span>
                  <span>{groupInfo?.name || '未设置'}</span>
                </div>
                <div>
                  <span className='font-medium'>描述：</span>
                  <span>{groupInfo?.description || '未设置'}</span>
                </div>
                <div>
                  <span className='font-medium'>备注：</span>
                  <span>{groupInfo?.remark || '未设置'}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className='bg-white rounded-lg border'>
          <div className='p-6 border-b'>
            <div className='flex gap-4'>
              <div className='flex-1 relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                <Input
                  placeholder='搜索用户组成员...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
              <Button variant='outline'>搜索</Button>
              <Button
                variant={batchRemoveMode ? 'destructive' : 'outline'}
                onClick={handleToggleBatchRemoveMode}
              >
                <Trash2 className='h-4 w-4 mr-2' />
                {batchRemoveMode ? '取消批量移除' : '批量移除'}
              </Button>
              <Button
                className='bg-purple-600 hover:bg-purple-700'
                onClick={() => setShowAddMemberSidebar(true)}
              >
                <Plus className='h-4 w-4 mr-2' />
                添加成员
              </Button>
            </div>

            {/* 批量操作栏 */}
            {batchRemoveMode && (
              <div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <Checkbox
                      checked={
                        selectedMembersForRemoval.length ===
                          filteredMembers.length && filteredMembers.length > 0
                      }
                      onCheckedChange={handleSelectAllMembers}
                    />
                    <span className='text-sm text-gray-700'>
                      已选择 {selectedMembersForRemoval.length} 个成员
                      {selectedMembersForRemoval.length > 0 &&
                        filteredMembers.length > 0 &&
                        ` / 共 ${filteredMembers.length} 个`}
                    </span>
                  </div>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={handleBatchRemoveMembers}
                    disabled={selectedMembersForRemoval.length === 0}
                  >
                    移除选中成员 ({selectedMembersForRemoval.length})
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                {batchRemoveMode && (
                  <TableHead className='w-12'>
                    <Checkbox
                      checked={
                        selectedMembersForRemoval.length ===
                          filteredMembers.length && filteredMembers.length > 0
                      }
                      onCheckedChange={handleSelectAllMembers}
                    />
                  </TableHead>
                )}
                <TableHead>用户名</TableHead>
                <TableHead>手机号</TableHead>
                <TableHead>用户组</TableHead>
                <TableHead>加入日期</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {membersLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={batchRemoveMode ? 6 : 5}
                    className='text-center py-8'
                  >
                    加载中...
                  </TableCell>
                </TableRow>
              ) : filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={batchRemoveMode ? 6 : 5}
                    className='text-center py-8 text-gray-500'
                  >
                    {searchTerm
                      ? '未找到匹配的用户组成员'
                      : '暂无用户组成员数据'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map(member => (
                  <TableRow key={member.id}>
                    {batchRemoveMode && (
                      <TableCell>
                        <Checkbox
                          checked={selectedMembersForRemoval.includes(
                            member.id
                          )}
                          onCheckedChange={checked =>
                            handleMemberSelectionForRemoval(
                              member.id,
                              checked as boolean
                            )
                          }
                        />
                      </TableCell>
                    )}
                    <TableCell className='font-medium'>
                      {member.username}
                    </TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>
                      <Badge variant='secondary'>{member.userGroup}</Badge>
                    </TableCell>
                    <TableCell>{member.joinDate}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='sm'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>编辑权限</DropdownMenuItem>
                          <DropdownMenuItem
                            className='text-red-600'
                            onClick={() =>
                              handleRemoveMember(member.id, member.username)
                            }
                          >
                            移除成员
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {/* 成员列表分页控件 - 临时修改显示条件用于测试 */}
        {membersTotal > 0 && (
          <div className='mt-4 flex items-center justify-between'>
            <div className='text-sm text-gray-600'>
              共 {membersTotal} 个成员，第 {membersCurrentPage + 1} 页，共{' '}
              {membersTotalPages} 页
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  const newPage = membersCurrentPage - 1;
                  setMembersCurrentPage(newPage);
                  loadMembers(newPage);
                }}
                disabled={membersCurrentPage === 0}
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  const newPage = membersCurrentPage + 1;
                  setMembersCurrentPage(newPage);
                  loadMembers(newPage);
                }}
                disabled={membersCurrentPage >= membersTotalPages - 1}
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}
        {/* Add Member Sidebar */}
        {showAddMemberSidebar && (
          <>
            <div
              className='fixed inset-0 bg-black bg-opacity-50 z-40'
              onClick={handleCloseSidebar}
            />
            <div className='fixed right-0 top-0 h-full w-1/2 bg-white z-50 shadow-xl'>
              <div className='p-4 border-b flex items-center justify-between'>
                <div>
                  <h2 className='text-lg font-semibold mb-2'>
                    添加成员到用户组
                  </h2>
                  <p className='text-sm text-muted-foreground mb-4'>
                    选择要添加到此用户组的用户
                  </p>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setShowAddMemberSidebar(false)}
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>

              <div className='p-4'>
                <div className='mb-4'>
                  <Input
                    placeholder='搜索用户...'
                    value={userSearchTerm}
                    onChange={e => handleUserSearchChange(e.target.value)}
                  />
                </div>

                <div className='space-y-2 max-h-80 overflow-y-auto'>
                  {usersLoading ? (
                    <div className='text-center py-8'>加载中...</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className='text-center py-8 text-gray-500'>
                      {userSearchTerm ? '未找到匹配的用户' : '暂无用户数据'}
                    </div>
                  ) : (
                    filteredUsers.map(user => {
                      const isSelected = selectedUsers.includes(user.id);
                      const isMember = user.userGroups.some(
                        (group: { groupId: string }) =>
                          group.groupId === groupId
                      );
                      return (
                        <div
                          key={user.id}
                          className='flex items-center space-x-3 p-2 border rounded-lg'
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={checked =>
                              handleUserSelection(user.id, checked as boolean)
                            }
                          />
                          <div className='flex-1 flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                              <span className='font-medium min-w-0 flex-shrink-0'>
                                {user.username}
                              </span>
                              <span className='text-sm text-gray-600 min-w-0 flex-shrink-0'>
                                {user.phone}
                              </span>
                              <Badge variant='secondary' className='text-xs'>
                                {typeof user.role === 'string'
                                  ? user.role
                                  : String(user.role)}
                              </Badge>
                            </div>
                            <div className='flex items-center gap-2'>
                              {isMember && (
                                <Badge variant='outline' className='text-xs'>
                                  已加入
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* 分页控件 */}
                {totalPages > 1 && (
                  <div className='mt-4 flex items-center justify-between'>
                    <div className='text-sm text-gray-600'>
                      共 {usersData.total} 个用户，第 {currentPage + 1} 页，共{' '}
                      {totalPages} 页
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                      >
                        <ChevronLeft className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                      >
                        <ChevronRight className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className='absolute bottom-0 left-0 right-0 p-4 border-t bg-white'>
                <div className='flex gap-3'>
                  <Button
                    variant='outline'
                    className='flex-1 bg-transparent'
                    onClick={() => setShowAddMemberSidebar(false)}
                  >
                    取消
                  </Button>
                  <Button
                    className='flex-1 bg-purple-600 hover:bg-purple-700'
                    onClick={handleAddMembers}
                  >
                    添加选中成员 (
                    {
                      selectedUsers.filter(
                        id => !members.some(m => m.id === id)
                      ).length
                    }
                    )
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
