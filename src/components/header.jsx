import './header.css';
import logo from './logo.PNG';
import "@fontsource/inter/700.css";
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import CreatePostModal from './CreatePostModal';

function Header({ onMenuClick }) {
    const navigate = useNavigate();
    const [user, loading] = useAuthState(auth);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isDarkTheme, setIsDarkTheme] = useState(true);
    const [showCreatePostModal, setShowCreatePostModal] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setIsDarkTheme(savedTheme === 'dark');
            document.body.classList.toggle('light-theme', savedTheme === 'light');
        } else {
            document.body.classList.add('dark-theme');
            setIsDarkTheme(true);
        }
    }, []);

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (user) {
                try {
                    const response = await fetch(`http://localhost:3000/api/users/${user.uid}`);
                    if (response.ok) {
                        const data = await response.json();
                        setUserInfo(data);
                    }
                } catch (error) {
                    console.error('Error fetching user info:', error);
                }
            }
        };

        fetchUserInfo();
    }, [user]);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (user) {
                try {
                    const token = await user.getIdToken();
                    const response = await fetch('http://localhost:3000/api/notifications', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setNotifications(data);
                        setUnreadCount(data.filter(n => !n.read).length);
                    }
                } catch (error) {
                    console.error('Error fetching notifications:', error);
                }
            }
        };

        fetchNotifications();
        // Set up polling for new notifications
        const interval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, [user]);

    const handleAccountClick = () => {
        if (!user) {
            navigate('/login');
        } else {
            setShowDropdown(prev => !prev);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        setShowDropdown(false);
    };

    const toggleTheme = () => {
        const newIsDarkTheme = !isDarkTheme;
        setIsDarkTheme(newIsDarkTheme);
        const theme = newIsDarkTheme ? 'dark' : 'light';
        document.body.classList.toggle('light-theme', theme === 'light');
        localStorage.setItem('theme', theme);
    };

    const handleCreatePostClick = () => {
        setShowCreatePostModal(true);
    };

    const handleCloseCreatePostModal = () => {
        setShowCreatePostModal(false);
    };

    const getUserInitials = () => {
        if (userInfo && userInfo.firstName && userInfo.lastName) {
            return `${userInfo.firstName.charAt(0)}${userInfo.lastName.charAt(0)}`.toUpperCase();
        }
        return 'U';
    };

    const handleNotificationClick = () => {
        setShowNotifications(prev => !prev);
        setShowDropdown(false);
    };

    const handleMarkAllRead = async () => {
        if (!user) return;
        
        try {
            const token = await user.getIdToken();
            const response = await fetch('http://localhost:3000/api/notifications/mark-all-read', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    const handleTestNotification = async () => {
        if (!user) return;
        
        try {
            const token = await user.getIdToken();
            // Get the first post from the database
            const postsResponse = await fetch('http://localhost:3000/api/posts');
            const posts = await postsResponse.json();
            
            if (posts.length > 0) {
                const post = posts[0];
                const response = await fetch('http://localhost:3000/api/test-notification', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        postId: post._id
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Test notification created:', data);
                    // Refresh notifications
                    const notificationsResponse = await fetch('http://localhost:3000/api/notifications', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (notificationsResponse.ok) {
                        const notificationsData = await notificationsResponse.json();
                        setNotifications(notificationsData);
                        setUnreadCount(notificationsData.filter(n => !n.read).length);
                    }
                } else {
                    console.error('Failed to create test notification:', await response.text());
                }
            }
        } catch (error) {
            console.error('Error creating test notification:', error);
        }
    };

    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <div className={`header ${isDarkTheme ? '' : 'light-theme'}`}>
            {!isMobile && <span className="uil--bars" onClick={onMenuClick} style={{ cursor: 'pointer' }}></span>}
            <div className='a'></div>
            <img src={logo} alt="Logo" />
            <h2 className='inter-imga'>TellU</h2>
                <div className="middle">
                    <form className='sea' onSubmit={handleSearch}>
                        <input 
                        type="search" 
                        placeholder="Search" 
                        className="Searcht"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                </div>
            

            <div className='chi'>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {user && (
                        <div className="notification-container">
                            <button className="notification-btn" onClick={handleNotificationClick}>
                                <span className="notification-icon"></span>
                                {unreadCount > 0 && (
                                    <span className="notification-badge">{unreadCount}</span>
                                )}
                            </button>
                            {showNotifications && (
                                <div className="notification-dropdown">
                                    <div className="notification-header">
                                        <h3>Notifications</h3>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                className="mark-all-read"
                                                onClick={handleMarkAllRead}
                                            >
                                                Mark all as read
                                            </button>
                                            <button 
                                                className="test-notification-btn"
                                                onClick={handleTestNotification}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'var(--primary-color)',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px'
                                                }}
                                            >
                                                Test
                                            </button>
                                        </div>
                                    </div>
                                    <div className="notification-list">
                                        {notifications.length > 0 ? (
                                            notifications.map(notification => (
                                                <div 
                                                    key={notification._id} 
                                                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                                >
                                                    <p>{notification.type === 'upvote' ? 'Someone upvoted your post' :
                                                        notification.type === 'comment' ? 'New comment on your post' :
                                                        'Someone mentioned you in a post'}</p>
                                                    <span className="notification-time">
                                                        {formatTimeAgo(notification.createdAt)}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="no-notifications">
                                                No new notifications
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <button className="theme-toggle-btn" onClick={toggleTheme}>
                        <span className={`theme-icon ${isDarkTheme ? 'moon-icon' : 'sun-icon'}`}></span>
                    </button>

                    <div
                        className={`teneg ${user ? 'no-border' : 'with-border'}`}
                        onClick={handleAccountClick}
                    >
                        {!user && (
                            <>
                                <span className="material-symbols--person-rounded"></span>
                                <p>Account</p>
                            </>
                        )}

                        {user && (
                            <div className="profile-button">
                                {getUserInitials()}
                            </div>
                        )}
                    </div>
                    {!isMobile && (
                        <div className='teneg1' onClick={handleCreatePostClick}>
                            <span className="line-md--plus"></span>
                            <p>Create Post</p>
                        </div>
                    )}
                </div>

                {user && showDropdown && (
                    <div className="dropdown-menu">
                        <button onClick={() => navigate('/profile')}>Profile</button>
                        <button>Settings</button>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                )}
            </div>

            {showCreatePostModal && <CreatePostModal onClose={handleCloseCreatePostModal} />}
        </div>
    );
}

export default Header;
