import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { repositoryId, fileId, displayTime } = body;

    // 验证必需参数
    if (!repositoryId || !fileId || !displayTime) {
      return NextResponse.json(
        { error: '缺少必需参数：repositoryId, fileId, displayTime' },
        { status: 400 }
      );
    }

    // 验证时间格式（YYYY-MM-DD 或 YYYY/MM/DD）
    const timeRegex = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/;
    if (!timeRegex.test(displayTime)) {
      return NextResponse.json(
        { error: '时间格式不正确，请使用 YYYY-MM-DD 或 YYYY/MM/DD 格式' },
        { status: 400 }
      );
    }

    // 从localStorage获取文件数据（在实际应用中，这里应该从数据库获取）
    const filesData = localStorage.getItem(`files_${repositoryId}`);
    if (!filesData) {
      return NextResponse.json(
        { error: '资料库不存在' },
        { status: 404 }
      );
    }

    let files = JSON.parse(filesData);
    const fileIndex = files.findIndex((file: any) => file.id === fileId);
    
    if (fileIndex === -1) {
      return NextResponse.json(
        { error: '文件不存在' },
        { status: 404 }
      );
    }

    // 更新文件的显示时间
    files[fileIndex].displayTime = displayTime;
    files[fileIndex].updatedAt = new Date().toISOString();

    // 保存更新后的文件数据
    localStorage.setItem(`files_${repositoryId}`, JSON.stringify(files));

    return NextResponse.json({
      success: true,
      message: '文件显示时间更新成功',
      data: {
        fileId,
        displayTime,
        updatedAt: files[fileIndex].updatedAt
      }
    });

  } catch (error) {
    console.error('更新文件显示时间失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const repositoryId = searchParams.get('repositoryId');
    const fileId = searchParams.get('fileId');

    if (!repositoryId || !fileId) {
      return NextResponse.json(
        { error: '缺少必需参数：repositoryId, fileId' },
        { status: 400 }
      );
    }

    // 从localStorage获取文件数据
    const filesData = localStorage.getItem(`files_${repositoryId}`);
    if (!filesData) {
      return NextResponse.json(
        { error: '资料库不存在' },
        { status: 404 }
      );
    }

    const files = JSON.parse(filesData);
    const file = files.find((f: any) => f.id === fileId);
    
    if (!file) {
      return NextResponse.json(
        { error: '文件不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        fileId: file.id,
        fileName: file.fileName,
        displayTime: file.displayTime || file.createdAt,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt
      }
    });

  } catch (error) {
    console.error('获取文件显示时间失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

