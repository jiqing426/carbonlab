import { Course, courses, modules, getCourse } from "@/lib/database";

// 课程进度记录类型
export interface ProgressRecord {
  completedLessons: string[];
  completedUnits: string[];
}

// 获取所有课程
export const getCourses = async (): Promise<Course[]> => {
  return courses.map(course => ({
    id: course.id,
    title: course.title,
    description: course.description,
    difficulty: course.difficulty,
    status: course.status,
    icon: course.icon,
    module: course.module,
    route: `/courses/${course.id}`, // 添加route属性
    image: course.image // 添加image属性
  }));
};

// 根据ID获取课程
export function getCourseById(courseId: string) {
  const course = getCourse(courseId);
  
  if (!course) {
    return null;
  }
  
  // 模拟评分数据 (4.5-5.0之间的随机数)
  const rating = (4.5 + Math.random() * 0.5).toFixed(1);
  
  return {
    ...course,
    rating: parseFloat(rating),
    enrolledCount: Math.floor(Math.random() * 500) + 1000, // 随机学员数量
    updatedAt: new Date().toISOString().split('T')[0], // 更新日期为今天
  };
}

// 根据模块获取课程
export function getCoursesByModule(moduleId: string) {
  const module = modules.find(m => m.id === moduleId);
  if (!module) return [];
  
  return module.courseIds.map(courseId => {
    const course = getCourse(courseId);
    if (!course) return null;
    
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      difficulty: course.difficulty,
      status: course.status,
      icon: course.icon,
      module: course.module,
      route: `/courses/${course.id}`, // 添加route属性
      image: course.image // 添加image属性
    };
  }).filter(Boolean);
}

