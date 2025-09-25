'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/lib/stores/user-store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  User,
  Lock,
  FileText,
  Save,
  Eye,
  EyeOff,
  Loader2,
  Edit,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  updateUserAction,
  updateUserPasswordAction,
  getAvatarPresignedUrlAction,
  uploadAvatarAction,
  getUserDetailAction,
  type UserManagementData,
} from '@/lib/actions/user-actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumb } from '@/components/breadcrumb';

export default function AccountSettingsPage() {
  const { user, isLoggedIn, updateUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userDetail, setUserDetail] = useState<UserManagementData | null>(null);
  const [isProfileEditMode, setIsProfileEditMode] = useState(false);
  const [isPasswordEditMode, setIsPasswordEditMode] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // 个人信息表单状态
  const [profileForm, setProfileForm] = useState({
    username: '',
    nick_name: '',
    email: '',
    phone: '',
    remark: '',
  });

  // 密码修改表单状态
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // 获取用户详细信息
  useEffect(() => {
    const fetchUserDetail = async () => {
      if (!user?.id) {
        setIsLoadingUserData(false);
        return;
      }

      try {
        const result = await getUserDetailAction(user.id);
        if (result.success && result.data) {
          // 转换API数据为UserManagementData格式
          const userManagementData: UserManagementData = {
            ...result.data,
            user_privileges: (result.data.user_privileges || []).map(
              (p: unknown) => String(p)
            ),
          };
          setUserDetail(userManagementData);
          // 预填表单数据
          setProfileForm({
            username: result.data.user.username || '',
            nick_name: result.data.user.nick_name || '',
            email: result.data.user.email || '',
            phone: result.data.user.phone || '',
            remark: result.data.user.remark || '',
          });

          // 获取头像
          if (result.data.user.avatar_url) {
            getAvatarPresignedUrlAction(result.data.user.avatar_url)
              .then(avatarResponse => {
                if (avatarResponse.success && avatarResponse.data) {
                  setAvatarUrl(avatarResponse.data.presignedUrl);
                }
              })
              .catch(() => {
                console.error('获取头像失败');
              });
          }
        } else {
          toast.error('获取用户信息失败');
        }
      } catch {
        toast.error('获取用户信息失败');
      } finally {
        setIsLoadingUserData(false);
      }
    };

    if (isLoggedIn && user) {
      fetchUserDetail();
    } else {
      setIsLoadingUserData(false);
    }
  }, [user, isLoggedIn]);

  if (!isLoggedIn || !user) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Card className='w-96'>
          <CardContent className='pt-6'>
            <p className='text-center text-muted-foreground'>
              请先登录以访问个人设置
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleProfileUpdate = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await updateUserAction(user.id, {
        username: profileForm.username,
        nick_name: profileForm.nick_name,
        email: profileForm.email,
        phone: profileForm.phone,
        remark: profileForm.remark,
      });

      if (result.success) {
        toast.success('个人信息更新成功');
        // 同步更新 user-store 中的用户信息
        updateUser({
          ...user,
          username: profileForm.username,
          email: profileForm.email,
        });
        // 退出编辑模式
        setIsProfileEditMode(false);
      } else {
        toast.error(result.error || '更新失败');
      }
    } catch {
      toast.error('更新失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!user?.id) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('新密码与确认密码不匹配');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('新密码长度至少为6位');
      return;
    }

    setIsLoading(true);
    try {
      // 这里需要对密码进行加密处理，实际项目中应该使用适当的加密方法
      const result = await updateUserPasswordAction({
        user_id: user.id,
        password_encrypted: passwordForm.newPassword, // 实际应该加密
      });

      if (result.success) {
        toast.success('密码修改成功');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        // 退出编辑模式
        setIsPasswordEditMode(false);
      } else {
        toast.error(result.error || '密码修改失败');
      }
    } catch {
      toast.error('密码修改失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 头像上传处理函数
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    // 验证文件大小（限制为1MB）
    if (file.size > 1 * 1024 * 1024) {
      toast.error('图片大小不能超过1MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const result = await uploadAvatarAction(file, user.id);

      if (result.success && result.data) {
        toast.success('头像上传成功');

        // 获取新头像的预签名URL
        const avatarResult = await getAvatarPresignedUrlAction(
          result.data.avatar_oss_key
        );
        if (avatarResult.success && avatarResult.data) {
          setAvatarUrl(avatarResult.data.presignedUrl);
        }

        // 重新获取用户详细信息以更新头像
        if (user?.id) {
          const userDetailResult = await getUserDetailAction(user.id);
          if (userDetailResult.success && userDetailResult.data) {
            const userManagementData: UserManagementData = {
              ...userDetailResult.data,
              user_privileges: (
                userDetailResult.data.user_privileges || []
              ).map((p: unknown) => String(p)),
            };
            setUserDetail(userManagementData);
          }
        }
      } else {
        toast.error(result.error || '头像上传失败');
      }
    } catch {
      toast.error('头像上传失败，请稍后重试');
    } finally {
      setIsUploadingAvatar(false);
      // 清空input值，允许重复选择同一文件
      event.target.value = '';
    }
  };

  return (
    <>
      <div className='flex h-16 items-center border-b px-4'>
        <SidebarTrigger />
        <Breadcrumb />
      </div>
      <div className='p-6 space-y-6'>
        {/* 个人信息部分 */}
        <Card>
          <CardHeader>
            <div className='flex justify-between items-start'>
              <div>
                <CardTitle className='flex items-center space-x-2'>
                  <User className='h-5 w-5' />
                  <span>个人信息</span>
                </CardTitle>
                <CardDescription>管理您的个人资料信息</CardDescription>
              </div>
              <div className='flex gap-2'>
                {!isProfileEditMode ? (
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() => setIsProfileEditMode(true)}
                  >
                    <Edit className='h-4 w-4' />
                  </Button>
                ) : (
                  <>
                    <Button
                      variant='outline'
                      onClick={() => {
                        setIsProfileEditMode(false);
                        // 重置表单数据
                        if (userDetail) {
                          setProfileForm({
                            username: userDetail.user.username || '',
                            nick_name: userDetail.user.nick_name || '',
                            email: userDetail.user.email || '',
                            phone: userDetail.user.phone || '',
                            remark: userDetail.user.remark || '',
                          });
                        }
                      }}
                      disabled={isLoading}
                    >
                      取消
                    </Button>
                    <Button
                      onClick={handleProfileUpdate}
                      disabled={isLoading || isLoadingUserData}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          保存中...
                        </>
                      ) : (
                        <>
                          <Save className='mr-2 h-4 w-4' />
                          保存
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* 头像显示区域 */}
            <div className='flex items-center space-x-4 pt-4'>
              <div className='relative'>
                <Avatar className='h-16 w-16'>
                  {avatarUrl && (
                    <AvatarImage
                      src={avatarUrl}
                      alt={`${userDetail?.user.username}的头像`}
                    />
                  )}
                  <AvatarFallback className='bg-primary/10 text-primary text-lg font-medium'>
                    {userDetail?.user.username?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                {/* 头像上传按钮 */}
                <Button
                  size='sm'
                  variant='outline'
                  className='absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0'
                  onClick={() =>
                    document.getElementById('avatar-upload')?.click()
                  }
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? (
                    <Loader2 className='h-3 w-3 animate-spin' />
                  ) : (
                    <Upload className='h-3 w-3' />
                  )}
                </Button>
                {/* 隐藏的文件输入框 */}
                <input
                  id='avatar-upload'
                  type='file'
                  accept='image/*'
                  onChange={handleAvatarUpload}
                  className='hidden'
                />
              </div>
              <div className='flex flex-col'>
                <span className='font-medium text-lg'>
                  {userDetail?.user.username || '用户名'}
                </span>
                <span className='text-sm text-muted-foreground'>
                  {userDetail?.user.nick_name || '暂无昵称'}
                </span>
                <span className='text-xs text-muted-foreground mt-1'>
                  点击头像右下角按钮上传新头像
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            {isLoadingUserData ? (
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-10 w-full' />
                  </div>
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-12' />
                    <Skeleton className='h-10 w-full' />
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-12' />
                    <Skeleton className='h-10 w-full' />
                  </div>
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-10 w-full' />
                  </div>
                </div>
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-12' />
                  <Skeleton className='h-10 w-full' />
                </div>
              </div>
            ) : (
              <>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='username'>用户名</Label>
                    <div className='px-3 py-2 text-sm bg-muted/30 rounded-md'>
                      {profileForm.username || '-'}
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='nickname'>昵称</Label>
                    {isProfileEditMode ? (
                      <Input
                        id='nickname'
                        value={profileForm.nick_name}
                        onChange={e =>
                          setProfileForm(prev => ({
                            ...prev,
                            nick_name: e.target.value,
                          }))
                        }
                        placeholder='请输入昵称'
                        disabled={isLoading}
                      />
                    ) : (
                      <div className='px-3 py-2 text-sm bg-muted/30 rounded-md'>
                        {profileForm.nick_name || '-'}
                      </div>
                    )}
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='email'>邮箱</Label>
                    {isProfileEditMode ? (
                      <Input
                        id='email'
                        type='email'
                        value={profileForm.email}
                        onChange={e =>
                          setProfileForm(prev => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder='请输入邮箱地址'
                        disabled={isLoading}
                      />
                    ) : (
                      <div className='px-3 py-2 text-sm bg-muted/30 rounded-md'>
                        {profileForm.email || '-'}
                      </div>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='phone'>手机号</Label>
                    {isProfileEditMode ? (
                      <Input
                        id='phone'
                        value={profileForm.phone}
                        onChange={e =>
                          setProfileForm(prev => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder='请输入手机号'
                        disabled={isLoading}
                      />
                    ) : (
                      <div className='px-3 py-2 text-sm bg-muted/30 rounded-md'>
                        {profileForm.phone || '-'}
                      </div>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='remark'>备注</Label>
                  {isProfileEditMode ? (
                    <Input
                      id='remark'
                      value={profileForm.remark}
                      onChange={e =>
                        setProfileForm(prev => ({
                          ...prev,
                          remark: e.target.value,
                        }))
                      }
                      placeholder='请输入备注信息'
                      disabled={isLoading}
                    />
                  ) : (
                    <div className='px-3 py-2 text-sm bg-muted/30 rounded-md min-h-[40px]'>
                      {profileForm.remark || '暂无备注信息'}
                    </div>
                  )}
                </div>
              </>
            )}

            <Separator />

            <div className='space-y-2'>
              <Label>账户信息</Label>
              {isLoadingUserData ? (
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-4 w-1/2' />
                </div>
              ) : (
                <>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <span className='text-muted-foreground'>用户ID：</span>
                      <span className='font-mono'>{user.id}</span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>注册时间：</span>
                      <span>
                        {user.registered_at
                          ? new Date(user.registered_at).toLocaleDateString(
                              'zh-CN'
                            )
                          : '-'}
                      </span>
                    </div>
                  </div>
                  {userDetail?.user_roles &&
                    userDetail.user_roles.length > 0 && (
                      <div className='space-y-2'>
                        <span className='text-muted-foreground'>
                          用户角色：
                        </span>
                        <div className='flex flex-wrap gap-2'>
                          {userDetail.user_roles.map(
                            (
                              role: { role_name?: string; name?: string },
                              index: number
                            ) => (
                              <Badge key={index} variant='secondary'>
                                {role.role_name || role.name || '未知角色'}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  {userDetail?.user_groups &&
                    userDetail.user_groups.length > 0 && (
                      <div className='space-y-2'>
                        <span className='text-muted-foreground'>用户组：</span>
                        <div className='flex flex-wrap gap-2'>
                          {userDetail.user_groups.map((group, index) => (
                            <Badge key={index} variant='outline'>
                              {group.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 修改密码部分 */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center space-x-2'>
                  <Lock className='h-5 w-5' />
                  修改密码
                </CardTitle>
                <CardDescription>为了账户安全，请定期更换密码</CardDescription>
              </div>
              <div className='flex items-center space-x-2'>
                {isPasswordEditMode ? (
                  <>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        setIsPasswordEditMode(false);
                        setPasswordForm({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        });
                      }}
                      disabled={isLoading}
                    >
                      取消
                    </Button>
                    <Button
                      size='sm'
                      onClick={handlePasswordUpdate}
                      disabled={
                        isLoading ||
                        !passwordForm.currentPassword ||
                        !passwordForm.newPassword ||
                        !passwordForm.confirmPassword
                      }
                    >
                      {isLoading ? (
                        <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      ) : (
                        <Save className='h-4 w-4 mr-2' />
                      )}
                      {isLoading ? '保存中...' : '保存'}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setIsPasswordEditMode(true)}
                    className='h-8 w-8 p-0'
                  >
                    <Edit className='h-4 w-4' />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            {isPasswordEditMode ? (
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='currentPassword'>当前密码</Label>
                  <div className='relative'>
                    <Input
                      id='currentPassword'
                      type={showPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={e =>
                        setPasswordForm(prev => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      placeholder='请输入当前密码'
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className='h-4 w-4' />
                      ) : (
                        <Eye className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='newPassword'>新密码</Label>
                  <div className='relative'>
                    <Input
                      id='newPassword'
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={e =>
                        setPasswordForm(prev => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      placeholder='请输入新密码（至少6位）'
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className='h-4 w-4' />
                      ) : (
                        <Eye className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='confirmPassword'>确认新密码</Label>
                  <div className='relative'>
                    <Input
                      id='confirmPassword'
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={e =>
                        setPasswordForm(prev => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      placeholder='请再次输入新密码'
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className='h-4 w-4' />
                      ) : (
                        <Eye className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                </div>

                <div className='bg-muted/50 p-4 rounded-lg'>
                  <h4 className='text-sm font-medium mb-2'>密码安全提示：</h4>
                  <ul className='text-sm text-muted-foreground space-y-1'>
                    <li>• 密码长度至少6位</li>
                    <li>• 建议包含大小写字母、数字和特殊字符</li>
                    <li>• 不要使用容易猜测的密码</li>
                    <li>• 定期更换密码以保证账户安全</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className='px-3 py-8 text-center text-muted-foreground'>
                <Lock className='h-8 w-8 mx-auto mb-2 opacity-50' />
                <p>点击右上角的编辑按钮来修改密码</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 用户协议与隐私政策部分 */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <FileText className='h-5 w-5' />
              <span>用户协议与隐私政策</span>
            </CardTitle>
            <CardDescription>查看我们的服务条款和隐私保护政策</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='p-4 border rounded-lg hover:bg-muted/50 transition-colors'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='font-medium'>用户服务协议</h3>
                    <p className='text-sm text-muted-foreground mt-1'>
                      了解平台服务条款、用户权利和义务
                    </p>
                  </div>
                  <Button variant='outline' size='sm' asChild>
                    <a href='#' target='_blank' rel='noopener noreferrer'>
                      <ExternalLink className='h-4 w-4 mr-2' />
                      查看
                    </a>
                  </Button>
                </div>
              </div>

              <div className='p-4 border rounded-lg hover:bg-muted/50 transition-colors'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='font-medium'>隐私保护政策</h3>
                    <p className='text-sm text-muted-foreground mt-1'>
                      了解我们如何收集、使用和保护您的个人信息
                    </p>
                  </div>
                  <Button variant='outline' size='sm' asChild>
                    <a href='#' target='_blank' rel='noopener noreferrer'>
                      <ExternalLink className='h-4 w-4 mr-2' />
                      查看
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <div className='bg-muted/50 p-4 rounded-lg'>
              <p className='text-sm text-muted-foreground'>
                <strong>重要提示：</strong>
                使用本平台即表示您已阅读并同意遵守我们的用户服务协议和隐私保护政策。如有疑问，请联系客服。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}