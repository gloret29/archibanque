'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Globe, Check, ChevronDown, LogOut, Settings } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export const UserMenuWrapper = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div style={{ position: 'relative' }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '20px',
                    transition: 'background 0.2s',
                    background: isOpen ? (theme === 'dark' ? '#27272a' : '#f1f5f9') : 'transparent'
                }}
                onMouseEnter={(e) => {
                    if (!isOpen) e.currentTarget.style.background = theme === 'dark' ? '#18181b' : '#f8fafc';
                }}
                onMouseLeave={(e) => {
                    if (!isOpen) e.currentTarget.style.background = 'transparent';
                }}
            >
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3366ff 0%, #1e40af 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    boxShadow: '0 2px 8px rgba(51, 102, 255, 0.25)'
                }}>
                    JD
                </div>
                <ChevronDown size={14} style={{
                    opacity: 0.5,
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s'
                }} />
            </div>

            {isOpen && (
                <>
                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '8px',
                            background: theme === 'dark' ? '#18181b' : 'white',
                            border: theme === 'dark' ? '1px solid #3f3f46' : '1px solid #e2e8f0',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                            minWidth: '220px',
                            zIndex: 1000,
                            overflow: 'hidden',
                            padding: '6px'
                        }}
                    >
                        {/* User Info */}
                        <div style={{ padding: '12px 12px 8px', borderBottom: theme === 'dark' ? '1px solid #27272a' : '1px solid #f1f5f9', marginBottom: '4px' }}>
                            <div style={{ fontWeight: 600, fontSize: '14px', color: theme === 'dark' ? '#f4f4f5' : '#1e293b' }}>John Doe</div>
                            <div style={{ fontSize: '12px', color: theme === 'dark' ? '#a1a1aa' : '#64748b' }}>john.doe@example.com</div>
                        </div>

                        {/* Theme Toggle */}
                        <div
                            onClick={toggleTheme}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                color: theme === 'dark' ? '#e4e4e7' : '#334155',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = theme === 'dark' ? '#27272a' : '#f8fafc'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                            <span style={{ flex: 1 }}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </div>

                        {/* Language Selector */}
                        <div style={{ padding: '4px 0' }}>
                            <div style={{
                                padding: '8px 12px 4px',
                                fontSize: '11px',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                color: theme === 'dark' ? '#71717a' : '#94a3b8'
                            }}>
                                Language
                            </div>
                            <div
                                onClick={() => setLanguage('en')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    color: theme === 'dark' ? '#e4e4e7' : '#334155',
                                    background: language === 'en' ? (theme === 'dark' ? '#1e293b' : '#f1f5f9') : 'transparent'
                                }}
                            >
                                <Globe size={16} style={{ opacity: 0.7 }} />
                                <span style={{ flex: 1 }}>English</span>
                                {language === 'en' && <Check size={14} style={{ color: '#3366ff' }} />}
                            </div>
                            <div
                                onClick={() => setLanguage('fr')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    color: theme === 'dark' ? '#e4e4e7' : '#334155',
                                    background: language === 'fr' ? (theme === 'dark' ? '#1e293b' : '#f1f5f9') : 'transparent'
                                }}
                            >
                                <Globe size={16} style={{ opacity: 0.7 }} />
                                <span style={{ flex: 1 }}>Français</span>
                                {language === 'fr' && <Check size={14} style={{ color: '#3366ff' }} />}
                            </div>
                        </div>

                        <div style={{ borderTop: theme === 'dark' ? '1px solid #27272a' : '1px solid #f1f5f9', margin: '4px 0', padding: '4px 0' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    color: theme === 'dark' ? '#e4e4e7' : '#334155'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = theme === 'dark' ? '#27272a' : '#f8fafc'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <Settings size={16} />
                                <span>Settings</span>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    color: '#ef4444'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = theme === 'dark' ? '#450a0a' : '#fef2f2'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <LogOut size={16} />
                                <span>Logout</span>
                            </div>
                        </div>
                    </div>

                    {/* Overlay for closing menu */}
                    <div
                        onClick={() => setIsOpen(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 999,
                            background: 'transparent'
                        }}
                    />
                </>
            )}
        </div>
    );
};
