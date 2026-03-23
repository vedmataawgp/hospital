"use client";

import {
  useState, useEffect, useRef, useCallback, useMemo,
} from "react";
import Navbar from "@/components/Navbar";
import { ChatWebSocket } from "@/lib/chatWebSocket";
import { tokenStore } from "@/lib/api";
import type { WSEvent } from "@/lib/chatWebSocket";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
interface Reaction { emoji: string; count: number; mine: boolean }
interface ReplyRef  { id: string; text: string; from: "me" | "other" }
type MsgType    = "text" | "image" | "file";
type MsgStatus  = "sending" | "sent" | "delivered" | "read";

interface Message {
  id:           string;
  from:         "me" | "other";
  text?:        string;
  file_url?:    string;
  file_name?:   string;
  message_type: MsgType;
  time:         string;
  status:       MsgStatus;
  reactions:    Reaction[];
  replyTo?:     ReplyRef;
  isNew?:       boolean;
}

interface Conversation {
  id:            number;
  name:          string;
  specialty?:    string;
  role:          "doctor" | "patient";
  last_message:  string;
  last_time:     string;
  unread:        number;
  online:        boolean;
  last_seen?:    string;
  messages:      Message[];
}

/* ═══════════════════════════════════════════════════════════════
   SEED DATA (shown while Django backend loads or is offline)
═══════════════════════════════════════════════════════════════ */
const now = (offsetMin = 0) => {
  const d = new Date(Date.now() - offsetMin * 60_000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const SEED_CONVOS: Conversation[] = [
  {
    id: 1, name: "Dr. Sarah Johnson", specialty: "Cardiologist",
    role: "doctor", online: true, unread: 2,
    last_message: "I'll review your ECG results shortly.",
    last_time: now(2),
    messages: [
      { id: "m1", from: "other", text: "Hello! How are you feeling today?", message_type: "text", time: now(42), status: "read", reactions: [] },
      { id: "m2", from: "me",    text: "Hi Doctor, I've been having chest pain since yesterday.", message_type: "text", time: now(41), status: "read", reactions: [] },
      { id: "m3", from: "other", text: "Can you describe the pain? Sharp or dull?", message_type: "text", time: now(40), status: "read", reactions: [] },
      { id: "m4", from: "me",    text: "More of a dull pressure, especially when I climb stairs.", message_type: "text", time: now(39), status: "read", reactions: [{ emoji: "👍", count: 1, mine: false }] },
      { id: "m5", from: "other", text: "I understand. Please get an ECG done today if possible. Upload the report here and I'll review it.", message_type: "text", time: now(38), status: "read", reactions: [] },
      { id: "m6", from: "me",    text: "Of course, I'll get it done right away.", message_type: "text", time: now(10), status: "read", reactions: [] },
      { id: "m7", from: "other", text: "I'll review your ECG results shortly.", message_type: "text", time: now(2),  status: "delivered", reactions: [] },
    ],
  },
  {
    id: 2, name: "Dr. Michael Chen", specialty: "Neurologist",
    role: "doctor", online: false, last_seen: "2 hours ago", unread: 0,
    last_message: "See you at your next appointment!",
    last_time: "Yesterday",
    messages: [
      { id: "n1", from: "other", text: "Your MRI results came back normal. Great news!", message_type: "text", time: "Yesterday", status: "read", reactions: [{ emoji: "❤️", count: 1, mine: true }] },
      { id: "n2", from: "me",    text: "That's such a relief! Thank you doctor.", message_type: "text", time: "Yesterday", status: "read", reactions: [] },
      { id: "n3", from: "other", text: "See you at your next appointment!", message_type: "text", time: "Yesterday", status: "read", reactions: [] },
    ],
  },
  {
    id: 3, name: "Dr. Aisha Patel", specialty: "Pediatrician",
    role: "doctor", online: true, unread: 1,
    last_message: "Increase water intake and rest well.",
    last_time: now(30),
    messages: [
      { id: "p1", from: "me",    text: "Doctor, my son has had a fever since last night.", message_type: "text", time: now(45), status: "read", reactions: [] },
      { id: "p2", from: "other", text: "What's the temperature? Any other symptoms?", message_type: "text", time: now(44), status: "read", reactions: [] },
      { id: "p3", from: "me",    text: "38.9°C. He's also complaining of a sore throat.", message_type: "text", time: now(43), status: "read", reactions: [] },
      { id: "p4", from: "other", text: "Increase water intake and rest well.", message_type: "text", time: now(30), status: "delivered", reactions: [] },
    ],
  },
  {
    id: 4, name: "Dr. James Wilson", specialty: "Orthopedist",
    role: "doctor", online: false, last_seen: "5 hours ago", unread: 0,
    last_message: "The physiotherapy exercises should help.",
    last_time: "Mon",
    messages: [
      { id: "o1", from: "other", text: "The physiotherapy exercises should help.", message_type: "text", time: "Mon", status: "read", reactions: [] },
    ],
  },
  {
    id: 5, name: "Dr. Lisa Thompson", specialty: "Pediatrician",
    role: "doctor", online: true, unread: 0,
    last_message: "Please upload the blood test report.",
    last_time: "Sun",
    messages: [
      { id: "q1", from: "other", text: "Please upload the blood test report.", message_type: "text", time: "Sun", status: "read", reactions: [] },
    ],
  },
];

/* Doctor auto-replies (simulated when WebSocket is offline) */
const AUTO_REPLIES = [
  "Thank you for letting me know. Please continue with the prescribed medication.",
  "That sounds concerning. Can you provide more details about the symptoms?",
  "I've noted that. We'll discuss it in detail at your next visit.",
  "Please don't worry. This is quite common. Follow the instructions I gave you.",
  "Upload the reports here when you have them and I'll review immediately.",
  "How long has this been going on?",
  "Are you experiencing any other symptoms alongside this?",
  "Make sure to stay hydrated and get plenty of rest.",
];

const REACTION_EMOJIS = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
function uid() { return Math.random().toString(36).slice(2) + Date.now(); }

function StatusIcon({ status }: { status: MsgStatus }) {
  if (status === "sending")   return <i className="bi bi-clock text-white/50 text-xs" />;
  if (status === "sent")      return <i className="bi bi-check text-white/70 text-xs" />;
  if (status === "delivered") return <i className="bi bi-check-all text-white/70 text-xs" />;
  return <i className="bi bi-check-all text-sky-300 text-xs" />;
}

function TypingDots() {
  return (
    <div className="flex items-end gap-2 px-4 py-3 max-w-[6rem]">
      <div className="flex items-center gap-1 bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-2 h-2 bg-gray-400 rounded-full"
            style={{ animation: `typingBounce 1.2s ${i * 0.2}s infinite ease-in-out` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function ChatPage() {
  /* ── State ────────────────────────────────────────────────── */
  const [convos, setConvos]             = useState<Conversation[]>(SEED_CONVOS);
  const [activeId, setActiveId]         = useState<number | null>(1);
  const [input, setInput]               = useState("");
  const [search, setSearch]             = useState("");
  const [wsConnected, setWsConnected]   = useState(false);
  const [doctorTyping, setDoctorTyping] = useState(false);
  const [myTyping, setMyTyping]         = useState(false);
  const [showEmoji, setShowEmoji]       = useState(false);
  const [replyTo, setReplyTo]           = useState<ReplyRef | null>(null);
  const [hoverMsgId, setHoverMsgId]     = useState<string | null>(null);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [mobileView, setMobileView]     = useState<"list" | "chat">("list");
  const [attachPreview, setAttachPreview] = useState<{ url: string; name: string; type: MsgType } | null>(null);

  const messagesEndRef  = useRef<HTMLDivElement>(null);
  const fileInputRef    = useRef<HTMLInputElement>(null);
  const wsRef           = useRef<ChatWebSocket | null>(null);
  const typingTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoReplyRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef        = useRef<HTMLInputElement>(null);

  /* ── Derived ─────────────────────────────────────────────── */
  const activeConvo = useMemo(
    () => convos.find(c => c.id === activeId) ?? null,
    [convos, activeId],
  );

  const filteredConvos = useMemo(
    () => convos.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.last_message.toLowerCase().includes(search.toLowerCase()),
    ),
    [convos, search],
  );

  /* ── WebSocket ───────────────────────────────────────────── */
  useEffect(() => {
    if (!activeId) return;
    const token = tokenStore.get() ?? "demo-token";
    const ws    = new ChatWebSocket(String(activeId), token);
    wsRef.current = ws;

    ws.connect();

    const unsubStatus = ws.onStatusChange(setWsConnected);
    const unsubEvents = ws.subscribe((ev: WSEvent) => {
      switch (ev.type) {
        case "RECEIVE_MESSAGE":
          appendMessage(activeId, {
            id:           String(ev.payload.message_id ?? uid()),
            from:         "other",
            text:         String(ev.payload.text ?? ""),
            message_type: (ev.payload.message_type as MsgType) ?? "text",
            time:         now(),
            status:       "delivered",
            reactions:    [],
            isNew:        true,
          });
          break;
        case "TYPING_START":
          setDoctorTyping(true);
          break;
        case "TYPING_STOP":
          setDoctorTyping(false);
          break;
        case "MESSAGE_READ":
          markDelivered(activeId, String(ev.payload.message_id ?? ""));
          break;
        case "REACTION_ADD":
          handleRemoteReaction(
            activeId,
            String(ev.payload.message_id ?? ""),
            String(ev.payload.reaction_type ?? ""),
          );
          break;
      }
    });

    return () => {
      unsubStatus();
      unsubEvents();
      ws.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  /* ── Auto-scroll ─────────────────────────────────────────── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConvo?.messages, doctorTyping]);

  /* ── Helpers to mutate convo state ───────────────────────── */
  const appendMessage = useCallback((id: number, msg: Message) => {
    setConvos(prev => prev.map(c =>
      c.id === id
        ? {
            ...c,
            messages:     [...c.messages, msg],
            last_message: msg.text ?? (msg.message_type === "image" ? "📷 Photo" : "📎 File"),
            last_time:    msg.time,
          }
        : c,
    ));
  }, []);

  const markDelivered = useCallback((convId: number, msgId: string) => {
    setConvos(prev => prev.map(c =>
      c.id === convId
        ? { ...c, messages: c.messages.map(m => m.id === msgId ? { ...m, status: "read" as MsgStatus } : m) }
        : c,
    ));
  }, []);

  const handleRemoteReaction = useCallback((convId: number, msgId: string, emoji: string) => {
    setConvos(prev => prev.map(c =>
      c.id === convId
        ? {
            ...c,
            messages: c.messages.map(m => {
              if (m.id !== msgId) return m;
              const existing = m.reactions.find(r => r.emoji === emoji);
              if (existing) return { ...m, reactions: m.reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r) };
              return { ...m, reactions: [...m.reactions, { emoji, count: 1, mine: false }] };
            }),
          }
        : c,
    ));
  }, []);

  /* ── Simulate doctor response (offline mode) ─────────────── */
  const simulateDoctorResponse = useCallback((convId: number) => {
    if (wsConnected) return; /* real WS handles it */
    setDoctorTyping(true);
    autoReplyRef.current = setTimeout(() => {
      setDoctorTyping(false);
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      appendMessage(convId, {
        id:           uid(),
        from:         "other",
        text:         reply,
        message_type: "text",
        time:         now(),
        status:       "delivered",
        reactions:    [],
        isNew:        true,
      });
    }, 1500 + Math.random() * 1500);
  }, [wsConnected, appendMessage]);

  /* ── Send message ────────────────────────────────────────── */
  const sendMessage = useCallback(() => {
    const text = input.trim();
    if ((!text && !attachPreview) || !activeId) return;

    const msg: Message = {
      id:           uid(),
      from:         "me",
      message_type: attachPreview?.type ?? "text",
      text:         text || undefined,
      file_url:     attachPreview?.url,
      file_name:    attachPreview?.name,
      time:         now(),
      status:       "sending",
      reactions:    [],
      replyTo:      replyTo ?? undefined,
      isNew:        true,
    };

    appendMessage(activeId, msg);
    setInput("");
    setReplyTo(null);
    setAttachPreview(null);
    setShowEmoji(false);

    /* Send via WebSocket */
    wsRef.current?.send("SEND_MESSAGE", {
      text:         text || undefined,
      file_url:     attachPreview?.url,
      file_name:    attachPreview?.name,
      message_type: msg.message_type,
    });

    /* Upgrade sending → sent after 400ms */
    setTimeout(() => {
      setConvos(prev => prev.map(c =>
        c.id === activeId
          ? { ...c, messages: c.messages.map(m => m.id === msg.id ? { ...m, status: "sent" } : m) }
          : c,
      ));
    }, 400);

    simulateDoctorResponse(activeId);
  }, [input, activeId, attachPreview, replyTo, appendMessage, simulateDoctorResponse]);

  /* ── Typing indicator (outgoing) ─────────────────────────── */
  const handleInput = (val: string) => {
    setInput(val);
    if (!myTyping) {
      setMyTyping(true);
      wsRef.current?.send("TYPING_START", {});
    }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setMyTyping(false);
      wsRef.current?.send("TYPING_STOP", {});
    }, 1500);
  };

  /* ── Reactions ───────────────────────────────────────────── */
  const toggleReaction = useCallback((convId: number, msgId: string, emoji: string) => {
    setConvos(prev => prev.map(c =>
      c.id === convId
        ? {
            ...c,
            messages: c.messages.map(m => {
              if (m.id !== msgId) return m;
              const existing = m.reactions.find(r => r.emoji === emoji);
              if (existing) {
                return {
                  ...m,
                  reactions: existing.mine
                    ? m.reactions.filter(r => r.emoji !== emoji)
                    : m.reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, mine: true } : r),
                };
              }
              return { ...m, reactions: [...m.reactions, { emoji, count: 1, mine: true }] };
            }),
          }
        : c,
    ));
    wsRef.current?.send("REACTION_ADD", { message_id: msgId, reaction_type: emoji });
    setShowReactions(null);
  }, []);

  /* ── File attach ─────────────────────────────────────────── */
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url  = URL.createObjectURL(file);
    const type: MsgType = file.type.startsWith("image/") ? "image" : "file";
    setAttachPreview({ url, name: file.name, type });
    e.target.value = "";
  };

  /* ── Select conversation ─────────────────────────────────── */
  const selectConvo = (id: number) => {
    setActiveId(id);
    setMobileView("chat");
    setConvos(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    setReplyTo(null);
    setInput("");
    setAttachPreview(null);
    setShowEmoji(false);
  };

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <>
      {/* Animations injected once */}
      <style>{`
        @keyframes typingBounce {
          0%,80%,100% { transform: translateY(0); opacity:.4 }
          40%          { transform: translateY(-8px); opacity:1 }
        }
        @keyframes msgSlideIn {
          from { opacity:0; transform: translateY(10px) scale(.97); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
        @keyframes reactionPop {
          from { opacity:0; transform: scale(.6) translateY(6px); }
          to   { opacity:1; transform: scale(1) translateY(0); }
        }
        @keyframes slideLeft {
          from { opacity:0; transform: translateX(20px); }
          to   { opacity:1; transform: translateX(0); }
        }
        .msg-new    { animation: msgSlideIn .25s ease forwards; }
        .react-pop  { animation: reactionPop .18s ease forwards; }
        .slide-left { animation: slideLeft .2s ease forwards; }
        .chat-bg {
          background-color: #EEF2F7;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c5d3e0' fill-opacity='0.18'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .scrollbar-thin::-webkit-scrollbar { width:4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background:#CBD5E1; border-radius:2px; }
        input[type=file] { display:none; }
      `}</style>

      <div className="h-screen flex flex-col overflow-hidden">
        <Navbar />

        <div className="flex flex-1 overflow-hidden bg-[#0A2647]">

          {/* ══ LEFT SIDEBAR ═════════════════════════════════════ */}
          <aside className={`
            ${mobileView === "chat" ? "hidden md:flex" : "flex"} 
            md:flex flex-col w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex-shrink-0
          `}>

            {/* Sidebar header */}
            <div className="bg-[#0A2647] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#2C74B3] rounded-full flex items-center justify-center">
                  <i className="bi bi-person-circle text-2xl" />
                </div>
                <div>
                  <div className="font-semibold text-sm">John Patient</div>
                  <div className="text-sky-300 text-xs">Patient Portal</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors" title="Video call">
                  <i className="bi bi-camera-video-fill text-lg" />
                </button>
                <button className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors" title="New chat">
                  <i className="bi bi-pencil-square text-lg" />
                </button>
                <button className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors" title="Menu">
                  <i className="bi bi-three-dots-vertical text-lg" />
                </button>
              </div>
            </div>

            {/* WS status strip */}
            {!wsConnected && (
              <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center gap-2">
                <i className="bi bi-wifi-off text-amber-600 text-sm" />
                <span className="text-amber-700 text-xs font-medium">Connecting to real-time server…</span>
              </div>
            )}

            {/* Search */}
            <div className="px-3 py-2 bg-[#F0F2F5]">
              <div className="relative">
                <i className="bi bi-search absolute left-3 top-2.5 text-gray-400 text-sm" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search or start new chat"
                  className="w-full bg-white rounded-full pl-9 pr-4 py-2 text-sm text-[#0A2647] placeholder-gray-400 focus:outline-none border border-gray-200"
                />
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {filteredConvos.map(c => (
                <button
                  key={c.id}
                  onClick={() => selectConvo(c.id)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-[#F5F6F6] transition-colors ${
                    activeId === c.id ? "bg-[#F0F2F5]" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#144272] to-[#2C74B3] rounded-full flex items-center justify-center">
                      <i className="bi bi-person-circle text-white text-3xl" />
                    </div>
                    {c.online && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#25D366] border-2 border-white rounded-full" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-[#0A2647] text-sm truncate">{c.name}</span>
                      <span className={`text-xs flex-shrink-0 ml-2 ${c.unread > 0 ? "text-[#25D366]" : "text-gray-400"}`}>
                        {c.last_time}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-0.5">
                      <span className="text-gray-500 text-xs truncate">{c.last_message}</span>
                      {c.unread > 0 && (
                        <span className="ml-2 flex-shrink-0 w-5 h-5 bg-[#25D366] text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}

              {filteredConvos.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">No conversations found</div>
              )}
            </div>
          </aside>

          {/* ══ RIGHT CHAT PANEL ══════════════════════════════════ */}
          {activeConvo ? (
            <main className={`
              ${mobileView === "list" ? "hidden md:flex" : "flex"}
              md:flex flex-1 flex-col overflow-hidden
            `}>

              {/* Chat header */}
              <div className="bg-[#0A2647] text-white px-4 py-3 flex items-center gap-3 flex-shrink-0 shadow-md">
                <button
                  className="md:hidden w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                  onClick={() => setMobileView("list")}
                >
                  <i className="bi bi-arrow-left text-xl" />
                </button>

                <div className="relative">
                  <div className="w-10 h-10 bg-[#2C74B3] rounded-full flex items-center justify-center">
                    <i className="bi bi-person-circle text-white text-2xl" />
                  </div>
                  {activeConvo.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] border-2 border-[#0A2647] rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm leading-tight">{activeConvo.name}</div>
                  <div className="text-xs leading-tight">
                    {doctorTyping ? (
                      <span className="text-[#25D366] animate-pulse">typing…</span>
                    ) : activeConvo.online ? (
                      <span className="text-sky-300">online · {activeConvo.specialty}</span>
                    ) : (
                      <span className="text-slate-400">last seen {activeConvo.last_seen} · {activeConvo.specialty}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors" title="Video call">
                    <i className="bi bi-camera-video-fill" />
                  </button>
                  <button className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors" title="Voice call">
                    <i className="bi bi-telephone-fill" />
                  </button>
                  <button className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors" title="Search">
                    <i className="bi bi-search" />
                  </button>
                  <button className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors" title="More">
                    <i className="bi bi-three-dots-vertical" />
                  </button>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto scrollbar-thin chat-bg px-4 py-3 space-y-1">
                {activeConvo.messages.map((msg, idx) => {
                  const isMe      = msg.from === "me";
                  const showDate  = idx === 0;
                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center my-3">
                          <span className="bg-white/80 text-gray-500 text-xs px-3 py-1 rounded-full shadow-sm">Today</span>
                        </div>
                      )}

                      <div
                        className={`flex ${isMe ? "justify-end" : "justify-start"} group`}
                        onMouseEnter={() => setHoverMsgId(msg.id)}
                        onMouseLeave={() => { setHoverMsgId(null); if (showReactions === msg.id) setShowReactions(null); }}
                      >
                        {/* Reaction bar (hover) */}
                        <div className={`self-end mb-2 mr-2 transition-all duration-150 ${
                          hoverMsgId === msg.id ? "opacity-100" : "opacity-0 pointer-events-none"
                        } ${isMe ? "order-first" : "order-last"}`}>
                          <div className="relative">
                            <button
                              onClick={() => setShowReactions(showReactions === msg.id ? null : msg.id)}
                              className="w-7 h-7 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <i className="bi bi-emoji-smile text-gray-500 text-sm" />
                            </button>

                            {showReactions === msg.id && (
                              <div className={`react-pop absolute bottom-9 ${isMe ? "right-0" : "left-0"} bg-white rounded-full shadow-xl border border-gray-100 flex items-center gap-1 px-2 py-1.5 z-10 whitespace-nowrap`}>
                                {REACTION_EMOJIS.map(em => (
                                  <button
                                    key={em}
                                    onClick={() => activeId && toggleReaction(activeId, msg.id, em)}
                                    className="text-lg hover:scale-125 transition-transform"
                                    title={em}
                                  >
                                    {em}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bubble */}
                        <div className={`flex flex-col max-w-[72%] lg:max-w-[55%] ${isMe ? "items-end" : "items-start"}`}>
                          {/* Reply-to quote */}
                          {msg.replyTo && (
                            <div className={`text-xs px-3 py-2 rounded-t-xl border-l-4 mb-0.5 max-w-full truncate ${
                              isMe
                                ? "bg-[#1a4e88] border-sky-300 text-sky-200 rounded-bl-xl"
                                : "bg-gray-100 border-[#2C74B3] text-gray-600 rounded-br-xl"
                            }`}>
                              <span className="font-semibold block">{msg.replyTo.from === "me" ? "You" : activeConvo.name}</span>
                              <span className="truncate">{msg.replyTo.text}</span>
                            </div>
                          )}

                          <div
                            className={`relative px-3 py-2 shadow-sm ${
                              isMe
                                ? "bg-[#2C74B3] text-white rounded-2xl rounded-tr-none"
                                : "bg-white text-[#0A2647] rounded-2xl rounded-tl-none"
                            } ${msg.isNew ? "msg-new" : ""}`}
                          >
                            {/* Image message */}
                            {msg.message_type === "image" && msg.file_url && (
                              <img
                                src={msg.file_url}
                                alt="shared"
                                className="rounded-xl max-w-xs mb-1 cursor-pointer hover:opacity-90 transition-opacity"
                                style={{ maxHeight: "220px", objectFit: "cover" }}
                              />
                            )}

                            {/* File message */}
                            {msg.message_type === "file" && msg.file_url && (
                              <a
                                href={msg.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className={`flex items-center gap-2 text-sm font-medium underline ${isMe ? "text-blue-200" : "text-[#2C74B3]"}`}
                              >
                                <i className="bi bi-file-earmark-text-fill text-xl" />
                                <span className="truncate max-w-[200px]">{msg.file_name}</span>
                              </a>
                            )}

                            {/* Text */}
                            {msg.text && (
                              <p className="text-sm leading-relaxed">{msg.text}</p>
                            )}

                            {/* Time + status */}
                            <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? "" : ""}`}>
                              <span className={`text-xs ${isMe ? "text-white/60" : "text-gray-400"}`}>
                                {msg.time}
                              </span>
                              {isMe && <StatusIcon status={msg.status} />}
                            </div>
                          </div>

                          {/* Reactions */}
                          {msg.reactions.length > 0 && (
                            <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                              {msg.reactions.map(r => (
                                <button
                                  key={r.emoji}
                                  onClick={() => activeId && toggleReaction(activeId, msg.id, r.emoji)}
                                  className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-all ${
                                    r.mine
                                      ? "bg-[#2C74B3]/15 border-[#2C74B3]/40 text-[#2C74B3]"
                                      : "bg-white border-gray-200 text-gray-600"
                                  } hover:scale-105`}
                                >
                                  <span>{r.emoji}</span>
                                  <span className="font-semibold">{r.count}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Reply button on hover */}
                          {hoverMsgId === msg.id && (
                            <button
                              onClick={() => setReplyTo({ id: msg.id, text: msg.text ?? (msg.file_name ?? ""), from: msg.from })}
                              className="mt-1 text-gray-400 text-xs hover:text-[#2C74B3] transition-colors flex items-center gap-1"
                            >
                              <i className="bi bi-reply-fill" /> Reply
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Doctor typing indicator */}
                {doctorTyping && (
                  <div className="flex justify-start">
                    <TypingDots />
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Attach preview */}
              {attachPreview && (
                <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3">
                  {attachPreview.type === "image"
                    ? <img src={attachPreview.url} alt="preview" className="w-16 h-16 object-cover rounded-xl" />
                    : <div className="w-16 h-16 bg-[#EFF6FF] rounded-xl flex items-center justify-center">
                        <i className="bi bi-file-earmark-text-fill text-[#2C74B3] text-2xl" />
                      </div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-[#0A2647] text-sm font-medium truncate">{attachPreview.name}</p>
                    <p className="text-gray-400 text-xs">{attachPreview.type === "image" ? "Image" : "File"}</p>
                  </div>
                  <button onClick={() => setAttachPreview(null)} className="text-gray-400 hover:text-[#E63946] transition-colors">
                    <i className="bi bi-x-lg text-lg" />
                  </button>
                </div>
              )}

              {/* Reply bar */}
              {replyTo && (
                <div className="bg-[#EFF6FF] border-t border-[#2C74B3]/20 px-4 py-2.5 flex items-center gap-3">
                  <div className="border-l-4 border-[#2C74B3] pl-2 flex-1 min-w-0">
                    <p className="text-[#2C74B3] text-xs font-semibold">{replyTo.from === "me" ? "You" : activeConvo.name}</p>
                    <p className="text-gray-600 text-xs truncate">{replyTo.text}</p>
                  </div>
                  <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-[#E63946] transition-colors flex-shrink-0">
                    <i className="bi bi-x-lg" />
                  </button>
                </div>
              )}

              {/* Emoji picker (minimal) */}
              {showEmoji && (
                <div className="bg-white border-t border-gray-200 px-4 py-3 grid grid-cols-10 gap-2 slide-left">
                  {["😀","😂","😍","🥰","😭","😡","👍","❤️","🙏","💪","🎉","✨","🏥","💊","🩺","🫀","🧠","🦷","👶","💉"].map(em => (
                    <button
                      key={em}
                      onClick={() => { setInput(v => v + em); setShowEmoji(false); inputRef.current?.focus(); }}
                      className="text-2xl hover:scale-125 transition-transform text-center"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              )}

              {/* Input area */}
              <div className="bg-[#F0F2F5] px-3 py-3 flex items-end gap-2 flex-shrink-0 border-t border-gray-200">
                {/* Emoji toggle */}
                <button
                  onClick={() => setShowEmoji(v => !v)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                    showEmoji ? "bg-[#2C74B3] text-white" : "text-gray-500 hover:bg-white"
                  }`}
                >
                  <i className={`bi ${showEmoji ? "bi-keyboard-fill" : "bi-emoji-smile-fill"} text-xl`} />
                </button>

                {/* Attach */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-white transition-colors flex-shrink-0"
                  title="Attach file"
                >
                  <i className="bi bi-paperclip text-xl" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx" onChange={handleFile} />

                {/* Text input */}
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => handleInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Type a message"
                  className="flex-1 bg-white rounded-2xl px-4 py-2.5 text-sm text-[#0A2647] placeholder-gray-400 focus:outline-none border border-gray-200 focus:border-[#2C74B3] transition-colors"
                />

                {/* Send / Mic */}
                {input.trim() || attachPreview ? (
                  <button
                    onClick={sendMessage}
                    className="w-11 h-11 rounded-full bg-[#2C74B3] hover:bg-[#0A2647] text-white flex items-center justify-center shadow-md transition-all hover:scale-105 flex-shrink-0"
                  >
                    <i className="bi bi-send-fill text-lg" />
                  </button>
                ) : (
                  <button
                    className="w-11 h-11 rounded-full bg-[#2C74B3] hover:bg-[#0A2647] text-white flex items-center justify-center shadow-md transition-all flex-shrink-0"
                    title="Voice message"
                  >
                    <i className="bi bi-mic-fill text-lg" />
                  </button>
                )}
              </div>
            </main>
          ) : (
            /* Empty state */
            <div className="hidden md:flex flex-1 items-center justify-center flex-col bg-[#F0F4F8]">
              <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
                <i className="bi bi-chat-heart-fill text-5xl text-[#2C74B3]" />
              </div>
              <h2 className="text-2xl font-bold text-[#0A2647] mb-2">MediCare Consultation</h2>
              <p className="text-gray-500 text-sm max-w-xs text-center">
                Select a conversation to start your real-time consultation with your doctor
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
