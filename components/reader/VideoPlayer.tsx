'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// 动态导入 Plyr 以避免 SSR 问题
const Plyr = dynamic(() => import('plyr-react'), {
  ssr: false,
  loading: () => (
    <div className='flex items-center justify-center h-64 bg-muted rounded-lg'>
      <div className='text-center'>
        <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
        <p className='text-muted-foreground'>正在加载播放器...</p>
      </div>
    </div>
  ),
});

// CSS 将在组件加载时自动导入

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type APITypes = any; // 临时类型定义，避免 SSR 问题

interface VideoPlayerProps {
  src?: string;
  poster?: string;
}

export function VideoPlayer({ src, poster }: VideoPlayerProps) {
  const [videoSrc, setVideoSrc] = useState<string | null>(src || null);
  const [videoPoster, setVideoPoster] = useState<string | null>(poster || null);
  const plyrRef = useRef<APITypes>(null);

  // 当传入的 src 或 poster 改变时更新状态
  useEffect(() => {
    if (src) {
      setVideoSrc(src);
    }
    if (poster) {
      setVideoPoster(poster);
    }
  }, [src, poster]);

  // Plyr 配置
  const plyrOptions = {
    controls: [
      'play-large', // 播放按钮
      'play', // 播放/暂停按钮
      'progress', // 进度条
      'current-time', // 当前时间
      'duration', // 总时长
      'mute', // 静音按钮
      'volume', // 音量控制
      'settings', // 设置按钮
      'pip', // 画中画
      'fullscreen', // 全屏按钮
    ],
    i18n: {
      restart: '重新开始',
      play: '播放',
      pause: '暂停',
      fastForward: '快进',
      rewind: '快退',
      seek: '跳转',
      played: '已播放',
      buffered: '已缓冲',
      currentTime: '当前时间',
      duration: '总时长',
      volume: '音量',
      mute: '静音',
      unmute: '取消静音',
      enableCaptions: '启用字幕',
      disableCaptions: '禁用字幕',
      enterFullscreen: '全屏',
      exitFullscreen: '退出全屏',
      frameTitle: '视频播放器',
      captions: '字幕',
      settings: '设置',
      speed: '速度',
      normal: '正常',
      quality: '质量',
      loop: '循环',
      start: '开始',
      end: '结束',
      all: '全部',
      reset: '重置',
      disabled: '禁用',
      advertisement: '广告',
      pip: '画中画',
    },
  };

  return (
    <div className='flex flex-col w-full'>
      {/* 视频播放区域 */}
      <div className='flex-1 overflow-hidden border rounded-md bg-black min-h-[500px]'>
        {videoSrc ? (
          <Plyr
            ref={plyrRef}
            source={{
              type: 'video',
              sources: [
                {
                  src: videoSrc,
                  type: 'video/mp4', // 默认类型，实际会根据视频自动检测
                },
              ],
              poster: videoPoster || undefined,
            }}
            options={plyrOptions}
          />
        ) : (
          <div className='flex flex-col items-center justify-center h-full text-white'>
            <p>暂无视频内容</p>
          </div>
        )}
      </div>
    </div>
  );
}

// 修复 ESLint 警告：将对象赋值给变量后再导出
const VideoPlayerModule = { VideoPlayer };
export default VideoPlayerModule;