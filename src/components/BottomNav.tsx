import { useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/libraries', icon: BookOpen, label: 'Libraries' },
  { path: '/search', icon: Search, label: 'Search' },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on note creation/view pages
  const hiddenPaths = ['/new', '/note/'];
  if (hiddenPaths.some(p => location.pathname.startsWith(p))) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-surface bg-background/80 border-t border-border">
      <div className="flex items-center justify-around max-w-lg mx-auto px-6 h-16" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {tabs.map(({ path, icon: Icon, label }) => {
          const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <button
              key={path}
              onClick={() => {
                navigate(path);
              }}
              className="flex flex-col items-center gap-0.5 pt-1 relative"
              aria-label={label}
            >
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.6}
                  className={isActive ? 'text-nav-active' : 'text-nav-inactive'}
                />
                {isActive && (
                  <motion.div
                    layoutId="nav-dot"
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-foreground"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-nav-active' : 'text-nav-inactive'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
