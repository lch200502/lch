/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  mockDoctors, 
  mockPrescriptions, 
  mockOrders, 
  mockThreads, 
  defaultTriageReport, 
  defaultChatHistory,
  mockProducts
} from "./data";
import { Doctor, Prescription, Order, ChatMessage, TriageReport, Product, CartItem } from "./types";
import { codeDatabase } from "./codeDatabase";
import { 
  Search, Bell, Activity, Stethoscope, MessageSquare, Calendar, ChevronRight, Star, 
  Camera, Mic, ShieldAlert, ArrowRight, Clipboard, ShieldCheck, Heart, Users, 
  RefreshCw, HelpCircle, AlertCircle, Send, FileText, Check, Plus, ArrowLeft, 
  BookOpen, Code, Settings, User, ShoppingCart, CreditCard, ChevronLeft, Tablet, Info,
  Home, Pencil
} from "lucide-react";

export default function App() {
  // Mobile Simulator Navigation state
  const [activeScreen, setActiveScreen] = useState<string>("home");
  const [activeTab, setActiveTab] = useState<string>("home");

  // Mall / Products State Management
  const [selectedProduct, setSelectedProduct] = useState<Product>(mockProducts[0]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("全部");
  const [searchProductQuery, setSearchProductQuery] = useState<string>("");
  const [showCartModal, setShowCartModal] = useState<boolean>(false);

  // Flow State Management
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(mockDoctors[0]);
  const [symptomText, setSymptomText] = useState<string>("");
  const [isTriageLoading, setIsTriageLoading] = useState<boolean>(false);
  const [triageReport, setTriageReport] = useState<TriageReport | null>(null);
  
  // Custom slots booking state
  const [selectedDate, setSelectedDate] = useState<string>("15日 周三");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [bookingFee, setBookingFee] = useState<number>(50);

  // Online consultation chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(defaultChatHistory);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [selectedDrugDraft, setSelectedDrugDraft] = useState<any>(null); // For Bottom Sheet modal
  
  // Insurance Card & Toast Notification
  const [showPaySuccess, setShowPaySuccess] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  // Dev Tool Workspace tabs
  const [devWorkspaceTab, setDevWorkspaceTab] = useState<"rationality" | "code">("rationality");
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Scroll anchor for Chatroom
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, activeScreen]);

  // Utility toast handler
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2500);
  };

  // Synchronize dynamic tab values with screen switches
  const handleTabSwitch = (tab: string) => {
    setActiveTab(tab);
    if (tab === "home") setActiveScreen("home");
    else if (tab === "triage") setActiveScreen("aiTriageInput");
    else if (tab === "mall") setActiveScreen("mall");
    else if (tab === "message") setActiveScreen("messageCenter");
    else if (tab === "me") setActiveScreen("profileMe");
  };

  // Trigger dynamic server-side AI Triage via our Gemini endpoint
  const handleAISubmit = async () => {
    if (!symptomText.trim()) return;
    setIsTriageLoading(true);
    try {
      const response = await fetch("/api/triage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms: symptomText,
          age: 45,
          gender: "男"
        }),
      });
      const data = await response.json();
      if (data.success) {
        // Hydrate data results
        setTriageReport(data);
        triggerToast("AI 评估诊断成功生成！已为您智能分流。");
        setActiveScreen("aiTriageFinish");
      } else {
        throw new Error(data.error || "Triage processing failed");
      }
    } catch (e) {
      console.error(e);
      // Fallback in case of server failure
      const reportNoStr = `TRG-202606-${Math.floor(10000000 + Math.random() * 90000000)}`;
      setTriageReport({
        ...defaultTriageReport,
        reportNo: reportNoStr,
        symptomsParsed: [symptomText.slice(0, 15), "发热 (Fever)", "胃区酸痛"],
      });
      triggerToast("网络连接不可用，已为您加载本地医学辅助规则。");
      setActiveScreen("aiTriageFinish");
    } finally {
      setIsTriageLoading(false);
    }
  };

  // Submit custom consultation chat text
  const handleSendChatMessage = (textVal: string) => {
    if (!textVal.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "张三",
      content: textVal,
      time: "10:30",
      isDoctor: false,
      isAI: false
    };
    setChatHistory(prev => [...prev, newMsg]);

    // Simulate doctor reply
    setTimeout(() => {
      const respMsg: ChatMessage = {
        id: `msg-doc-${Date.now()}`,
        sender: "张医生",
        avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&h=150&q=80",
        content: "收到您的反馈。这种干咳如果伴有鼻塞，可以多饮温水温盐水含漱治疗。我建议您可以服用我们刚刚给您开配的阿莫西林抗炎胶囊，查看处方后可在下方一键结算支付药费。",
        time: "10:31",
        isDoctor: true,
        isAI: false
      };
      setChatHistory(prev => [...prev, respMsg]);
    }, 1500);
  };

  // Cart Helper Methods
  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    triggerToast(`已成功加入购物车: ${product.name}`);
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => 
      prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: newQty < 1 ? 1 : newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    triggerToast("已移出购物车");
  };

  // Handle simulation of transaction checkout
  const handleConfirmPayment = () => {
    setShowPaySuccess(true);
    setTimeout(() => {
      setShowPaySuccess(false);
      setActiveScreen("myOrders");
      triggerToast("支付成功！可在我的订单中查收票据。");
    }, 1800);
  };

  // Mapping current screen selection to dynamic helper descriptions of the codeDatabase
  const getMappedDocKey = (): string => {
    if (activeScreen === "home") return "home";
    if (activeScreen === "aiTriageInput" || activeScreen === "aiTriageFinish") return "ai";
    if (activeScreen === "aiTriageReport") return "report";
    if (activeScreen === "medicalCard") return "card";
    if (activeScreen === "paymentCashier") return "cashier";
    if (activeScreen === "doctorChat" || activeScreen === "medicineDetails_Sheet") return "chat";
    return "home"; // default fallback
  };

  const activeDocDetail = codeDatabase[getMappedDocKey()];

  // Exporter copy text clipboard utility
  const handleCopyCode = () => {
    if (activeDocDetail) {
      navigator.clipboard.writeText(activeDocDetail.codeSnippet);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 flex flex-col md:flex-row font-sans">
      
      {/* Toast Overlay alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#e8faef] text-[#006d36] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold border border-emerald-200">
          <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT COLUMN: INTERACTIVE DEVICE WORKSPACE SCREEN */}
      <div className="flex-1 p-4 lg:p-6 flex flex-col justify-start items-center border-r border-[#e5e7eb]">
        
        {/* Device Header Taggers & Interactive Control Switchers */}
        <div className="w-full max-w-[390px] mb-4 text-center">
          <div className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full p-1.5 px-3 text-[10px] text-gray-500 font-medium shadow-xs">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-1.5"></span>
            小程序原型多视图在线调试沙箱 (切换点击可直观测试)
          </div>

          {/* Quick Screen Selector Dropdown/Buttons list */}
          <div className="mt-3 flex gap-1 bg-white p-1.5 rounded-2xl overflow-x-auto no-scrollbar max-w-[390px] border border-gray-200 shadow-xs">
            {[
              { label: "主页", id: "home" },
              { label: "自测输入", id: "aiTriageInput" },
              { label: "AI荐科", id: "aiTriageFinish" },
              { label: "AI报告", id: "aiTriageReport" },
              { label: "挂号门诊", id: "clinicList" },
              { label: "医生页", id: "docDetails" },
              { label: "自营商城", id: "mall" },
              { label: "买药详情", id: "mallDetails" },
              { label: "收银台", id: "paymentCashier" },
              { label: "医保卡", id: "medicalCard" },
              { label: "线上问诊", id: "doctorChat" },
              { label: "订单", id: "myOrders" }
            ].map((scr) => (
              <button
                key={scr.id}
                onClick={() => {
                  setActiveScreen(scr.id);
                  if (["home", "clinicList", "docDetails", "calendarBook"].includes(scr.id)) setActiveTab("home");
                  if (["aiTriageInput", "aiTriageFinish", "aiTriageReport"].includes(scr.id)) setActiveTab("triage");
                  if (["mall", "mallDetails"].includes(scr.id)) setActiveTab("mall");
                  if (["doctorChat", "medicineDetails_Sheet"].includes(scr.id)) setActiveTab("message");
                  if (["myOrders", "medicalCard", "myPrescriptions"].includes(scr.id)) setActiveTab("me");
                }}
                className={`px-3 py-1.5 rounded-xl shrink-0 text-[10px] font-semibold transition ${
                  activeScreen === scr.id 
                    ? "bg-gray-900 text-white shadow-xs" 
                    : "text-gray-650 hover:bg-gray-50"
                }`}
              >
                {scr.label}
              </button>
            ))}
          </div>
        </div>

        {/* PHYSICAL SMARTPHONE CONTAINER SHELL MODEL */}
        <div className="w-[390px] h-[812px] bg-white text-gray-900 rounded-[48px] shadow-2xl relative border-[12px] border-gray-900 overflow-hidden flex flex-col justify-between shrink-0 select-none">
          
          {/* Static Dynamic Island / Status Bar Area */}
          <div className="absolute top-0 inset-x-0 h-10 bg-white/95 backdrop-blur-md z-40 px-6 flex justify-between items-center text-[11px] font-semibold text-slate-800">
            <span>10:25</span>
            <div className="w-24 h-5 bg-slate-950 rounded-full absolute left-1/2 -translate-x-1/2 top-1.5 flex justify-center items-center">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse mr-1"></span>
              <span className="w-10 h-1 bg-slate-800 rounded-full"></span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <span>📶</span>
              <span>5G</span>
              <span className="w-5 h-2.5 border border-slate-800 rounded-sm relative flex items-center p-0.5">
                <span className="h-full w-4/5 bg-slate-800 rounded-xs block"></span>
                <span className="w-[1px] h-1 bg-slate-800 rounded-r-xs absolute -right-[2px]"></span>
              </span>
            </div>
          </div>

          {/* DYNAMIC SCROLLABLE BODY CONTENT */}
          <div className="flex-1 pt-10 pb-20 overflow-y-auto no-scrollbar bg-[#F3F6FB]">
            
            {/* 1. HOME SCREEN */}
            {activeScreen === "home" && (
              <div className="text-gray-900">
                {/* Logo Banner Header */}
                <div className="bg-white px-5 pt-4 pb-4 border-b border-gray-100 flex justify-between items-center shadow-xs">
                  <div className="flex items-center gap-2 text-[#005da7] font-bold text-lg">
                    <span className="bg-[#005da7] text-white p-1 rounded-md text-[10px] font-black leading-none flex items-center justify-center w-5 h-5 shadow-xs">✚</span>
                    <span className="font-display font-extrabold tracking-tight text-[#005da7] text-base">CareConnect Health</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 bg-slate-50 hover:bg-slate-105 rounded-full transition relative">
                      <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      <Bell className="w-4.5 h-4.5 text-gray-700" />
                    </button>
                  </div>
                </div>

                {/* Simulated search bar */}
                <div className="px-5 pt-4">
                  <div className="bg-white p-2.5 rounded-2xl flex items-center gap-2.5 border border-slate-100 shadow-sm hover:border-slate-300 transition cursor-pointer">
                    <Search className="w-4 h-4 text-slate-400 ml-1.5" />
                    <span className="text-slate-300 text-xs">搜索科室、医生、急重常见疾病</span>
                  </div>
                </div>

                {/* Broadcast horizontal banners */}
                <div className="mx-5 mt-4 bg-blue-50 border border-blue-100 p-3 rounded-2xl flex items-start gap-2 shadow-xs">
                  <span className="text-blue-700 text-xs mt-0.5">📢</span>
                  <p className="text-[10px] text-blue-900 leading-normal font-medium">
                    温馨提示：若突发急性胸闷、高热请立即拨打 <span className="font-bold border-b border-[#005da7] text-[#005da7]">400-123-4567</span>。智慧药房夏季全城极速送。
                  </p>
                </div>

                {/* 2x2 Services Grid (Buttons Layout) */}
                <div className="mx-5 mt-4 grid grid-cols-2 gap-3.5">
                  {[
                    { label: "门诊挂号", desc: "快速挑选极速挂号", id: "clinicList", color: "bg-[#e4f1fc]", icon: "🩺", text: "text-[#005da7]" },
                    { label: "智能导诊", desc: "专业大模型荐诊", id: "aiTriageInput", color: "bg-[#e8faef]", icon: "🤖", text: "text-[#006d36]" },
                    { label: "在线问诊", desc: "图文/视频线上诊疗", id: "doctorChat", color: "bg-[#eaf4ff]", icon: "💬", text: "text-[#2976c7]" },
                    { label: "我的预约", desc: "查看诊疗时间安排", id: "myOrders", color: "bg-[#fff5e6]", icon: "📅", text: "text-[#7f5300]" }
                  ].map((srv) => (
                    <div
                      key={srv.id}
                      onClick={() => setActiveScreen(srv.id)}
                      className="bg-white p-4 rounded-3xl border border-slate-100/50 shadow-xs hover:shadow-md hover:border-slate-200 transition cursor-pointer flex flex-col justify-between h-[115px] group"
                    >
                      <div className="flex justify-between items-start">
                        <span className={`w-9 h-9 ${srv.color} ${srv.text} rounded-2xl flex items-center justify-center text-lg`}>
                          {srv.icon}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-slate-800">{srv.label}</h3>
                        <p className="text-[9px] text-slate-400 mt-0.5">{srv.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Popular departments section */}
                <div className="mx-5 mt-5">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-display font-bold text-xs text-slate-800">热门科室推荐</h3>
                    <span onClick={() => setActiveScreen("clinicList")} className="text-[10px] text-[#005da7] font-semibold cursor-pointer select-none">查看全部 &gt;</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2.5">
                    {[
                      { name: "内科", icon: "🩺" },
                      { name: "外科", icon: "🩹" },
                      { name: "妇科", icon: "🤰" },
                      { name: "儿科", icon: "👶" }
                    ].map((dept, i) => (
                      <div 
                        key={i} 
                        onClick={() => setActiveScreen("clinicList")}
                        className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex flex-col items-center justify-center cursor-pointer hover:border-[#005da7] transition"
                      >
                        <span className="text-xl mb-1">{dept.icon}</span>
                        <span className="text-[10px] font-bold text-slate-700">{dept.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Featured Recommended Doctor profile card */}
                <div className="mx-5 mt-6 mb-10">
                  <h3 className="font-display font-bold text-xs text-[#005da7] mb-3 flex items-center gap-1">
                    🌟 精选专家推荐
                  </h3>
                  <div className="bg-white p-4 rounded-3xl border border-slate-100/80 shadow-sm">
                    <div className="flex gap-4">
                      <img 
                        src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&h=120&q=80" 
                        className="w-14 h-14 rounded-2xl object-cover shrink-0" 
                        alt="Dr" 
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-slate-800">张医生</span>
                              <span className="bg-[#e4f1fc] text-[#005da7] text-[9px] px-1.5 py-0.5 rounded-full font-bold">主任医师</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">内科 (消化病学/糖尿病)</p>
                          </div>
                          <div className="flex items-center gap-0.5 text-xs text-amber-500 font-bold shrink-0">
                            ★ <span className="text-slate-800">4.9</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                          <div>
                            <span className="text-[9px] text-slate-400 block">门诊诊疗挂号费</span>
                            <span className="text-sm font-black text-[#005da7] block">¥50.00</span>
                          </div>
                          <button 
                            onClick={() => {
                              setSelectedDoctor(mockDoctors[0]);
                              setActiveScreen("docDetails");
                            }}
                            className="bg-[#005da7] hover:bg-[#004883] text-white px-4 py-2 rounded-xl text-[10px] font-bold shadow-xs transition"
                          >
                            立即预约
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. CLINIC DOCTOR LIST SCREEN (门诊挂号 - Doctor roster) */}
            {activeScreen === "clinicList" && (
              <div className="text-slate-900 px-5 pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setActiveScreen("home")} className="p-1 hover:bg-slate-100 rounded-lg">
                    <ChevronLeft className="w-5 h-5 text-slate-700" />
                  </button>
                  <h1 className="text-sm font-bold">选择预约挂号专家</h1>
                </div>

                {/* Filter and roster search */}
                <div className="bg-white p-1 rounded-2xl border border-slate-100 shadow-xs mb-4 flex">
                  <input 
                    type="text" 
                    placeholder="按拼音、疾病、科室搜索对应医生" 
                    className="flex-1 bg-transparent px-3 py-2 text-xs border-none outline-none"
                  />
                  <button className="bg-[#005da7] text-white px-3 py-1.5 rounded-xl text-[10px] font-semibold">搜索</button>
                </div>

                <div className="space-y-3.5 mb-10">
                  {mockDoctors.map((doc) => (
                    <div 
                      key={doc.id}
                      onClick={() => {
                        setSelectedDoctor(doc);
                        setActiveScreen("docDetails");
                      }}
                      className="bg-white p-4 rounded-3xl border border-slate-100/80 shadow-xs hover:border-[#005da7] transition cursor-pointer flex gap-3.5"
                    >
                      <img src={doc.avatarUrl} className="w-12 h-12 rounded-xl object-cover shrink-0" alt="doc" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                              {doc.name} 
                              <span className="bg-slate-100 text-slate-600 font-normal text-[9px] px-1.5 py-0.5 rounded-md">
                                {doc.title}
                              </span>
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-1">{doc.dept} | {doc.hospital}</p>
                          </div>
                          <span className="text-xs text-amber-500 font-bold shrink-0">★ {doc.rating}</span>
                        </div>
                        <p className="text-[9px] text-slate-400 line-clamp-1 mt-1.5">擅长: {doc.specialties}</p>
                        
                        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                          <span className="text-[10px] text-[#006d36] font-bold bg-[#e8faef] px-2 py-0.5 rounded-full">挂号费: ¥{doc.fee}</span>
                          <span className="text-[10px] text-[#005da7] font-bold flex items-center gap-0.5">
                            预约挂号 <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. DOCTOR DETAIL PORTAL SCREEN */}
            {activeScreen === "docDetails" && selectedDoctor && (
              <div className="text-slate-900 px-5 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setActiveScreen("clinicList")} className="p-1 hover:bg-slate-100 rounded-lg">
                    <ChevronLeft className="w-5 h-5 text-slate-700" />
                  </button>
                  <span className="text-xs font-bold text-slate-800">专家主页</span>
                  <span></span>
                </div>

                {/* Card with core details */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center relative overflow-hidden">
                  <div className="absolute right-0 top-0 bg-[#e4f1fc] text-[#005da7] text-[8px] font-bold font-mono px-3 py-1 rounded-bl-2xl uppercase">
                     三甲资质
                  </div>
                  <img src={selectedDoctor.avatarUrl} className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-indigo-50" alt="avatar" />
                  <h2 className="font-extrabold text-sm text-slate-800 mt-2.5 flex items-center justify-center gap-1.5">
                    {selectedDoctor.name} 
                    <span className="bg-indigo-50 text-[#005da7] text-[9px] px-1.5 py-0.5 rounded-md font-bold">{selectedDoctor.title}</span>
                  </h2>
                  <p className="text-[10px] text-slate-400 mt-1">{selectedDoctor.dept} | {selectedDoctor.hospital}</p>
                  
                  {/* Performance stats banner */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
                    <div className="border-r border-slate-100">
                      <span className="text-slate-400 text-[8px] block uppercase">接诊量</span>
                      <span className="font-bold text-xs mt-0.5 block">1.2w+</span>
                    </div>
                    <div className="border-r border-slate-100">
                      <span className="text-slate-400 text-[8px] block uppercase">平均响应</span>
                      <span className="font-bold text-xs mt-0.5 block text-[#006d36]">{selectedDoctor.avgResponseMin}分钟</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[8px] block uppercase">好评率</span>
                      <span className="font-bold text-xs mt-0.5 block text-amber-600">{selectedDoctor.satisfactionRate}%</span>
                    </div>
                  </div>
                </div>

                {/* Specialties Bios */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mt-4">
                  <h3 className="text-xs font-bold text-[#005da7] mb-2 flex items-center gap-1">
                    🩺 专科研究擅长
                  </h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed text-left">{selectedDoctor.specialties}</p>
                </div>

                {/* Biography bio */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mt-4">
                  <h3 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1">
                    📜 主治医学履历
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed text-left">{selectedDoctor.introduction}</p>
                </div>

                {/* Patient reviews */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mt-4 mb-10 text-left">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold text-slate-800">患者评价 (256)</h3>
                    <span className="text-[10px] text-[#005da7] font-semibold">查看全部 &gt;</span>
                  </div>
                  <div className="border-t border-slate-50 pt-3 space-y-3">
                    <div className="flex justify-between items-start text-[10px]">
                      <span className="font-bold text-slate-700">匿名患者</span>
                      <span className="text-slate-400">2026-05-18</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      "张医生非常细致耐心，对病情解释详实有据，听诊器触感不凉，服用了针对开具的阿莫西林胶囊已经彻底痊愈，不愧为三甲权威名医！"
                    </p>
                    <div className="flex gap-2">
                      <span className="bg-[#e8faef] text-[#006d36] text-[8px] px-1.5 py-0.5 rounded font-bold">医术精湛</span>
                      <span className="bg-blue-50 text-blue-700 text-[8px] px-1.5 py-0.5 rounded font-bold">态度极好</span>
                    </div>
                  </div>
                </div>

                {/* Sticky book button */}
                <button 
                  onClick={() => {
                    setBookingFee(selectedDoctor.fee);
                    setActiveScreen("calendarBook");
                  }}
                  className="w-full bg-[#005da7] hover:bg-[#004883] text-white font-bold py-3.5 rounded-2xl shadow-md flex justify-center items-center gap-2 mt-4"
                >
                  前往选择预约排班 (¥{selectedDoctor.fee})
                </button>
              </div>
            )}

            {/* 4. CLINIC CALENDAR BOOKING SCHEDULE (预约挂号 - Page 4) */}
            {activeScreen === "calendarBook" && selectedDoctor && (
              <div className="text-slate-900 px-5 pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setActiveScreen("docDetails")} className="p-1 hover:bg-slate-100 rounded-lg">
                    <ChevronLeft className="w-5 h-5 text-slate-700" />
                  </button>
                  <h1 className="text-sm font-bold">选择日期与时间段</h1>
                </div>

                {/* Brief doc details card */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-xs">
                  <img src={selectedDoctor.avatarUrl} className="w-10 h-10 rounded-xl object-cover shrink-0" alt="doc" />
                  <div>
                    <h3 className="font-bold text-xs text-slate-800">{selectedDoctor.name} 一 门诊排班</h3>
                    <p className="text-[9px] text-slate-400 mt-0.5">{selectedDoctor.dept} | 主任处诊</p>
                  </div>
                </div>

                {/* Selected month carousel */}
                <div className="mt-4">
                  <span className="text-xs font-bold text-slate-500 block">2026年6月</span>
                  <div className="flex gap-2.5 mt-2 overflow-x-auto no-scrollbar py-1">
                    {[
                      { day: "12日", wk: "周五" },
                      { day: "13日", wk: "周六" },
                      { day: "14日", wk: "周日" },
                      { day: "15日", wk: "周一", select: true },
                      { day: "16日", wk: "周二" },
                      { day: "17日", wk: "周三" }
                    ].map((d, i) => (
                      <div 
                        key={i}
                        onClick={() => setSelectedDate(`${d.day} ${d.wk}`)}
                        className={`p-3 rounded-2xl text-center shrink-0 w-14 cursor-pointer border transition ${
                          selectedDate.includes(d.day)
                            ? "bg-[#005da7] hover:bg-[#004883] text-white border-transparent shadow-sm"
                            : "bg-white border-slate-100 text-slate-700"
                        }`}
                      >
                        <span className="text-[9px] block opacity-80">{d.wk}</span>
                        <span className="text-xs font-bold mt-1 block">{d.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Morning Slots */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-800">上午挂号排班</span>
                    <span className="text-[10px] text-[#006d36] font-semibold">剩余8号</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {selectedDoctor.availableSlots.morning.map((slot) => (
                      <button 
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3 rounded-xl text-xs font-semibold border transition ${
                          selectedSlot === slot 
                            ? "bg-[#e4f1fc] border-[#005da7] text-[#005da7]" 
                            : "bg-white border-slate-100 text-slate-700"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Afternoon Slots */}
                <div className="mt-5 mb-10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-800">下午挂号排班</span>
                    <span className="text-[10px] text-[#006d36] font-semibold">剩余5号</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {selectedDoctor.availableSlots.afternoon.map((slot) => (
                      <button 
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3 rounded-xl text-xs font-semibold border transition ${
                          selectedSlot === slot 
                            ? "bg-[#e4f1fc] border-[#005da7] text-[#005da7]" 
                            : "bg-white border-slate-100 text-slate-700"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Booking summary and sticky book button */}
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex justify-between items-center">
                  <div className="text-left">
                    <span className="text-[9px] text-slate-400">已选就诊时段: {selectedDate}</span>
                    <p className="text-sm font-extrabold text-[#005da7] mt-0.5">{selectedSlot || "请先任选一时间段"}</p>
                  </div>
                  <button 
                    disabled={!selectedSlot}
                    onClick={() => {
                      // Navigate to Payment Center Cashier
                      setActiveScreen("paymentCashier");
                    }}
                    className="bg-[#005da7] hover:bg-[#004883] disabled:opacity-50 text-white px-5 py-3 rounded-xl text-xs font-bold shadow-sm"
                  >
                    立即预约
                  </button>
                </div>
              </div>
            )}

            {/* 5. AI TRIAGE QUESTION INTAKE (智能导诊第一步 - Page 2) */}
            {activeScreen === "aiTriageInput" && (
              <div className="text-slate-900">
                <div className="bg-white py-4 px-5 border-b border-slate-100 flex justify-between items-center text-xs font-bold shrink-0">
                  <div className="flex items-center gap-1.5 text-[#005da7]">
                    <span className="w-5 h-5 flex items-center justify-center bg-[#005da7] text-white rounded-full text-[10px]">1</span>
                    <span>描述症状</span>
                  </div>
                  <div className="w-8 h-[1.5px] bg-slate-200"></div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-5 h-5 flex items-center justify-center bg-slate-100 text-slate-400 rounded-full text-[10px]">2</span>
                    <span>AI 分诊推荐</span>
                  </div>
                  <div className="w-8 h-[1.5px] bg-slate-200"></div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-5 h-5 flex items-center justify-center bg-slate-100 text-slate-400 rounded-full text-[10px]">3</span>
                    <span>自荐挂号</span>
                  </div>
                </div>

                <div className="p-5 text-left">
                  <h2 className="text-base font-extrabold leading-snug">请描述您的症状</h2>
                  <p className="text-[10px] text-slate-400 leading-relaxed mt-1">请告诉我们您的身体不适，CareConnect 独家全科临床 AI 引擎将为您引导至正确的针对性门诊科室。</p>

                  <div className="bg-white mt-4 p-4 rounded-3xl border border-slate-200/80 shadow-xs relative">
                    <textarea 
                      className="w-full h-36 border-0 text-xs text-slate-800 outline-none resize-none placeholder-slate-300 leading-relaxed"
                      placeholder="例：昨晚吃完海鲜后，今晨上腹部剧痛，伴发恶心呕吐和全身冷汗..."
                      value={symptomText}
                      onChange={(e) => setSymptomText(e.target.value)}
                    />
                    <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 mt-2">
                      <span className="text-[10px] text-slate-400">已输入 {symptomText.length} 字</span>
                      <div className="flex gap-2">
                        <button onClick={() => triggerToast("相机接入准备就绪")} className="p-2 bg-slate-50 text-slate-500 rounded-full hover:bg-slate-100">
                          <Camera className="w-4.5 h-4.5 text-[#005da7]" />
                        </button>
                        <button onClick={() => triggerToast("长按录音正在筹备中")} className="p-2 bg-[#005da7] text-white rounded-full hover:bg-[#004883]">
                          <Mic className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick selection tabs */}
                  <div className="mt-4">
                    <p className="text-[10px] text-slate-400 font-bold mb-2">常用不适体征 (点击自动补入文本栏)</p>
                    <div className="flex flex-wrap gap-2">
                      {["腹泻呕吐", "高烧咳嗽", "剧烈头痛", "胃区酸胀", "小儿厌食"].map((sym) => (
                        <button
                          key={sym}
                          onClick={() => setSymptomText(prev => prev ? prev + "，" + sym : sym)}
                          className="bg-white border border-slate-100 hover:border-slate-300 text-[10px] font-medium text-slate-700 px-3 py-1.5 rounded-full"
                        >
                          {sym}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Safety box */}
                  <div className="mt-5 bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex gap-3">
                    <ShieldAlert className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[10px] font-semibold text-slate-700">隐私与信息合规保障</h4>
                      <p className="text-[9px] text-slate-400 leading-relaxed mt-0.5">
                        您的主诉及不适信息均进行沙箱加密投档。智能分诊报告仅用作诊前提速、优化分诊推荐，不作临床用药结论。
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={isTriageLoading || !symptomText.trim()}
                    onClick={handleAISubmit}
                    className="w-full bg-[#005da7] hover:bg-[#004883] disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-md mt-6 flex justify-center items-center gap-1.5 transition"
                  >
                    {isTriageLoading ? (
                      <span className="flex items-center gap-2 text-xs">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        大语言模型医学计算深度检索中...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        开始 AI 医学预诊评估 <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* 6. AI TRIAGE RECOMMENDATION FINISH (导诊推荐科室完成 - Page 8) */}
            {activeScreen === "aiTriageFinish" && triageReport && (
              <div className="text-slate-900 px-5 pt-4">
                <div className="bg-emerald-50 border border-emerald-100/50 p-5 rounded-3xl text-center space-y-2 mb-4 shadow-xs">
                  <div className="w-10 h-10 bg-[#e8faef] border border-emerald-200/50 rounded-full flex items-center justify-center text-emerald-800 mx-auto font-bold text-sm">
                    ✓
                  </div>
                  <h2 className="font-extrabold text-sm text-slate-800">医学分诊计算分析就绪</h2>
                  <p className="text-[10px] text-slate-400 leading-normal">大核心模型已审阅您的自述体征，以下为您精选关联性最高的多轮内外科门诊：</p>
                </div>

                {/* Symptoms pills parsed */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs mb-4">
                  <span className="text-[9px] text-slate-400 block font-bold mb-2">核心提取不适症状:</span>
                  <div className="flex flex-wrap gap-2">
                    {triageReport.symptomsParsed.map((sym, i) => (
                      <span key={i} className="bg-red-50 text-red-700 text-[10px] px-2.5 py-1 rounded-full font-bold">
                        {sym}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Primary Recommended Department Card */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden mb-4">
                  <div className="absolute right-0 top-0 bg-[#e8faef] text-[#006d36] text-[9px] font-bold px-3 py-1 rounded-bl-2xl">
                    🎯 {triageReport.recommendedConfidence}% 最佳匹配
                  </div>
                  <span className="text-[9px] tracking-wider text-[#006d36] block font-bold">拟推荐就诊专科:</span>
                  <h3 className="text-xl font-black text-slate-800 mt-1">{triageReport.recommendedDept}</h3>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-2.5">
                    基于您反复描述的症状，考虑存在消化器官粘膜应激或组织受累。强烈建议优先挂号咨询该科室门诊。
                  </p>
                  
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span onClick={() => setActiveScreen("aiTriageReport")} className="text-[10px] text-[#005da7] hover:underline cursor-pointer font-bold flex items-center gap-1">
                      🔬 详细病志分析电子报告 <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Other related departments list sliders */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6 text-left space-y-3">
                  <span className="text-[9px] text-slate-400 block font-bold">其他潜在可能受累科室排查占比</span>
                  {triageReport.relatedDepts.map((related, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-700">{related.name}</span>
                        <span className="text-slate-400 font-mono">{related.matchRate}% 偏离值占比</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div style={{ width: `${related.matchRate}%` }} className="h-full bg-blue-500 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sticky jump action and book */}
                <button 
                  onClick={() => setActiveScreen("clinicList")}
                  className="w-full bg-[#005da7] hover:bg-[#004883] text-white font-bold py-3.5 rounded-2xl shadow-md flex justify-center items-center gap-1"
                >
                  前往预约挂号科室门诊 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* 7. AI PRE-TRIAGE REPORT DETAILS (预问诊报告详情 - Page 5) */}
            {activeScreen === "aiTriageReport" && triageReport && (
              <div className="text-slate-900 px-5 pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setActiveScreen("aiTriageFinish")} className="p-1 hover:bg-slate-100 rounded-lg">
                    <ChevronLeft className="w-5 h-5 text-slate-700" />
                  </button>
                  <h1 className="text-sm font-bold">预问诊辅断报告</h1>
                </div>

                {/* Detailed clinical medical sheet */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-md space-y-4 text-left font-sans">
                  <div className="text-center border-b border-dashed border-slate-200 pb-3">
                    <h2 className="text-base font-extrabold tracking-tight">CareConnect 人工智能导分诊报告单</h2>
                    <span className="text-[8px] font-mono text-slate-400">报告单条号: {triageReport.reportNo}</span>
                  </div>

                  {/* Patient bio */}
                  <div className="grid grid-cols-2 gap-3 text-[10px]">
                    <div>
                      <span className="text-slate-400 block">患者年龄:</span>
                      <span className="font-bold block mt-0.5">45 岁</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">患者性别:</span>
                      <span className="font-bold block mt-0.5">男</span>
                    </div>
                  </div>

                  {/* Clinical Description */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[9px] text-[#ba1a1a] font-bold block">核心不适靶区与体征:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {triageReport.symptomsParsed.map((sym, i) => (
                        <span key={i} className="bg-red-50 text-red-700 text-[9px] px-2.5 py-1 rounded-full font-bold">
                          {sym}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI Diagnosis block */}
                  <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-2xl space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-amber-800">📋 初步临床疑似筛查:</span>
                      <span className="bg-[#ba1a1a]/5 text-[#ba1a1a] text-[8px] px-1.5 py-0.5 rounded">仅供参考</span>
                    </div>
                    <h4 className="text-xs font-extrabold text-[#ba1a1a]">{triageReport.aiDiagnosis}</h4>
                    <p className="text-[10px] text-[#7f5300] leading-relaxed mt-1.5">{triageReport.aiExplanation}</p>
                  </div>

                  {/* Clinical advice */}
                  <div>
                    <span className="text-[9px] text-slate-400 block font-bold">拟诊科室及检查建议:</span>
                    <span className="text-xs font-extrabold text-emerald-800 mt-0.5 block">对口科室: {triageReport.recommendedDept} (95% 偏特异性)</span>
                    <p className="text-[10px] text-slate-600 leading-relaxed mt-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">{triageReport.clinicalAdvice}</p>
                  </div>

                  {/* Lifestyle directions */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[9px] text-[#006d36] block font-bold">居家护理预后保养建议:</span>
                    <div className="space-y-2">
                      {triageReport.lifestyleAdvice.map((adv, i) => (
                        <div key={i} className="flex gap-2 text-[10px] text-slate-500 leading-normal">
                          <span className="text-[#006d36] font-extrabold">✓</span>
                          <p>{adv}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveScreen("clinicList")}
                  className="w-full bg-[#005da7] hover:bg-[#004883] text-white font-bold py-3.5 rounded-xl shadow-md mt-6"
                >
                  去医院预约挂号门诊
                </button>
              </div>
            )}

            {/* 8. DOCTOR CHAT टेली-कंसल्टेशन (在线医生交流聊天室 - Image 9) */}
            {activeScreen === "doctorChat" && (
              <div className="text-slate-900 h-full flex flex-col justify-between relative bg-slate-50">
                
                {/* Custom inner consulting header */}
                <div className="bg-[#005da7] text-white py-4 px-4 flex items-center justify-between shadow-xs sticky top-0 z-15">
                  <button onClick={() => setActiveScreen("home")} className="p-1 hover:bg-white/10 rounded-lg">
                    <ChevronLeft className="w-4.5 h-4.5 text-white" />
                  </button>
                  <div className="text-center">
                    <h3 className="font-bold text-xs">张医生</h3>
                    <span className="text-[8px] text-emerald-100 flex items-center justify-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> 在线接诊中
                    </span>
                  </div>
                  <HelpCircle className="w-5 h-5 text-white opacity-80" />
                </div>

                {/* Message elements container */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar max-h-[500px]">
                  <div className="text-center">
                    <span className="text-[8px] bg-slate-200/50 text-slate-400 px-2 py-0.5 rounded-full font-mono">2026-06-08 10:15</span>
                  </div>

                  {chatHistory.map((msg, idx) => (
                    <div 
                      key={msg.id}
                      className={`flex items-start gap-2.5 ${msg.isDoctor || msg.isAI ? "" : "flex-row-reverse"}`}
                    >
                      {/* Avatar initials badge */}
                      <span className={`w-8.5 h-8.5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 border ${
                        msg.isAI ? "bg-emerald-50 text-[#006d36] border-emerald-100" :
                        msg.isDoctor ? "bg-blue-50 text-[#005da7] border-blue-100" :
                        "bg-slate-200 text-slate-700"
                      }`}>
                        {msg.isAI ? "🤖" : msg.isDoctor ? "张" : "我"}
                      </span>

                      {/* Msg text bubble block */}
                      <div className="max-w-[70%] space-y-1">
                        <span className="text-[9px] text-slate-400 block px-1">{msg.sender}</span>
                        <div className={`p-3 rounded-2xl text-[11px] leading-relaxed shadow-xs ${
                          msg.isAI ? "bg-emerald-50 text-emerald-800 border-emerald-100 rounded-tl-sm" :
                          msg.isDoctor ? "bg-white text-slate-800 rounded-tl-sm border-slate-100" :
                          "bg-[#005da7] text-white rounded-tr-sm"
                        }`}>
                          {msg.content.split("\n").map((line, lidx) => (
                            <p key={lidx} className={line.startsWith("•") ? "pl-2 -indent-2 mt-0.5" : ""}>{line}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Static Prebuilt Prescription Card inside dialogue */}
                  <div className="flex gap-2.5">
                    <span className="w-8.5 h-8.5 rounded-full bg-blue-50 text-[#005da7] font-bold text-xs flex items-center justify-center shrink-0 border border-blue-100">
                      张
                    </span>
                    <div className="max-w-[70%] space-y-1 text-left">
                      <span className="text-[9px] text-slate-400 block px-1">张医生</span>
                      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3.5">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 text-[10px]">
                          <span className="font-extrabold text-[#005da7] flex items-center gap-1">
                            📋 消化专科电子处方笺
                          </span>
                          <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold">待支付</span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">阿莫西林胶囊 <span className="text-[10px] text-slate-400 font-normal">0.5g * 24粒</span></h4>
                          <p className="text-[9px] text-slate-400 mt-1">用法：口服，每日3餐后各2粒。温水吞服。</p>
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                          <button 
                            onClick={() => {
                              setSelectedDrugDraft(mockPrescriptions[0].drugs[0]);
                              setActiveScreen("medicineDetails_Sheet");
                            }}
                            className="text-[#005da7] hover:underline text-[9px] font-bold"
                          >
                            查看药品规格详情 &gt;
                          </button>
                          <button 
                            onClick={() => {
                              setBookingFee(29.9);
                              setActiveScreen("paymentCashier");
                            }}
                            className="bg-[#005da7] hover:bg-[#004883] text-white font-bold text-[9px] px-3.5 py-1.5 rounded-lg shadow-xs"
                          >
                            处方一键买药 ¥29.90
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div ref={chatBottomRef}></div>
                </div>

                {/* Chat text input */}
                <div className="bg-white p-3 border-t border-slate-100 flex items-center gap-2">
                  <button onClick={() => triggerToast("长按语音输入启用")} className="p-2 text-slate-400 hover:text-[#005da7]">
                    <Mic className="w-5 h-5 text-[#005da7]" />
                  </button>
                  <input 
                    type="text" 
                    placeholder="在这里回复张医生细节..." 
                    className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs outline-none"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && currentMessage.trim()) {
                        handleSendChatMessage(currentMessage);
                        setCurrentMessage("");
                      }
                    }}
                  />
                  <button 
                    disabled={!currentMessage.trim()}
                    onClick={() => {
                      handleSendChatMessage(currentMessage);
                      setCurrentMessage("");
                    }}
                    className="p-2 bg-[#005da7] text-white rounded-full hover:bg-[#004883] disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 9. MEDICINE DETAILS BOTTOM SHEET POPUP SCREEN (药品规格详情 - Page 6) */}
            {activeScreen === "medicineDetails_Sheet" && (
              <div className="text-slate-900 px-5 pt-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-md text-left space-y-4 font-sans relative">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h2 className="text-base font-extrabold flex items-center gap-1.5">
                      💊 执配专科处方药品详情
                    </h2>
                    <span onClick={() => setActiveScreen("doctorChat")} className="text-xs text-slate-400 font-bold hover:text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full cursor-pointer">关闭</span>
                  </div>

                  {/* Header Title Specs */}
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800">阿莫西林胶囊</h3>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Amoxicillin Capsules</span>
                  </div>

                  {/* Dosages table row */}
                  <div className="space-y-2.5 text-xs">
                    <div className="bg-slate-50 p-3 rounded-2xl flex justify-between">
                      <span className="text-slate-400">制剂规格:</span>
                      <span className="font-semibold text-slate-800">0.5g * 24粒 / 盒</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl flex justify-between">
                      <span className="text-slate-400">用法与每日服量:</span>
                      <span className="font-semibold text-slate-800 text-right">口服。每日3次，每次1粒。餐后服</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl flex justify-between">
                      <span className="text-slate-400">开方处量:</span>
                      <span className="font-semibold text-[#005da7]">1 盒 (¥29.90 / 盒)</span>
                    </div>
                  </div>

                  {/* Warning labels columns */}
                  <div className="space-y-2">
                    <div className="bg-red-50 text-red-800 p-3 rounded-2xl border border-red-100">
                      <h4 className="text-[10px] font-bold flex items-center gap-1">⚠️ 可能的不良反应 (Side Effects):</h4>
                      <p className="text-[9px] leading-relaxed mt-1">口服本敏抗生药物偶见恶心反应、肠蠕动加快、稀便或过敏性红疹。</p>
                    </div>
                    <div className="bg-amber-50 text-amber-800 p-3 rounded-2xl border border-amber-100">
                      <h4 className="text-[10px] font-bold flex items-center gap-1">🚫 严格禁忌症 (Allergen Info):</h4>
                      <p className="text-[9px] leading-relaxed mt-1">青霉素相关过敏体质人群、红斑狼疮携带者绝对禁用。用药前建议行皮试。</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveScreen("doctorChat")}
                    className="w-full bg-[#005da7] hover:bg-[#004883] text-white font-bold py-3.5 rounded-xl shadow-md flex justify-center items-center gap-1"
                  >
                     确认了解规格说明
                  </button>
                </div>
              </div>
            )}

            {/* 10. PAYMENT CASHIER CENTER (结算收银支付中心 - Page 11) */}
            {activeScreen === "paymentCashier" && (
              <div className="text-slate-900 px-5 pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setActiveScreen("home")} className="p-1 hover:bg-slate-100 rounded-lg">
                    <ChevronLeft className="w-5 h-5 text-slate-700" />
                  </button>
                  <h1 className="text-sm font-bold">结算收银中心</h1>
                </div>

                {/* Simulated payment detail */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center relative overflow-hidden">
                  <div className="absolute right-0 top-0 bg-yellow-50 text-yellow-800 text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                    ⌛ 待支付
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">待支付扣除金额</p>
                  <p className="text-3xl font-black text-[#005da7] mt-1">¥{bookingFee.toFixed(2)}</p>
                  
                  <div className="border-t border-slate-100 mt-5 pt-4 grid grid-cols-2 text-left text-[10px] gap-2.5">
                    <div>
                      <span className="text-slate-400">解缴服务项目</span>
                      <p className="font-bold text-slate-800 mt-1">
                        {[10, 20, 30].includes(bookingFee) ? "门诊预约 / 临床会诊挂号" : "自营医疗药品及健康设备采购"}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">网银账款单流水号</span>
                      <p className="font-mono text-slate-500 mt-1">VC202606080112</p>
                    </div>
                  </div>
                </div>

                {/* Subscriptions checking radio lists */}
                <div className="mt-5 text-left">
                  <span className="text-[10px] text-slate-400 font-bold block mb-2.5">请选择解缴和抵扣方式</span>
                  <div className="space-y-2.5">
                    {[
                      { id: "insure", label: "医保个账支付扣减 (推荐)", sub: "个账可用余额 ¥3,580.00", icon: "🏛️", check: true },
                      { id: "wechat", label: "微信免密直接结算", sub: "拉起微信内置钱包收银通道", icon: "🟢", check: false },
                      { id: "alipay", label: "直接扫码及联扣付", sub: "拉起支付宝内置支付收银台", icon: "🔵", check: false },
                    ].map((m) => (
                      <label 
                        key={m.id}
                        className="bg-white p-4 rounded-2xl border border-slate-100 focus-within:border-[#005da7] hover:border-slate-300 shadow-xs flex items-start gap-3 cursor-pointer transition"
                      >
                        <input type="radio" name="pay_type_ch" defaultChecked={m.check} className="accent-[#005da7] mt-1 shrink-0" />
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                            <span>{m.icon}</span> <span>{m.label}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 leading-normal">{m.sub}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="text-center py-4 text-[9px] text-slate-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" /> 由智慧医疗安全支付系统以及省职工医保库对接联保
                </div>

                {/* Big bottom action purchase */}
                <button 
                  onClick={handleConfirmPayment}
                  className="w-full bg-[#005da7] hover:bg-[#004883] text-white font-bold py-4 rounded-2xl shadow-md flex justify-center items-center gap-1 transition"
                >
                  确认个账结算 ¥{bookingFee}.00
                </button>
              </div>
            )}

            {/* 11. ELECTRONIC MEDICAL INSURANCE CARD DETAILS (医保电子凭证 - Page 10) */}
            {activeScreen === "medicalCard" && (
              <div className="text-slate-900 px-5 pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setActiveScreen("home")} className="p-1 hover:bg-slate-100 rounded-lg">
                    <ChevronLeft className="w-5 h-5 text-slate-700" />
                  </button>
                  <h1 className="text-sm font-bold">医保电子卡详情</h1>
                </div>

                {/* Premium gradient card */}
                <div className="bg-gradient-to-br from-[#006d36] to-[#005da7] p-5 rounded-3xl text-white shadow-md text-left relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 opacity-10 text-9xl">🇨🇳</div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[8px] uppercase tracking-wider block text-emerald-100 font-bold">中华人民共和国医疗保障</span>
                      <h2 className="text-base font-extrabold mt-0.5">国家医保电子凭证</h2>
                    </div>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[8px] font-bold">职工参保</span>
                  </div>

                  <div className="mb-6">
                    <span className="text-[9px] text-emerald-100">持卡人</span>
                    <p className="text-lg font-black tracking-wide mt-0.5">张 * 三 <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-normal ml-2">北京职工医保</span></p>
                  </div>

                  <div className="flex justify-between items-end border-t border-white/20 pt-4 text-[10px]">
                    <div>
                      <span className="text-emerald-100">医保存号编码</span>
                      <p className="font-mono mt-0.5 tracking-widest">3201 ********** 5678</p>
                    </div>
                    <div onClick={() => triggerToast("二维码已在窗口极速渲染")} className="bg-white text-slate-800 p-1.5 rounded-lg font-bold text-[9px] shadow-sm cursor-pointer hover:scale-105 transition">
                      🔲 展示二维码
                    </div>
                  </div>
                </div>

                {/* Tonal Account balances */}
                <div className="bg-white p-5 rounded-[24px] border border-slate-100/85 mt-4 text-left flex justify-between items-center shadow-xs">
                  <div>
                    <span className="text-[9px] text-slate-400">个账钱包可用余额</span>
                    <h3 className="text-xl font-bold text-[#005da7] mt-1">¥3,580.00</h3>
                  </div>
                  <button onClick={() => triggerToast("账目流水已完成最新同步")} className="text-xs text-[#005da7] font-semibold flex items-center gap-1 shadow-xs bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                    <RefreshCw className="w-3.5 h-3.5" /> 刷新
                  </button>
                </div>

                {/* Sub-functions grids list */}
                <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                  {[
                    { n: "就诊记录", i: "🕒" },
                    { n: "缴费记录", i: "🧾" },
                    { n: "结算划拔", i: "💳" },
                    { n: '报销明细', i: '💰' }
                  ].map((act, i) => (
                    <div key={i} onClick={() => triggerToast(`${act.n}检索开通中`)} className="bg-white p-2.5 rounded-2xl border border-slate-100 cursor-pointer hover:border-slate-300 shadow-xs">
                      <span className="text-xl mb-1 block">{act.i}</span>
                      <span className="text-[10px] text-slate-700 font-bold block">{act.n}</span>
                    </div>
                  ))}
                </div>

                {/* Sharing family accounts member card binder */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 mt-4 text-left shadow-sm mb-10">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                    <div>
                      <h4 className="font-bold text-xs">医保家庭成员账户共济</h4>
                      <p className="text-[9px] text-slate-400 leading-normal mt-0.5">支持关联您直系亲属（父母/配偶/儿女）个账代支付</p>
                    </div>
                    <span className="text-[8px] bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full py-0.5 px-2 font-mono font-bold">1/5 绑定额度</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">李</div>
                      <div>
                        <p className="text-[10px] font-bold">李四 <span className="bg-indigo-50 text-[#005da7] text-[8px] border border-indigo-100 px-1 py-0.5 rounded ml-1">配偶</span></p>
                        <p className="text-[9px] font-mono text-slate-400 mt-0.5">3201**********8888</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>

                  <button 
                    onClick={() => triggerToast("家庭共济绑定功能已加载")}
                    className="w-full py-3 border border-dashed border-slate-200 text-slate-400 text-center rounded-2xl text-[10px] font-bold hover:border-[#005da7] hover:text-[#005da7] transition"
                  >
                    ➕ 共济直系亲属实名认证添加
                  </button>
                </div>
              </div>
            )}

            {/* 12. MY PRESCRIPTIONS LIST HISTORIES (我的处方页 - Page 12) */}
            {activeScreen === "myPrescriptions" && (
              <div className="text-slate-900 px-5 pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setActiveScreen("home")} className="p-1 hover:bg-slate-100 rounded-lg">
                    <ChevronLeft className="w-5 h-5 text-slate-700" />
                  </button>
                  <h1 className="text-sm font-bold">我的处方笺病志</h1>
                </div>

                {/* Core Prescriptions block */}
                <div className="space-y-4 mb-10 text-left">
                  {mockPrescriptions.map((pres) => (
                    <div key={pres.id} className="bg-white p-5 rounded-3xl border border-slate-100/85 shadow-sm space-y-3.5 relative overflow-hidden">
                      <div className="absolute right-0 top-0 text-[9px] font-bold px-3 py-1 rounded-bl-2xl uppercase tracking-wider font-mono shadow-xs block" style={{
                        backgroundColor: pres.status === "可续方" ? "#e8faef" : "#f2f4f7",
                        color: pres.status === "可续方" ? "#006d36" : "#414751"
                      }}>
                        {pres.status}
                      </div>

                      <div className="flex gap-2 text-xs">
                        <span className="w-8.5 h-8.5 bg-blue-50 text-[#005da7] font-bold rounded-full flex items-center justify-center shrink-0 border border-blue-100">{pres.doctorName[0]}</span>
                        <div>
                          <h4 className="font-extrabold text-slate-800">{pres.doctorName} <span className="bg-[#e4f1fc] text-[#005da7] text-[8px] px-1 rounded-md font-normal font-mono">{pres.dept}</span></h4>
                          <span className="text-[9px] text-slate-400 block mt-1">{pres.hospital} • {pres.date}</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[10px] space-y-1.5 leading-relaxed">
                        <p className="text-slate-700 font-bold"><span className="text-slate-400">诊断结果:</span> {pres.diagnosis}</p>
                        <p className="text-slate-500 font-bold"><span className="text-slate-400">执药配案:</span> {pres.drugs.map(dr => `${dr.name} x${dr.qty.replace("盒", "")}`).join("、")}</p>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-slate-100">
                        <button 
                          onClick={() => {
                            setSelectedDrugDraft(pres.drugs[0]);
                            setActiveScreen("medicineDetails_Sheet");
                          }}
                          className="flex-1 py-2 rounded-xl text-[10px] font-bold bg-slate-50 border border-slate-100 text-slate-700 hover:bg-slate-100 text-center transition shadow-xs"
                        >
                          查看处方单详情
                        </button>
                        {pres.status === "可续方" && (
                          <button 
                            onClick={() => {
                              setSelectedDrugDraft(pres.drugs[0]);
                              setActiveScreen("medicineDetails_Sheet");
                              triggerToast("续方审核发起。即将接入执业医师临床签字审定。");
                            }}
                            className="flex-1 py-2 rounded-xl text-[10px] font-bold bg-[#005da7] hover:bg-[#004883] text-white text-center transition shadow-xs"
                          >
                            递交申请续方
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 13. MINI MERCHANT MALL - PRODUCTS LIST (微商城药品罗列 - Page 14) */}
            {activeScreen === "mall" && (
              <div className="text-gray-900 text-left flex flex-col h-full bg-[#F9FAFB] min-h-[716px]">
                {/* Header */}
                <div className="bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between shadow-xs sticky top-0 z-10">
                  <span className="text-xs font-bold tracking-widest text-[#005da7] uppercase">自营健康药铺</span>
                  <div className="relative cursor-pointer" onClick={() => setShowCartModal(true)}>
                    <ShoppingCart className="w-5 h-5 text-gray-700 hover:text-[#005da7] transition" />
                    {cart.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-bold text-[8px] rounded-full w-4 h-4 flex items-center justify-center border border-white">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Body scroll */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4 pb-20 no-scrollbar max-h-[660px]">
                  {/* Slogan Banner */}
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-10/40 relative overflow-hidden">
                    <span className="absolute right-2 bottom-0 text-5xl opacity-15">🏥</span>
                    <h3 className="text-xs font-bold text-[#005da7] flex items-center gap-1">✨ 一站式医保统筹直算</h3>
                    <p className="text-[9px] text-gray-500 mt-1 leading-relaxed">
                      原厂优选、极速发货，全站支持个人自费及医保个人账户余额直抵。点击可看临床药理。
                    </p>
                  </div>

                  {/* Search input */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input 
                      type="text" 
                      placeholder="检索感冒药、抗生素、血压仪..."
                      value={searchProductQuery}
                      onChange={(e) => setSearchProductQuery(e.target.value)}
                      className="w-full bg-white text-xs border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 outline-hidden focus:border-[#005da7] transition shadow-xs"
                    />
                    {searchProductQuery && (
                      <button 
                        onClick={() => setSearchProductQuery("")}
                        className="text-[10px] text-red-500 absolute right-3 top-3 font-semibold"
                      >
                        清除
                      </button>
                    )}
                  </div>

                  {/* Category tabs scroll */}
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
                    {["全部", "药物", "医疗器械", "保健食品"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg shrink-0 text-[10px] font-bold transition border ${
                          activeCategory === cat 
                            ? "bg-gray-900 text-white border-gray-900 shadow-xs" 
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Products card list */}
                  <div className="grid grid-cols-2 gap-3 pb-8">
                    {mockProducts
                      .filter(p => {
                        const matchCat = activeCategory === "全部" || p.category === activeCategory;
                        const matchQuery = p.name.includes(searchProductQuery) || p.description.includes(searchProductQuery);
                        return matchCat && matchQuery;
                      })
                      .map((prod) => (
                        <div 
                          key={prod.id} 
                          className="bg-white rounded-2xl border border-gray-100/90 shadow-xs flex flex-col justify-between overflow-hidden hover:border-gray-200 hover:shadow-sm transition"
                        >
                          {/* Image box area */}
                          <div 
                            className="bg-gray-50 h-28 flex flex-col items-center justify-center cursor-pointer relative"
                            onClick={() => {
                              setSelectedProduct(prod);
                              setActiveScreen("mallDetails");
                            }}
                          >
                            <span className="text-4xl">{prod.emoji}</span>
                            <span className="absolute bottom-1.5 left-1.5 bg-white text-gray-600 text-[7px] font-bold px-1.5 py-0.5 rounded border border-gray-100 scale-90 origin-left">
                              {prod.badge}
                            </span>
                          </div>

                          {/* Words details */}
                          <div className="p-3 flex-grow flex flex-col justify-between space-y-2 text-left">
                            <div 
                              className="space-y-1 cursor-pointer"
                              onClick={() => {
                                setSelectedProduct(prod);
                                setActiveScreen("mallDetails");
                              }}
                            >
                              <h3 className="text-[11px] font-bold text-gray-800 line-clamp-1">
                                {prod.name}
                              </h3>
                              <p className="text-[8px] text-gray-400 font-medium">
                                规格：{prod.specs}
                              </p>
                              <p className="text-[8px] text-gray-400 line-clamp-2 leading-relaxed">
                                {prod.description}
                              </p>
                            </div>

                            {/* Cost action row */}
                            <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                              <div>
                                <span className="text-xs font-extrabold text-[#ba1a1a]">¥{prod.price.toFixed(2)}</span>
                                {prod.originalPrice && (
                                  <span className="text-[8px] text-gray-300 line-through ml-1">¥{prod.originalPrice.toFixed(0)}</span>
                                )}
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(prod, 1);
                                }}
                                className="w-5 h-5 bg-[#005da7] hover:bg-[#004883] text-white rounded-md flex items-center justify-center font-bold text-xs"
                                title="加入购物车"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                    {/* Empty view */}
                    {mockProducts.filter(p => {
                      const matchCat = activeCategory === "全部" || p.category === activeCategory;
                      const matchQuery = p.name.includes(searchProductQuery) || p.description.includes(searchProductQuery);
                      return matchCat && matchQuery;
                    }).length === 0 && (
                      <div className="col-span-2 py-12 text-center text-[10px] text-gray-400">
                        🛋️ 未搜到对应药品门类，请更换检索词
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 13.5. MINI MERCHANT MALL MEDICINE DETAILS (微商城药品详情 - Page 14-Details) */}
            {activeScreen === "mallDetails" && (
              <div className="text-gray-900 text-left flex flex-col h-full bg-[#F9FAFB] min-h-[716px] relative">
                {/* Header */}
                <div className="bg-white px-4 py-4 border-b border-gray-100 flex items-center justify-between shadow-xs sticky top-0 z-100">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setActiveScreen("mall")} className="p-1 hover:bg-gray-100 rounded-lg shrink-0">
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <span className="text-xs font-bold tracking-widest text-[#005da7] uppercase">药品与健康产品详情</span>
                  </div>
                  <div className="relative cursor-pointer" onClick={() => setShowCartModal(true)}>
                    <ShoppingCart className="w-5 h-5 text-gray-700 hover:text-[#005da7] transition" />
                    {cart.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-bold text-[8px] rounded-full w-4 h-4 flex items-center justify-center border border-white">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sub-body scroll */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4 pb-24 no-scrollbar max-h-[660px]">
                  {/* Dynamic Product Visual Card */}
                  <div className="bg-white overflow-hidden rounded-[24px] border border-gray-100 shadow-sm">
                    <div className="bg-gray-50 h-44 flex flex-col items-center justify-center text-slate-400 relative">
                      <span className="text-6xl">{selectedProduct.emoji}</span>
                      <span className="absolute left-3.5 top-3.5 bg-[#e8faef] text-[#006d36] text-[8px] font-bold px-2 py-0.5 rounded-md border border-emerald-100 uppercase">
                        {selectedProduct.badge}
                      </span>
                    </div>

                    <div className="p-4 space-y-1.5 text-left">
                      <div className="flex justify-between items-baseline">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-extrabold text-[#ba1a1a]">¥{selectedProduct.price.toFixed(2)}</span>
                          {selectedProduct.originalPrice && (
                            <span className="text-xs text-slate-300 line-through">¥{selectedProduct.originalPrice.toFixed(2)}</span>
                          )}
                        </div>
                        <span className="text-[9px] text-[#005da7] bg-blue-50 px-2 py-0.5 rounded font-bold">自营三方核验</span>
                      </div>
                      <h2 className="text-xs font-bold text-gray-800">{selectedProduct.name} ({selectedProduct.specs})</h2>
                      <p className="text-[10px] text-gray-500 leading-relaxed">{selectedProduct.description}</p>
                    </div>
                  </div>

                  {/* Clinical Indicators */}
                  <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-xs space-y-3 text-left">
                    <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1">📋 临床核定药理指标</h3>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-650 font-medium">
                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <span className="text-gray-400 block text-[9px]">剂型/类型</span>
                        <strong className="block mt-0.5 font-bold text-gray-700">{selectedProduct.pharmacology.dosageForm}</strong>
                      </div>
                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <span className="text-gray-400 block text-[9px]">批准文号</span>
                        <strong className="block mt-0.5 font-mono text-gray-700">{selectedProduct.pharmacology.approvalNo}</strong>
                      </div>
                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <span className="text-gray-400 block text-[9px]">保质储存</span>
                        <strong className="block mt-0.5 font-bold text-gray-700">{selectedProduct.pharmacology.storage}</strong>
                      </div>
                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <span className="text-gray-400 block text-[9px]">适用群体</span>
                        <strong className="block mt-0.5 font-bold text-gray-700">{selectedProduct.pharmacology.target}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Directions and warnings */}
                  <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-xs space-y-3 text-xs leading-relaxed text-gray-500 pb-5 text-left">
                    <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1 font-display">⚠️ 服用与安全重要指征</h3>
                    <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 space-y-2 text-[#7f5300] text-[10px]">
                      <p className="font-bold">1. 指引说明 (Directions):</p>
                      <p>{selectedProduct.directions}</p>
                      <p className="font-bold pt-1">2. 禁忌/成分过敏警惕 (Warnings):</p>
                      <p className="text-[#ba1a1a]">{selectedProduct.contraindications}</p>
                    </div>
                  </div>
                </div>

                {/* Actions purchase sticky bar */}
                <div className="absolute bottom-0 inset-x-0 bg-white border-t border-gray-100 p-3.5 flex gap-2.5 z-20 shadow-xl shrink-0">
                  <button 
                    onClick={() => addToCart(selectedProduct, 1)} 
                    className="flex-1 py-3 border border-[#005da7] bg-white text-[#005da7] hover:bg-blue-50/30 font-bold rounded-xl text-center text-xs shadow-xs transition duration-200 cursor-pointer"
                  >
                    加入购物车
                  </button>
                  <button 
                    onClick={() => {
                      setBookingFee(selectedProduct.price);
                      setActiveScreen("paymentCashier");
                    }} 
                    className="flex-1 py-3 bg-[#005da7] hover:bg-[#004883] text-white font-bold rounded-xl text-center text-xs shadow-md hover:shadow-lg transition duration-200 cursor-pointer"
                  >
                    立即购买
                  </button>
                </div>
              </div>
            )}

            {/* 14. MY ORDERS HISTORY LEDGER (我的结算订单记录表 - Page 15) */}
            {activeScreen === "myOrders" && (
              <div className="text-slate-900 px-5 pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setActiveScreen("home")} className="p-1 hover:bg-slate-100 rounded-lg">
                    <ChevronLeft className="w-5 h-5 text-slate-700" />
                  </button>
                  <h1 className="text-sm font-bold">我的挂号/设备订单</h1>
                </div>

                {/* Filter segments bar */}
                <div className="flex border-b border-slate-100 justify-between items-center text-xs font-semibold mb-3">
                  {["全部", "待支付", "待就诊", "已完成"].map((seg, se_i) => (
                    <span 
                      key={seg} 
                      className={`pb-1.5 px-2 cursor-pointer transition ${
                        se_i === 0 ? "border-b-2 border-[#005da7] text-[#005da7]" : "text-slate-400"
                      }`}
                    >
                      {seg}
                    </span>
                  ))}
                </div>

                {/* Dynamic Orders roster */}
                <div className="space-y-4 mb-10 text-left">
                  {mockOrders.map((ord) => (
                    <div key={ord.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3 relative overflow-hidden">
                      <div className="flex justify-between items-center border-b border-slate-50 pb-2 text-[10px] font-bold">
                        <span className="text-slate-400 font-mono">订单号: {ord.id}</span>
                        <span className="text-[#005da7] bg-blue-50 px-2 py-0.5 rounded-full">{ord.status}</span>
                      </div>

                      <div className="flex gap-2">
                        <span className="w-9 h-9 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center text-lg shadow-inner">
                          {ord.type === "门诊挂号" ? "🩺" : "🩸"}
                        </span>
                        <div>
                          <h4 className="font-bold text-xs text-slate-800">{ord.title}</h4>
                          <span className="text-[9px] text-slate-400 block mt-0.5">{ord.subTitle}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-105">
                        <div>
                          <span className="text-[9px] text-slate-400">解缴金额</span>
                          <span className="text-xs font-black text-slate-800 block mt-0.5">¥{ord.amount}.00</span>
                        </div>
                        <div className="flex gap-2.5">
                          {ord.status === "待支付" ? (
                            <button 
                              onClick={() => {
                                setBookingFee(ord.amount);
                                setActiveScreen("paymentCashier");
                              }}
                              className="bg-[#005da7] hover:bg-[#004883] text-white px-3.5 py-1.5 rounded-xl text-[10px] font-bold shadow-xs transition"
                            >
                              确认支付账单
                            </button>
                          ) : (
                            <button 
                              onClick={() => {
                                triggerToast("就诊凭据单二维码下载完成！请线下主动亮码。");
                              }}
                              className="bg-[#006d36] text-white px-3.5 py-1.5 rounded-xl text-[10px] font-bold shadow-xs transition"
                            >
                              亮码就诊
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 15. MESSAGE THREADS WINDOW (消息盒子 - Page 16) */}
            {activeScreen === "messageCenter" && (
              <div className="text-slate-900 text-left">
                <div className="bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between shadow-xs sticky top-0 z-10">
                  <span className="text-sm font-bold">健康会诊交互盒子</span>
                  <HelpCircle className="w-5 h-5 text-[#005da7]" />
                </div>

                <div className="px-5 pt-3">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center gap-2 text-xs">
                    <Search className="w-4 h-4 text-slate-400 ml-1" />
                    <span className="text-slate-300">检索临床大夫及健康周记通知</span>
                  </div>
                </div>

                <div className="p-4 space-y-3 mb-10">
                  {mockThreads.map((th) => (
                    <div 
                      key={th.id}
                      onClick={() => {
                        if (th.type === "doctor") setActiveScreen("doctorChat");
                        else if (th.type === "ai") setActiveScreen("aiTriageInput");
                        else triggerToast("系统重要挂号回款单推单。请长按亮码核销。");
                      }}
                      className="bg-white p-4 rounded-3xl border border-slate-100 hover:border-indigo-100 transition cursor-pointer flex gap-3.5 items-center shadow-xs relative"
                    >
                      <img src={th.avatar} className="w-10 h-10 rounded-full object-cover shrink-0" alt="avatar" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h4 className="font-bold text-xs text-slate-800 truncate">{th.name}</h4>
                          <span className="text-[8px] text-slate-400 font-mono shrink-0">{th.time}</span>
                        </div>
                        <p className="text-[9px] text-slate-400 truncate mt-1">{th.lastMessage}</p>
                      </div>
                      
                      {th.unreadCount > 0 && (
                        <span className="w-4 h-4 bg-red-600 text-white rounded-full text-[8px] font-bold flex items-center justify-center shrink-0">
                          {th.unreadCount}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 16. PROFILE DASHBOARD (个人中心 - Page 13) */}
            {activeScreen === "profileMe" && (
              <div className="text-gray-900 text-left flex flex-col h-full bg-[#F3F6FB] min-h-[716px] overflow-hidden">
                {/* Header matching screenshot header */}
                <div className="bg-[#F3F6FB] px-5 pt-3.5 pb-2.5 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2 text-[#005da7] font-bold text-base">
                    <span className="bg-[#005da7] text-white p-1 rounded-md text-[10px] font-black leading-none flex items-center justify-center w-5 h-5 shadow-xs">✚</span>
                    <span className="font-display font-extrabold tracking-tight text-[#005da7] text-base">CareConnect Health</span>
                  </div>
                  <div className="relative">
                    <Bell className="w-5 h-5 text-gray-750 hover:text-[#005da7] transition cursor-pointer" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#F3F6FB]"></span>
                  </div>
                </div>

                {/* Body scroll */}
                <div className="flex-1 overflow-y-auto px-5 space-y-4 pb-20 no-scrollbar max-h-[660px]">
                  {/* User Profile Card */}
                  <div className="bg-white p-4.5 rounded-[24px] border border-gray-100 shadow-xs flex items-center justify-between gap-3 mt-1.5">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        {/* High quality user profile avatar matching screenshot */}
                        <img 
                          src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&h=150&w=150&q=80" 
                          alt="张三" 
                          className="w-13 h-13 rounded-full object-cover border-2 border-gray-150 shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                        {/* Blue check icon */}
                        <div className="absolute -bottom-1 -right-1 bg-[#005da7] border-2 border-white text-white rounded-full p-0.5 shadow-xs w-4.5 h-4.5 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3.5px]" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-gray-900 leading-none">
                          张三 
                        </h3>
                        <p className="text-[10px] text-gray-400 font-medium mt-1.5 whitespace-nowrap">ID: +86 138 **** 5678</p>
                      </div>
                    </div>
                    {/* 编辑资料 button */}
                    <button 
                      onClick={() => triggerToast("编辑个人资料模块载入中...")}
                      className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50/50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition shadow-xs border border-blue-50 shrink-0"
                    >
                      <Pencil className="w-3.5 h-3.5 text-blue-600" />
                      <span>编辑资料</span>
                    </button>
                  </div>

                  {/* 2x2 grid of quick action health blocks */}
                  <div className="grid grid-cols-2 gap-3.5">
                    {[
                      { 
                        n: "我的预约", 
                        sub: "待就诊", 
                        count: "2", 
                        active: "myOrders", 
                        icon: Calendar, 
                        iconBg: "bg-blue-50 text-blue-600",
                        iconColor: "text-blue-600"
                      },
                      { 
                        n: "我的订单", 
                        sub: "检查与药品", 
                        count: "5", 
                        active: "myOrders", 
                        icon: Clipboard, 
                        iconBg: "bg-emerald-50 text-emerald-600",
                        iconColor: "text-emerald-600"
                      },
                      { 
                        n: "我的处方", 
                        sub: "可续方", 
                        count: "3", 
                        active: "myPrescriptions", 
                        icon: Heart, 
                        iconBg: "bg-amber-50 text-amber-500",
                        iconColor: "text-amber-500"
                      },
                      { 
                        n: "健康档案", 
                        sub: "查看历史", 
                        count: "", 
                        active: "medicalCard", 
                        icon: FileText, 
                        iconBg: "bg-slate-100 text-slate-500",
                        iconColor: "text-slate-500"
                      },
                    ].map((it, i) => {
                      const CardIcon = it.icon;
                      return (
                        <div 
                          key={i} 
                          onClick={() => {
                            if (it.active === "myPrescriptions") {
                              triggerToast("载入您的电子门诊处方签列表...");
                            }
                            setActiveScreen(it.active);
                          }}
                          className="bg-white p-4.5 rounded-[24px] border border-gray-100/60 shadow-xs relative cursor-pointer hover:shadow-xs hover:border-gray-200 transition text-left flex flex-col justify-between h-[105px]"
                        >
                          {/* Upper section */}
                          <div className="flex justify-between items-start">
                            <div className={`p-2 rounded-xl ${it.iconBg} flex items-center justify-center shrink-0`}>
                              <CardIcon className={`w-4.5 h-4.5 ${it.iconColor}`} />
                            </div>
                            {it.count && (
                              <span className="bg-[#ba1a1a] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center leading-none">
                                {it.count}
                              </span>
                            )}
                          </div>
                          {/* Lower section */}
                          <div className="mt-2 text-left">
                            <h4 className="text-[12px] font-extrabold text-gray-800 leading-none">{it.n}</h4>
                            <p className="text-[9px] text-gray-400 mt-1 font-medium">{it.sub}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* WeChat list navigation cards */}
                  <div className="bg-white rounded-[24px] border border-gray-100 shadow-xs overflow-hidden mb-8 text-left">
                    {[
                      { label: "实名认证", icon: ShieldCheck, badge: "已实名", id: "verified", iconColor: "text-blue-500", iconBg: "bg-blue-50" },
                      { label: "电子医疗卡", icon: CreditCard, badge: "已激活", id: "medicalCard", iconColor: "text-blue-500", iconBg: "bg-blue-50" },
                      { label: "我的购物车", icon: ShoppingCart, id: "cart_trigger", iconColor: "text-gray-500", iconBg: "bg-gray-100" },
                      { label: "账号设置", icon: Settings, id: "settings", iconColor: "text-gray-500", iconBg: "bg-gray-100" },
                      { label: "帮助中心", icon: HelpCircle, id: "help", iconColor: "text-gray-500", iconBg: "bg-gray-100" },
                    ].map((row, r_i) => {
                      const RowIcon = row.icon;
                      return (
                        <div 
                          key={r_i}
                          onClick={() => {
                            if (row.id === "verified") triggerToast("中国身份实名实测关联成功！");
                            else if (row.id === "settings") triggerToast("由于隐私加密限制，请至微信设置管理！");
                            else if (row.id === "cart_trigger") setShowCartModal(true);
                            else if (row.id === "help") triggerToast("如果您需要帮助，请联系服务中心！");
                            else setActiveScreen(row.id);
                          }}
                          className="py-3.5 px-4.5 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition cursor-pointer flex justify-between items-center"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${row.iconBg} flex items-center justify-center shrink-0`}>
                              <RowIcon className={`w-4 h-4 ${row.iconColor}`} />
                            </div>
                            <span className="text-xs font-extrabold text-gray-850">{row.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {row.badge && (
                              <span className="bg-blue-50 text-[#005da7] text-[9px] px-1.5 py-0.5 rounded font-bold">
                                {row.badge}
                              </span>
                            )}
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* SHOPPING CART BOTTOM SLIDE-UP DRAWER OVERLAY */}
          {showCartModal && (
            <div className="absolute inset-0 bg-black/60 z-50 flex flex-col justify-end">
              {/* Tap to close background */}
              <div className="flex-1" onClick={() => setShowCartModal(false)}></div>
              
              {/* Drawer Container */}
              <div className="bg-white rounded-t-[28px] max-h-[500px] overflow-hidden flex flex-col shadow-2xl relative text-left select-none animate-slide-up">
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div>
                    <h3 className="text-xs font-extrabold text-gray-800 flex items-center gap-1">🏷️ 智慧健康自营收银袋</h3>
                    <p className="text-[8px] text-gray-400 mt-0.5">支持线上全国统筹医保个账直抵或自付抵扣</p>
                  </div>
                  <button 
                    onClick={() => setShowCartModal(false)}
                    className="text-[10px] font-bold text-gray-450 hover:text-gray-650 bg-gray-100/70 border border-gray-200/50 px-2.5 py-1 rounded-lg"
                  >
                    关闭
                  </button>
                </div>

                {/* Items list container */}
                <div className="flex-grow overflow-y-auto p-4 space-y-3 no-scrollbar max-h-[300px]">
                  {cart.length === 0 ? (
                    <div className="py-14 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
                      <span className="text-4xl">🛒</span>
                      <span className="font-semibold text-gray-400 text-[10px]">自营购物车空空如也，快去挑选健康商品吧！</span>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.product.id} className="flex justify-between items-center gap-3 p-3 bg-gray-50/80 rounded-2xl border border-gray-100 shadow-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-2xl bg-white p-1 rounded-xl shadow-xs border border-gray-100 shrink-0">{item.product.emoji}</span>
                          <div className="min-w-0">
                            <h4 className="text-[10px] font-bold text-gray-800 truncate">{item.product.name}</h4>
                            <span className="text-[8px] text-gray-400 block">规格：{item.product.specs}</span>
                            <span className="text-[10px] font-extrabold text-[#ba1a1a] block mt-0.5">¥{(item.product.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button 
                            onClick={() => updateCartQuantity(item.product.id, -1)}
                            className="w-5 h-5 rounded-md bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center p-0"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold w-5 text-center text-gray-800">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQuantity(item.product.id, 1)}
                            className="w-5 h-5 rounded-md bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center p-0"
                          >
                            +
                          </button>
                          <button 
                            onClick={() => removeFromCart(item.product.id)}
                            className="ml-1 text-[8px] font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100/80 px-2 py-1 rounded-md"
                          >
                            移除
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Bottom summary and buy now trigger */}
                {cart.length > 0 && (
                  <div className="p-4 border-t border-gray-100 bg-white space-y-3 shrink-0">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-800">
                      <span>商品总计金额：</span>
                      <span className="text-[#ba1a1a] text-sm font-extrabold">
                        ¥{cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setCart([]);
                          triggerToast("自营药铺购物车已全部清空");
                        }}
                        className="py-2.5 px-3 border border-gray-200 hover:bg-gray-50 text-gray-500 text-[9px] font-bold rounded-xl transition"
                      >
                        清空
                      </button>
                      <button 
                        onClick={() => {
                          const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
                          setBookingFee(total);
                          setShowCartModal(false);
                          setActiveScreen("paymentCashier");
                        }}
                        className="flex-1 py-2.5 bg-[#005da7] hover:bg-[#004883] text-white font-bold rounded-xl text-center text-xs shadow-xs transition"
                      >
                        合并去收银台支付 (共 {cart.reduce((sum, item) => sum + item.quantity, 0)} 件)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STICKY BOTTOM WECHAT NAVIGATION MENU BAR */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-white/95 backdrop-blur-md border-t border-gray-100 z-45 flex justify-around items-center px-2 shadow-lg shrink-0">
            {[
              { id: "home", label: "首页", icon: Home },
              { id: "triage", label: "分诊", icon: Stethoscope },
              { id: "mall", label: "商城", icon: ShoppingCart },
              { id: "message", label: "消息", icon: MessageSquare },
              { id: "me", label: "我的", icon: User }
            ].map((tab) => {
              const IconComp = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabSwitch(tab.id)}
                  className={`flex flex-col items-center justify-center p-1.5 transition-all duration-250 select-none cursor-pointer rounded-xl ${
                    isSelected 
                      ? "bg-[#eefcf3] text-[#00a854] font-black border border-emerald-100 px-3.5" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 px-2.5"
                  }`}
                  style={{ minWidth: "64px" }}
                >
                  <IconComp className={`w-4.5 h-4.5 ${isSelected ? "scale-105 stroke-[2.5px]" : "stroke-[2px]"}`} />
                  <span className="text-[9px] font-extrabold mt-1 tracking-wide">{tab.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* RIGHT COLUMN: CLINICAL UX INTENT INTRO & CODE EXPORTER WORKSPACE */}
      <div className="flex-1 bg-[#F9FAFB] p-5 lg:p-7 flex flex-col justify-start overflow-y-auto no-scrollbar border-t md:border-t-0 md:border-l border-gray-200">
        
        {/* Workspace panel tabs selector */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-4 mb-5 shrink-0 gap-4">
          <div>
            <div className="text-xs text-blue-700 font-bold font-mono uppercase tracking-widest flex items-center gap-1.5 mb-1 bg-blue-50 px-3 py-1 rounded-full w-fit">
              <Settings className="w-3.5 h-3.5" /> 微信小程序原型优化调试器
            </div>
            <h1 className="text-xl font-display font-black text-gray-900">CareConnect DevTool</h1>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setDevWorkspaceTab("rationality")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                devWorkspaceTab === "rationality" 
                  ? "bg-blue-50 text-blue-700 shadow-xs border border-blue-100" 
                  : "bg-white border border-gray-200 hover:bg-gray-50 text-gray-650"
              }`}
            >
              <Info className="w-4 h-4" /> 合理性与设计分析
            </button>
            <button
              onClick={() => setDevWorkspaceTab("code")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                devWorkspaceTab === "code" 
                  ? "bg-gray-900 text-white shadow-xs" 
                  : "bg-white border border-gray-200 hover:bg-gray-50 text-gray-650"
              }`}
            >
              <Code className="w-4 h-4" /> 拷贝/导出优化后代码
            </button>
          </div>
        </div>

        {/* ACTIVE SCREEN STATE CONTROLLER METADATA CARD */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 shrink-0 flex items-start gap-4 shadow-xs">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-lg shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              当前展示的微信小程序视图 (排班/时段已互联)
            </span>
            <h3 className="text-base font-extrabold text-gray-900 mt-1">
              {activeDocDetail ? activeDocDetail.title : "微信门诊就医流程子页面"}
            </h3>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              提示：在左侧手机视图中点击挂号或智能分诊输入不适，可直接连入大语言模型测试真实医学病志报告！
            </p>
          </div>
        </div>

        {/* TAB CONTENTS 1: RATIONALITY ANALYSES */}
        {devWorkspaceTab === "rationality" && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-left space-y-6 flex-1 shadow-xs h-[400px] overflow-y-auto no-scrollbar">
            <div>
              <h1 className="text-xs font-bold uppercase tracking-widest text-gray-400">UI Rationality Audit</h1>
              <h3 className="text-sm font-bold text-gray-950 mt-1 pb-2 border-b border-gray-100 flex items-center gap-1.5">
                🔎 针对微信生态适老人群的 UX 合理性判断
              </h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                针对微信小程序医疗门诊多路径、多层级造成的用户焦虑感，我们秉持「低负担，高精度、极速分流」的产品演进思路：
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100 overflow-hidden shadow-xs">
              {activeDocDetail ? (
                activeDocDetail.rationality.map((rat, idx) => {
                  let alertClass = "text-green-600";
                  let alertBg = "bg-green-50/20";
                  let alertChar = "✓";
                  if (idx === 1) {
                    alertClass = "text-blue-600 font-bold";
                    alertBg = "bg-blue-50/20";
                    alertChar = "!";
                  } else if (idx === 2) {
                    alertClass = "text-amber-500";
                    alertBg = "bg-amber-50/20";
                    alertChar = "⚠";
                  }
                  return (
                    <div key={idx} className={`p-4 flex items-start space-x-3 ${alertBg}`}>
                      <div className={`mt-0.5 shrink-0 ${alertClass} font-bold text-sm`}>{alertChar}</div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">优化审查机制 第 {idx + 1} 条</p>
                        <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{rat}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-xs text-gray-400">请在左侧切换至拥有完整优化详情的高频视图。</div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 text-gray-500 leading-relaxed text-xs">
              <h4 className="font-bold text-gray-800 text-xs mb-1.5">💡 大厅挂号及预问诊流程优化决策 (Product Decisions)</h4>
              <ul className="list-disc pl-5 space-y-2 text-gray-500 text-[11px]">
                <li><strong className="text-gray-750">门诊降压策略</strong>：在导诊 Step 1、AI 分析报告等板块大量引入淡雅、安心的浅绿和莫兰迪蓝，降低传统医疗刺眼的白色和尖锐几何感造成的“白大褂恐惧效应”。</li>
                <li><strong className="text-gray-750">离线数据缓存设计</strong>：微信网络断链率极高。我们的代码模板完美支持 Local Rules Fallback 引擎，哪怕用户在地下车库或急诊走廊，依然能获得瞬时本地诊断。</li>
                <li><strong className="text-gray-750">闭环收银路径</strong>：将医保统筹扣划一键引入。先支持个账抵扣、再支持余付款拉起微信钱包混合支付，极大提高了医疗合规账款的吞吐量和结清率。</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB CONTENTS 2: TECHNICAL CODE EXPORTER */}
        {devWorkspaceTab === "code" && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-left flex-1 flex flex-col justify-between overflow-hidden shadow-xs">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                📦 挂载及精细化 React TypeScript + Tailwind 模板代码
              </span>
              <button
                onClick={handleCopyCode}
                className="bg-gray-900 hover:bg-gray-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition"
              >
                {copiedNotification ? "✓ 已拷贝到剪切板" : "📋 复制当前视图代码"}
              </button>
            </div>

            {/* Code CodeBlock with custom styling inside pre scroll */}
            <div className="flex-grow bg-gray-900 rounded-lg p-5 font-mono text-[11px] leading-relaxed text-gray-300 relative overflow-auto no-scrollbar h-[380px] border border-gray-800 shadow-inner">
              <div className="absolute top-3 right-3 text-[10px] text-gray-500 uppercase font-bold tracking-widest">Tailwind / React</div>
              <pre className="no-scrollbar">
                <code>{activeDocDetail ? activeDocDetail.codeSnippet : "// 无代码样本"}</code>
              </pre>
            </div>

            <p className="text-[10px] text-gray-400 mt-2.5 leading-relaxed">
              * 您可以直接右键选择一键复制并将此代码并入您的原生微信小程序微型框架组件中，完美支持 standard React + Tailwind Class 配给。
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
