/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Doctor, Prescription, Order, Thread, ChatMessage, Product } from "./types";

export const mockDoctors: Doctor[] = [
  {
    id: "doc-zhang-wc",
    name: "张医生",
    title: "主任医师",
    dept: "消化内科",
    hospital: "协和医院",
    rating: 4.9,
    avgResponseMin: 10,
    satisfactionRate: 99,
    isClass3A: true,
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&h=150&q=80",
    specialties: "胃炎、胃溃疡等消化系统疾病，熟练掌握胃肠镜的诊断及内镜下微创治疗。",
    introduction: "从事消化内科临床工作20余年，曾在日本国立癌症中心进修消化道早期肿瘤的内镜下诊治。对消化系统常见病、多发病及疑难危重病例有着丰富的临床经验，尤其擅长幽门螺杆菌感染的规范化治疗及胃肠道息肉的内镜下切除。",
    fee: 50,
    availableSlots: {
      morning: ["08:30", "09:00", "09:30", "10:00", "10:30", "11:00"],
      afternoon: ["13:30", "14:00", "14:30", "15:00", "15:30"]
    }
  },
  {
    id: "doc-liu-ortho",
    name: "刘骨科",
    title: "副主任医师",
    dept: "骨科",
    hospital: "同济医院",
    rating: 4.5,
    avgResponseMin: 15,
    satisfactionRate: 94,
    isClass3A: true,
    avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=150&h=150&q=80",
    specialties: "脊柱侧弯矫正、腰椎间盘突出微创手术、膝关节置换等骨伤病理治疗。",
    introduction: "积累骨外创伤及关节退行变手术多达1500余例。熟练实施射频消融及关节镜微创技术，发表核心医学SCI学术文章5篇。",
    fee: 40,
    availableSlots: {
      morning: ["09:00", "09:30", "10:00", "11:00"],
      afternoon: ["14:00", "14:30", "15:30"]
    }
  },
  {
    id: "doc-zhao-neuro",
    name: "赵儿科",
    title: "主治医师",
    dept: "神经内科",
    hospital: "华山医院",
    rating: 4.6,
    avgResponseMin: 12,
    satisfactionRate: 96,
    isClass3A: true,
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&h=150&q=80",
    specialties: "偏头痛、睡眠呼吸障碍症、运动障碍及周围神经功能性病症诊断。",
    introduction: "毕业于复旦大学上海医学院，在脑血管基础发病机理、脑退行性衰变神经调节方向拥有多年科学研发与门诊执教资历。",
    fee: 45,
    availableSlots: {
      morning: ["08:30", "09:30", "10:30"],
      afternoon: ["13:30", "14:30", "15:00"]
    }
  },
  {
    id: "doc-wang-peds",
    name: "王医生",
    title: "副主任医师",
    dept: "儿科",
    hospital: "儿童医学中心",
    rating: 4.8,
    avgResponseMin: 8,
    satisfactionRate: 98,
    isClass3A: true,
    avatarUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=150&h=150&q=80",
    specialties: "儿童呼吸道感染、过敏性鼻炎、小儿胃肠功能紊乱调节及营养评估。",
    introduction: "深耕儿科一线15年，极富有亲和力和善于缓解患儿及家长就诊焦虑。对儿童免疫功能低下、长期低烧具有丰富的针对性查因方案。",
    fee: 50,
    availableSlots: {
      morning: ["08:30", "09:00", "09:30", "10:00", "11:00"],
      afternoon: ["13:30", "14:00", "14:30", "15:30"]
    }
  }
];

export const mockPrescriptions: Prescription[] = [
  {
    id: "PRE-20260420-0988",
    doctorName: "张医生",
    dept: "消化内科",
    hospital: "北京市第一人民医院",
    date: "2026-04-20",
    diagnosis: "慢性胃炎 (Chronic Gastritis)",
    drugs: [
      {
        name: "阿莫西林胶囊",
        specs: "0.25g * 24粒 / 盒",
        usage: "口服，每日3次，每次2粒（0.5g），餐后半小时服用",
        qty: "2盒",
        price: 29.9,
        sideEffects: "偶见恶心、呕吐、腹泻，或轻微皮疹和药物过敏反应。",
        allergenInfo: "青霉素过敏者禁用。口服前需行青霉素皮试测试。"
      },
      {
        name: "奥美拉唑肠溶片",
        specs: "20mg * 14片 / 盒",
        usage: "口服，每日1次，每次1片（20mg），清晨空腹口服",
        qty: "1盒",
        price: 18.5,
        sideEffects: "少数患者可呈轻度头痛、嗜睡、口干及便秘。",
        allergenInfo: "对质子泵抑制剂（PPI）类过敏者禁用。"
      }
    ],
    status: "可续方"
  },
  {
    id: "PRE-20231115-1254",
    doctorName: "李医生",
    dept: "内分泌科",
    hospital: "北京市第一人民医院",
    date: "2023-11-15",
    diagnosis: "2型糖尿病 (Type 2 Diabetes)",
    drugs: [
      {
        name: "盐酸二甲双胍缓释片",
        specs: "0.5g * 30片 / 盒",
        usage: "口服，每日1次，每次2片（1.0g），随晚餐口服",
        qty: "3盒",
        price: 15.6,
        sideEffects: "消化道不适感，口中有金属味；长期服用可能降低B12吸收率。",
        allergenInfo: "已知对二甲双胍过敏、中重度肾功能不全、急性酸中毒或严重感染者禁用。"
      }
    ],
    status: "已失效"
  }
];

