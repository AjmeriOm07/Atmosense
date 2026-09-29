import React, { useState } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Paperclip,
  FileCheck,
  Info,
  Layers,
  MapPin,
  Thermometer,
  Wind
} from 'lucide-react';
import type { RegionConfig, NodeData, PolicyAdvisory, HourlyTimelineStep } from '../../types/atmosense';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isReportAttached?: boolean;
}

interface RagChatbotWidgetProps {
  region: RegionConfig;
  nodes: NodeData[];
  advisory: PolicyAdvisory;
  currentStep?: HourlyTimelineStep;
  selectedNode?: NodeData | null;
  onOpenReportModal: () => void;
}

export const RagChatbotWidget: React.FC<RagChatbotWidgetProps> = ({
  region,
  nodes,
  advisory,
  currentStep,
  selectedNode,
  onOpenReportModal
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [attachedReport, setAttachedReport] = useState(false);

  const activeNodeName = selectedNode ? selectedNode.name : (nodes[0]?.name || 'Anand Vihar CAAQMS');
  const activePblh = currentStep?.telemetry.pblh_meters ?? 215;
  const activeWind = currentStep?.telemetry.wind_direction_cardinal && currentStep?.telemetry.wind_speed_ms
    ? `${currentStep.telemetry.wind_direction_cardinal} @ ${currentStep.telemetry.wind_speed_ms} m/s`
    : 'NW @ 1.2 m/s';
  const activeTime = currentStep?.formattedTime ?? 'Nov 16, 04:00 AM';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: `Hello! I am the Atmosense RAG Environmental Explainability Assistant.\n\nI am synced to your active dashboard context:\n📍 Location: **${activeNodeName}**\n🕒 Time: **${activeTime}**\n🌡️ PBLH: **${activePblh}m** | 💨 Wind: **${activeWind}**\n\nHow can I help explain the atmospheric conditions or forecast outputs?`,
      timestamp: 'Just now'
    }
  ]);

  const handleSend = (userText?: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim() && !attachedReport) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: attachedReport ? `[Attached Decision Support Brief] ${textToSend}` : textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isReportAttached: attachedReport
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Generate dynamic context-aware RAG explainability response
    setTimeout(() => {
      let botResponse = `Based on atmospheric diagnostics for **${activeNodeName}** at **${activeTime}**:\nBoundary layer height is currently **${activePblh}m** with winds **${activeWind}**.`;

      const lower = textToSend.toLowerCase();

      if (lower.includes('why') && (lower.includes('increasing') || lower.includes('rising') || lower.includes('high'))) {
        botResponse = `🔍 **Contextual Atmospheric Explanation (${activeNodeName})**:\n\nPM₂.₅ concentration is elevated during this window due to a combination of reduced Planetary Boundary Layer Height (**${activePblh}m**) and weak winds (**${activeWind}**).\n\nThese boundary-layer conditions severely restrict vertical and horizontal atmospheric dispersion, locking local surface emissions into a shallow air volume. Sub-surface transport from the northwest corridor further contributes to local accumulation.`;
      } else if (lower.includes('5 am') || lower.includes('5am') || lower.includes('early morning') || lower.includes('spike')) {
        botResponse = `🌅 **Nocturnal Inversion & Morning Peak Analysis**:\n\nPollution is expected to increase sharply between 02:00 AM and 08:00 AM because radiational ground cooling reaches its maximum, dropping PBLH down to 180m–215m.\n\nWhen combined with stagnant northwest wind vectors (< 1.8 m/s), nocturnal surface emissions are trapped before daytime solar convective mixing begins to re-expand the boundary layer after 10:00 AM.`;
      } else if (lower.includes('pblh') || lower.includes('meaning') || lower.includes('what is')) {
        botResponse = `📖 **Environmental Concept: Planetary Boundary Layer Height (PBLH)**:\n\nPBLH represents the vertical depth of the lower atmosphere in which surface emissions mix. When PBLH is high (e.g. 950m in afternoon sun), pollutants disperse into a large air volume. When PBLH drops (e.g. **${activePblh}m** at night), vertical mixing is restricted, concentrating pollutants near the ground.`;
      } else if (attachedReport || lower.includes('report') || lower.includes('brief') || lower.includes('decision')) {
        botResponse = `📄 **Decision Support Briefing Context**:\n\nReviewing the Decision Support Briefing for **${region.name}**:\n• **Forecast Risk**: High Pollution Accumulation Risk (${advisory.forecastRisk?.window || '02:00 AM - 08:00 AM'})\n• **Primary Drivers**: Low PBLH, Weak NW Winds, Inversion Layer, Regional Advection\n• **Recommended Considerations**: Enhanced monitoring, traffic management review, and outdoor exposure reduction during peak hours.`;
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
      setAttachedReport(false);
    }, 600);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[90] select-none font-sans">
      {/* Floating Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-bold text-xs px-4 py-3 rounded-full shadow-2xl transition-all hover:scale-105 cursor-pointer border-2 border-white/40"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>AI RAG Assistant</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[410px] h-[550px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in duration-200">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold font-sans">
                  RAG Environmental Assistant
                </h3>
                <span className="text-[10px] text-teal-400 font-mono block">
                  ● Explainability Layer Ready
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dynamic Context Bar */}
          <div className="px-3 py-2 bg-sky-950 text-sky-100 border-b border-sky-900 flex items-center justify-between text-[10px] font-mono">
            <div className="flex items-center space-x-2 truncate">
              <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
              <span className="font-bold truncate">{activeNodeName}</span>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <span className="bg-sky-900 px-1.5 py-0.5 rounded text-sky-300">PBLH: {activePblh}m</span>
              <span className="bg-sky-900 px-1.5 py-0.5 rounded text-sky-300">{activeTime.split(', ')[1] || activeTime}</span>
            </div>
          </div>

          {/* Contextual Quick Prompt Suggestion Chips */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[10px] font-bold">
            <button
              onClick={() => handleSend(`Why is PM2.5 increasing at ${activeNodeName}?`)}
              className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg whitespace-nowrap cursor-pointer shadow-2xs"
            >
              Why is PM₂.₅ increasing here?
            </button>
            <button
              onClick={() => handleSend('Why is pollution expected to increase around 5 AM?')}
              className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg whitespace-nowrap cursor-pointer shadow-2xs"
            >
              Why peak at 5 AM?
            </button>
            <button
              onClick={() => handleSend('What does PBLH mean?')}
              className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg whitespace-nowrap cursor-pointer shadow-2xs"
            >
              What does PBLH mean?
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed font-sans ${
                    msg.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-800 shadow-xs rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">
                  {msg.timestamp}
                </span>
              </div>
            ))}
          </div>

          {/* Report Attachment Strip */}
          {attachedReport && (
            <div className="px-3 py-1.5 bg-sky-50 border-t border-sky-100 flex items-center justify-between text-[11px] text-sky-900 font-semibold">
              <div className="flex items-center space-x-1.5">
                <FileCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>Attached: Decision Support Brief PDF</span>
              </div>
              <button
                onClick={() => setAttachedReport(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
            <button
              onClick={() => setAttachedReport(!attachedReport)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                attachedReport
                  ? 'bg-sky-100 text-sky-700 border-sky-300'
                  : 'bg-slate-100 text-slate-500 hover:text-slate-800 border-slate-200'
              }`}
              title="Attach Generated Decision Support Brief for AI Analysis"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              placeholder="Ask RAG assistant about air quality, PBLH..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />

            <button
              onClick={() => handleSend()}
              className="p-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
