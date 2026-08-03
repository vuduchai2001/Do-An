import {
  ReactNode,
  SVGProps,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { PageTransition } from '@/components/common/PageTransition';
import { MainRoutes } from '@/router/MainRoutes';
import {
  IconSidebarAuthFiles,
  IconSidebarConfig,
  IconSidebarDashboard,
  IconSidebarLogs,
  IconSidebarOauth,
  IconSidebarProviders,
  IconSidebarQuota,
  IconSidebarSystem,
} from '@/components/ui/icons';
import { INLINE_LOGO_JPEG } from '@/assets/logoInline';
import { useAuthStore, useConfigStore, useNotificationStore, useThemeStore } from '@/stores';
import { triggerHeaderRefresh } from '@/hooks/useHeaderRefresh';
import type { Theme } from '@/types';

const sidebarIcons: Record<string, ReactNode> = {
  dashboard: <IconSidebarDashboard size={18} />,
  aiProviders: <IconSidebarProviders size={18} />,
  authFiles: <IconSidebarAuthFiles size={18} />,
  oauth: <IconSidebarOauth size={18} />,
  quota: <IconSidebarQuota size={18} />,
  config: <IconSidebarConfig size={18} />,
  logs: <IconSidebarLogs size={18} />,
  system: <IconSidebarSystem size={18} />,
};

// Header action icons - smaller size for header buttons
const headerIconProps: SVGProps<SVGSVGElement> = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  focusable: 'false',
};

