"use client";

import { useAuth } from "@/context/AuthContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { mockMessages, Message, mockUsers, User } from "@/data/mockData";
import { 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Paperclip, 
  Image as ImageIcon, 
  Smile, 
  CheckCheck,
  Plus,
  ChevronLeft
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [selectedContact, setSelectedContact] = useState<User>(
    mockUsers.find(u => u.role !== user?.role) || mockUsers[1]
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contacts = mockUsers.filter(u => u.id !== user?.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedContact]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: Message = {
      id: Date.now().toString(),
      senderId: user?.id || '1',
      receiverId: selectedContact.id,
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    setMessages([...messages, msg]);
    setNewMessage("");

    // Simulate reply
    setTimeout(() => {
       const reply: Message = {
          id: (Date.now() + 1).toString(),
          senderId: selectedContact.id,
          receiverId: user?.id || '1',
          content: "Thank you for the update. I'll review this shortly.",
          timestamp: new Date().toISOString(),
          isRead: false
       };
       setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  const currentChatMessages = messages.filter(m => 
    (m.senderId === user?.id && m.receiverId === selectedContact.id) ||
    (m.senderId === selectedContact.id && m.receiverId === user?.id)
  );

  return (
    <div className="flex h-screen bg-slate-50/50 overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <DashboardHeader />
        
        <main className="flex-1 flex p-6 gap-6 overflow-hidden">
           {/* Sidebar - Contacts */}
           <div className="w-96 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
              <div className="p-8 pb-4">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight underline decoration-blue-500 decoration-4 underline-offset-4">Messages</h3>
                    <button className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                       <Plus className="w-5 h-5" />
                    </button>
                 </div>
                 <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input type="text" placeholder="Search direct messages..." className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all font-bold text-sm" />
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto mt-4 px-4 space-y-2 pb-8">
                 {contacts.map((contact) => (
                   <div 
                     key={contact.id}
                     onClick={() => setSelectedContact(contact)}
                     className={`p-4 rounded-3xl cursor-pointer transition-all flex items-center gap-4 group relative ${
                       selectedContact.id === contact.id ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50 border border-transparent'
                     }`}
                   >
                      <div className="relative shrink-0">
                         <img src={contact.avatar} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white shadow-md group-hover:scale-110 transition-transform" />
                         <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-center mb-1">
                            <h4 className={`text-sm font-black truncate ${selectedContact.id === contact.id ? 'text-blue-600' : 'text-slate-800'}`}>{contact.name}</h4>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">12:45 PM</span>
                         </div>
                         <p className="text-xs text-slate-500 truncate leading-tight italic font-medium">Click to open this conversation thread</p>
                      </div>
                      {selectedContact.id !== contact.id && (
                        <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                      )}
                   </div>
                 ))}
              </div>
           </div>

           {/* Chat Window */}
           <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
              {/* Chat Header */}
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <button className="lg:hidden p-2 -ml-2 hover:bg-slate-50 rounded-xl transition-colors"><ChevronLeft/></button>
                    <div className="relative">
                       <img src={selectedContact.avatar} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-md" alt={selectedContact.name} />
                       <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-slate-900 leading-none mb-1">{selectedContact.name}</h4>
                        <div className="flex items-center gap-2">
                           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">Online</p>
                           <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{selectedContact.specialty || selectedContact.role}</p>
                        </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <button className="h-11 w-11 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"><Phone className="w-5 h-5"/></button>
                    <button className="h-11 w-11 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"><Video className="w-5 h-5"/></button>
                    <button className="h-11 w-11 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"><MoreVertical className="w-5 h-5"/></button>
                 </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/20">
                 <div className="text-center py-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">Yesterday, Mar 26</span>
                 </div>
                 
                 {currentChatMessages.map((msg, i) => {
                   const isMe = msg.senderId === user?.id;
                   return (
                     <motion.div 
                       key={msg.id}
                       initial={{ opacity: 0, scale: 0.9, y: 10, x: isMe ? 20 : -20 }}
                       animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                       transition={{ duration: 0.3 }}
                       className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                     >
                        <div className={`max-w-[70%] group`}>
                           <div className={`p-5 rounded-[2rem] text-sm font-medium shadow-sm leading-relaxed ${
                             isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                           }`}>
                              {msg.content}
                           </div>
                           <div className={`flex items-center gap-2 mt-2 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">10:45 AM</p>
                              {isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                           </div>
                        </div>
                     </motion.div>
                   );
                 })}
                 <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-8 pt-4">
                 <form onSubmit={handleSendMessage} className="bg-slate-50 border border-slate-100 p-3 pl-6 rounded-3xl flex items-center gap-4 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100 focus-within:border-blue-600 transition-all overflow-hidden shadow-inner">
                    <div className="flex items-center gap-2 shrink-0">
                       <button type="button" className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Smile className="w-5 h-5"/></button>
                       <button type="button" className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Paperclip className="w-5 h-5"/></button>
                    </div>
                    <input 
                       type="text" 
                       value={newMessage}
                       onChange={(e) => setNewMessage(e.target.value)}
                       placeholder="Hyper-secure E2EE connection active. Type a message..." 
                       className="flex-1 bg-transparent py-4 text-sm font-bold text-slate-800 focus:outline-none"
                    />
                    <button 
                       type="submit"
                       className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                       disabled={!newMessage.trim()}
                    >
                       <Send className="w-6 h-6 rotate-0" />
                    </button>
                 </form>
              </div>
           </div>
        </main>
      </div>
    </div>
  );
}
