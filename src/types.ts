/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TriageReport {
  symptomsParsed: string[];
  recommendedDept: string;
  recommendedConfidence: number;
  relatedDepts: Array<{ name: string; matchRate: number }>;
  reportNo: string;
  aiDiagnosis: string;
  aiExplanation: string;
  clinicalAdvice: string;
  lifestyleAdvice: string[];
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  dept: string;
  hospital: string;
  rating: number;
  avgResponseMin: number;
  satisfactionRate: number;
  isClass3A: boolean;
  avatarUrl: string;
  specialties: string;
  introduction: string;
  fee: number;
  availableSlots: {
    morning: string[];
    afternoon: string[];
  };
}

export interface PrescriptionDrug {
  name: string;
  specs: string;
  usage: string;
  qty: string;
  price: number;
  sideEffects: string;
  allergenInfo: string;
}

export interface Prescription {
  id: string;
  doctorName: string;
  dept: string;
  hospital: string;
  date: string;
  diagnosis: string;
  drugs: PrescriptionDrug[];
  status: "可续方" | "已失效";
}

export interface Order {
  id: string;
  type: "门诊挂号" | "医疗设备";
  title: string;
  subTitle: string;
  doctorName?: string;
  time: string;
  amount: number;
  status: "待支付" | "待就诊" | "配药中" | "已完成";
}

export interface ChatMessage {
  id: string;
  sender: string;
  avatar?: string;
  content: string;
  time: string;
  isDoctor: boolean;
  isAI: boolean;
  prescription?: Prescription;
}

export interface Thread {
  id: string;
  name: string;
  avatar: string;
  type: "doctor" | "ai" | "system";
  lastMessage: string;
  time: string;
  unreadCount: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: "药物" | "医疗器械" | "保健食品";
  badge: string;
  emoji: string;
  specs: string;
  pharmacology: {
    dosageForm: string;
    approvalNo: string;
    storage: string;
    target: string;
  };
  directions: string;
  contraindications: string;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

