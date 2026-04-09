import React, { useState, useEffect } from 'react';
import { PenTool, X, Search, FileText, Loader2, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

interface Article {
    id: number;
    title: string;
    slug: string;
    status: number; // 0: Draft, 1: Published
    publishedAt: string | null;
    category: string;
    excerpt: string;
    contentHtml: string;
    coverImageUrl: string;
}

const JournalPage: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        coverImageUrl: '',
        excerpt: '',
        contentHtml: ''
    });

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('superadmin_token');
            const response = await fetch(API_ENDPOINTS.journal.admin, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setArticles(data);
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (article: Article) => {
        setEditingId(article.id);
        setFormData({
            title: article.title,
            category: article.category,
            coverImageUrl: article.coverImageUrl,
            excerpt: article.excerpt,
            contentHtml: article.contentHtml
        });
        setMessage(null);
        setIsEditing(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) return;

        try {
            const token = localStorage.getItem('superadmin_token');
            const response = await fetch(API_ENDPOINTS.journal.adminById(id), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchArticles();
            } else {
                alert('Failed to delete article.');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('A network error occurred.');
        }
    };

    const handleSave = async (publishNow: boolean) => {
        if (!formData.title || !formData.contentHtml) {
            setMessage({ type: 'error', text: 'Title and Content are required.' });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('superadmin_token');
            const url = editingId ? API_ENDPOINTS.journal.adminById(editingId) : API_ENDPOINTS.journal.admin;
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    publishNow
                })
            });

            if (response.ok) {
                setMessage({ type: 'success', text: editingId ? 'Article updated!' : (publishNow ? 'Article published!' : 'Draft saved!') });
                setFormData({ title: '', category: '', coverImageUrl: '', excerpt: '', contentHtml: '' });
                setIsEditing(false);
                setEditingId(null);
                fetchArticles();
            } else {
                let errorText = 'Failed to save article.';
                try {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        const err = await response.json();
                        errorText = err.message || errorText;
                    } else {
                        errorText = `Server error: ${response.status} ${response.statusText}`;
                    }
                } catch (e) {
                    console.error('Error parsing error response:', e);
                }
                setMessage({ type: 'error', text: errorText });
            }
        } catch (error) {
            console.error('Save error:', error);
            setMessage({ type: 'error', text: 'A network error occurred.' });
        } finally {
            setSaving(false);
        }
    };

    if (isEditing) {
        return (
            <div className="max-w-4xl max-h-screen">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-xl font-light text-white/90">{editingId ? 'Edit Article' : 'Write Novel Article'}</h2>
                    <button 
                        onClick={() => {
                            setIsEditing(false);
                            setEditingId(null);
                        }}
                        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors"
                    >
                        <X size={16} /> Cancel
                    </button>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        <span className="text-sm font-medium">{message.text}</span>
                    </div>
                )}

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-white/30 mb-2">Headline</label>
                        <input 
                            type="text" 
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="An evocative title..."
                            className="w-full bg-[#1A1123] border border-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C4A95A] transition-colors"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-white/30 mb-2">Category</label>
                            <input 
                                type="text" 
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                placeholder="Philosophy, Culture..."
                                className="w-full bg-[#1A1123] border border-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C4A95A] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-white/30 mb-2">Cover Image URL</label>
                            <input 
                                type="text" 
                                value={formData.coverImageUrl}
                                onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                                placeholder="Unsplash / S3 Link"
                                className="w-full bg-[#1A1123] border border-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C4A95A] transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-widest text-white/30 mb-2">Excerpt</label>
                        <textarea 
                            rows={2}
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            placeholder="A brief 1-2 sentence hook..."
                            className="w-full bg-[#1A1123] border border-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C4A95A] transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-widest text-white/30 mb-2">Full Content (HTML Supported)</label>
                        <textarea 
                            rows={12}
                            value={formData.contentHtml}
                            onChange={(e) => setFormData({ ...formData, contentHtml: e.target.value })}
                            placeholder="<p>Write your beautiful story here...</p>"
                            className="w-full bg-[#1A1123] border border-white/5 rounded-lg px-4 py-3 text-white font-mono text-sm opacity-80 focus:outline-none focus:border-[#C4A95A] transition-colors"
                        />
                    </div>

                    <div className="pt-6 flex justify-end gap-4">
                        <button 
                            disabled={saving}
                            onClick={() => handleSave(false)}
                            className="px-6 py-2 rounded border border-white/10 text-white/50 hover:text-white transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save as Draft'}
                        </button>
                        <button 
                            disabled={saving}
                            onClick={() => handleSave(true)}
                            className="flex items-center gap-2 px-6 py-2 rounded bg-white text-black font-semibold hover:bg-[#C4A95A] transition-colors disabled:opacity-50"
                        >
                            {saving && <Loader2 size={16} className="animate-spin" />}
                            {saving ? 'Processing...' : (editingId ? 'Update & Publish' : 'Publish to Journal')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-2xl font-light text-white/90">The Editorial Journal</h1>
                <button 
                    onClick={() => {
                        setMessage(null);
                        setEditingId(null);
                        setFormData({ title: '', category: '', coverImageUrl: '', excerpt: '', contentHtml: '' });
                        setIsEditing(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-semibold rounded hover:bg-[#C4A95A] transition-colors"
                >
                    <PenTool size={15} /> Write Article
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-white/20" />
                </div>
            ) : (
                <div className="bg-[#1A1123] rounded-xl border border-white/5 overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                            <input 
                                type="text" 
                                placeholder="Search articles..." 
                                className="bg-transparent border border-white/10 rounded pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-white/20 text-white"
                            />
                        </div>
                    </div>

                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="text-white/30 border-b border-white/5">
                                <th className="px-6 py-4 font-normal w-[50%]">Title</th>
                                <th className="px-6 py-4 font-normal">Status</th>
                                <th className="px-6 py-4 font-normal">Published Date</th>
                                <th className="px-6 py-4 font-normal text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {articles.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-white/20">
                                        No articles found. Start writing your first story!
                                    </td>
                                </tr>
                            ) : (
                                articles.map(article => (
                                    <tr key={article.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4 text-white/80 font-serif flex items-center gap-3">
                                            <FileText size={14} className="text-white/20" />
                                            {article.title}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                                                article.status === 1 
                                                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                                : 'bg-white/5 text-white/40 border-white/10'
                                            }`}>
                                                {article.status === 1 ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-white/40 tabular-nums">
                                            {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-6">
                                            <button 
                                                onClick={() => handleEdit(article)}
                                                className="text-white/20 hover:text-[#C4A95A] transition-colors text-xs font-semibold uppercase tracking-wider"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(article.id)}
                                                className="text-white/10 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default JournalPage;
