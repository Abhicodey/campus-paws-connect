import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications, useUnreadCount, useMarkAsRead } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
    const { authUser } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<any>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data: notifications = [] } = useNotifications(authUser?.id);
    const { data: unreadCount = 0 } = useUnreadCount(authUser?.id);
    const markAsRead = useMarkAsRead();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'announcement': return '📢';
            case 'approval': return '✅';
            case 'achievement': return '🏆';
            case 'moderation': return '⚠️';
            case 'system': return '🔔';
            default: return '📬';
        }
    };

    const handleNotificationClick = (notification: any) => {
        // Mark as read immediately
        if (!notification.is_read) {
            markAsRead.mutate(notification.id);
        }

        // If it has an action URL, navigate there
        if (notification.action_url) {
            navigate(notification.action_url);
            setIsOpen(false);
        } else {
            // Otherwise open modal to show full details
            setSelectedNotification(notification);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-muted transition-colors"
            >
                <Bell className="w-6 h-6 text-foreground" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-50 max-h-[80vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-border bg-muted/30">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-foreground">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {notifications.map((notification) => (
                                    <button
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`w-full p-4 text-left hover:bg-muted/50 transition-all ${!notification.is_read ? 'bg-primary/5' : ''
                                            }`}
                                    >
                                        <div className="flex gap-3 items-start">
                                            <span className="text-xl flex-shrink-0 mt-0.5">
                                                {getNotificationIcon(notification.type)}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm text-foreground mb-1 ${!notification.is_read ? 'font-semibold' : 'font-medium'
                                                    }`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                    {notification.content}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground/70 mt-2 font-medium">
                                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                </p>
                                            </div>
                                            {!notification.is_read && (
                                                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Notification Details Modal */}
            {selectedNotification && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-start gap-4 mb-4">
                            <span className="text-3xl p-3 bg-muted rounded-xl">
                                {getNotificationIcon(selectedNotification.type)}
                            </span>
                            <div className="flex-1">
                                <h2 className="text-lg font-bold text-foreground leading-tight">
                                    {selectedNotification.title}
                                </h2>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formatDistanceToNow(new Date(selectedNotification.created_at), { addSuffix: true })}
                                </p>
                            </div>
                        </div>

                        <div className="bg-muted/30 rounded-xl p-4 mb-6">
                            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                {selectedNotification.content}
                            </p>
                        </div>

                        <button
                            onClick={() => setSelectedNotification(null)}
                            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
                        >
                            Close
                        </button>
                    </div>
                    {/* Backdrop click to close */}
                    <div
                        className="absolute inset-0 -z-10"
                        onClick={() => setSelectedNotification(null)}
                    />
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
