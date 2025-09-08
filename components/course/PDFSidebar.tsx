"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { pdfjs } from "react-pdf";
import { Loader2 } from "lucide-react";

interface PDFSidebarProps {
  pdfDocument: any;
  currentPage: number;
  onPageClick: (pageNumber: number) => void;
}

interface PDFThumbnail {
  pageNumber: number;
  url: string;
}

export function PDFSidebar({
  pdfDocument,
  currentPage,
  onPageClick,
}: PDFSidebarProps) {
  const [thumbnails, setThumbnails] = React.useState<PDFThumbnail[]>([]);
  const [bookmarks, setBookmarks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  // 加载缩略图
  React.useEffect(() => {
    const loadThumbnails = async () => {
      if (!pdfDocument) return;

      setLoading(true);
      const thumbs: PDFThumbnail[] = [];

      try {
        for (let i = 1; i <= pdfDocument.numPages; i++) {
          const page = await pdfDocument.getPage(i);
          const viewport = page.getViewport({ scale: 0.2 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (context) {
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
              canvasContext: context,
              viewport,
            }).promise;

            thumbs.push({
              pageNumber: i,
              url: canvas.toDataURL(),
            });
          }
        }
      } catch (error) {
        console.error("Error generating thumbnails:", error);
      }

      setThumbnails(thumbs);
      setLoading(false);
    };

    loadThumbnails();
  }, [pdfDocument]);

  // 加载书签
  React.useEffect(() => {
    const loadBookmarks = async () => {
      if (!pdfDocument) return;
      try {
        const outline = await pdfDocument.getOutline();
        setBookmarks(outline || []);
      } catch (error) {
        console.error("Error loading bookmarks:", error);
        setBookmarks([]);
      }
    };

    loadBookmarks();
  }, [pdfDocument]);

  // 处理书签点击
  const handleBookmarkClick = async (bookmark: any) => {
    if (!pdfDocument) return;

    try {
      let pageIndex: number | undefined;

      // 处理不同类型的书签目标
      if (bookmark.dest) {
        if (typeof bookmark.dest === "string") {
          // 命名目标
          const destination = await pdfDocument.getDestination(bookmark.dest);
          if (destination) {
            pageIndex = await pdfDocument.getPageIndex(destination[0]);
          }
        } else if (Array.isArray(bookmark.dest)) {
          // 显式目标
          pageIndex = await pdfDocument.getPageIndex(bookmark.dest[0]);
        }
      } else if (bookmark.pageNumber) {
        // 直接页码
        pageIndex = bookmark.pageNumber - 1;
      }

      if (typeof pageIndex === "number") {
        onPageClick(pageIndex + 1);
      }
    } catch (error) {
      console.error("Error navigating to bookmark:", error);
    }
  };

  return (
    <div className="w-64 border-r bg-muted">
      <Tabs defaultValue="thumbnails">
        <TabsList className="w-full p-2">
          <TabsTrigger value="thumbnails" className="flex-1 bg-transparent">
            缩略图
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="flex-1 bg-transparent">
            书签
          </TabsTrigger>
        </TabsList>

        <TabsContent value="thumbnails">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">生成缩略图中...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {thumbnails.map(thumb => (
                  <div
                    key={thumb.pageNumber}
                    className={`w-full flex flex-col items-center p-1 rounded ${
                      currentPage === thumb.pageNumber ? "bg-primary/10" : ""
                    }`}
                  >
                    <img
                      src={thumb.url}
                      alt={`Page ${thumb.pageNumber}`}
                      className="w-48 border cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => onPageClick(thumb.pageNumber)}
                    />
                    <span className="text-sm mt-1">
                      第 {thumb.pageNumber} 页
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="bookmarks">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="p-4">
              {bookmarks.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  没有可用的书签
                </div>
              ) : (
                <div className="space-y-2">
                  {bookmarks.map((bookmark, index) => (
                    <button
                      key={index}
                      onClick={() => handleBookmarkClick(bookmark)}
                      className="text-sm hover:text-primary w-full text-left py-1 px-2 rounded hover:bg-primary/10"
                    >
                      {bookmark.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
} 