export const mockOrders: Order[] = [
  {
    id: "VC20240315889",
    type: "门诊挂号",
    title: "门诊挂号 - 消化内科",
    subTitle: "北京市第一人民医院 • 网络门诊",
    doctorName: "张医生",
    time: "2026-04-15 09:00",
    amount: 50.00,
    status: "待就诊"
  },
  {
    id: "VM20240315124",
    type: "医疗设备",
    title: "智能家用电子血压计",
    subTitle: "臂式测量 • 双人语音播报升级版",
    time: "2026-06-08 14:12",
    amount: 199.00,
    status: "待支付"
  }
];

export const mockThreads: Thread[] = [
  {
    id: "th-zhang",
    name: "张医生 (内科)",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&h=150&q=80",
    type: "doctor",
    lastMessage: "最近：根据您的症状，我为您生成了病情摘要...",
    time: "10:45",
    unreadCount: 1
  },
  {
    id: "th-ai",
    name: "AI健康助手",
    avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&h=150&q=80",
    type: "ai",
    lastMessage: "最近：您的导诊报告已成功下载，建议科室...",
    time: "昨天",
    unreadCount: 0
  },
  {
    id: "th-sys",
    name: "系统通知",
    avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&h=150&q=80",
    type: "system",
    lastMessage: "最近：您明天的预约挂号成功已扣款50元...",
    time: "周一",
    unreadCount: 2
  }
];

export const defaultTriageReport = {
  symptomsNo: "TRG-202606-45520147",
  symptomsParsed: ["腹痛", "恶心", "轻微乏力"],
  recommendedConfidence: 95,
  recommendedDept: "消化内科",
  aiDiagnosis: "疑似急性胃炎 (Possible Gastritis)",
  aiExplanation: "描述中提到上腹部突发剧痛并伴发恶心，这符合急性消化系统粘膜应激表现。结合年龄与性别，考虑工作饮食压力引发胃肠炎概率极大。此评估不能替代线下医师的临床检查。",
  clinicalAdvice: "建议及时前往医院消化内科进行局部诊断。若突发高烧或排黏液便，请即时就医并进行大便、血常规基础普查。",
  lifestyleAdvice: [
    "近期禁吃冷、烫、辛辣、高盐、以及带有高度油腻的食物。",
    "一日三餐定时点进，采用少量多次细软熟烂温水喂养粥点。",
    "保障日均8-9小时睡眠，避免繁重的脑力与体力工作，稳定胃肠植物神经。"
  ],
  relatedDepts: [
    { name: "神经内科", matchRate: 75 },
    { name: "内分泌科", matchRate: 60 }
  ]
};

export const defaultChatHistory: ChatMessage[] = [
  {
    id: "msg-101",
    sender: "AI 助手",
    content: "为您生成了病情摘要，已发送给张医生：\n\n• 主要症状：咳嗽、发热 (38.5℃)\n• 持续时间：3天\n• 伴随症状：轻微咽痛、乏力\n• 过敏史：无青霉素过敏",
    time: "今天 10:15",
    isDoctor: false,
    isAI: true
  },
  {
    id: "msg-102",
    sender: "张医生",
    content: "您好，我是张医生。我已经看了您的病情描述。除了咳嗽和发热，有没有感觉呼吸困难或者胸闷？",
    time: "今天 10:17",
    isDoctor: true,
    isAI: false
  },
  {
    id: "msg-103",
    sender: "张三",
    content: "医生您好。没有呼吸困难，就是干咳，晚上比较严重，影响睡眠。",
    time: "今天 10:20",
    isDoctor: false,
    isAI: false
  },
  {
    id: "msg-104",
    sender: "张医生",
    content: "根据您的症状，目前考虑是上呼吸道感染引起的急性支气管炎。我给执配了一些对症药物，请按时服用。如果发热超过39度或者出现呼吸急促，请立即去线下医院就诊。",
    time: "今天 10:25",
    isDoctor: true,
    isAI: false
  }
];

