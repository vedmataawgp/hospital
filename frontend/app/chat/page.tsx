"use client";

import {
  useState, useEffect, useRef, useCallback, useMemo,
} from "react";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import { api, userStore, tokenStore } from "@/lib/api";
import type { ChatConversation, ChatMsg, UserBrief } from "@/lib/api";

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch { return ""; }
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

const REACTION_EMOJIS = ["❤️", "👍", "😂", "😮", "😢", "🙏"];
const POLL_INTERVAL_MS = 2000;

interface ApptContact {
  id: number;
  name: string;
  email: string;
  role: string;
  appointment_status: string;
  appointment_date: string;
}

interface LocalMessage {
  tempId: string;
  serverId?: number;
  sender_id: number;
  sender_name: string;
  sender_role: string;
  text: string;
  message_type: string;
  time: string;
  status: "sending" | "sent" | "delivered";
  reactions: { emoji: string; count: number; mine: boolean }[];
  replyTo?: { text: string; name: string };
}

/* ═══════════════════════════════════════════════════════════════
   STATUS ICON
═══════════════════════════════════════════════════════════════ */
function StatusIcon({ status }: { status: string }) {
  if (status === "sending") return <i className="bi bi-clock text-white/50 text-xs" />;
  if (status === "sent") return <i className="bi bi-check text-white/70 text-xs" />;
  return <i className="bi bi-check-all text-sky-300 text-xs" />;
}

