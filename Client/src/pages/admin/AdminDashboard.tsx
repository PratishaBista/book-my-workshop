import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/admin/login');
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const roles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

            if (!roles || (!roles.includes('Admin') && roles !== 'Admin')) {
                navigate('/admin/login');
            }
        } catch {
            navigate('/admin/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiry');
        navigate('/admin/login');
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #F5F6F7 0%, #F2F2F2 100%)',
            padding: '40px',
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    background: 'white',
                    borderRadius: '16px',
                    padding: '40px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
                }}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '40px',
                    paddingBottom: '24px',
                    borderBottom: '1.5px solid #E5E7EB',
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '28px',
                            fontWeight: 600,
                            color: '#1C1F23',
                            letterSpacing: '-0.5px',
                            margin: 0,
                        }}>
                            Admin Dashboard
                        </h1>
                        <p style={{
                            fontSize: '14px',
                            color: '#6B7280',
                            marginTop: '4px',
                        }}>
                            Welcome back, Administrator
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '10px 20px',
                            background: '#F9FAFB',
                            border: '1.5px solid #E5E7EB',
                            borderRadius: '8px',
                            color: '#4B5563',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#F3F4F6';
                            e.currentTarget.style.borderColor = '#D1D5DB';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#F9FAFB';
                            e.currentTarget.style.borderColor = '#E5E7EB';
                        }}
                    >
                        Sign Out
                    </button>
                </div>

                <div style={{
                    textAlign: 'center',
                    padding: '80px 40px',
                }}>
                    <div style={{
                        fontSize: '64px',
                        marginBottom: '24px',
                    }}>
                        🚧
                    </div>
                    <h2 style={{
                        fontSize: '24px',
                        fontWeight: 600,
                        color: '#1C1F23',
                        marginBottom: '12px',
                    }}>
                        Dashboard Under Construction
                    </h2>
                    <p style={{
                        fontSize: '16px',
                        color: '#6B7280',
                        maxWidth: '500px',
                        margin: '0 auto',
                        lineHeight: 1.6,
                    }}>
                        The admin dashboard is currently being developed. You'll soon be able to manage workshops, categories, users, and more from this interface.
                    </p>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '20px',
                        marginTop: '60px',
                    }}>
                        {[
                            { label: 'Total Workshops', value: '—', color: '#AF82C5' },
                            { label: 'Active Users', value: '—', color: '#73A757' },
                            { label: 'Pending Reviews', value: '—', color: '#E57A44' },
                            { label: 'Categories', value: '10', color: '#6B7280' },
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                style={{
                                    padding: '24px',
                                    background: '#F9FAFB',
                                    borderRadius: '12px',
                                    border: '1.5px solid #E5E7EB',
                                }}
                            >
                                <div style={{
                                    fontSize: '32px',
                                    fontWeight: 700,
                                    color: stat.color,
                                    marginBottom: '8px',
                                }}>
                                    {stat.value}
                                </div>
                                <div style={{
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color: '#6B7280',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                }}>
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminDashboard;
