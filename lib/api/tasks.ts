// 碳交易模拟实验任务API接口
import { useUserStore } from "@/lib/stores/user-store";

// 历史任务接口类型定义
export interface HistoryTask {
  task_id: string;
  app_id: string;
  user_id: string;
  task_title: string;
  task_input: {
    content: string;
  };
  task_output: unknown;
  task_type: string;
  task_status: string;
  created_at: string;
  updated_at: string;
}

export interface HistoryResponse {
  content(content: unknown): unknown;
  data: {
    total: number;
    content: HistoryTask[];
    pageable: {
      sort: {
        orders: Array<{
          direction: string;
          property: string;
          ignoreCase: boolean;
          nullHandling: string;
        }>;
      };
      pageNumber: number;
      pageSize: number;
    };
  };
  code: number;
  msg: string;
}

// 获取历史查询列表
export async function fetchHistoryTasks(taskStatus?: string): Promise<HistoryResponse> {
  const { apiGetWithAuth } = await import("@/lib/api/base");

  try {
    // 动态获取用户ID - 从userStore获取
    const userStore = await useUserStore.getState();
    const user = userStore.user;

    const params: any = {
      page: "0",
      size: "10",
      sort: "createdAt,desc",
      user_ids: user?.id || "",
    };

    // 如果指定了task_status，则添加到查询参数中
    if (taskStatus) {
      params.task_status = taskStatus;
    }

    const response = await apiGetWithAuth<HistoryResponse>(
      "/user-task/v1/tasks",
      params
    );

    if (response.code === 200 && response.data) {
      return response.data;
    } else {
      throw new Error(response.msg || "获取历史记录失败");
    }
  } catch (error) {
    console.error("获取历史记录失败:", error);
    throw error;
  }
}

// 获取所有任务记录（用于过滤碳交易模拟实验）
export async function fetchCarbonTradingTasks(): Promise<HistoryResponse> {
  const { apiGetWithAuth } = await import("@/lib/api/base");

  try {
    // 动态获取用户ID - 从userStore获取
    const userStore = await useUserStore.getState();
    const user = userStore.user;

    if (!user || !user.id) {
      throw new Error("用户未登录或用户信息不完整");
    }

    const response = await apiGetWithAuth<HistoryResponse>(
      "/user-task/v1/tasks",
      {
        page: "0",
        size: "10",
        sort: "createdAt,desc",
        user_ids: user.id,
        task_status: "",
      }
    );

    if (response.code === 200 && response.data) {
      return response.data;
    } else {
      throw new Error(response.msg || "获取实验记录失败");
    }
  } catch (error) {
    console.error("获取实验记录失败:", error);
    throw error;
  }
}

// 保存任务数据接口
export async function saveTaskData(taskData: {
  task_title: string;
  task_input: {
    content: string;
  };
  task_output: Record<string, unknown>;
  task_type: string;
  task_status: string;
}): Promise<{
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}> {
  const { apiPostWithAuth } = await import("@/lib/api/base");

  try {
    // 动态获取用户ID - 从userStore获取
    const userStore = await useUserStore.getState();
    const user = userStore.user;

    if (!user || !user.id) {
      throw new Error("用户未登录或用户信息不完整");
    }

    const requestData = {
      user_id: user.id,
      ...taskData,
    };

    const response = await apiPostWithAuth("/user-task/v1/tasks", requestData);

    if (response.code === 200) {
      return { success: true, data: response.data as Record<string, unknown> };
    } else {
      return { success: false, error: response.msg || "保存失败" };
    }
  } catch (error) {
    console.error("保存任务数据失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "保存任务数据时发生错误",
    };
  }
}