function TypingDots() {
  return (
    <div className="flex items-end gap-2 px-4 py-2">
      <div className="flex items-center gap-1 bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
        {[0, 1, 2].map(i => (
          <span key={i} className="w-2 h-2 bg-gray-400 rounded-full"
            style={{ animation: `typingBounce 1.2s ${i * 0.2}s infinite ease-in-out` }} />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AVATAR
═══════════════════════════════════════════════════════════════ */
function Avatar({ name, role, size = 10 }: { name: string; role: string; size?: number }) {
  const isDoc = role === "doctor";
  return (
    <div className={`w-${size} h-${size} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${isDoc ? "bg-[#0A2647]" : "bg-[#2C74B3]"}`}>
      {initials(name)}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function ChatPage() {
  const currentUser = userStore.get();
  const isLoggedIn = !!tokenStore.get() && !!currentUser;

  /* conversations */
  const [convos, setConvos] = useState<ChatConversation[]>([]);
  const [loadingConvos, setLoadingConvos] = useState(false);
  const [activeConvoId, setActiveConvoId] = useState<number | null>(null);

  /* messages */
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  /* ui state */
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [replyTo, setReplyTo] = useState<{ text: string; name: string } | null>(null);
  const [hoverMsgId, setHoverMsgId] = useState<string | null>(null);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [otherTyping, setOtherTyping] = useState(false);
  const [reactions, setReactions] = useState<Record<string, { emoji: string; count: number; mine: boolean }[]>>({});

  /* new chat search */
  const [showNewChat, setShowNewChat] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<UserBrief[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [apptContacts, setApptContacts] = useState<ApptContact[]>([]);
  const [apptContactsLoading, setApptContactsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMsgIdRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeConvo = useMemo(() => convos.find(c => c.id === activeConvoId) ?? null, [convos, activeConvoId]);

  /* ── Load conversations ───────────────────────────────── */
  const loadConversations = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoadingConvos(true);
    try {
      const data = await api.chat.conversations();
      setConvos(data);
    } catch {
      /* stay with empty list if backend offline */
    } finally {
      setLoadingConvos(false);
    }
  }, [isLoggedIn]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  /* ── Load messages when active convo changes ─────────── */
  useEffect(() => {
    if (!activeConvoId || !isLoggedIn) return;
    setLoadingMsgs(true);
    setMessages([]);
    lastMsgIdRef.current = 0;
    api.chat.messages(activeConvoId)
      .then(data => {
        const local: LocalMessage[] = data.map(m => ({
          tempId: String(m.id),
          serverId: m.id,
          sender_id: m.sender,
          sender_name: m.sender_name,
          sender_role: m.sender_role,
          text: m.text,
          message_type: m.message_type,
          time: m.created_at,
          status: "delivered",
          reactions: [],
        }));
        setMessages(local);
        setReactions({});
        if (data.length > 0) lastMsgIdRef.current = Math.max(...data.map(m => m.id));
      })
      .catch(() => {})
      .finally(() => setLoadingMsgs(false));
  }, [activeConvoId, isLoggedIn]);

  /* ── Real-time polling for new messages ───────────────── */
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!activeConvoId || !isLoggedIn || !currentUser) return;

    pollRef.current = setInterval(async () => {
      try {
        const data = await api.chat.messages(activeConvoId);
        if (!data.length) return;
        const maxId = Math.max(...data.map(m => m.id));
        if (maxId <= lastMsgIdRef.current) return;
        const newMsgs = data.filter(m => m.id > lastMsgIdRef.current && m.sender !== currentUser.id);
        if (newMsgs.length === 0) return;
        lastMsgIdRef.current = maxId;
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.serverId).filter(Boolean));
          const toAdd: LocalMessage[] = newMsgs
            .filter(m => !existingIds.has(m.id))
            .map(m => ({
              tempId: String(m.id),
              serverId: m.id,
              sender_id: m.sender,
              sender_name: m.sender_name,
              sender_role: m.sender_role,
              text: m.text,
              message_type: m.message_type,
              time: m.created_at,
              status: "delivered" as const,
              reactions: [],
            }));
          return toAdd.length ? [...prev, ...toAdd] : prev;
        });
        setConvos(prev => prev.map(c =>
          c.id === activeConvoId
            ? { ...c, updated_at: newMsgs[newMsgs.length - 1].created_at }
            : c
        ));
      } catch { /* ignore polling errors */ }
    }, POLL_INTERVAL_MS);

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeConvoId, isLoggedIn, currentUser]);

  /* ── Auto-scroll ─────────────────────────────────────── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping]);

  /* ── Load appointment contacts when new chat panel opens ─ */
  useEffect(() => {
    if (!showNewChat || !isLoggedIn) return;
    setApptContactsLoading(true);
    api.appointments.contacts()
      .then(data => setApptContacts(data as ApptContact[]))
      .catch(() => setApptContacts([]))
      .finally(() => setApptContactsLoading(false));
  }, [showNewChat, isLoggedIn]);

  /* ── User search for new chat ─────────────────────────── */
  useEffect(() => {
    if (!userSearch.trim() || userSearch.length < 1) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const roleFilter = currentUser?.role === "doctor" ? "patient" : "doctor";
        const results = await api.chat.searchUsers(userSearch, roleFilter);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [userSearch, currentUser]);

  /* ── Start or open conversation with a user ───────────── */
  const startChatWith = async (user: UserBrief) => {
    setShowNewChat(false);
    setUserSearch("");
    setSearchResults([]);
    try {
      const convo = await api.chat.startConversation(user.id);
      const existingIdx = convos.findIndex(c => c.id === convo.id);
      if (existingIdx === -1) {
        setConvos(prev => [convo, ...prev]);
      }
      setActiveConvoId(convo.id);
      setMobileView("chat");
    } catch { /* ignore */ }
  };

  /* ── Send message ─────────────────────────────────────── */
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || !activeConvoId || !currentUser) return;

    const tempId = `tmp-${Date.now()}`;
    const localMsg: LocalMessage = {
      tempId,
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      sender_role: currentUser.role,
      text,
      message_type: "text",
      time: new Date().toISOString(),
      status: "sending",
      reactions: [],
      replyTo: replyTo ?? undefined,
    };

    setMessages(prev => [...prev, localMsg]);
    setInput("");
    setReplyTo(null);

    try {
      const saved = await api.chat.send(activeConvoId, text);
      setMessages(prev =>
        prev.map(m => m.tempId === tempId
          ? { ...m, serverId: saved.id, status: "sent" }
          : m)
      );
      setConvos(prev => prev.map(c =>
        c.id === activeConvoId
          ? { ...c, last_message: { text, created_at: saved.created_at, sender_name: currentUser.name }, updated_at: saved.created_at }
          : c
      ));
    } catch {
      setMessages(prev => prev.map(m => m.tempId === tempId ? { ...m, status: "sending" } : m));
    }

  }, [input, activeConvoId, currentUser, replyTo]);

  /* ── Toggle reaction ──────────────────────────────────── */
  const toggleReaction = (msgKey: string, emoji: string) => {
    setReactions(prev => {
      const cur = prev[msgKey] ?? [];
      const existing = cur.find(r => r.emoji === emoji);
      if (existing) {
        if (existing.mine) return { ...prev, [msgKey]: cur.filter(r => r.emoji !== emoji) };
        return { ...prev, [msgKey]: cur.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, mine: true } : r) };
      }
      return { ...prev, [msgKey]: [...cur, { emoji, count: 1, mine: true }] };
    });
    setShowReactions(null);
  };

  /* ── Filtered convo list ──────────────────────────────── */
  const filteredConvos = useMemo(() =>
    convos.filter(c =>
      !search || c.other_user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.last_message?.text?.toLowerCase().includes(search.toLowerCase())
    ), [convos, search]);

  /* ─── NOT LOGGED IN ──────────────────────────────────── */
  if (!isLoggedIn) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 flex items-center justify-center bg-[#F8FAFC]">
          <div className="text-center max-w-md px-6">
            <div className="w-20 h-20 bg-[#EFF6FF] rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="bi bi-chat-heart-fill text-4xl text-[#2C74B3]" />
            </div>
            <h2 className="text-2xl font-bold text-[#0A2647] mb-3">Sign in to start chatting</h2>
            <p className="text-gray-500 mb-6">
              Chat directly with your doctors or patients. Securely, in real time.
            </p>
            <div className="flex gap-3 justify-center">
              <a href="/auth/login"
                className="bg-[#2C74B3] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#0A2647] transition-all">
                Sign In
              </a>
              <a href="/auth/register"
                className="border-2 border-[#2C74B3] text-[#2C74B3] font-semibold px-6 py-3 rounded-xl hover:bg-[#2C74B3] hover:text-white transition-all">
                Register
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════ */
  return (
    <AuthGuard>
    <>
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
        .msg-new    { animation: msgSlideIn .22s ease forwards; }
        .react-pop  { animation: reactionPop .18s ease forwards; }
        .chat-bg {
          background-color: #EEF2F7;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c5d3e0' fill-opacity='0.18'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .scrollbar-thin::-webkit-scrollbar { width:4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background:#CBD5E1; border-radius:2px; }
      `}</style>

      <div className="h-screen flex flex-col overflow-hidden">
        <Navbar />

        <div className="flex flex-1 overflow-hidden">

          {/* ══ LEFT SIDEBAR ═════════════════════════════════════ */}
          <aside className={`
            ${mobileView === "chat" ? "hidden md:flex" : "flex"}
            md:flex flex-col w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex-shrink-0
          `}>

            {/* Header */}
            <div className="bg-[#0A2647] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={currentUser.name} role={currentUser.role} size={10} />
                <div>
                  <div className="font-semibold text-sm">{currentUser.name}</div>
                  <div className="text-sky-300 text-xs capitalize">{currentUser.role} Portal</div>
                </div>
              </div>
              <button
                onClick={() => setShowNewChat(v => !v)}
                className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                title="New chat"
              >
                <i className="bi bi-pencil-square text-lg" />
              </button>
            </div>

            {/* New chat panel */}
            {showNewChat && (
              <div className="bg-[#EFF6FF] border-b border-blue-100 px-3 py-3">
                {/* Search input */}
                <div className="relative mb-2">
                  <i className="bi bi-search absolute left-3 top-2.5 text-gray-400 text-sm" />
                  <input
                    autoFocus
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder={`Search ${currentUser.role === "doctor" ? "patients" : "doctors"}…`}
                    className="w-full bg-white rounded-full pl-9 pr-4 py-2 text-sm text-[#0A2647] placeholder-gray-400 focus:outline-none border border-blue-200"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {/* Search results */}
                  {userSearch.trim() && (
                    <>
                      {searchLoading && (
                        <div className="space-y-1 py-1">
                          {[1,2].map(i => (
                            <div key={i} className="flex items-center gap-2 px-2 py-2">
                              <div className="w-9 h-9 rounded-full bg-blue-100 animate-pulse flex-shrink-0" />
                              <div className="flex-1 space-y-1">
                                <div className="h-3 bg-blue-100 rounded animate-pulse w-3/4" />
                                <div className="h-2.5 bg-blue-100 rounded animate-pulse w-1/2" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {!searchLoading && searchResults.length === 0 && (
                        <div className="text-center py-3 text-xs text-gray-400">No users found</div>
                      )}
                      {searchResults.map(u => (
                        <button key={u.id} onClick={() => startChatWith(u)}
                          className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white transition-colors text-left">
                          <Avatar name={u.name} role={u.role} size={9} />
                          <div>
                            <div className="text-sm font-semibold text-[#0A2647]">{u.role === "doctor" ? "Dr. " : ""}{u.name}</div>
                            <div className="text-xs text-gray-400 capitalize">{u.role}</div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}

                  {/* Appointment-based suggestions (shown when not searching) */}
                  {!userSearch.trim() && (
                    <>
                      {apptContactsLoading && (
                        <div className="space-y-1 py-1">
                          {[1,2].map(i => (
                            <div key={i} className="flex items-center gap-2 px-2 py-2">
                              <div className="w-9 h-9 rounded-full bg-blue-100 animate-pulse flex-shrink-0" />
                              <div className="flex-1 space-y-1">
                                <div className="h-3 bg-blue-100 rounded animate-pulse w-3/4" />
                                <div className="h-2.5 bg-blue-100 rounded animate-pulse w-1/2" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {!apptContactsLoading && apptContacts.length > 0 && (
                        <>
                          <p className="text-xs text-[#2C74B3] font-semibold px-2 pb-1">
                            <i className="bi bi-calendar-check-fill mr-1" />
                            From your appointments
                          </p>
                          {apptContacts.map(c => (
                            <button key={c.id}
                              onClick={() => startChatWith({ id: c.id, name: c.name, email: c.email, role: c.role })}
                              className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white transition-colors text-left">
                              <Avatar name={c.name} role={c.role} size={9} />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-[#0A2647]">{c.role === "doctor" ? "Dr. " : ""}{c.name}</div>
                                <div className="text-xs text-gray-400">
                                  {c.appointment_date} ·{" "}
                                  <span className={c.appointment_status === "confirmed" ? "text-green-600" : c.appointment_status === "pending" ? "text-amber-500" : "text-gray-400"}>
                                    {c.appointment_status}
                                  </span>
                                </div>
                              </div>
                              <i className="bi bi-chat-dots-fill text-[#2C74B3] text-sm flex-shrink-0" />
                            </button>
                          ))}
                          <div className="border-t border-blue-100 my-1" />
                        </>
                      )}
                      {!apptContactsLoading && apptContacts.length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-2">
                          Type a name to search
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Search */}
            <div className="px-3 py-2 bg-[#F0F2F5]">
              <div className="relative">
                <i className="bi bi-search absolute left-3 top-2.5 text-gray-400 text-sm" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search conversations"
                  className="w-full bg-white rounded-full pl-9 pr-4 py-2 text-sm text-[#0A2647] placeholder-gray-400 focus:outline-none border border-gray-200"
                />
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {loadingConvos && (
                <div className="divide-y divide-gray-100">
                  {Array.from({length: 5}).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-gray-200 rounded animate-pulse w-2/3" />
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-4/5" />
                      </div>
                      <div className="h-2.5 w-8 bg-gray-100 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              )}

              {!loadingConvos && filteredConvos.length === 0 && (
                <div className="text-center py-12 px-6">
                  <i className="bi bi-chat-dots text-5xl text-gray-200 block mb-3" />
                  <p className="text-gray-500 text-sm">No conversations yet.</p>
                  <button
                    onClick={() => setShowNewChat(true)}
                    className="mt-3 text-[#2C74B3] text-sm font-semibold hover:underline"
                  >
                    Start a new chat
                  </button>
                </div>
              )}

              {filteredConvos.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setActiveConvoId(c.id); setMobileView("chat"); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-[#F0F2F5] transition-colors text-left ${activeConvoId === c.id ? "bg-[#EFF6FF] border-l-4 border-l-[#2C74B3]" : ""}`}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar name={c.other_user?.name ?? "?"} role={c.other_user?.role ?? "patient"} size={12} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#0A2647] text-sm truncate">
                        {c.other_user?.role === "doctor" ? "Dr. " : ""}{c.other_user?.name ?? "Unknown"}
                      </span>
                      <span className="text-gray-400 text-xs ml-2 flex-shrink-0">
                        {c.last_message ? formatTime(c.last_message.created_at) : ""}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-gray-500 text-xs truncate">
                        {c.last_message?.text ?? "Say hello!"}
                      </span>
                      {c.unread_count > 0 && (
                        <span className="ml-2 bg-[#2C74B3] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {c.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* ══ CHAT AREA ════════════════════════════════════════ */}
          <div className={`${mobileView === "list" ? "hidden md:flex" : "flex"} flex-1 flex-col overflow-hidden`}>
            {!activeConvoId ? (
              <div className="flex-1 flex items-center justify-center bg-[#F8FAFC]">
                <div className="text-center">
                  <div className="w-24 h-24 bg-[#EFF6FF] rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="bi bi-chat-heart-fill text-5xl text-[#2C74B3]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0A2647]">Select a conversation</h3>
                  <p className="text-gray-500 mt-2 text-sm">or start a new one by clicking the pencil icon</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
                  <button
                    className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-[#0A2647] hover:bg-gray-100"
                    onClick={() => setMobileView("list")}
                  >
                    <i className="bi bi-arrow-left text-lg" />
                  </button>
                  {activeConvo && (
                    <>
                      <Avatar name={activeConvo.other_user?.name ?? "?"} role={activeConvo.other_user?.role ?? "patient"} size={10} />
                      <div className="flex-1">
                        <div className="font-semibold text-[#0A2647]">
                          {activeConvo.other_user?.role === "doctor" ? "Dr. " : ""}{activeConvo.other_user?.name}
                        </div>
                        <div className="text-xs text-[#2C74B3] capitalize">{activeConvo.other_user?.role}</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto scrollbar-thin chat-bg px-4 py-4 space-y-1">
                  {loadingMsgs && (
                    <div className="space-y-4 py-2">
                      {[80, 55, 70, 45, 65].map((w, i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"} items-end gap-2`}>
                          {i % 2 !== 0 && <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />}
                          <div className={`h-10 bg-gray-200 rounded-2xl animate-pulse`} style={{ width: `${w}%`, maxWidth: "70%" }} />
                        </div>
                      ))}
                    </div>
                  )}

                  {!loadingMsgs && messages.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-sm">
                      <i className="bi bi-chat-dots text-4xl block mb-3 text-gray-200" />
                      No messages yet. Say hello!
                    </div>
                  )}

                  {messages.map((msg) => {
                    const isMe = msg.sender_id === currentUser.id || msg.tempId.startsWith("tmp-");
                    const msgKey = msg.tempId;
                    const msgReactions = reactions[msgKey] ?? [];

                    return (
                      <div
                        key={msgKey}
                        className={`flex ${isMe ? "justify-end" : "justify-start"} group msg-new`}
                        onMouseEnter={() => setHoverMsgId(msgKey)}
                        onMouseLeave={() => { setHoverMsgId(null); setShowReactions(null); }}
                      >
                        {!isMe && (
                          <div className="mr-2 mt-auto mb-1 flex-shrink-0">
                            <Avatar name={msg.sender_name} role={msg.sender_role} size={8} />
                          </div>
                        )}
                        <div className="max-w-[65%]">
                          {/* Reply reference */}
                          {msg.replyTo && (
                            <div className={`text-xs px-3 py-1.5 rounded-xl mb-1 border-l-4 ${isMe ? "bg-blue-800/30 border-blue-300 text-blue-100 ml-auto" : "bg-gray-100 border-gray-300 text-gray-500"}`}>
                              <span className="font-semibold">{msg.replyTo.name}</span>
                              <p className="truncate">{msg.replyTo.text}</p>
                            </div>
                          )}

                          {/* Bubble */}
                          <div className={`relative px-4 py-2.5 rounded-2xl shadow-sm ${isMe ? "bg-[#2C74B3] text-white rounded-br-none" : "bg-white text-[#0A2647] rounded-bl-none"}`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                            <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                              <span className={`text-[10px] ${isMe ? "text-white/60" : "text-gray-400"}`}>
                                {formatTime(msg.time)}
                              </span>
                              {isMe && <StatusIcon status={msg.status} />}
                            </div>
                          </div>

                          {/* Reactions */}
                          {msgReactions.length > 0 && (
                            <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                              {msgReactions.map(r => (
                                <button key={r.emoji}
                                  onClick={() => toggleReaction(msgKey, r.emoji)}
                                  className={`text-xs px-2 py-0.5 rounded-full border react-pop ${r.mine ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}>
                                  {r.emoji} {r.count}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Hover actions */}
                          {hoverMsgId === msgKey && (
                            <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                              <div className="relative">
                                <button
                                  onClick={() => setShowReactions(showReactions === msgKey ? null : msgKey)}
                                  className="w-7 h-7 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#2C74B3] text-sm"
                                >
                                  <i className="bi bi-emoji-smile" />
                                </button>
                                {showReactions === msgKey && (
                                  <div className={`absolute bottom-9 react-pop flex gap-1 bg-white border border-gray-200 rounded-2xl px-2 py-1 shadow-lg z-10 ${isMe ? "right-0" : "left-0"}`}>
                                    {REACTION_EMOJIS.map(e => (
                                      <button key={e} onClick={() => toggleReaction(msgKey, e)}
                                        className="text-lg hover:scale-125 transition-transform">{e}</button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => setReplyTo({ text: msg.text, name: msg.sender_name })}
                                className="w-7 h-7 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#2C74B3] text-sm"
                              >
                                <i className="bi bi-reply" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {otherTyping && <TypingDots />}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply bar */}
                {replyTo && (
                  <div className="bg-[#EFF6FF] border-t border-blue-100 px-4 py-2 flex items-center gap-3">
                    <div className="flex-1 border-l-4 border-[#2C74B3] pl-3">
                      <div className="text-xs font-semibold text-[#2C74B3]">{replyTo.name}</div>
                      <div className="text-xs text-gray-500 truncate">{replyTo.text}</div>
                    </div>
                    <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-gray-600">
                      <i className="bi bi-x-lg" />
                    </button>
                  </div>
                )}

                {/* Input */}
                <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Type a message…"
                    className="flex-1 bg-[#F0F2F5] rounded-full px-4 py-2.5 text-sm text-[#0A2647] placeholder-gray-400 focus:outline-none border border-gray-200 focus:border-[#2C74B3] transition-colors"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="w-10 h-10 rounded-full bg-[#2C74B3] text-white flex items-center justify-center hover:bg-[#0A2647] transition-all disabled:opacity-40 flex-shrink-0"
                  >
                    <i className="bi bi-send-fill text-sm" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
    </AuthGuard>
  );
}
