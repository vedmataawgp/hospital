/**
 * WebSocket client for Django Channels real-time chat.
 * Endpoint: ws(s)://{host}/ws/chat/{roomId}/?token={jwt}
 *
 * Implements:
 *  - Auto-reconnect with exponential back-off (up to 30s)
 *  - Keep-alive ping every 30s
 *  - Unsent message queue (retried on reconnect)
 *  - All event types from the spec
 */

export type WSEventType =
  | "SEND_MESSAGE"
  | "RECEIVE_MESSAGE"
  | "TYPING_START"
  | "TYPING_STOP"
  | "MESSAGE_READ"
  | "USER_ONLINE"
  | "USER_OFFLINE"
  | "REACTION_ADD"
  | "PING"
  | "PONG";

export interface WSPayload {
  message_id?: string | number;
  room_id?: number;
  sender_id?: number;
  text?: string;
  message_type?: "text" | "image" | "file";
  file_url?: string;
  file_name?: string;
  status?: "sent" | "delivered" | "read";
  user_id?: number;
  reaction_type?: string;
  [key: string]: unknown;
}

export interface WSEvent {
  type: WSEventType;
  payload: WSPayload;
}

type Listener = (event: WSEvent) => void;
type StatusListener = (connected: boolean) => void;

export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private readonly roomId: string;
  private readonly token: string;
  private listeners  = new Set<Listener>();
  private statusListeners = new Set<StatusListener>();
  private unsentQueue: WSEvent[] = [];
  private reconnectAttempts = 0;
  private readonly maxReconnects = 12;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private isManualClose = false;

  constructor(roomId: string, token: string) {
    this.roomId = roomId;
    this.token  = token;
  }

  /* ── Connect ────────────────────────────────────────────────── */
  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;

    try {
      const protocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:";
      const host     = typeof window !== "undefined" ? window.location.host : "localhost:8080";
      const url      = `${protocol}//${host}/ws/chat/${this.roomId}/?token=${encodeURIComponent(this.token)}`;

      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.startPing();
        this.notifyStatus(true);
        /* Flush unsent queue */
        const queued = [...this.unsentQueue];
        this.unsentQueue = [];
        queued.forEach(e => this.send(e.type, e.payload));
      };

      this.ws.onmessage = (ev: MessageEvent) => {
        try {
          const data = JSON.parse(ev.data as string) as WSEvent;
          if (data.type === "PONG") return;
          this.listeners.forEach(l => l(data));
        } catch { /* ignore malformed frames */ }
      };

      this.ws.onclose = () => {
        this.stopPing();
        this.notifyStatus(false);
        if (!this.isManualClose) this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      if (!this.isManualClose) this.scheduleReconnect();
    }
  }

  /* ── Send ───────────────────────────────────────────────────── */
  send(type: WSEventType, payload: WSPayload = {}) {
    const event: WSEvent = { type, payload };
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    } else {
      /* Queue for retry on reconnect */
      if (type === "SEND_MESSAGE") this.unsentQueue.push(event);
    }
  }

  /* ── Subscribe ──────────────────────────────────────────────── */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  /* ── Disconnect ─────────────────────────────────────────────── */
  disconnect() {
    this.isManualClose = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.stopPing();
    this.ws?.close();
    this.ws = null;
  }

  get connected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /* ── Private ────────────────────────────────────────────────── */
  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnects) return;
    const delay = Math.min(500 * Math.pow(2, this.reconnectAttempts), 30_000);
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  private startPing() {
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "PING", payload: {} }));
      }
    }, 30_000);
  }

  private stopPing() {
    if (this.pingTimer) { clearInterval(this.pingTimer); this.pingTimer = null; }
  }

  private notifyStatus(connected: boolean) {
    this.statusListeners.forEach(l => l(connected));
  }
}
