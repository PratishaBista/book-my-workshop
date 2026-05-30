import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Mail, MessageSquare, Plus, CheckCircle2, Loader2, Send } from 'lucide-react';

interface SupportTicket {
    id: string;
    subject: string;
    category: string;
    description: string;
    status: 'Open' | 'In Progress' | 'Resolved';
    date: string;
}

const DEFAULT_TICKETS: SupportTicket[] = [
    {
        id: 'TKT-8839',
        subject: 'Inquiry regarding Stripe payment release schedule',
        category: 'Payouts & Banking',
        description: 'I recently hosted a pottery session on Saturday but the payment is showing as pending in my earnings dashboard. When will this balance transfer to my connected bank account?',
        status: 'In Progress',
        date: 'May 28, 2026'
    },
    {
        id: 'TKT-8012',
        subject: 'PAN Card verification upload error',
        category: 'Identity Verification',
        description: 'Getting a file format invalid error when uploading my PDF PAN certificate in the security center. Please verify.',
        status: 'Resolved',
        date: 'May 15, 2026'
    }
];

export const HostSupportView: React.FC = () => {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [showNewTicketForm, setShowNewTicketForm] = useState(false);
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('Payouts & Banking');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('host_support_tickets');
        if (saved) {
            setTickets(JSON.parse(saved));
        } else {
            setTickets(DEFAULT_TICKETS);
            localStorage.setItem('host_support_tickets', JSON.stringify(DEFAULT_TICKETS));
        }
    }, []);

    const handleSubmitTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !description.trim()) return;

        setSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Premium delay

        const newTicket: SupportTicket = {
            id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
            subject,
            category,
            description,
            status: 'Open',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };

        const updatedTickets = [newTicket, ...tickets];
        setTickets(updatedTickets);
        localStorage.setItem('host_support_tickets', JSON.stringify(updatedTickets));

        setSubject('');
        setDescription('');
        setShowNewTicketForm(false);
        setSubmitting(false);
        setSuccessMessage('Support ticket submitted successfully! A manager will respond shortly.');
        setTimeout(() => setSuccessMessage(''), 4000);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-deep-purple">Host Support</h2>
                    <p className="text-gray-500 mt-1">Need help optimizing your workshop business? Raise a ticket and chat with our community manager.</p>
                </div>
                {!showNewTicketForm && (
                    <button
                        onClick={() => setShowNewTicketForm(true)}
                        className="px-5 py-3 bg-deep-purple text-white font-bold rounded-2xl text-xs hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                    >
                        <Plus size={16} />
                        <span>Create Support Ticket</span>
                    </button>
                )}
            </div>

            {/* Toast Alerts */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-2xl flex items-center gap-3 font-semibold shadow-sm"
                    >
                        <CheckCircle2 className="text-green-600" size={20} />
                        {successMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tickets Column */}
                <div className="lg:col-span-2 space-y-6">
                    {showNewTicketForm ? (
                        <motion.form 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onSubmit={handleSubmitTicket}
                            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-5"
                        >
                            <h4 className="text-xl font-bold font-serif text-deep-purple mb-2">Create New Support Ticket</h4>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Support Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-deep-purple outline-none transition-all font-semibold text-deep-purple text-xs"
                                >
                                    <option>Payouts & Banking</option>
                                    <option>Workshop Listing & Schedule</option>
                                    <option>Identity Verification</option>
                                    <option>Student Disputes & Attendance</option>
                                    <option>Technical Bug</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Ticket Subject</label>
                                <input
                                    type="text"
                                    required
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Brief summary of the issue..."
                                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-deep-purple outline-none transition-all text-xs font-semibold text-deep-purple"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Detailed Description</label>
                                <textarea
                                    rows={5}
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Explain the background context, issue details, and how our support managers can help..."
                                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-deep-purple outline-none transition-all text-xs font-semibold text-deep-purple resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-3.5 bg-deep-purple hover:bg-deep-purple/95 text-white font-bold rounded-xl text-xs flex items-center gap-2 active:scale-95 disabled:opacity-40 transition-all shadow-sm"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                                    {submitting ? 'Submitting...' : 'Submit Support Request'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowNewTicketForm(false)}
                                    className="px-4 py-3.5 text-xs font-bold text-gray-400 hover:text-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.form>
                    ) : (
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-deep-purple/30 ml-1">Recent Tickets ({tickets.length})</h4>
                            
                            {tickets.length === 0 ? (
                                <div className="p-16 text-center bg-white rounded-[2.5rem] border border-gray-100">
                                    <p className="text-gray-400 font-semibold">No active support tickets found.</p>
                                </div>
                            ) : (
                                tickets.map((tkt) => {
                                    const statusColor = tkt.status === 'Resolved' 
                                        ? 'bg-green-50 text-green-700 border-green-200' 
                                        : tkt.status === 'In Progress' 
                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                        : 'bg-indigo-50 text-indigo-700 border-indigo-200';

                                    return (
                                        <div key={tkt.id} className="p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start flex-wrap gap-2">
                                                <div>
                                                    <span className="text-[10px] font-mono font-bold text-gray-400 block mb-1">{tkt.id} • {tkt.date}</span>
                                                    <h5 className="font-bold text-deep-purple text-base leading-snug">{tkt.subject}</h5>
                                                    <span className="text-[10px] font-bold text-primary-orange bg-orange-50/50 px-2 py-0.5 rounded border border-orange-100 inline-block mt-2">
                                                        {tkt.category}
                                                    </span>
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusColor}`}>
                                                    {tkt.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 leading-relaxed font-medium bg-gray-50/50 p-4 rounded-xl border border-gray-50">
                                                {tkt.description}
                                            </p>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                {/* Info / FAQ Sidebar */}
                <div className="space-y-6">
                    <div className="p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-primary-orange">
                            <HelpCircle size={20} />
                        </div>
                        <h5 className="font-bold text-deep-purple font-serif text-lg">Support FAQS</h5>
                        
                        <div className="space-y-4 divide-y divide-gray-100">
                            <div className="pt-3">
                                <h6 className="font-bold text-xs text-deep-purple mb-1">When will my earnings transfer?</h6>
                                <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                                    Payouts are processed automatically 24 hours after the workshop completion to prevent attendee dispute hold-backs.
                                </p>
                            </div>
                            <div className="pt-3">
                                <h6 className="font-bold text-xs text-deep-purple mb-1">How do I cancel a scheduled session?</h6>
                                <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                                    Go to Schedules, select the session, and click "Cancel". Students will receive automated full refunds to their wallets.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-deep-purple text-cream-base rounded-[2.5rem] shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl -mr-16 -mt-16" />
                        <h5 className="font-bold text-lg font-serif mb-2">Direct Studio Contact</h5>
                        <p className="text-xs text-cream-base/70 leading-relaxed mb-4 font-medium">
                            Need critical assistance regarding payment failures or severe server errors? Contact support directly:
                        </p>
                        <div className="space-y-2 text-xs font-semibold text-cream-base">
                            <p className="flex items-center gap-2">
                                <Mail size={14} className="text-primary-orange" /> support@bookmyworkshop.com
                            </p>
                            <p className="flex items-center gap-2 font-mono">
                                <MessageSquare size={14} className="text-primary-orange" /> +977-9801234567
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
