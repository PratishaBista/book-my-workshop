import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config/api';
import { 
    Terminal, 
    ShieldAlert, 
    AlertTriangle, 
    Info, 
    Search, 
    Calendar, 
    Trash2, 
    Database, 
    ChevronDown, 
    ChevronUp,
    RefreshCw
} from 'lucide-react';

interface SystemLog {
    id: number;
    timestamp: string;
    logLevel: 'Information' | 'Warning' | 'Error';
    source: string;
    message: string;
    exception?: string;
    triggeredBy?: string;
}

interface LogSummary {
    total: number;
    info: number;
    warning: number;
    error: number;
}

const LogsPage: React.FC = () => {
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [summary, setSummary] = useState<LogSummary>({ total: 0, info: 0, warning: 0, error: 0 });
    const [loading, setLoading] = useState(true);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 15;

    // Filters
    const [search, setSearch] = useState('');
    const [level, setLevel] = useState('All');
    const [source, setSource] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [triggerFetch, setTriggerFetch] = useState(0);

    // Expandable logs row tracking
    const [expandedLogId, setExpandedLogId] = useState<number | null>(null);

    // Action loading states
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('superadmin_token');
        const headers = { Authorization: `Bearer ${token}` };

        // Construct query parameters
        const params = new URLSearchParams();
        params.append('page', String(currentPage));
        params.append('pageSize', String(pageSize));
        if (level !== 'All') params.append('level', level);
        if (source !== 'All') params.append('source', source);
        if (search) params.append('search', search);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        setLoading(true);
        fetch(`${API_BASE_URL}/superadmin/logs?${params.toString()}`, { headers })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(data => {
                setLogs(data.logs || []);
                setTotalPages(data.totalPages || 1);
                setTotalCount(data.totalCount || 0);
                if (data.summary) {
                    setSummary(data.summary);
                }
            })
            .catch(err => {
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, [currentPage, level, source, startDate, endDate, triggerFetch]);

    // Handle Search Submit
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        setTriggerFetch(p => p + 1);
    };

    // Seed test logs
    const handleSeedTestLogs = async () => {
        if (!window.confirm('Seed 5 mock diagnostic logs (including Warning & Error stack trace)?')) return;
        setActionLoading(true);
        try {
            const token = localStorage.getItem('superadmin_token');
            const res = await fetch(`${API_BASE_URL}/superadmin/logs/seed-test`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error();
            setCurrentPage(1);
            setTriggerFetch(p => p + 1);
            alert('Mock logs successfully seeded!');
        } catch {
            alert('Failed to seed mock logs.');
        } finally {
            setActionLoading(false);
        }
    };

    // Clear logs
    const handleClearLogs = async () => {
        if (!window.confirm('Are you sure you want to permanently clear all system logs from the database? This cannot be undone.')) return;
        setActionLoading(true);
        try {
            const token = localStorage.getItem('superadmin_token');
            const res = await fetch(`${API_BASE_URL}/superadmin/logs/clear`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error();
            setCurrentPage(1);
            setLogs([]);
            setSummary({ total: 0, info: 0, warning: 0, error: 0 });
            setTotalCount(0);
            setTotalPages(1);
            alert('System logs successfully cleared.');
        } catch {
            alert('Failed to clear logs.');
        } finally {
            setActionLoading(false);
        }
    };

    const toggleRow = (id: number) => {
        setExpandedLogId(prev => (prev === id ? null : id));
    };

    const getLevelIcon = (lvl: 'Information' | 'Warning' | 'Error') => {
        switch (lvl) {
            case 'Error':
                return <ShieldAlert size={16} className="text-red-400 shrink-0" />;
            case 'Warning':
                return <AlertTriangle size={16} className="text-amber-400 shrink-0" />;
            default:
                return <Info size={16} className="text-blue-400 shrink-0" />;
        }
    };

    const getLevelClass = (lvl: 'Information' | 'Warning' | 'Error') => {
        switch (lvl) {
            case 'Error':
                return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'Warning':
                return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            default:
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        }
    };

    const getSourceClass = (src: string) => {
        switch (src) {
            case 'Auth':
                return 'bg-purple-500/15 text-purple-300';
            case 'Financials':
                return 'bg-green-500/15 text-green-300';
            case 'Moderation':
                return 'bg-cyan-500/15 text-cyan-300';
            case 'System':
                return 'bg-zinc-500/20 text-zinc-300';
            default:
                return 'bg-white/10 text-white/80';
        }
    };

    const formatDate = (isoStr: string) => {
        const d = new Date(isoStr);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div className="space-y-8 max-w-6xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">System Logs &amp; Audit Trail</h1>
                    <p className="text-white/40 text-sm mt-1">
                        Monitor database transactions, server metrics, administrative actions, and global exceptions.
                    </p>
                </div>
                
                {/* Actions Panel */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSeedTestLogs}
                        disabled={actionLoading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors disabled:opacity-40"
                        title="Inject sample audit and error logs into the database"
                    >
                        <Database size={14} />
                        <span>Seed Test Logs</span>
                    </button>
                    <button
                        onClick={handleClearLogs}
                        disabled={actionLoading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/20 transition-colors disabled:opacity-40"
                    >
                        <Trash2 size={14} />
                        <span>Clear All Logs</span>
                    </button>
                </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-5">
                    <p className="text-xs text-white/40 uppercase tracking-wider">Total Diagnostic Logs</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-bold">{summary.total}</span>
                        <span className="text-xs text-white/30">records</span>
                    </div>
                </div>

                <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
                    <p className="text-xs text-white/40 uppercase tracking-wider">Critical Errors</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-bold text-red-400">{summary.error}</span>
                        {summary.error > 0 && (
                            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping absolute top-5 right-5" />
                        )}
                    </div>
                </div>

                <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-5">
                    <p className="text-xs text-white/40 uppercase tracking-wider">System Warnings</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-bold text-amber-400">{summary.warning}</span>
                    </div>
                </div>

                <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-5">
                    <p className="text-xs text-white/40 uppercase tracking-wider">Info Entries</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-bold text-blue-400">{summary.info}</span>
                    </div>
                </div>
            </div>

            {/* Filter controls */}
            <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-6">
                <form onSubmit={handleSearchSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search Bar */}
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                            <input
                                type="text"
                                placeholder="Search messages, email addresses..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/20 focus:border-white/30 outline-none transition-colors"
                            />
                        </div>

                        {/* Log Level Dropdown */}
                        <div>
                            <select
                                value={level}
                                onChange={(e) => { setLevel(e.target.value); setCurrentPage(1); }}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-white/30 outline-none transition-colors"
                            >
                                <option value="All" className="bg-[#1C1C1E]">Level: All Levels</option>
                                <option value="Information" className="bg-[#1C1C1E]">Information</option>
                                <option value="Warning" className="bg-[#1C1C1E]">Warning</option>
                                <option value="Error" className="bg-[#1C1C1E]">Error</option>
                            </select>
                        </div>

                        {/* Source Dropdown */}
                        <div>
                            <select
                                value={source}
                                onChange={(e) => { setSource(e.target.value); setCurrentPage(1); }}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-white/30 outline-none transition-colors"
                            >
                                <option value="All" className="bg-[#1C1C1E]">Source: All Sources</option>
                                <option value="Auth" className="bg-[#1C1C1E]">Authentication</option>
                                <option value="Financials" className="bg-[#1C1C1E]">Financials</option>
                                <option value="Moderation" className="bg-[#1C1C1E]">Moderation</option>
                                <option value="Payment" className="bg-[#1C1C1E]">Payment</option>
                                <option value="System" className="bg-[#1C1C1E]">System</option>
                                <option value="MLService" className="bg-[#1C1C1E]">ML Recommendation</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-wrap md:items-center justify-between gap-4 pt-2 border-t border-white/5">
                        {/* Dates */}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
                            <span className="flex items-center gap-1.5"><Calendar size={14} /> Filter Dates:</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                                    className="bg-black/20 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-white/30"
                                />
                                <span className="text-white/20">to</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                                    className="bg-black/20 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-white/30"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Reset Button */}
                            {(search || level !== 'All' || source !== 'All' || startDate || endDate) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        setLevel('All');
                                        setSource('All');
                                        setStartDate('');
                                        setEndDate('');
                                        setCurrentPage(1);
                                        setTriggerFetch(p => p + 1);
                                    }}
                                    className="text-xs text-white/40 hover:text-white/70 transition-colors"
                                >
                                    Reset Filters
                                </button>
                            )}

                            {/* Search Submit Button */}
                            <button
                                type="submit"
                                className="px-5 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Logs List Container */}
            <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-white/30">
                        <RefreshCw size={24} className="animate-spin" />
                        <span className="text-xs">Loading logs...</span>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-white/20 gap-3">
                        <Terminal size={40} className="stroke-[1.2]" />
                        <div className="text-center">
                            <p className="text-sm font-medium">No diagnostic logs found</p>
                            <p className="text-xs text-white/15 mt-1">Try relaxing filters or click 'Seed Test Logs' to see diagnostic entries.</p>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-white/[0.02] text-xs font-semibold text-white/40 uppercase tracking-wider">
                            <div className="col-span-2">Level</div>
                            <div className="col-span-2">Source</div>
                            <div className="col-span-3">Timestamp</div>
                            <div className="col-span-4">Message Snippet</div>
                            <div className="col-span-1 text-right">Details</div>
                        </div>

                        {/* Rows */}
                        {logs.map((log) => {
                            const isExpanded = expandedLogId === log.id;
                            return (
                                <div key={log.id} className="transition-colors hover:bg-white/[0.01]">
                                    {/* Primary Row Summary */}
                                    <div 
                                        onClick={() => toggleRow(log.id)}
                                        className="grid grid-cols-12 gap-4 px-6 py-4 text-sm items-center cursor-pointer select-none"
                                    >
                                        <div className="col-span-2 flex items-center gap-2">
                                            {getLevelIcon(log.logLevel)}
                                            <span className={`px-2 py-0.5 text-[10px] font-semibold border rounded-full uppercase tracking-wider ${getLevelClass(log.logLevel)}`}>
                                                {log.logLevel === 'Information' ? 'Info' : log.logLevel}
                                            </span>
                                        </div>

                                        <div className="col-span-2">
                                            <span className={`px-2 py-0.5 rounded text-[11px] font-medium tracking-wide ${getSourceClass(log.source)}`}>
                                                {log.source}
                                            </span>
                                        </div>

                                        <div className="col-span-3 text-xs text-white/50">
                                            {formatDate(log.timestamp)}
                                        </div>

                                        <div className="col-span-4 text-xs text-white/80 truncate pr-6" title={log.message}>
                                            {log.message}
                                        </div>

                                        <div className="col-span-1 flex justify-end text-white/30">
                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </div>
                                    </div>

                                    {/* Expanded Detail Panel */}
                                    {isExpanded && (
                                        <div className="px-6 pb-6 pt-2 bg-black/10 border-t border-white/[0.02] text-xs space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/40">
                                                <div>
                                                    <p className="font-semibold text-white/60 mb-0.5">Triggered By:</p>
                                                    <p className="text-white/80">{log.triggeredBy || 'System Automated'}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white/60 mb-0.5">Exact Database Timestamp:</p>
                                                    <p className="text-white/80 font-mono">{log.timestamp}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="font-semibold text-white/60 mb-1">Full Log Message:</p>
                                                <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-white/90 text-sm whitespace-pre-wrap select-text leading-relaxed">
                                                    {log.message}
                                                </div>
                                            </div>

                                            {log.exception && (
                                                <div>
                                                    <p className="font-semibold text-red-400 mb-1 flex items-center gap-1.5">
                                                        <ShieldAlert size={12} /> System Exception Stacktrace:
                                                    </p>
                                                    <pre className="font-mono text-[11px] text-red-300 bg-[#1c0c16] border border-red-500/10 p-4 rounded-xl whitespace-pre-wrap overflow-x-auto select-text max-h-96 leading-relaxed">
                                                        {log.exception}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-white/40 px-2">
                    <p>Showing page {currentPage} of {totalPages} ({totalCount} total entries)</p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3.5 py-1.5 rounded-lg bg-[#1C1C1E] border border-white/5 hover:bg-white/5 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3.5 py-1.5 rounded-lg bg-[#1C1C1E] border border-white/5 hover:bg-white/5 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LogsPage;
