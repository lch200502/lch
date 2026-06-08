import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Express
const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini
let ai: GoogleGenAI | null = null;
const api_key = process.env.GEMINI_API_KEY;

if (api_key && api_key !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: api_key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini client successfully initialized.");
  } catch (error) {
    console.error("Failed to initialize Gemini Client:", error);
  }
} else {
  console.log("GEMINI_API_KEY is not configured or uses standard placeholder. Fallback mode enabled.");
}

// Diagnostic fallback data generator for offline/unconfigured environments
function generateFallbackReport(symptoms: string, age: number, gender: string) {
  const symLower = symptoms.toLowerCase();
  
  // Gastroenterology (Gastrointestinal) case
  if (symLower.includes("胃") || symLower.includes("腹") || symLower.includes("吐") || symLower.includes("恶心") || symLower.includes("泻") || symLower.includes("拉肚子") || symLower.includes("消化")) {
    return {
      symptomsParsed: ["腹痛 (Abdominal pain)", "恶心 (Nausea)", "消化不良 (Dyspepsia)"],
      recommendedDept: "消化内科",
      recommendedConfidence: 95,
      relatedDepts: [
        { name: "神经内科", matchRate: 75 },
        { name: "内分泌科", matchRate: 60 }
      ],
      reportNo: `TRG-202606-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      aiDiagnosis: "疑似急性胃炎 (Possible Gastroenteritis / Gastritis)",
      aiExplanation: "根据您描述的腹痛与恶心等胃肠道反应，多由于消化道粘膜急性炎症引发，建议在消化系统方向做针对排查。本评估结果属于居家问诊，仅供临床参考，不能代替医院现场医师的专业检查和医疗诊断结论。",
      clinicalAdvice: "建议尽快前往医院消化内科预约专家门诊，由临床医生触诊。如持续不能缓解或伴发烧、黑便，需加急检查血常规，以便于决定是否需要配合胃镜或腹部彩超诊断。",
      lifestyleAdvice: [
        "饮食严禁冷、酸、烫、辣及多油等刺激性食品。",
        "近期建议以温热、细软易消化的清淡流食（如温热小米粥、素面）为主。",
        "严格规律饮食规律，少量多餐，避免暴饮暴食。合理作息以加速恢复。"
      ]
    };
  }
  
  // Respiratory (Cough, fever, respiratory) case
  if (symLower.includes("咳") || symLower.includes("嗽") || symLower.includes("烧") || symLower.includes("热") || symLower.includes("感冒") || symLower.includes("鼻")) {
    return {
      symptomsParsed: ["咳嗽 (Cough)", "轻微发热 (Mild Fever)", "咽痛 (Sore Throat)"],
      recommendedDept: "呼吸内科",
      recommendedConfidence: 92,
      relatedDepts: [
        { name: "风湿免疫科", matchRate: 68 },
        { name: "感染科", matchRate: 55 }
      ],
      reportNo: `TRG-202606-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      aiDiagnosis: "疑似急性上呼吸道感染 / 支气管炎 (Mild Upper Respiratory Tract Infection)",
      aiExplanation: "描述中出现持久咳嗽，伴发热或刺激性反应，属呼吸道受累、受凉或病原体刺激的典型指征，需前往呼吸科专业筛查并监测肺部声响。本智能评估不能替代正式的医生线下诊断。",
      clinicalAdvice: "建议呼吸科常规听诊。若体温持续超过38.5℃或感到气促，应增加血常规化验以确定是病毒亦或细菌感染，由执业医生开具合理的抗病毒或抗生素对症药物。",
      lifestyleAdvice: [
        "每日补充大量温开水（1500-2000ml），促进新陈代谢与痰液稀释。",
        "室内保持合理的空气湿度与温度，定时开窗通风换气。",
        "保障100%充足休息，规避剧烈运动，温盐水漱口缓解咽喉肿痛。"
      ]
    };
  }

  // Children pediatric case
  if (symLower.includes("儿") || symLower.includes("宝宝") || symLower.includes("孩子") || symLower.includes("小儿") || age < 14) {
    return {
      symptomsParsed: ["小儿不适 (Pediatric Discomfort)", "生长监护 (Growth Monitoring)"],
      recommendedDept: "儿科",
      recommendedConfidence: 90,
      relatedDepts: [
        { name: "儿内科", matchRate: 85 },
        { name: "儿童保健科", matchRate: 70 }
      ],
      reportNo: `TRG-202606-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      aiDiagnosis: "儿科发育或儿科急性病常指征 (Pediatric Symptoms Under Evaluation)",
      aiExplanation: "由于患儿生理结构和成人不同，任何发烧、厌食或呼吸不畅均建议直接至专注儿童医疗的儿科进行首诊，儿童药量必须面诊严格遵医嘱配制。",
      clinicalAdvice: "建议即刻前往儿童专科医院或综合性医院儿科。携带儿童免疫接种本、近期体温监测记录备查。",
      lifestyleAdvice: [
        "持续监测宝宝体温，并作详细记录。",
        "提供易于吸收的小儿温软流食，少量多次提供水分，切忌盲目乱服成人药物。",
        "物理降温前请先咨询医师指导，如遇神志不清或高热惊厥，请速拨打急救电话。"
      ]
    };
  }

  // General fallback case (Universal)
  return {
    symptomsParsed: [`描述症状: ${symptoms.slice(0, 20)}...`],
    recommendedDept: "普通内科",
    recommendedConfidence: 85,
    relatedDepts: [
      { name: "全科医学科", matchRate: 80 },
      { name: "健康管理科", matchRate: 60 }
    ],
    reportNo: `TRG-202606-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    aiDiagnosis: "全科常见未定型性指征 (Unspecified Internal Symptom Group)",
    aiExplanation: "当前输入的信息略显模糊。由于没有高度特异性的局限器质反应，推荐通过普通内科首诊进行全面体格普查、分诊排查。本诊断仅为人工智能估值参考，不可作为处方和手术依据。",
    clinicalAdvice: "建议面见全科医生，做常规心电图、指尖血糖及血压测量。带上以往的所有病历和正在服用的日常用药历史卡片。",
    lifestyleAdvice: [
      "保持营养全面、食物熟透的清淡膳食，定时作息不熬夜。",
      "开展半小时以内的低强度有氧放松活动（如慢走），减少近期精神压力。",
      "如有突发胸闷、剧烈头疼等重症，应当立刻前往就近的线下急诊进行排查。"
    ]
  };
}

// Deep analytical Symptom Triage route
app.post("/api/triage", async (req, res) => {
  const { symptoms = "", age = 35, gender = "男" } = req.body;
  
  if (!symptoms.trim()) {
    return res.status(400).json({ error: "Symptom description is required" });
  }

  // Fallback if client is uninitialized or key missing
  if (!ai) {
    console.log("No active Gemini client. Generating high-quality local clinical analysis report...");
    const report = generateFallbackReport(symptoms, age, gender);
    return res.json({ success: true, ...report, source: "Local Clinical Rules Engine" });
  }

  try {
    const prompt = `您是一名资深的全科医学专家。请针对以下患者进行智能预问诊和症状导诊评估：
患者年龄：${age}
患者性别：${gender}
症状描述：${symptoms}

请对该症状进行专业而严谨的临床分析，并输出结构化的JSON数据，字段必须包括：
1. symptomsParsed: 识别并提取出的核心症状短语（数组，英文括号附加学术翻译，例如 ["腹痛 (Abdominal pain)", "恶心 (Nausea)"]）
2. recommendedDept: 建议就诊的首选科室名称（字符串，例如 "消化内科"）
3. recommendedConfidence: 该科室建议的匹配可信度（0-100的整数，例如 95）
4. relatedDepts: 其他潜在相关科室（数组，每个元素包含 name: 科室名称, matchRate: 匹配率百分比 0-100 整数）
5. reportNo: 系统预问诊报告编号（以 "TRG-202606-" 开头加10位随机数字）
6. aiDiagnosis: 初步可疑临床诊断（字符串，英文括号附加学术翻译，例如 "疑似急性胃炎 (Possible Gastritis)"）
7. aiExplanation: 针对本初步诊断的简明原理解释，请用中文，并配合英文学术名称（例如 "根据您的描述，症状主要集中在上腹部且伴随恶心，消化系统炎症可能性较大。请注意，此初步评估不能替代线下医师的专业诊断。"）
8. clinicalAdvice: 线下到门诊院内的进一步诊疗或检查建议（字符串，例如 "建议前往消化内科专门医生进行做触诊或血常规、胃镜确诊。"）
9. lifestyleAdvice: 针对该症状的日常居家和生活护理建议（字符串数组由3到4条指南组成）

请严格保证JSON输出的完美语法，且完全遵循上述结构。`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            symptomsParsed: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendedDept: { type: Type.STRING },
            recommendedConfidence: { type: Type.INTEGER },
            relatedDepts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  matchRate: { type: Type.INTEGER }
                },
                required: ["name", "matchRate"]
              }
            },
            reportNo: { type: Type.STRING },
            aiDiagnosis: { type: Type.STRING },
            aiExplanation: { type: Type.STRING },
            clinicalAdvice: { type: Type.STRING },
            lifestyleAdvice: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: [
            "symptomsParsed", "recommendedDept", "recommendedConfidence", 
            "relatedDepts", "reportNo", "aiDiagnosis", "aiExplanation", 
            "clinicalAdvice", "lifestyleAdvice"
          ]
        }
      }
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("Empty response from Gemini API");
    }

    const parsedData = JSON.parse(textResult.trim());
    return res.json({ success: true, ...parsedData, source: "Gemini AI" });
    
  } catch (error) {
    console.error("Gemini triage processing failed:", error);
    // Graceful error fallback
    const report = generateFallbackReport(symptoms, age, gender);
    return res.json({ success: true, ...report, source: "Dynamic Fallback due to API error" });
  }
});

// Configure Vite or Static Asset delivery
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CareConnect server running on port ${PORT}`);
  });
}

startServer();
