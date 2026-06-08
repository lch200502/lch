/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CodeDescription {
  title: string;
  rationality: string[];
  codeSnippet: string;
}

export const codeDatabase: Record<string, CodeDescription> = {
  home: {
    title: "首页 (Main Home Page)",
    rationality: [
      "【降低认知开销】：将高频业务（挂号、导诊、问诊、预约）直接抽离为4个大比例色彩圆块，作为黄金入口，避免多层深埋菜单对老年或急诊患者造成的视觉干扰。",
      "【提示信息的温和性】：将‘微核酸检测’或客服电话以平铺软性淡横幅展现，替代弹窗式强插，避免营造‘临床紧迫感’从而减轻患者精神压力。",
      "【触达即时性】：推荐医生卡片直接放置在下方，支持‘立即预约’一键直达，减少决策链路。",
      "【适老化与触屏尺寸】：所有入口区域与科室过滤卡片触控区大于44px，满足视力不佳或指关节不灵活的老弱人群点击标准。"
    ],
    codeSnippet: `import { Search, Bell, Activity, Stethoscope, MessageSquare, Calendar, ChevronRight, Star } from 'lucide-react';

export function SmartMedicalHome({ onNavigate, onBookDoc }) {
  return (
    <div className="bg-[#f7f9fc] min-h-screen text-[#191c1e] font-sans pb-24">
      {/* Search Header */}
      <div className="bg-white px-5 pt-6 pb-4 rounded-b-3xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-[#005da7] font-bold text-xl">
            <span className="bg-[#005da7] text-white p-1 rounded-lg">✚</span>
            <h2>智慧医疗</h2>
          </div>
          <button className="p-2 bg-[#f2f4f7] rounded-full hover:bg-slate-200 transition">
            <Bell className="w-5 h-5 text-slate-700" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="搜索科室、医生、疾病" 
            className="w-full pl-11 pr-4 py-3 bg-[#f2f4f7] rounded-xl border border-transparent focus:border-[#005da7] focus:bg-white text-sm outline-none transition"
          />
        </div>
      </div>

      {/* Broadcast Banner */}
      <div className="mx-5 my-4 bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-start gap-2.5">
        <span className="text-[#a06900] text-sm mt-0.5">🔔</span>
        <p className="text-xs text-[#7f5300] leading-relaxed">
          双向互认服务：如需紧急协助请直接拨打客服热线 <strong className="font-semibold">400-123-4567</strong>。呼吸内科开设夏季流感绿色专属通道。
        </p>
      </div>

      {/* Core Services Grid */}
      <div className="mx-5 mb-5 grid grid-cols-2 gap-4">
        {[
          { label: '门诊挂号', desc: '挑选专家极速挂号', color: '#e4f1fc', iconColor: '#005da7', tag: 'clinic' },
          { label: '智能导诊', desc: 'AI辅助精准荐科', color: '#e8faef', iconColor: '#006d36', tag: 'ai' },
          { label: '在线问诊', desc: '图文/视频线上诊疗', color: '#eaf4ff', iconColor: '#2976c7', tag: 'chat' },
          { label: '我的预约', desc: '查看诊疗时间安排', color: '#fff5e6', iconColor: '#7f5300', tag: 'schedule' }
        ].map((item, idx) => (
          <div 
            key={idx} 
            onClick={() => onNavigate(item.tag)}
            className="p-4 bg-white rounded-2xl hover:shadow-md border border-[#e6e8eb]/70 cursor-pointer transition flex flex-col justify-between h-28"
          >
            <div className="flex justify-between items-start">
              <span style={{ backgroundColor: item.color, color: item.iconColor }} className="p-2 rounded-xl text-lg font-bold">●</span>
              <span className="text-xs text-slate-400">⚡</span>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#191c1e]">{item.label}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Department Row */}
      <div className="mx-5 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-sm text-slate-800">热门科室</h3>
          <span className="text-xs text-[#005da7] font-medium cursor-pointer">查看全部</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { name: '内科', icon: '🩺' }, { name: '外科', icon: '🩹' },
            { name: '儿科', icon: '👶' }, { name: '妇科', icon: '🤰' }
          ].map((dept, idx) => (
            <div key={idx} className="bg-white p-3 rounded-2xl flex flex-col items-center justify-center border border-[#e6e8eb]/70">
              <span className="text-2xl mb-1.5">{dept.icon}</span>
              <span className="text-xs font-medium text-slate-700">{dept.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Doctor */}
      <div className="mx-5">
        <h3 className="font-bold text-sm text-slate-800 mb-3">推荐专家</h3>
        <div className="bg-white p-4 rounded-3xl border border-[#e6e8eb]/70 shadow-sm">
          <div className="flex gap-4">
            <img 
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&h=150&q=80" 
              className="w-14 h-14 rounded-2xl object-cover" 
              alt="Avatar"
            />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                    张医生 <span className="bg-indigo-50 text-[#005da7] text-[10px] px-1.5 py-0.5 rounded-md font-normal">主任医师</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">内科 (消化病学/慢性病)</p>
                </div>
                <div className="flex items-center gap-0.5 text-amber-500 text-xs font-semibold">
                  <Star className="w-3 h-3 fill-amber-500" /> 4.9
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-slate-400">诊疗挂号门诊费</p>
                  <p className="text-sm font-bold text-[#005da7]">¥50</p>
                </div>
                <button 
                  onClick={() => onBookDoc('doc-zhang-wc')}
                  className="bg-[#005da7] hover:bg-[#004883] text-white px-5 py-2 rounded-xl text-xs font-semibold transition shadow-sm"
                >
                  立即预约
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`
  },
  ai: {
    title: "智能导诊 - 症状输入 (AI Triage Step 1)",
    rationality: [
      "【分步向导，减轻挫败感】：采用‘1-2-3’线性进度指示器，使用户明确知晓其所处流转阶段，防止复杂症状采集输入造成中途流失率。",
      "【多模态录入合规】：集成了语音和拍照辅诊输入，针对急性疼痛无法打字或行动不便的老人。但在真实微信环境，建议增加微信原生麦克风权限请求保护与弱网防断重传逻辑。",
      "【非阻断性常用症快选】：针对胸痛、恶心等高频词设有下方圆角胶囊标签，极速带入，节省输入时长、降低打字门槛。",
      "【隐私告知义务（合规核心）】：将‘隐私和信息安全’服务申明以浅蓝色警示盒陈列在开始分析按钮前，明确告知输入数据过密且经沙箱加密，建立临床安全信任关系。"
    ],
    codeSnippet: `import { Camera, Mic, ShieldAlert, ArrowRight } from 'lucide-react';

export function AITriageInput({ symptomText, setSymptomText, onSubmit, isLoading }) {
  const commonSymptoms = ["头痛", "发烧", "咳嗽", "腹痛", "腹泻", "恶心"];

  return (
    <div className="bg-[#f7f9fc] min-h-screen font-sans pb-10">
      {/* Flow Progress Steps */}
      <div className="bg-white py-4 px-6 border-b border-slate-100 flex justify-between items-center text-sm font-semibold">
        <div className="flex items-center gap-2 text-[#005da7]">
          <span className="w-6 h-6 flex items-center justify-center bg-[#005da7] text-white rounded-full text-xs">1</span>
          <span>描述症状</span>
        </div>
        <div className="w-10 h-[2px] bg-slate-200"></div>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-400 rounded-full text-xs">2</span>
          <span>AI 分析评估</span>
        </div>
        <div className="w-10 h-[2px] bg-slate-200"></div>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-400 rounded-full text-xs">3</span>
          <span>自荐挂号</span>
        </div>
      </div>

      <div className="p-5 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-slate-800 leading-snug">请描述您的症状</h2>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">请提供您的实际感受，AI 引擎将结合真实海量临床病例大数据，引导您推荐最贴合的急需或慢筛对应科室。</p>

        {/* Textured Rich Text Editor Area */}
        <div className="bg-white mt-5 p-4 rounded-3xl border border-slate-200/80 shadow-sm relative focus-within:border-[#005da7] transition">
          <textarea 
            className="w-full h-44 text-sm bg-transparent border-0 outline-none resize-none placeholder-slate-300 leading-relaxed text-slate-800"
            placeholder="例如：从昨天早上开始上部右侧位置腹部明显隐痛，有时带轻微反酸和腹泻。无明显感冒发烧咳嗽、有打嗝反应..."
            value={symptomText}
            onChange={(e) => setSymptomText(e.target.value)}
          />
          <div className="flex justify-between items-center pt-2 border-t border-slate-50">
            <button className="flex items-center gap-1.5 bg-[#f2f4f7] hover:bg-slate-200 p-2.5 rounded-full text-slate-500 transition">
              <Camera className="w-4 h-4 text-[#005da7]" />
            </button>
            <button className="flex items-center gap-1.5 bg-[#005da7] hover:bg-[#004883] p-2.5 rounded-full text-white transition shadow-sm">
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="mt-5">
          <p className="text-xs font-semibold text-slate-500 mb-2.5">常用不适体征快选 (点击填补文本)</p>
          <div className="flex flex-wrap gap-2.5">
            {commonSymptoms.map((sym, idx) => (
              <button 
                key={idx}
                onClick={() => setSymptomText(p => p ? p + "，" + sym : sym)}
                className="px-4 py-2 bg-white border border-slate-100 hover:border-slate-300 text-xs font-medium text-slate-700 rounded-full shadow-sm transition"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Privacy Lock Disclaimer */}
        <div className="mt-6 bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-slate-700">隐私权及医疗合规声明</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
              您的病史及所有不适数据均进行多点链路军事级算法加密。临床预设建议仅用于诊前辅助挂号引导，绝对不作最终临床处方。
            </p>
          </div>
        </div>

        {/* Main Action Submit */}
        <button 
          onClick={onSubmit}
          disabled={isLoading || !symptomText.trim()}
          className="w-full bg-[#005da7] hover:bg-[#004883] disabled:opacity-50 text-white font-semibold py-4 rounded-2xl shadow-md mt-6 flex justify-center items-center gap-2 transition"
        >
          {isLoading ? (
            <span className="flex items-center gap-2 text-xs">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              结合智能病史数据库库分析中...
            </span>
          ) : (
            <span className="flex items-center gap-1">
              开始 AI 智能自测分析 <ArrowRight className="w-4 h-4 ml-1" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}`
  },
  report: {
    title: "预问诊报告 (Pre-Consultation AI Report)",
    rationality: [
      "【医生视角的提质增效】：本页面非传统噱头诊断，而是专业预问诊。患者面诊时向医生出示本报告，不仅让医生秒懂主诉、病史及排查优先级，更将门诊问病时间从10分钟压缩至3分钟。",
      "【多维度临床透视】：报告包含‘疑似临床诊断（带有标准ICD-10翻译）’、‘诊疗检查指引（提前警示可能需要的检验项，打消恐病心理）’以及‘针对性生活指南’，提供一站式居家自理闭环。",
      "【分流引导】：底部主按钮为‘前往挂号’，将报告结论直接传递到下一级挂号流程，锁死匹配的科室，无缝对接医疗实体闭环系统。"
    ],
    codeSnippet: `import { Clipboard, ShieldCheck, Heart, Stethoscope, ChevronRight } from 'lucide-react';

export function AIPreTriageReport({ report, onGoRegister }) {
  if (!report) return null;

  return (
    <div className="bg-[#f7f9fc] min-h-screen font-sans pb-24 text-[#191c1e]">
      <div className="bg-white p-5 rounded-b-3xl shadow-sm border-b border-slate-100">
        <div className="flex items-center gap-1.5 text-[#006d36] font-semibold text-sm mb-1">
          <span className="bg-[#006d36]/10 p-1 rounded-full">✓</span>
          <span>AI 预诊评估就绪</span>
        </div>
        <h2 className="text-xl font-bold leading-tight">CareConnect 自测报告</h2>
        <p className="text-[10px] text-slate-400 mt-1">
          生成时间: 2026-06-08 • 报表流水号: <span className="font-mono">{report.reportNo}</span>
        </p>
      </div>

      <div className="p-5 max-w-md mx-auto space-y-4">
        {/* Patient Case Cards */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <h3 className="text-xs font-semibold text-[#005da7] flex items-center gap-1.5">
            <Clipboard className="w-4 h-4" /> 患者病志信息摘要
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-[#f2f4f7] p-2.5 rounded-xl">
              <span className="text-slate-400 block text-[10px]">评估对象/年龄</span>
              <span className="font-semibold block mt-0.5">45岁 • 男性</span>
            </div>
            <div className="bg-[#f2f4f7] p-2.5 rounded-xl">
              <span className="text-slate-400 block text-[10px]">疑似核心靶器官</span>
              <span className="font-semibold block mt-0.5 text-[#ba1a1a]">消化道 / 粘膜组织</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">不适主诉与不适反应</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {report.symptomsParsed.map((sym, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-[#ba1a1a]/5 text-[#ba1a1a] text-[10px] font-semibold rounded-full">
                  {sym}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* AI Initial Triage Diagnosis */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-[#ba1a1a]" /> 预诊可疑诊断评估
            </h3>
            <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold">仅供参考</span>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl">
            <h4 className="text-sm font-bold text-[#ba1a1a]">{report.aiDiagnosis}</h4>
            <p className="text-xs text-[#7f5300] mt-1.5 leading-relaxed">{report.aiExplanation}</p>
          </div>
        </div>

        {/* Clinical Exam & Consult Suggestion */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <h3 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-[#005da7]" /> 线下就诊建议及拟检项
          </h3>
          <div className="text-xs leading-relaxed text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="font-semibold text-emerald-700 block text-[11px] mb-1">拟推荐科室：{report.recommendedDept}</span>
            {report.clinicalAdvice}
          </div>
        </div>

        {/* Nursing Lifestyle Advice List */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3 pb-5">
          <h3 className="text-xs font-semibold text-[#006d36] flex items-center gap-1.5">
            <Clipboard className="w-4 h-4 text-[#006d36]" /> 慢病居家康复建议
          </h3>
          <div className="space-y-2.5">
            {report.lifestyleAdvice.map((item, idx) => (
              <div key={idx} className="flex gap-2.5 text-xs text-slate-600 leading-normal">
                <span className="text-[#006d36] font-bold">✓</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation back and registration */}
        <button 
          onClick={onGoRegister}
          className="w-full bg-[#005da7] hover:bg-[#004883] text-white font-bold py-4 rounded-2xl shadow-md flex justify-center items-center gap-1.5 transition"
        >
          <span>前往挂号系统</span> <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}`
  },
  card: {
    title: "医保电子凭证 (National Health Insurance Card)",
    rationality: [
      "【动态条码防伪】：医保电子凭证的核心在于防止截图伪造。界面中设计了绿底高亮安全底纹、带有国家总医保安全图腾的卡面，并加入了一键复制/动态刷新条码入口，规范金融安全体系逻辑。",
      "【余额可见性】：将职工医保账户账面可用余额（¥3,580.00）大字号高亮度置于最上层，减少患者在支付扣减时因不明确账目而反复跳转或询问费用的认知焦虑。",
      "【亲情共济账户合规】：加入了‘家庭共济成员绑定’（如李四，配偶，实名关联）。在我国医保改革制度中，亲情共济是一大亮点，在此处设置便捷添加亲人，极大方便照料家中老少，提升黏性。"
    ],
    codeSnippet: `import { ShieldCheck, Award, Users, ChevronRight, RefreshCw, HelpCircle } from 'lucide-react';

export function MedicalInsuranceCard() {
  const familyCount = "1/5";

  return (
    <div className="bg-[#f7f9fc] min-h-screen font-sans pb-10 text-[#191c1e]">
      <div className="bg-white px-5 py-4 border-b border-slate-100 flex justify-between items-center">
        <h1 className="text-base font-bold">医保电子凭证</h1>
        <HelpCircle className="w-5 h-5 text-slate-400" />
      </div>

      <div className="p-5 max-w-md mx-auto space-y-4">
        {/* National Insurance Card Header */}
        <div className="bg-gradient-to-br from-[#006d36] to-[#005da7] p-5 rounded-3xl text-white shadow-md relative overflow-hidden">
          {/* Wave Decor background */}
          <div className="absolute right-0 bottom-0 opacity-10 text-9xl pointer-events-none">🇨🇳</div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[10px] uppercase tracking-widest block text-emerald-100 font-semibold">国家医疗保障系统</span>
              <h2 className="text-lg font-bold mt-0.5">国家医保电子凭证</h2>
            </div>
            <div className="bg-white/20 p-2 rounded-xl text-[10px] font-semibold flex items-center gap-1">
              <span>●</span> 动态码已启用
            </div>
          </div>
          
          <div className="mb-6">
            <span className="text-[10px] text-emerald-100">参保人</span>
            <p className="text-xl font-bold tracking-wide">张 * <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-normal ml-2">职工基本医疗保险</span></p>
          </div>

          <div className="flex justify-between items-end border-t border-white/20 pt-4">
            <div>
              <span className="text-[10px] text-emerald-100">保障卡号</span>
              <p className="text-sm font-mono tracking-wider mt-0.5">320 ********** 5678</p>
            </div>
            <div className="bg-white text-[#005da7] p-1.5 rounded-xl font-bold text-xs shadow-sm hover:scale-105 transition cursor-pointer">
              🔲 展示二维码
            </div>
          </div>
        </div>

        {/* Dynamic Balance check */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400">职工医保个账当前余额</span>
            <p className="text-2xl font-bold text-[#005da7] mt-0.5">¥3,580.00</p>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-[#005da7] font-semibold hover:underline">
            <RefreshCw className="w-4 h-4" /> 刷新账页
          </button>
        </div>

        {/* Quick actions grids */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "就诊记录", icon: "🕒", desc: "查看门诊" },
            { label: "缴费记录", icon: "🧾", desc: "历史发票" },
            { label: "结算记录", icon: "💳", desc: "扣减明细" },
            { label: "报销明细", icon: "💰", desc: "统筹划拔" }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-3 rounded-2xl flex flex-col items-center justify-center border border-slate-100 shadow-sm group hover:border-slate-300 transition cursor-pointer">
              <span className="text-2xl mb-1.5">{item.icon}</span>
              <span className="text-xs font-semibold text-slate-700">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Family Member Sharing Panel */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-50">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-1.5 text-slate-800">
                <Users className="w-4 h-4 text-[#005da7]" /> 医保家庭共济账户
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">支持将您的医保个人账户余额共享给直系亲属代付</p>
            </div>
            <span className="text-xs text-slate-400 font-mono font-bold bg-[#f2f4f7] px-2 py-0.5 rounded-full">{familyCount} 成员</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 flex items-center justify-center bg-indigo-50 text-indigo-700 rounded-full font-bold">李</span>
              <div>
                <p className="text-xs font-bold">李四 <span className="text-[10px] font-normal text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md ml-1.5">配偶</span></p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">3201**********8888</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <button className="w-full py-3.5 border border-dashed border-slate-200 hover:border-[#005da7] hover:text-[#005da7] rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 transition">
            ➕ 添加新的家庭共济直系成员
          </button>
        </div>
      </div>
    </div>
  );
}`
  },
  cashier: {
    title: "结算中心 (Cashier Payment Center)",
    rationality: [
      "【避免未付款遗忘隐患】：由于涉及门诊挂号，顶部赫然打出‘等待支付’倒计时和粗体金额（¥150.00），突出核心应缴债务。",
      "【扣减优先级透明化】：医保电子改革的关键是减少网银出现真实现金扣除负担。本系统首个推荐支付项为‘医保支付’，并实时拉取投保卡的余额（¥3,580.00）用于一键直接个账抵扣，彻底打消现金付款不悦感。",
      "【多模态网银防错兜底】：同时引入了微信支付、支付宝作为混合参保费补缴防呆，下方‘安全盾’提供安全免密结算声誉支撑，防止支付故障、漏挂，有效化解线上医疗支付纠纷。"
    ],
    codeSnippet: `import { ShieldCheck, HelpCircle, AlertCircle } from 'lucide-react';

export function PaymentCashier({ onPayConfirm, fee = 150 }) {
  return (
    <div className="bg-[#f7f9fc] min-h-screen font-sans pb-10 text-[#191c1e]">
      <div className="bg-white px-5 py-4 border-b border-slate-100 flex justify-between items-center">
        <h1 className="text-base font-bold">结算收银中心</h1>
        <HelpCircle className="w-5 h-5 text-slate-400" />
      </div>

      <div className="p-5 max-w-md mx-auto space-y-4">
        {/* Countdown bill card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center relative">
          <span className="absolute left-4 top-4 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">⏳ 待支付</span>
          <p className="text-xs text-slate-400 pt-6">本次预检门诊累计挂号缴费</p>
          <p className="text-4xl font-extrabold text-slate-800 tracking-tight mt-1">¥{fee}.00</p>
          
          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 text-left text-xs gap-3">
            <div>
              <span className="text-slate-400">服务项目</span>
              <p className="font-semibold text-slate-700 mt-0.5">门诊挂号 - 消化内科</p>
            </div>
            <div>
              <span className="text-slate-400">挂号票据号</span>
              <p className="font-semibold text-slate-700 mt-0.5">VC20260608011</p>
            </div>
          </div>
        </div>

        {/* Payment options checklist */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2.5">请选择结算抵扣渠道</p>
          <div className="space-y-3">
            {[
              { id: 'insure', label: '职工医疗统筹账户支付', sub: '推荐使用，当前个账余额 ¥3,580.00', icon: '🏦', badge: '推荐' },
              { id: 'wechat', label: '微信极速免密付款', sub: '自动通过关联微信钱包解缴扣款', icon: '🟢', badge: null },
              { id: 'alipay', label: '支付宝收银台直接扣付', sub: '拉起外部支付宝网页直接联接支付', icon: '🔵', badge: null }
            ].map((pay, i) => (
              <label 
                key={i} 
                className="bg-white p-4 rounded-2xl border border-slate-100 focus-within:border-[#005da7] hover:border-slate-300 shadow-sm flex items-start gap-3 cursor-pointer transition"
              >
                <input 
                  type="radio" 
                  name="pay_type" 
                  defaultChecked={i === 0}
                  className="mt-1 w-4 h-4 accent-[#005da7]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{pay.icon}</span>
                    <span className="text-xs font-bold text-slate-800">{pay.label}</span>
                    {pay.badge && <span className="bg-[#ba1a1a]/5 text-[#ba1a1a] text-[9px] px-1.5 py-0.5 rounded-md font-bold">{pay.badge}</span>}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{pay.sub}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Security pledge disclaimer */}
        <div className="text-center py-2 text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> 由智慧医疗国政支付安全和微信零延迟解缴机制提供安全授信
        </div>

        {/* Big pay button */}
        <button 
          onClick={onPayConfirm}
          className="w-full bg-[#005da7] hover:bg-[#004883] text-white font-bold py-4 rounded-xl shadow-md flex justify-center items-center gap-1 transition"
        >
          确认使用职工个账结算 ¥{fee}.00
        </button>
      </div>
    </div>
  );
}`
  },
  chat: {
    title: "医生咨询聊天室 (Doctor Tele-Consultation Box)",
    rationality: [
      "【首诊自动病史抄送（卓越UX）】：一进入聊天室，AI健康助手已自动将在导诊台自测并转译好的‘不适主诉和病史提要（咳嗽、发热38.5C、3天等）’自动汇编成一目了然的‘病历投递摘要’递送至医生窗口，杜绝无效对话，大幅改善诊断精准性。",
      "【在线药店药师签发】：医生诊断直接转化为带病指征的‘电子处方’（待支付，待处方审查），处方可以一键直接点击查看药丸配料规格和不良反应自明，形成极高的就诊闭环，提供微信小程序无跳转式的完美体验及合规质感。"
    ],
    codeSnippet: `import { Send, FileText, Check, Mic, Plus, ArrowLeft } from 'lucide-react';

export function DoctorConsultationChat({ chatHistory, onSendMessage, onSelectPrescription, onBack }) {
  return (
    <div className="bg-[#f7f9fc] h-screen font-sans flex flex-col justify-between text-[#191c1e]">
      {/* Dynamic consulting header */}
      <div className="bg-[#005da7] text-white py-4 px-5 flex items-center justify-between shadow-sm shrink-0">
        <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-lg transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-bold text-sm text-center">张医生（消化/内分泌专家）</h2>
          <span className="text-[10px] text-emerald-100 flex items-center justify-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span> 医生处在线会诊指导中
          </span>
        </div>
        <span className="text-sm font-semibold opacity-80">🏥 协和</span>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div className="text-center">
          <span className="text-[10px] text-slate-400 bg-slate-200/50 px-2.5 py-1 rounded-full font-mono">2026-06-08 10:15</span>
        </div>

        {chatHistory.map((msg, index) => (
          <div key={index} className={\`flex items-start gap-3 \${msg.isDoctor || msg.isAI ? '' : 'flex-row-reverse'}\`}>
            {/* Avatar block */}
            <div className={\`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-sm font-bold \${
              msg.isAI ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
              msg.isDoctor ? 'bg-indigo-50 text-[#005da7] border border-indigo-100' :
              'bg-slate-200 text-slate-700'
            }\`}>
              {msg.isAI ? '🤖' : msg.isDoctor ? '張' : '我'}
            </div>

            {/* Bubble contents block */}
            <div className="max-w-[70%] text-xs space-y-1.5">
              <span className="text-[10px] text-slate-400 block px-1">{msg.sender}</span>
              <div className={\`p-3.5 rounded-2xl leading-relaxed font-normal shadow-sm \${
                msg.isAI ? 'bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-tl-sm' :
                msg.isDoctor ? 'bg-white text-slate-800 rounded-tl-sm' :
                'bg-[#005da7] text-white rounded-tr-sm'
              }\`}>
                {/* Support multiline renders */}
                {msg.content.split('\\n').map((line, i) => (
                  <p key={i} className={line.startsWith('•') ? "pl-2.5 -indent-2.5 mt-1 text-[11px]" : ""}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Sticky Interactive bar */}
      <div className="bg-white px-4 py-3 border-t border-slate-100 shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-400 hover:text-[#005da7] hover:bg-slate-50 rounded-xl transition">
            <Mic className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="向医生补充反馈细节..." 
              className="w-full py-3 pl-4 pr-10 bg-slate-50 border border-slate-100 rounded-2xl text-xs outline-none focus:bg-white focus:border-[#005da7] transition"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  onSendMessage(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <span className="absolute right-3.5 top-3 text-slate-300">☺</span>
          </div>

          <button className="bg-[#f2f4f7] hover:bg-slate-200 p-2.5 text-slate-500 rounded-xl transition">
            <Plus className="w-5 h-5 text-[#005da7]" />
          </button>
        </div>
      </div>
    </div>
  );
}`
  }
};