export const mockProducts: Product[] = [
  {
    id: "prod-amoxicillin",
    name: "阿莫西林抗炎胶囊",
    price: 29.90,
    originalPrice: 35.00,
    category: "药物",
    badge: "自营处方药",
    emoji: "💊",
    specs: "0.25g * 24粒 / 盒",
    pharmacology: {
      dosageForm: "固态口服胶囊",
      approvalNo: "国药准字H11020088",
      storage: "避光密封24个月",
      target: "对青霉素无过敏者"
    },
    directions: "成人每日3次，饭后半小时服用。温水冲服。儿童用量须严格遵医嘱。",
    contraindications: "严格禁止对青霉素成分过敏者服用此药！若伴有哮喘突发，请速至线下急诊。",
    description: "青霉素类高效防感染抗生素，配有专业阻断包衣工艺，降低胃粘膜直接刺激度。"
  },
  {
    id: "prod-omeprazole",
    name: "奥美拉唑肠溶片",
    price: 18.50,
    originalPrice: 22.00,
    category: "药物",
    badge: "胃肠常备药",
    emoji: "🧪",
    specs: "20mg * 14片 / 盒",
    pharmacology: {
      dosageForm: "肠溶包衣片剂",
      approvalNo: "国药准字H31021455",
      storage: "常温密封避光保存",
      target: "胃酸过多、胃溃疡患者"
    },
    directions: "口服，每日1次，每次1片（20mg），清晨空腹口服最佳。",
    contraindications: "对质子泵抑制剂（PPI）类过敏者、肝肾功能不全者慎用。",
    description: "高效抑制胃酸分泌，保护胃粘膜屏障，科学对症消化道返流及急慢性十二指肠应激。"
  },
  {
    id: "prod-tongue-lozeng",
    name: "复方草珊瑚含片",
    price: 12.00,
    originalPrice: 15.00,
    category: "药物",
    badge: "润喉清凉",
    emoji: "🍬",
    specs: "1.2g * 24片 / 盒",
    pharmacology: {
      dosageForm: "口含片剂",
      approvalNo: "国药准字Z36021204",
      storage: "阴凉干燥处保存",
      target: "急慢性咽喉炎、失音症"
    },
    directions: "含服，一次1-2片，每日数次。本品不宜吞服以免降低局部药效。",
    contraindications: "孕妇、哺乳期妇女、糖尿病患者及对本品过敏者慎服。",
    description: "清热解毒，宣肺利咽。专门用于外感风热所致的咽喉肿痛、声哑失音。"
  },
  {
    id: "prod-bp-monitor",
    name: "智能家用电子血压计",
    price: 199.00,
    originalPrice: 268.00,
    category: "医疗器械",
    badge: "适老推荐",
    emoji: "🩺",
    specs: "臂式测量 • 双人语音播报升级版",
    pharmacology: {
      dosageForm: "医用电子仪器",
      approvalNo: "京械注准20222070144",
      storage: "避免高温强磁及潮湿",
      target: "需日常监测血压的长者"
    },
    directions: "平视微坐，袖带下缘距肘关节2cm，一键启动静止等待读数、支持语音双核校准。",
    contraindications: "严重心律失常患者测量数据可能产生偏差，请参考临床动态监测。",
    description: "大字幕背光显示，专为中老年人群设计，一键自动加压测量，双人各99组存储记忆卡。"
  },
  {
    id: "prod-vitc-yingqiao",
    name: "维C银翘片",
    price: 16.00,
    originalPrice: 20.00,
    category: "药物",
    badge: "流感防护",
    emoji: "☘️",
    specs: "12片 * 2板 / 盒",
    pharmacology: {
      dosageForm: "包衣片剂(含维生素C)",
      approvalNo: "国药准字Z44021003",
      storage: "常温防潮密闭",
      target: "外感风热感冒初期"
    },
    directions: "口服。一次2片，一日3次。配合充足温水分服。",
    contraindications: "严重肝肾功能不全者慎用，服用期间禁止饮酒或操作精密仪器。",
    description: "中西药复方制剂。疏风解表，清热解毒。用于流行性感冒引起的发热头痛、咳嗽咽痛。"
  }
];