// 模拟课程单元和课程
export async function getCourseUnitsAndLessons(courseId: string) {
  const course = await getCourseById(courseId);
  if (!course) {
    return { units: [] };
  }

  // 为碳核算与碳管理课程提供专门的章节结构
  if (courseId === "carbon-accounting-management") {
    return {
      units: [
        {
          id: "carbon-accounting-management-unit-1",
          title: "碳核算基础理论",
          description: "碳核算的基本概念、原则和方法论",
          course_id: courseId,
          order: 1,
          lessons: [
            {
              id: "carbon-accounting-management-lesson-1-1",
              title: "碳核算概述",
              description: "碳核算的定义、重要性和应用领域",
              unit_id: "carbon-accounting-management-unit-1",
              order: 1,
              content_type: "text",
              content_url: "",
            },
            {
              id: "carbon-accounting-management-lesson-1-2",
              title: "碳核算标准体系",
              description: "国际和国内主要碳核算标准介绍",
              unit_id: "carbon-accounting-management-unit-1",
              order: 2,
              content_type: "text",
              content_url: "",
            }
          ]
        },
        {
          id: "carbon-accounting-management-unit-2",
          title: "企业碳核算方法",
          description: "企业层面碳核算的具体实施方法",
          course_id: courseId,
          order: 2,
          lessons: [
            {
              id: "carbon-accounting-management-lesson-2-1",
              title: "组织边界确定",
              description: "如何确定企业的组织边界和运营边界",
              unit_id: "carbon-accounting-management-unit-2",
              order: 1,
              content_type: "text",
              content_url: "",
            },
            {
              id: "carbon-accounting-management-lesson-2-2",
              title: "排放源识别与分类",
              description: "企业碳排放源的识别、分类和量化方法",
              unit_id: "carbon-accounting-management-unit-2",
              order: 2,
              content_type: "text",
              content_url: "",
            }
          ]
        },
        {
          id: "carbon-accounting-management-unit-3",
          title: "产品碳足迹核算",
          description: "产品全生命周期碳足迹的核算方法",
          course_id: courseId,
          order: 3,
          lessons: [
            {
              id: "carbon-accounting-management-lesson-3-1",
              title: "产品碳足迹概述",
              description: "产品碳足迹的概念、意义和核算标准",
              unit_id: "carbon-accounting-management-unit-3",
              order: 1,
              content_type: "text",
              content_url: "",
            },
            {
              id: "carbon-accounting-management-lesson-3-2",
              title: "生命周期评价方法",
              description: "LCA方法在产品碳足迹核算中的应用",
              unit_id: "carbon-accounting-management-unit-3",
              order: 2,
              content_type: "text",
              content_url: "",
            }
          ]
        },
        {
          id: "carbon-accounting-management-unit-4",
          title: "碳管理体系建设",
          description: "企业碳管理体系的构建与实施",
          course_id: courseId,
          order: 4,
          lessons: [
            {
              id: "carbon-accounting-management-lesson-4-1",
              title: "碳管理战略制定",
              description: "企业碳管理战略的制定和实施路径",
              unit_id: "carbon-accounting-management-unit-4",
              order: 1,
              content_type: "text",
              content_url: "",
            },
            {
              id: "carbon-accounting-management-lesson-4-2",
              title: "碳管理信息系统",
              description: "碳管理信息系统的设计和应用",
              unit_id: "carbon-accounting-management-unit-4",
              order: 2,
              content_type: "text",
              content_url: "",
            }
          ]
        },
        {
          id: "carbon-accounting-management-unit-5",
          title: "碳足迹计量",
          description: "第5章 碳足迹计量的详细内容",
          course_id: courseId,
          order: 5,
          lessons: [
            {
              id: "carbon-accounting-management-lesson-5-1",
              title: "5.1 碳足迹计量标准",
              description: "碳足迹计量的国际和国内标准体系",
              unit_id: "carbon-accounting-management-unit-5",
              order: 1,
              content_type: "text",
              content_url: "",
            },
            {
              id: "carbon-accounting-management-lesson-5-2",
              title: "5.1.1 基于产品的碳足迹标准",
              description: "产品碳足迹的核算标准和方法",
              unit_id: "carbon-accounting-management-unit-5",
              order: 2,
              content_type: "text",
              content_url: "",
            },
            {
              id: "carbon-accounting-management-lesson-5-3",
              title: "5.1.2 基于活动的碳足迹标准",
              description: "活动碳足迹的核算标准和方法",
              unit_id: "carbon-accounting-management-unit-5",
              order: 3,
              content_type: "text",
              content_url: "",
            },
            {
              id: "carbon-accounting-management-lesson-5-4",
              title: "5.2 生命周期评价方法与碳足迹",
              description: "LCA方法在碳足迹核算中的应用",
              unit_id: "carbon-accounting-management-unit-5",
              order: 4,
              content_type: "text",
              content_url: "",
            },
            {
              id: "carbon-accounting-management-lesson-5-5",
              title: "5.2.1 功能单位确定",
              description: "LCA中功能单位的确定原则和方法",
              unit_id: "carbon-accounting-management-unit-5",
              order: 5,
              content_type: "text",
              content_url: "",
            },
            {
              id: "carbon-accounting-management-lesson-5-6",
              title: "5.2.2 系统边界确定",
              description: "LCA系统边界的确定和范围界定",
              unit_id: "carbon-accounting-management-unit-5",
              order: 6,
              content_type: "text",
              content_url: "",
            },
            {
              id: "carbon-accounting-management-lesson-5-7",
              title: "5.2.3 活动数据的收集",
              description: "LCA中活动数据的收集方法和质量控制",
              unit_id: "carbon-accounting-management-unit-5",
              order: 7,
              content_type: "text",
              content_url: "",
            },
            {
              id: "carbon-accounting-management-lesson-5-8",
              title: "5.3 碳足迹计算与数据质量",
              description: "碳足迹计算方法和数据质量保证",
              unit_id: "carbon-accounting-management-unit-5",
              order: 8,
              content_type: "text",
              content_url: "",
            },
            {
              id: "carbon-accounting-management-lesson-5-9",
              title: "5.3.1 碳足迹计算",
              description: "碳足迹的具体计算方法和步骤",
              unit_id: "carbon-accounting-management-unit-5",
              order: 9,
              content_type: "text",
              content_url: "",
            },
            {
              id: "carbon-accounting-management-lesson-5-10",
              title: "5.3.2 数据质量评分与关键参数验证",
              description: "数据质量评估和关键参数的验证方法",
              unit_id: "carbon-accounting-management-unit-5",
              order: 10,
              content_type: "text",
              content_url: "",
            }
          ]
        }
      ]
    };
  }

  // 为其他课程生成默认结构
  const unitCount = Math.floor(Math.random() * 3) + 3;
  const units = [];

  for (let i = 0; i < unitCount; i++) {
    // 每个单元2-4节课
    const lessonCount = Math.floor(Math.random() * 3) + 2;
    const lessons = [];

    for (let j = 0; j < lessonCount; j++) {
      lessons.push({
        id: `${courseId}-lesson-${i}-${j}`,
        title: `${course.title} 单元${i + 1} 第${j + 1}节`,
        description: `这是 ${course.title} 的第 ${i + 1} 单元第 ${j + 1} 节`,
        unit_id: `${courseId}-unit-${i}`,
        order: j + 1,
        content_type: "video",
        content_url: "",
        duration: Math.floor(Math.random() * 20) + 10,
      });
    }

    units.push({
      id: `${courseId}-unit-${i}`,
      title: `${course.title} 单元${i + 1}`,
      description: `这是 ${course.title} 的第 ${i + 1} 个单元`,
      course_id: courseId,
      order: i + 1,
      lessons,
    });
  }

  return { units };
}

// 获取课程进度记录
export async function getCourseProgressRecords(courseId: string): Promise<ProgressRecord[]> {
  const { units } = await getCourseUnitsAndLessons(courseId);
  const progressRecords: ProgressRecord[] = [];

  // 为每个课程随机生成进度记录
  units.forEach(unit => {
    unit.lessons.forEach(lesson => {
      // 70%的概率课程已完成
      const isCompleted = Math.random() > 0.3;
      if (isCompleted) {
        progressRecords.push({
          completedLessons: [lesson.id],
          completedUnits: [unit.id],
        });
      }
    });
  });

  return progressRecords;
} 