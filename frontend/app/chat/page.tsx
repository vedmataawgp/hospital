"use client";

import {
  useState, useEffect, useRef, useCallback, useMemo,
} from "react";
import { useSearchParams } from "next/navigation";
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

/* 1 s fast poll for new messages, 1.5 s for typing, 2.5 s for read-receipt check */
const FAST_POLL_MS   = 1000;
const TYPING_POLL_MS = 1500;
const READ_POLL_MS   = 2500;
const TYPING_DEBOUNCE_MS = 3000; /* stop-typing signal delay */

interface ApptContact {
  id: number;
  name: string;
  email: string;
  role: string;
  appointment_status: string;
  appointment_date: string;
}

/* "sending" = optimistic, "sent" = server ACK, "delivered" = server stored (legacy compat), "read" = other user read it */
type MsgStatus = "sending" | "sent" | "delivered" | "read";

interface LocalMessage {
  tempId: string;
  serverId?: number;
  sender_id: number;
  sender_name: string;
  sender_role: string;
  text: string;
  message_type: string;
  time: string;
  status: MsgStatus;
  reactions: { emoji: string; count: number; mine: boolean }[];
  replyTo?: { text: string; name: string };
}

/* ═══════════════════════════════════════════════════════════════
   READ-RECEIPT TICK ICON
   ✓  = sending (grey single)
   ✓✓ = sent / delivered (grey double)
   ✓✓ = read (blue double)
═══════════════════════════════════════════════════════════════ */
function TickIcon({ status }: { status: MsgStatus }) {
  if (status === "sending") {
    return <i className="bi bi-clock text-white/50 text-[11px]" title="Sending…" />;
  }
  if (status === "sent" || status === "delivered") {
    return (
      <span className="inline-flex items-center -space-x-[5px]" title="Delivered">
        <i className="bi bi-check text-white/60 text-[13px]" />
        <i className="bi bi-check text-white/60 text-[13px]" />
      </span>
    );
  }
  /* read — blue double tick */
  return (
    <span className="inline-flex items-center -space-x-[5px]" title="Read">
      <i className="bi bi-check text-sky-300 text-[13px]" />
      <i className="bi bi-check text-sky-300 text-[13px]" />
    </span>
  );
}

/* Animated typing dots */
function TypingDots({ name }: { name: string }) {
  return (
    <div className="flex items-end gap-2 px-4 py-1 msg-new">
      <div className="flex flex-col items-start gap-0.5">
        <span className="text-[10px] text-gray-400 pl-1">{name} is typing…</span>
        <div className="flex items-center gap-1 bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-2 h-2 bg-gray-400 rounded-full"
              style={{ animation: `typingBounce 1.2s ${i * 0.18}s infinite ease-in-out` }} />
          ))}
        </div>
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
   SKELETON LOADERS
═══════════════════════════════════════════════════════════════ */
function ConvoSkeleton() {
  return (
    <div className="space-y-0.5 px-2 pt-1">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="flex items-center gap-3 px-2 py-3 rounded-xl">
          <div className="w-11 h-11 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 animate-pulse rounded w-2/3" />
            <div className="h-2.5 bg-gray-100 animate-pulse rounded w-1/2" />
          </div>
          <div className="h-2 bg-gray-100 animate-pulse rounded w-8" />
        </div>
      ))}
    </div>
  );
}

function MsgSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-4 py-6">
      {[false, true, false, false, true].map((mine, i) => (
        <div key={i} className={`flex gap-2 ${mine ? "justify-end" : "justify-start"}`}>
          {!mine && <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0 mt-1" />}
          <div className={`h-10 rounded-2xl animate-pulse ${mine ? "bg-blue-100 w-40" : "bg-gray-200 w-52"}`} />
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function ChatPage() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const rawUser = userStore.get();
  const currentUser = useMemo(() => rawUser, [rawUser?.id, rawUser?.role]);
  const isLoggedIn = !!tokenStore.get() && !!currentUser;
  const searchParams = useSearchParams();

  /* conversations */
  const [convos, setConvos] = useState<ChatConversation[]>([]);
  const [loadingConvos, setLoadingConvos] = useState(false);
  const [activeConvoId, setActiveConvoId] = useState<number | null>(null);
  const autoOpenedRef = useRef(false);

  /* messages */
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  /* real-time */
  const [otherTyping, setOtherTyping] = useState(false);

  /* ui */
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [replyTo, setReplyTo] = useState<{ text: string; name: string } | null>(null);
  const [hoverMsgId, setHoverMsgId] = useState<string | null>(null);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, { emoji: string; count: number; mine: boolean }[]>>({});

  /* new chat */
  const [showNewChat, setShowNewChat] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<UserBrief[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [apptContacts, setApptContacts] = useState<ApptContact[]>([]);
  const [apptContactsLoading, setApptContactsLoading] = useState(false);

  /* attachments */
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* video call */
  const [callSession, setCallSession] = useState<{ role: 'caller' | 'callee'; status: 'ringing' | 'connected' | 'ended' } | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const processedSignalsRef = useRef<Set<number>>(new Set());
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fastPollRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const readPollRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMsgIdRef  = useRef<number>(0);
  const inputRef      = useRef<HTMLInputElement>(null);

  /* IDs of our sent messages awaiting a read receipt */
  const unreadSentRef = useRef<Set<number>>(new Set());

  /* typing debounce: clear typing after TYPING_DEBOUNCE_MS of silence */
  const typingTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSendingTypingRef = useRef(false);

  const activeConvo = useMemo(() => convos.find(c => c.id === activeConvoId) ?? null, [convos, activeConvoId]);
  
  const displayMessages = useMemo(() => 
    messages.filter(m => m.message_type !== "signal"),
    [messages]
  );

  /* ── Convert server msg to local ───────────────────────── */
  const serverToLocal = (m: ChatMsg, mine: boolean): LocalMessage => ({
    tempId: String(m.id),
    serverId: m.id,
    sender_id: m.sender,
    sender_name: m.sender_name,
    sender_role: m.sender_role,
    text: m.text,
    message_type: m.message_type,
    time: m.created_at,
    status: mine ? (m.is_read ? "read" : "sent") : "delivered",
    reactions: [],
  });

  /* ── Load conversations ───────────────────────────────── */
  const loadConversations = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoadingConvos(true);
    try {
      const data = await api.chat.conversations();
      setConvos(data);
    } catch { /* ignore */ }
    finally { setLoadingConvos(false); }
  }, [isLoggedIn]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  /* ── Auto-open conversation from ?userId=X URL param ─── */
  useEffect(() => {
    if (!isLoggedIn || autoOpenedRef.current) return;
    const targetUserId = searchParams.get("userId");
    if (!targetUserId) return;
    autoOpenedRef.current = true;

    const open = async () => {
      try {
        const convo = await api.chat.startConversation(Number(targetUserId));
        setConvos(prev => prev.find(c => c.id === convo.id) ? prev : [convo, ...prev]);
        setActiveConvoId(convo.id);
        setMobileView("chat");
      } catch { /* ignore */ }
    };
    open();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, searchParams]);

  /* ── Load full message history when convo changes ────── */
  useEffect(() => {
    if (!activeConvoId || !isLoggedIn || !currentUser) return;
    setLoadingMsgs(true);
    setMessages([]);
    setOtherTyping(false);
    lastMsgIdRef.current = 0;
    unreadSentRef.current = new Set();
    processedSignalsRef.current.clear(); // Clear signals when switching conversations

    api.chat.messages(activeConvoId)
      .then(data => {
        const local = data.map(m => serverToLocal(m, m.sender === currentUser.id));
        setMessages(local);
        setReactions({});
        if (data.length > 0) {
          lastMsgIdRef.current = Math.max(...data.map(m => m.id));
          /* track any of our sent messages that haven't been read yet */
          data.forEach(m => {
            if (m.sender === currentUser.id && !m.is_read) {
              unreadSentRef.current.add(m.id);
            }
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingMsgs(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConvoId, isLoggedIn]);

  /* ── FAST POLL: new incoming messages (1 s, ?after=lastId) ─ */
  useEffect(() => {
    if (fastPollRef.current) clearInterval(fastPollRef.current);
    if (!activeConvoId || !isLoggedIn || !currentUser) return;

    fastPollRef.current = setInterval(async () => {
      try {
        const data = await api.chat.messages(activeConvoId, lastMsgIdRef.current);
        if (!data.length) return;
        const newId = Math.max(...data.map(m => m.id));
        lastMsgIdRef.current = newId;
        const incoming = data.filter(m => m.sender !== currentUser.id);
        if (!incoming.length) return;
        setMessages(prev => {
          const ids = new Set(prev.map(m => m.serverId).filter(Boolean));
          const toAdd = incoming.filter(m => !ids.has(m.id)).map(m => serverToLocal(m, false));
          return toAdd.length ? [...prev, ...toAdd] : prev;
        });
        setConvos(prev => prev.map(c =>
          c.id === activeConvoId
            ? { ...c, updated_at: incoming[incoming.length - 1].created_at }
            : c
        ));
      } catch { /* ignore */ }
    }, FAST_POLL_MS);

    return () => { if (fastPollRef.current) clearInterval(fastPollRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConvoId, isLoggedIn, currentUser]);

  /* ── READ-RECEIPT POLL: check if our sent msgs got is_read (2.5 s) ─ */
  useEffect(() => {
    if (readPollRef.current) clearInterval(readPollRef.current);
    if (!activeConvoId || !isLoggedIn || !currentUser) return;

    readPollRef.current = setInterval(async () => {
      if (!unreadSentRef.current.size) return;
      const minPending = Math.min(...unreadSentRef.current);
      try {
        const data = await api.chat.messages(activeConvoId, minPending - 1);
        let changed = false;
        data.forEach(m => {
          if (unreadSentRef.current.has(m.id) && m.is_read) {
            unreadSentRef.current.delete(m.id);
            changed = true;
          }
        });
        if (changed) {
          /* get the full list of now-read IDs before clearing the set */
          const readIds = data.filter(m => m.is_read && m.sender === currentUser.id).map(m => m.id);
          if (readIds.length) {
            setMessages(prev => prev.map(msg =>
              msg.serverId && readIds.includes(msg.serverId)
                ? { ...msg, status: "read" }
                : msg
            ));
          }
        }
      } catch { /* ignore */ }
    }, READ_POLL_MS);

    return () => { if (readPollRef.current) clearInterval(readPollRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConvoId, isLoggedIn, currentUser]);

  /* ── TYPING POLL: is the other person typing? (1.5 s) ─── */
  useEffect(() => {
    if (typingPollRef.current) clearInterval(typingPollRef.current);
    if (!activeConvoId || !isLoggedIn) return;

    typingPollRef.current = setInterval(async () => {
      try {
        const { typing } = await api.chat.getTyping(activeConvoId);
        setOtherTyping(typing);
      } catch { /* ignore */ }
    }, TYPING_POLL_MS);

    return () => { if (typingPollRef.current) clearInterval(typingPollRef.current); };
  }, [activeConvoId, isLoggedIn]);

  /* ── Auto-scroll ─────────────────────────────────────── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping]);

  /* ── Appointment contacts ─────────────────────────────── */
  useEffect(() => {
    if (!showNewChat || !isLoggedIn) return;
    setApptContactsLoading(true);
    api.chat.appointmentContacts()
      .then(data => setApptContacts(data as ApptContact[]))
      .catch(() => setApptContacts([]))
      .finally(() => setApptContactsLoading(false));
  }, [showNewChat, isLoggedIn]);

  /* ── User search ──────────────────────────────────────── */
  useEffect(() => {
    if (!userSearch.trim()) {
      setSearchResults(prev => (prev.length === 0 ? prev : []));
      return;
    }
    const t = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const roleFilter = currentUser?.role === "doctor" ? "patient" : "doctor";
        const results = await api.chat.searchUsers(userSearch, roleFilter);
        setSearchResults(results);
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [userSearch, currentUser]);

  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
  }, [localStream]);
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  /* ── Start or open convo ──────────────────────────────── */
  const startChatWith = async (user: UserBrief) => {
    setShowNewChat(false);
    setUserSearch("");
    setSearchResults([]);
    try {
      const convo = await api.chat.startConversation(user.id);
      setConvos(prev => prev.find(c => c.id === convo.id) ? prev : [convo, ...prev]);
      setActiveConvoId(convo.id);
      setMobileView("chat");
    } catch { /* ignore */ }
  };

  /* ── File Upload ── */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConvoId || !currentUser) return;
    setUploading(true);
    try {
      const res = await api.upload(file);
      const type = file.type.startsWith('image/') ? 'image' : 'file';
      const msg = await api.chat.send(activeConvoId, "", type, res.url, res.name);
      setMessages(prev => [...prev, serverToLocal(msg, true)]);
    } catch { 
      alert("Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /* ── Video Call ── */
  const startCall = async () => {
    if (!activeConvoId || !currentUser) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setCallSession({ role: 'caller', status: 'ringing' });
      
      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      pcRef.current = pc;
      
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      pc.ontrack = e => setRemoteStream(e.streams[0]);
      
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      await api.chat.send(activeConvoId, JSON.stringify({ type: 'offer', sdp: offer.sdp }), 'signal');
      
      pc.onicecandidate = e => {
        if (e.candidate) {
          api.chat.send(activeConvoId, JSON.stringify({ type: 'candidate', candidate: e.candidate }), 'signal');
        }
      };
    } catch (err) {
      alert("Could not start camera: " + (err as Error).message);
    }
  };

  const acceptCall = async () => {
    if (!activeConvoId || !currentUser) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setCallSession(prev => prev ? { ...prev, status: 'connected' } : null);
      
      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      pcRef.current = pc;
      
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      pc.ontrack = e => setRemoteStream(e.streams[0]);
      
      // Find the most recent signal message that is an offer
      const offerMsg = [...messages].reverse().find(m => {
        const t = m.text.replace(/&quot;/g, '"');
        return m.message_type === "signal" && t.includes('"type":"offer"');
      });
      if (offerMsg) {
        const rawText = offerMsg.text.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        const signal = JSON.parse(rawText);
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: signal.sdp }));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await api.chat.send(activeConvoId, JSON.stringify({ type: 'answer', sdp: answer.sdp }), 'signal');
      }
      
      pc.onicecandidate = e => {
        if (e.candidate) {
          api.chat.send(activeConvoId, JSON.stringify({ type: 'candidate', candidate: e.candidate }), 'signal');
        }
      };
    } catch (err) {
      alert("Error accepting call: " + (err as Error).message);
    }
  };

  const endCall = () => {
    pcRef.current?.close();
    pcRef.current = null;
    localStream?.getTracks().forEach(t => t.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setCallSession(null);
    if (activeConvoId) {
      api.chat.send(activeConvoId, "Call ended", 'video_call');
    }
  };

  /* Process incoming signals */
  useEffect(() => {
    if (!messages.length || !currentUser || !activeConvoId) return;

    const currentSignals = messages.filter(m => 
      m.message_type === "signal" && 
      m.sender_id !== currentUser?.id && 
      !processedSignalsRef.current.has(Number(m.serverId || 0))
    );

    if (currentSignals.length === 0) return;

    const now = Date.now();
    currentSignals.forEach(async (msg) => {
      const signalId = Number(msg.serverId || 0);
      if (signalId) processedSignalsRef.current.add(signalId);

      // Skip signals older than 2 minutes (prevents ringing for stale offers)
      const msgTime = new Date(msg.time).getTime();
      if (now - msgTime > 120000) return;

      try {
        const rawText = msg.text.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        const signal = JSON.parse(rawText);
        
        switch (signal.type) {
          case 'offer':
            // Only respond to offers if we are not already in an active session
            if (!callSession || callSession.status === 'ended') {
              console.log("Incoming call offer detected. Starting ringing...");
              setCallSession({ role: 'callee', status: 'ringing' });
            }
            break;

          case 'answer':
            if (pcRef.current && pcRef.current.signalingState !== 'stable') {
              await pcRef.current.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: signal.sdp }));
              setCallSession(prev => prev ? { ...prev, status: 'connected' } : null);
            }
            break;

          case 'candidate':
            if (pcRef.current && pcRef.current.remoteDescription) {
              await pcRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
            }
            break;
        }
      } catch (err) {
        console.error("Signal parsing error:", err);
      }
    });
  }, [messages, currentUser, activeConvoId, callSession]);

  /* ── Typing signal to backend ─────────────────────────── */
  const handleInputChange = (val: string) => {
    setInput(val);
    if (!activeConvoId) return;

    /* send "typing: true" once per key sequence */
    if (!isSendingTypingRef.current) {
      isSendingTypingRef.current = true;
      api.chat.setTyping(activeConvoId, true).catch(() => {});
    }

    /* reset debounce timer */
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isSendingTypingRef.current = false;
      if (activeConvoId) api.chat.setTyping(activeConvoId, false).catch(() => {});
    }, TYPING_DEBOUNCE_MS);
  };

  /* ── Send message ─────────────────────────────────────── */
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || !activeConvoId || !currentUser) return;

    /* clear typing signal immediately */
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    isSendingTypingRef.current = false;
    api.chat.setTyping(activeConvoId, false).catch(() => {});

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
      /* track for read receipts */
      unreadSentRef.current.add(saved.id);
      lastMsgIdRef.current = Math.max(lastMsgIdRef.current, saved.id);
      setConvos(prev => prev.map(c =>
        c.id === activeConvoId
          ? { ...c, last_message: { text, created_at: saved.created_at, sender_name: currentUser.name }, updated_at: saved.created_at }
          : c
      ));
    } catch {
      /* show error state (re-use "sending" look) */
    }
  }, [input, activeConvoId, currentUser, replyTo]);

  /* ── Reaction toggle ──────────────────────────────────── */
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
      !search ||
      c.other_user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.last_message?.text?.toLowerCase().includes(search.toLowerCase())
    ), [convos, search]);

  /* ─── LOADING STATE ──────────────────────────────────── */
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2C74B3] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#0A2647] font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

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
            <p className="text-gray-500 mb-6">Chat directly with your doctors or patients. Securely, in real time.</p>
            <div className="flex gap-3 justify-center">
              <a href="/auth/login" className="bg-[#2C74B3] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#0A2647] transition-all">Sign In</a>
              <a href="/auth/register" className="border-2 border-[#2C74B3] text-[#2C74B3] font-semibold px-6 py-3 rounded-xl hover:bg-[#2C74B3] hover:text-white transition-all">Register</a>
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
          from { opacity:0; transform: translateY(8px) scale(.98); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
        @keyframes reactionPop {
          from { opacity:0; transform: scale(.6) translateY(6px); }
          to   { opacity:1; transform: scale(1) translateY(0); }
        }
        .msg-new    { animation: msgSlideIn .18s ease forwards; }
        .react-pop  { animation: reactionPop .15s ease forwards; }
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
                <i className={`bi ${showNewChat ? "bi-x-lg" : "bi-pencil-square"} text-lg`} />
              </button>
            </div>

            {/* New chat panel */}
            {showNewChat && (
              <div className="bg-[#EFF6FF] border-b border-blue-100 px-3 py-3">
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

                <div className="max-h-64 overflow-y-auto scrollbar-thin">
                  {/* Search results */}
                  {userSearch.trim() ? (
                    <>
                      {searchLoading && (
                        <div className="space-y-1 py-1">
                          {[1,2].map(i => (
                            <div key={i} className="flex items-center gap-2 px-2 py-2">
                              <div className="w-9 h-9 rounded-full bg-blue-100 animate-pulse flex-shrink-0" />
                              <div className="flex-1 space-y-1.5">
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
                  ) : (
                    /* Appointment-based suggestions */
                    <>
                      {apptContactsLoading && (
                        <div className="space-y-1 py-1">
                          {[1,2].map(i => (
                            <div key={i} className="flex items-center gap-2 px-2 py-2">
                              <div className="w-9 h-9 rounded-full bg-blue-100 animate-pulse flex-shrink-0" />
                              <div className="flex-1 space-y-1.5">
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
                        <p className="text-xs text-gray-400 text-center py-2">Type a name to search</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Search bar */}
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="relative">
                <i className="bi bi-search absolute left-3 top-2.5 text-gray-400 text-sm" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search conversations…"
                  className="w-full bg-gray-50 rounded-full pl-9 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#2C74B3]/30" />
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {loadingConvos ? (
                <ConvoSkeleton />
              ) : filteredConvos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                  <i className="bi bi-chat-dots text-4xl text-gray-200 mb-3" />
                  <p className="text-sm text-gray-400">No conversations yet.<br />Tap the pencil to start one.</p>
                </div>
              ) : (
                <div className="py-1">
                  {filteredConvos.map(c => (
                    <button key={c.id}
                      onClick={() => { setActiveConvoId(c.id); setMobileView("chat"); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${activeConvoId === c.id ? "bg-blue-50 border-l-4 border-[#2C74B3]" : "border-l-4 border-transparent"}`}
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar name={c.other_user?.name ?? "?"} role={c.other_user?.role ?? "patient"} size={11} />
                        {c.unread_count > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#2C74B3] text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                            {c.unread_count > 9 ? "9+" : c.unread_count}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <span className="font-semibold text-sm text-[#0A2647] truncate">
                            {c.other_user?.role === "doctor" ? "Dr. " : ""}{c.other_user?.name}
                          </span>
                          <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">{c.last_message ? formatTime(c.last_message.created_at) : ""}</span>
                        </div>
                        <div className="text-xs text-gray-500 truncate mt-0.5">
                          {c.last_message?.text ?? "Start a conversation"}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* ══ CHAT AREA ═════════════════════════════════════════ */}
          <main className={`
            ${mobileView === "list" ? "hidden md:flex" : "flex"}
            flex-1 flex-col overflow-hidden bg-white
          `}>
            {!activeConvoId ? (
              /* Empty state */
              <div className="flex-1 flex items-center justify-center chat-bg">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white/70 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <i className="bi bi-chat-heart text-5xl text-[#2C74B3]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0A2647] mb-2">Select a conversation</h3>
                  <p className="text-gray-500 text-sm">or tap the pencil icon to start a new one</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0 shadow-sm">
                  <button onClick={() => setMobileView("list")}
                    className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
                    <i className="bi bi-arrow-left text-[#0A2647]" />
                  </button>
                  {activeConvo?.other_user && (
                    <>
                      <div className="relative">
                        <Avatar name={activeConvo.other_user.name} role={activeConvo.other_user.role} size={10} />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#0A2647]">
                          {activeConvo.other_user.role === "doctor" ? "Dr. " : ""}{activeConvo.other_user.name}
                        </div>
                        <div className="text-xs text-gray-400 capitalize flex items-center gap-1">
                          {otherTyping
                            ? <><span className="text-green-500 font-medium">typing</span><span className="flex gap-0.5">{[0,1,2].map(i=><span key={i} className="w-1 h-1 bg-green-500 rounded-full" style={{animation:`typingBounce 1.2s ${i*0.18}s infinite`}} />)}</span></>
                            : <><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Online</>
                          }
                        </div>
                      </div>
                      <button 
                        onClick={() => startCall()}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#2C74B3] transition-colors"
                        title="Start video call"
                      >
                        <i className="bi bi-camera-video-fill text-xl" />
                      </button>
                    </>
                  )}
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto scrollbar-thin chat-bg px-2 py-2">
                  {loadingMsgs ? (
                    <MsgSkeleton />
                  ) : (
                    <>
                      {displayMessages.map((msg, idx) => {
                        const mine = msg.sender_id === currentUser.id;
                        const msgReactions = reactions[msg.tempId] ?? [];
                        const showAvatar = !mine && (idx === 0 || displayMessages[idx - 1].sender_id !== msg.sender_id);

                        return (
                          <div key={msg.tempId}
                            className="msg-new relative group"
                            onMouseEnter={() => setHoverMsgId(msg.tempId)}
                            onMouseLeave={() => { setHoverMsgId(null); setShowReactions(null); }}
                          >
                            {/* Reply-to preview */}
                            {msg.replyTo && (
                              <div className={`flex ${mine ? "justify-end" : "justify-start"} px-10 mb-0.5`}>
                                <div className="text-xs text-gray-400 italic bg-gray-100 rounded px-2 py-1 max-w-[60%] truncate border-l-2 border-[#2C74B3]">
                                  {msg.replyTo.name}: {msg.replyTo.text}
                                </div>
                              </div>
                            )}

                            <div className={`flex items-end gap-2 px-2 py-0.5 ${mine ? "justify-end" : "justify-start"}`}>
                              {/* Other user avatar */}
                              {!mine && (
                                <div className="w-8 flex-shrink-0">
                                  {showAvatar && <Avatar name={msg.sender_name} role={msg.sender_role} size={8} />}
                                </div>
                              )}

                              {/* Bubble */}
                              <div className={`relative max-w-[72%] sm:max-w-[60%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
                                {/* Sender label for others */}
                                {!mine && showAvatar && (
                                  <span className="text-[10px] text-gray-400 font-medium px-1 mb-0.5">{msg.sender_name}</span>
                                )}

                                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                                  ${mine
                                    ? "bg-gradient-to-br from-[#2C74B3] to-[#0A2647] text-white rounded-br-none"
                                    : "bg-white text-[#1a1a2e] rounded-bl-none"
                                  }`}>
                                  {/* Attachment */}
                                  {msg.message_type === "image" && msg.file_url && (
                                    <div className="mb-2 rounded-lg overflow-hidden border border-gray-200/20 shadow-sm transition-transform hover:scale-[1.02] cursor-pointer">
                                      <img 
                                        src={msg.file_url} 
                                        alt={msg.file_name} 
                                        className="max-w-full min-w-[200px] h-auto object-cover max-h-[300px]" 
                                        onClick={() => window.open(msg.file_url, '_blank')}
                                      />
                                    </div>
                                  )}
                                  {msg.message_type === "file" && msg.file_url && (
                                    <a 
                                      href={msg.file_url} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className={`flex items-center gap-3 px-3 py-2 rounded-xl mb-2 border transition-all hover:bg-black/5 ${mine ? "bg-white/10 border-white/20 text-white" : "bg-gray-50 border-gray-100 text-[#2C74B3]"}`}
                                    >
                                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${mine ? "bg-white/20" : "bg-blue-50"}`}>
                                        <i className="bi bi-file-earmark-arrow-down-fill text-xl" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="text-xs font-semibold truncate">{msg.file_name}</div>
                                        <div className="text-[10px] opacity-60 uppercase font-bold tracking-tight">Open Document</div>
                                      </div>
                                    </a>
                                  )}
                                  
                                  {/* Text */}
                                  {msg.text && (
                                    <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                                  )}

                                  {/* Video Call notification */}
                                  {msg.message_type === "video_call" && (
                                    <div className="flex items-center gap-2 py-1">
                                      <i className="bi bi-camera-video-fill text-xl" />
                                      <span className="font-semibold">{msg.text || "Video call"}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Time + tick */}
                                <div className={`flex items-center gap-1 mt-0.5 px-1 ${mine ? "justify-end" : "justify-start"}`}>
                                  <span className="text-[10px] text-gray-400">{formatTime(msg.time)}</span>
                                  {mine && <TickIcon status={msg.status} />}
                                </div>

                                {/* Reactions */}
                                {msgReactions.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1 px-1">
                                    {msgReactions.map(r => (
                                      <button key={r.emoji}
                                        onClick={() => toggleReaction(msg.tempId, r.emoji)}
                                        className={`text-xs px-1.5 py-0.5 rounded-full border transition-colors ${r.mine ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}>
                                        {r.emoji} {r.count > 1 && r.count}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Action buttons on hover */}
                              {hoverMsgId === msg.tempId && (
                                <div className={`flex items-center gap-1 mb-5 ${mine ? "order-first" : "order-last"}`}>
                                  {/* React */}
                                  <div className="relative">
                                    <button onClick={() => setShowReactions(v => v === msg.tempId ? null : msg.tempId)}
                                      className="w-7 h-7 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-100 text-sm transition-colors">
                                      😊
                                    </button>
                                    {showReactions === msg.tempId && (
                                      <div className={`react-pop absolute bottom-9 ${mine ? "right-0" : "left-0"} flex gap-1 bg-white shadow-lg rounded-full px-2 py-1.5 z-10`}>
                                        {REACTION_EMOJIS.map(emoji => (
                                          <button key={emoji}
                                            onClick={() => toggleReaction(msg.tempId, emoji)}
                                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-lg transition-transform hover:scale-125">
                                            {emoji}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  {/* Reply */}
                                  <button
                                    onClick={() => setReplyTo({ text: msg.text, name: msg.sender_name })}
                                    className="w-7 h-7 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-100 transition-colors">
                                    <i className="bi bi-reply text-gray-500 text-sm" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Typing indicator */}
                      {otherTyping && activeConvo?.other_user && (
                        <TypingDots name={activeConvo.other_user.name} />
                      )}

                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input area */}
                <div className="bg-white border-t border-gray-100 px-3 py-2 flex-shrink-0">
                  {/* Reply preview */}
                  {replyTo && (
                    <div className="flex items-center justify-between bg-blue-50 rounded-xl px-3 py-2 mb-2 border-l-4 border-[#2C74B3]">
                      <div className="text-xs text-gray-600">
                        <span className="font-semibold text-[#2C74B3]">{replyTo.name}</span>
                        <span className="mx-1">·</span>
                        <span className="truncate">{replyTo.text}</span>
                      </div>
                      <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-gray-600 ml-2">
                        <i className="bi bi-x text-sm" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-[#2C74B3] transition-colors"
                      title="Attach file"
                    >
                      {uploading ? (
                        <i className="bi bi-arrow-repeat animate-spin text-xl" />
                      ) : (
                        <i className="bi bi-paperclip text-2xl" />
                      )}
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileSelect} 
                    />

                    <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2.5 border border-gray-200 focus-within:border-[#2C74B3]/50 focus-within:bg-white transition-colors">
                      <input
                        ref={inputRef}
                        value={input}
                        onChange={e => handleInputChange(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                        placeholder="Type a message…"
                        className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={sendMessage}
                      disabled={!input.trim()}
                      className="w-11 h-11 rounded-full bg-[#2C74B3] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow hover:bg-[#0A2647] transition-colors active:scale-95">
                      <i className="bi bi-send-fill text-white" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Video Call Overlay */}
      {callSession && (
        <div className="fixed inset-0 z-[100] bg-[#0A2647] flex flex-col items-center justify-center text-white">
          <div className="absolute top-6 left-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2C74B3] rounded-xl flex items-center justify-center shadow-lg">
              <i className="bi bi-heart-pulse-fill text-white" />
            </div>
            <div>
              <div className="font-bold text-lg text-white">MediCare Connect</div>
              <div className="text-sky-300 text-xs font-semibold uppercase tracking-wider">Secure Consultation</div>
            </div>
          </div>

          {callSession.status === 'ringing' ? (
            <div className="text-center animate-pulse">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8 ring-4 ring-white/5 shadow-2xl overflow-hidden">
                <Avatar name={activeConvo?.other_user?.name ?? "?"} role={activeConvo?.other_user?.role ?? ""} size={16} />
              </div>
              <h2 className="text-3xl font-bold mb-2">
                {callSession.role === 'caller' ? `Calling ${activeConvo?.other_user?.name}...` : `Incoming Call: ${activeConvo?.other_user?.name}`}
              </h2>
              <p className="text-sky-300 mb-12">{callSession.role === 'caller' ? 'Waiting for answer...' : 'Click Accept to join'}</p>
              
              <div className="flex gap-8 justify-center">
                {callSession.role === 'callee' && (
                  <button onClick={acceptCall} className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-xl transition-transform active:scale-90">
                    <i className="bi bi-telephone-fill text-3xl" />
                  </button>
                )}
                <button onClick={endCall} className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-xl transition-transform active:scale-90">
                  <i className="bi bi-telephone-fill rotate-[135deg] text-3xl" />
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full h-full relative flex items-center justify-center bg-black">
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
              
              {/* Local preview */}
              <div className="absolute bottom-24 right-6 w-48 h-64 bg-gray-900 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-10">
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 rounded text-[10px] font-bold">YOU</div>
              </div>

              {/* Controls */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/40 backdrop-blur-xl px-8 py-4 rounded-3xl border border-white/10 shadow-2xl">
                <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <i className="bi bi-mic-fill text-xl" />
                </button>
                <button onClick={endCall} className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-transform active:scale-95">
                  <i className="bi bi-telephone-fill rotate-[135deg] text-2xl" />
                </button>
                <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <i className="bi bi-camera-video-fill text-xl" />
                </button>
              </div>

              <div className="absolute top-6 right-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold tracking-widest uppercase">Live Connection</span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
    </AuthGuard>
  );
}
