'use client';

import React, { useState, useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import styles from '@/app/modeler/modeler.module.css';
import { Lock, Unlock, LockOpen } from 'lucide-react';
import { checkOutView, checkInView } from '@/actions/view-lock';

// For demo purposes - in production this would come from auth
const CURRENT_USER_ID = 'demo-user';

const ModelerTabs = () => {
    const { views, openViewIds, activeViewId, setActiveView, addView, closeView } = useEditorStore();
    const [lockedViews, setLockedViews] = useState<Record<string, { lockedBy: string; lockedAt?: Date }>>({});
    const [isLocking, setIsLocking] = useState(false);

    // Get the open views (filter views by openViewIds)
    const openViews = views.filter(v => openViewIds.includes(v.id));

    const handleCheckOut = useCallback(async (viewId: string) => {
        setIsLocking(true);
        try {
            const result = await checkOutView(viewId, CURRENT_USER_ID, 'Editing in progress');
            if (result.success) {
                setLockedViews(prev => ({
                    ...prev,
                    [viewId]: { lockedBy: CURRENT_USER_ID, lockedAt: new Date() }
                }));
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert(`Check out failed: ${error}`);
        } finally {
            setIsLocking(false);
        }
    }, []);

    const handleCheckIn = useCallback(async (viewId: string) => {
        setIsLocking(true);
        try {
            const result = await checkInView(viewId, CURRENT_USER_ID);
            if (result.success) {
                setLockedViews(prev => {
                    const newState = { ...prev };
                    delete newState[viewId];
                    return newState;
                });
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert(`Check in failed: ${error}`);
        } finally {
            setIsLocking(false);
        }
    }, []);

    const getViewLockStatus = (viewId: string) => {
        const lock = lockedViews[viewId];
        if (!lock) return null;
        return lock.lockedBy === CURRENT_USER_ID ? 'own' : 'other';
    };

    return (
        <div className={styles.tabBar}>
            <div className={styles.tabsList}>
                {openViews.map(view => {
                    const lockStatus = getViewLockStatus(view.id);
                    const isActive = view.id === activeViewId;

                    return (
                        <div
                            key={view.id}
                            className={`${styles.tabItem} ${isActive ? styles.activeTab : ''}`}
                            onClick={() => setActiveView(view.id)}
                        >
                            <span className={styles.tabIcon}>
                                {lockStatus === 'own' ? (
                                    <Lock size={12} style={{ color: '#22c55e' }} />
                                ) : lockStatus === 'other' ? (
                                    <Lock size={12} style={{ color: '#ef4444' }} />
                                ) : (
                                    '🎯'
                                )}
                            </span>
                            <span className={styles.tabName}>{view.name}</span>

                            {/* Lock/Unlock button for active tab */}
                            {isActive && (
                                <button
                                    className={styles.lockTab}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (lockStatus === 'own') {
                                            handleCheckIn(view.id);
                                        } else if (!lockStatus) {
                                            handleCheckOut(view.id);
                                        }
                                    }}
                                    disabled={isLocking || lockStatus === 'other'}
                                    title={lockStatus === 'own' ? 'Check In (Release Lock)' : lockStatus === 'other' ? 'Locked by another user' : 'Check Out (Lock for editing)'}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: '2px 4px',
                                        cursor: lockStatus === 'other' ? 'not-allowed' : 'pointer',
                                        opacity: lockStatus === 'other' ? 0.5 : 1,
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    {lockStatus === 'own' ? (
                                        <Unlock size={12} style={{ color: '#22c55e' }} />
                                    ) : (
                                        <LockOpen size={12} style={{ color: 'var(--foreground-secondary, #666)' }} />
                                    )}
                                </button>
                            )}

                            {/* Close button - closes tab but keeps view in repository */}
                            <button
                                className={styles.closeTab}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (lockStatus) {
                                        alert('Cannot close a locked view. Check it in first.');
                                        return;
                                    }
                                    closeView(view.id);
                                }}
                            >
                                ×
                            </button>
                        </div>
                    );
                })}
                <button
                    className={styles.addTab}
                    onClick={() => addView(`View ${views.length + 1}`)}
                >
                    +
                </button>
            </div>
        </div>
    );
};

export default ModelerTabs;