const headerIcons = {
  refresh: (
    <svg {...headerIconProps}>
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  ),
  menu: (
    <svg {...headerIconProps}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  ),
  close: (
    <svg {...headerIconProps}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
  chevronLeft: (
    <svg {...headerIconProps}>
      <path d="m14 18-6-6 6-6" />
    </svg>
  ),
  chevronRight: (
    <svg {...headerIconProps}>
      <path d="m10 6 6 6-6 6" />
    </svg>
  ),
  language: (
    <svg {...headerIconProps}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  sun: (
    <svg {...headerIconProps}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  ),
  moon: (
    <svg {...headerIconProps}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
    </svg>
  ),
  whiteTheme: (
    <svg {...headerIconProps}>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </svg>
  ),
  autoTheme: (
    <svg {...headerIconProps}>
      <defs>
        <clipPath id="mainLayoutAutoThemeSunLeftHalf">
          <rect x="0" y="0" width="12" height="24" />
        </clipPath>
      </defs>
      <circle cx="12" cy="12" r="4" />
      <circle
        cx="12"
        cy="12"
        r="4"
        clipPath="url(#mainLayoutAutoThemeSunLeftHalf)"
        fill="currentColor"
      />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M6.34 17.66l-1.41 1.41" />
      <path d="M19.07 4.93l-1.41 1.41" />
    </svg>
  ),
  logout: (
    <svg {...headerIconProps}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  ),
};

const THEME_CARDS: Array<{
  key: Theme;
  labelKey: string;
  colors: { bg: string; card: string; border: string; text: string; textMuted: string };
}> = [
  {
    key: 'auto',
    labelKey: 'theme.auto',
    colors: {
      bg: 'linear-gradient(135deg, #ffffff 0 50%, #111111 50% 100%)',
      card: 'linear-gradient(135deg, #ffffff 0 50%, #1a1a1a 50% 100%)',
      border: '#bdbdbd',
      text: '#2d2a26',
      textMuted: 'linear-gradient(135deg, #c9c9c9 0 50%, #5a5a5a 50% 100%)',
    },
  },
  {
    key: 'white',
    labelKey: 'theme.white',
    colors: {
      bg: '#ffffff',
      card: '#ffffff',
      border: '#e5e5e5',
      text: '#2d2a26',
      textMuted: '#a29c95',
    },
  },
  {
    key: 'light',
    labelKey: 'theme.light',
    colors: {
      bg: '#faf9f5',
      card: '#f0eee8',
      border: '#e3e1db',
      text: '#2d2a26',
      textMuted: '#a29c95',
    },
  },
  {
    key: 'dark',
    labelKey: 'theme.dark',
    colors: {
      bg: '#151412',
      card: '#1d1b18',
      border: '#3a3530',
      text: '#f6f4f1',
      textMuted: '#9c958d',
    },
  },
];

export function MainLayout() {
  const { t } = useTranslation();
  const { showNotification } = useNotificationStore();
  const location = useLocation();

  const logout = useAuthStore((state) => state.logout);

  const fetchConfig = useConfigStore((state) => state.fetchConfig);
  const clearCache = useConfigStore((state) => state.clearCache);

  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const themeMenuRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  const [railExpanded, setRailExpanded] = useState(() => {
    try {
      return localStorage.getItem('hg-rail-expanded') === '1';
    } catch {
      return false;
    }
  });

  const fullBrandName = 'Hexgate Management Center';
  const abbrBrandName = t('title.abbr');
  const isLogsPage = location.pathname.startsWith('/logs');
  const closeMobileNav = useCallback(() => setSidebarOpen(false), []);
  const toggleRail = useCallback(() => {
    setRailExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('hg-rail-expanded', next ? '1' : '0');
      } catch {
        // ignore storage failure
      }
      return next;
    });
  }, []);

  // 将顶部悬浮控制区高度写入 CSS 变量，供移动端粘性元素和浮层避让。
  useLayoutEffect(() => {
    const updateHeaderHeight = () => {
      const height = headerRef.current?.offsetHeight;
      if (height) {
        document.documentElement.style.setProperty('--header-height', `${height}px`);
      }
    };

    updateHeaderHeight();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' && headerRef.current
        ? new ResizeObserver(updateHeaderHeight)
        : null;
    if (resizeObserver && headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }

    window.addEventListener('resize', updateHeaderHeight);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  // 将主内容区的中心点写入 CSS 变量，供底部浮层（配置面板操作栏、提供商导航）对齐到内容区
  useLayoutEffect(() => {
    const updateContentCenter = () => {
      const el = contentRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      document.documentElement.style.setProperty('--content-center-x', `${centerX}px`);
    };

    updateContentCenter();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' && contentRef.current
        ? new ResizeObserver(updateContentCenter)
        : null;

    if (resizeObserver && contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    window.addEventListener('resize', updateContentCenter);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', updateContentCenter);
      document.documentElement.style.removeProperty('--content-center-x');
    };
  }, []);

  useEffect(() => {
    if (!themeMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!themeMenuRef.current?.contains(event.target as Node)) {
        setThemeMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setThemeMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [themeMenuOpen]);

  const toggleThemeMenu = useCallback(() => {
    setThemeMenuOpen((prev) => !prev);
  }, []);

  const handleThemeSelect = useCallback(
    (nextTheme: Theme) => {
      setTheme(nextTheme);
      setThemeMenuOpen(false);
    },
    [setTheme]
  );

  useEffect(() => {
    fetchConfig().catch(() => {
      // ignore initial failure; login flow会提示
    });
  }, [fetchConfig]);

  const navGroups = [
    {
      id: 'operate',
      labelKey: 'nav_groups.operate',
      items: [
        {
          path: '/',
          labelKey: 'nav.dashboard',
          metaKey: 'nav_meta.dashboard',
          icon: sidebarIcons.dashboard,
        },
      ],
    },
    {
      id: 'gateway',
      labelKey: 'nav_groups.gateway',
      items: [
        {
          path: '/ai-providers',
          labelKey: 'nav.ai_providers',
          metaKey: 'nav_meta.ai_providers',
          icon: sidebarIcons.aiProviders,
        },
        {
          path: '/auth-files',
          labelKey: 'nav.auth_files',
          metaKey: 'nav_meta.auth_files',
          icon: sidebarIcons.authFiles,
        },
        {
          path: '/oauth',
          labelKey: 'nav.oauth',
          metaKey: 'nav_meta.oauth',
          icon: sidebarIcons.oauth,
        },
      ],
    },
    {
      id: 'observe',
      labelKey: 'nav_groups.observe',
      items: [
        {
          path: '/quota',
          labelKey: 'nav.quota_management',
          metaKey: 'nav_meta.quota_management',
          icon: sidebarIcons.quota,
        },
        {
          path: '/logs',
          labelKey: 'nav.logs',
          metaKey: 'nav_meta.logs',
          icon: sidebarIcons.logs,
        },
      ],
    },
    {
      id: 'control',
      labelKey: 'nav_groups.control',
      items: [
        {
          path: '/config',
          labelKey: 'nav.config_management',
          metaKey: 'nav_meta.config_management',
          icon: sidebarIcons.config,
        },
      ],
    },
  ];
  const navItems = navGroups.flatMap((group) => group.items);
  const navOrder = navItems.map((item) => item.path);
  const getRouteOrder = (pathname: string) => {
    const trimmedPath =
      pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    const normalizedPath = trimmedPath === '/dashboard' ? '/' : trimmedPath;

    const aiProvidersIndex = navOrder.indexOf('/ai-providers');
    if (aiProvidersIndex !== -1) {
      if (normalizedPath === '/ai-providers') return aiProvidersIndex;
      if (normalizedPath.startsWith('/ai-providers/')) {
        if (normalizedPath.startsWith('/ai-providers/gemini')) return aiProvidersIndex + 0.1;
        if (normalizedPath.startsWith('/ai-providers/codex')) return aiProvidersIndex + 0.2;
        if (normalizedPath.startsWith('/ai-providers/claude')) return aiProvidersIndex + 0.3;
        if (normalizedPath.startsWith('/ai-providers/vertex')) return aiProvidersIndex + 0.4;
        if (normalizedPath.startsWith('/ai-providers/ampcode')) return aiProvidersIndex + 0.5;
        if (normalizedPath.startsWith('/ai-providers/openai')) return aiProvidersIndex + 0.6;
        return aiProvidersIndex + 0.05;
      }
    }

    const authFilesIndex = navOrder.indexOf('/auth-files');
    if (authFilesIndex !== -1) {
      if (normalizedPath === '/auth-files') return authFilesIndex;
      if (normalizedPath.startsWith('/auth-files/')) {
        if (normalizedPath.startsWith('/auth-files/oauth-excluded')) return authFilesIndex + 0.1;
        if (normalizedPath.startsWith('/auth-files/oauth-model-alias')) return authFilesIndex + 0.2;
        return authFilesIndex + 0.05;
      }
    }

    const exactIndex = navOrder.indexOf(normalizedPath);
    if (exactIndex !== -1) return exactIndex;
    const nestedIndex = navOrder.findIndex(
      (path) => path !== '/' && normalizedPath.startsWith(`${path}/`)
    );
    return nestedIndex === -1 ? null : nestedIndex;
  };

  const getTransitionVariant = useCallback((fromPathname: string, toPathname: string) => {
    const normalize = (pathname: string) => {
      const trimmed =
        pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
      return trimmed === '/dashboard' ? '/' : trimmed;
    };

    const from = normalize(fromPathname);
    const to = normalize(toPathname);
    const isAuthFiles = (pathname: string) =>
      pathname === '/auth-files' || pathname.startsWith('/auth-files/');
    const isAiProviders = (pathname: string) =>
      pathname === '/ai-providers' || pathname.startsWith('/ai-providers/');
    if (isAuthFiles(from) && isAuthFiles(to)) return 'ios';
    if (isAiProviders(from) && isAiProviders(to)) return 'ios';
    return 'vertical';
  }, []);

  const handleRefreshAll = async () => {
    clearCache();
    const results = await Promise.allSettled([
      fetchConfig(undefined, true),
      triggerHeaderRefresh(),
    ]);
    const rejected = results.find((result) => result.status === 'rejected');
    if (rejected && rejected.status === 'rejected') {
      const reason = rejected.reason;
      const message =
        typeof reason === 'string' ? reason : reason instanceof Error ? reason.message : '';
      showNotification(
        `${t('notification.refresh_failed')}${message ? `: ${message}` : ''}`,
        'error'
      );
      return;
    }
    showNotification(t('notification.data_refreshed'), 'success');
  };
  const normalizedPath =
    location.pathname === '/dashboard' ? '/' : location.pathname.replace(/\/+$/, '') || '/';
  const currentNav =
    navItems.find((item) => item.path === normalizedPath) ??
    navItems.find((item) => item.path !== '/' && normalizedPath.startsWith(`${item.path}/`)) ??
    navItems.find((item) => item.path !== '/' && normalizedPath.startsWith(item.path));
  const currentTitle = currentNav ? t(currentNav.labelKey) : abbrBrandName;
  const currentSubtitle = currentNav ? t(currentNav.metaKey) : fullBrandName;
  const mobileNavLabel = sidebarOpen
    ? t('sidebar.toggle_collapse', { defaultValue: 'Close navigation' })
    : t('sidebar.toggle_expand', { defaultValue: 'Open navigation' });

  return (
    <div
      className={`hg-shell ${sidebarOpen ? 'rail-open' : ''} ${
        railExpanded ? 'rail-expanded' : ''
      }`}
    >
      <button
        type="button"
        className="hg-rail-backdrop"
        onClick={closeMobileNav}
        aria-label={t('common.close')}
        aria-hidden={!sidebarOpen}
        tabIndex={sidebarOpen ? 0 : -1}
      />

      <aside className="hg-rail">
        <NavLink to="/" className="hg-rail-brand" title={fullBrandName} onClick={closeMobileNav}>
          <img src={INLINE_LOGO_JPEG} alt="Hexgate logo" className="hg-rail-brand-logo" />
          <span className="hg-rail-brand-title">{abbrBrandName}</span>
        </NavLink>

        <nav className="hg-rail-nav" aria-label={t('title.abbr')}>
          {navItems.map((item) => {
            const itemLabel = t(item.labelKey);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `hg-rail-item ${isActive ? 'active' : ''}`}
                onClick={closeMobileNav}
                title={itemLabel}
              >
                <span className="hg-rail-ico">{item.icon}</span>
                <span className="hg-rail-tip">{itemLabel}</span>
              </NavLink>
            );
          })}
        </nav>

        <button
          type="button"
          className="hg-rail-toggle"
          onClick={toggleRail}
          title={
            railExpanded
              ? t('sidebar.collapse', { defaultValue: 'Collapse' })
              : t('sidebar.expand', { defaultValue: 'Expand' })
          }
          aria-label={
            railExpanded
              ? t('sidebar.collapse', { defaultValue: 'Collapse' })
              : t('sidebar.expand', { defaultValue: 'Expand' })
          }
          aria-pressed={railExpanded}
        >
          <span className="hg-rail-toggle-ico">
            {railExpanded ? headerIcons.chevronLeft : headerIcons.chevronRight}
          </span>
          <span className="hg-rail-toggle-label">
            {t('sidebar.collapse', { defaultValue: 'Collapse' })}
          </span>
        </button>
      </aside>

      <header className="hg-topbar" ref={headerRef}>
        <button
          type="button"
          className="hg-topbar-burger"
          onClick={() => setSidebarOpen((prev) => !prev)}
          title={mobileNavLabel}
          aria-label={mobileNavLabel}
        >
          {sidebarOpen ? headerIcons.close : headerIcons.menu}
        </button>

        <div className="hg-topbar-title">
          <h1 className="hg-topbar-h">{currentTitle}</h1>
          <span className="hg-topbar-sub">{currentSubtitle}</span>
        </div>

        <div className="hg-topbar-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshAll}
            title={t('header.refresh_all')}
          >
            {headerIcons.refresh}
          </Button>
          <div className={`theme-menu ${themeMenuOpen ? 'open' : ''}`} ref={themeMenuRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleThemeMenu}
              title={t('theme.switch')}
              aria-label={t('theme.switch')}
              aria-haspopup="menu"
              aria-expanded={themeMenuOpen}
            >
              {theme === 'auto'
                ? headerIcons.autoTheme
                : theme === 'dark'
                  ? headerIcons.moon
                  : theme === 'white'
                    ? headerIcons.whiteTheme
                    : headerIcons.sun}
            </Button>
            {themeMenuOpen && (
              <div
                className="notification entering theme-menu-popover"
                role="menu"
                aria-label={t('theme.switch')}
              >
                {THEME_CARDS.map((tc) => (
                  <button
                    key={tc.key}
                    type="button"
                    className={`theme-card ${theme === tc.key ? 'active' : ''}`}
                    onClick={() => handleThemeSelect(tc.key)}
                    role="menuitemradio"
                    aria-checked={theme === tc.key}
                  >
                    <div
                      className="theme-card-preview"
                      style={{
                        background: tc.colors.bg,
                        border: `1px solid ${tc.colors.border}`,
                      }}
                    >
                      <div
                        className="theme-card-header"
                        style={{
                          background: tc.colors.card,
                          borderBottom: `1px solid ${tc.colors.border}`,
                        }}
                      />
                      <div className="theme-card-body">
                        <div
                          className="theme-card-sidebar"
                          style={{
                            background: tc.colors.card,
                            borderRight: `1px solid ${tc.colors.border}`,
                          }}
                        />
                        <div className="theme-card-content" style={{ background: tc.colors.bg }}>
                          <div
                            className="theme-card-line"
                            style={{ background: tc.colors.textMuted }}
                          />
                          <div
                            className="theme-card-line short"
                            style={{ background: tc.colors.textMuted }}
                          />
                        </div>
                      </div>
                    </div>
                    <span className="theme-card-label">{t(tc.labelKey)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={logout} title={t('header.logout')}>
            {headerIcons.logout}
          </Button>
        </div>
      </header>

      <div className="hg-content" ref={contentRef}>
        <main className={`hg-main${isLogsPage ? ' hg-main-logs' : ''}`}>
          <PageTransition
            render={(location) => <MainRoutes location={location} />}
            getRouteOrder={getRouteOrder}
            getTransitionVariant={getTransitionVariant}
            scrollContainerRef={contentRef}
          />
        </main>
      </div>
    </div>
  );
}
