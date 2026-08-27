// Sprite SVG de ícones — portado de design-system/style-guide.html.
// Traço único 1.8px, currentColor. Renderizado uma vez no AppLayout.
export default function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <symbol id="ic-search" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" /><line x1="15.3" y1="15.3" x2="21" y2="21" /></symbol>
        <symbol id="ic-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.6" /><path d="M5 20c0-4 3.1-6.5 7-6.5s7 2.5 7 6.5" /></symbol>
        <symbol id="ic-users" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19.5c0-3.5 2.5-5.8 5.5-5.8s5.5 2.3 5.5 5.8" /><circle cx="17" cy="8.5" r="2.4" /><path d="M15.5 13.2c2.5.3 4.2 2.3 4.2 5.3" /></symbol>
        <symbol id="ic-briefcase" viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="11" rx="2.4" /><path d="M8.5 8V6.2A2.2 2.2 0 0 1 10.7 4h2.6a2.2 2.2 0 0 1 2.2 2.2V8" /><line x1="3" y1="13" x2="21" y2="13" /></symbol>
        <symbol id="ic-bell" viewBox="0 0 24 24"><path d="M6 10.5a6 6 0 0 1 12 0c0 4 1.4 5.2 1.4 5.2H4.6S6 14.5 6 10.5Z" /><path d="M10 18.5a2 2 0 0 0 4 0" /></symbol>
        <symbol id="ic-send" viewBox="0 0 24 24"><path d="M4 12 20 4l-6 16-3-6-7-2Z" /></symbol>
        <symbol id="ic-grid" viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.6" /><rect x="13" y="4" width="7" height="7" rx="1.6" /><rect x="4" y="13" width="7" height="7" rx="1.6" /><rect x="13" y="13" width="7" height="7" rx="1.6" /></symbol>
        <symbol id="ic-gear" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2" /><circle cx="12" cy="12" r="7.3" strokeDasharray="2.6 2.6" /></symbol>
        <symbol id="ic-chevron-down" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></symbol>
        <symbol id="ic-chevron-up" viewBox="0 0 24 24"><polyline points="6 15 12 9 18 15" /></symbol>
        <symbol id="ic-chevron-right" viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18" /></symbol>
        <symbol id="ic-chevron-left" viewBox="0 0 24 24"><polyline points="15 6 9 12 15 18" /></symbol>
        <symbol id="ic-menu" viewBox="0 0 24 24"><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></symbol>
        <symbol id="ic-check" viewBox="0 0 24 24"><polyline points="5 13 10 18 19 7" /></symbol>
        <symbol id="ic-x" viewBox="0 0 24 24"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></symbol>
        <symbol id="ic-calendar" viewBox="0 0 24 24"><rect x="3.5" y="5.5" width="17" height="15" rx="2.2" /><line x1="3.5" y1="10" x2="20.5" y2="10" /><line x1="8" y1="3.5" x2="8" y2="7.5" /><line x1="16" y1="3.5" x2="16" y2="7.5" /></symbol>
        <symbol id="ic-doc" viewBox="0 0 24 24"><path d="M6 3.5h9l3.5 3.5V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="16" x2="14" y2="16" /></symbol>
        <symbol id="ic-trend" viewBox="0 0 24 24"><polyline points="3 16 9.5 9.5 14 14 21 6" /><polyline points="15 6 21 6 21 12" /></symbol>
        <symbol id="ic-link" viewBox="0 0 24 24"><circle cx="7" cy="17" r="3" /><circle cx="17" cy="7" r="3" /><line x1="9.2" y1="14.8" x2="14.8" y2="9.2" /></symbol>
        <symbol id="ic-bars" viewBox="0 0 24 24"><rect x="4" y="12" width="4" height="8" rx="1" /><rect x="10" y="7" width="4" height="13" rx="1" /><rect x="16" y="3" width="4" height="17" rx="1" /></symbol>
        <symbol id="ic-wallet" viewBox="0 0 24 24"><rect x="3.5" y="6" width="17" height="13" rx="2.4" /><path d="M3.5 10h17" /><circle cx="16.5" cy="13.5" r="1.3" fill="currentColor" stroke="none" /></symbol>
        <symbol id="ic-cash" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="3" /><line x1="7" y1="9" x2="7" y2="9.01" /><line x1="17" y1="15" x2="17" y2="15.01" /></symbol>
        <symbol id="ic-box" viewBox="0 0 24 24"><path d="M12 3 3.5 7.5v9L12 21l8.5-4.5v-9L12 3Z" /><path d="M3.5 7.5 12 12l8.5-4.5" /><line x1="12" y1="12" x2="12" y2="21" /></symbol>
        <symbol id="ic-wheelchair" viewBox="0 0 24 24"><circle cx="11" cy="5" r="2" /><path d="M11 8v5h5l3 6" /><path d="M16 15a5 5 0 1 1-5-6" /></symbol>
        <symbol id="ic-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><line x1="12" y1="2.5" x2="12" y2="5.5" /><line x1="12" y1="18.5" x2="12" y2="21.5" /><line x1="2.5" y1="12" x2="5.5" y2="12" /><line x1="18.5" y1="12" x2="21.5" y2="12" /></symbol>
        <symbol id="ic-chat" viewBox="0 0 24 24"><path d="M4 5.5h16A1.5 1.5 0 0 1 21.5 7v9A1.5 1.5 0 0 1 20 17.5H9l-5 4V7A1.5 1.5 0 0 1 4 5.5Z" /></symbol>
        <symbol id="ic-star" viewBox="0 0 24 24"><path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="currentColor" stroke="none" /></symbol>
        <symbol id="ic-check-circle" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><polyline points="8 12.5 11 15.5 16.5 9" /></symbol>
        <symbol id="ic-alert" viewBox="0 0 24 24"><path d="M12 4 21 19H3L12 4Z" /><line x1="12" y1="10" x2="12" y2="14" /><line x1="12" y1="17" x2="12" y2="17.01" /></symbol>
        <symbol id="ic-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" /><polyline points="12 7 12 12 15.5 14" /></symbol>
        <symbol id="ic-pencil" viewBox="0 0 24 24"><path d="M4 20.5 4.8 16.8 16.2 5.4a1.8 1.8 0 0 1 2.5 0l1.1 1.1a1.8 1.8 0 0 1 0 2.5L8.4 20.2 4 20.5Z" /><line x1="14.5" y1="7.1" x2="18.9" y2="11.5" /></symbol>
        <symbol id="ic-trash" viewBox="0 0 24 24"><path d="M5 7h14" /><path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2" /><path d="M7 7l1 13a1.5 1.5 0 0 0 1.5 1.4h5a1.5 1.5 0 0 0 1.5-1.4L17 7" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></symbol>
        <symbol id="ic-filter" viewBox="0 0 24 24"><path d="M4 5h16l-6 7.5V19l-4 2v-8.5Z" /></symbol>
        <symbol id="ic-phone" viewBox="0 0 24 24"><path d="M6 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 4.5 5.1 1.5 1.5 0 0 1 6 3.5Z" /></symbol>
        <symbol id="ic-mail" viewBox="0 0 24 24"><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="M4 6.5 12 13l8-6.5" /></symbol>
        <symbol id="ic-download" viewBox="0 0 24 24"><path d="M12 3.5v11" /><polyline points="7.5 11 12 15.5 16.5 11" /><path d="M4.5 17.5v2A1.5 1.5 0 0 0 6 21h12a1.5 1.5 0 0 0 1.5-1.5v-2" /></symbol>
        <symbol id="ic-print" viewBox="0 0 24 24"><path d="M7 9V4h10v5" /><rect x="4" y="9" width="16" height="8" rx="1.6" /><rect x="7" y="14" width="10" height="6" rx="1" /></symbol>
        <symbol id="ic-plus" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></symbol>
        <symbol id="ic-more" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" /></symbol>
        <symbol id="ic-home" viewBox="0 0 24 24"><path d="M4 11 12 4l8 7" /><path d="M6 10v9.5A1 1 0 0 0 7 20.5h10a1 1 0 0 0 1-1.5V10" /></symbol>
        <symbol id="ic-shield" viewBox="0 0 24 24"><path d="M12 3 19 6v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6l7-3Z" /><polyline points="9 12 11 14 15.5 9.5" /></symbol>
        <symbol id="ic-database" viewBox="0 0 24 24"><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6" /><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" /></symbol>
        <symbol id="ic-receipt" viewBox="0 0 24 24"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="9" y1="12" x2="15" y2="12" /></symbol>
        <symbol id="ic-flag" viewBox="0 0 24 24"><path d="M6 21V4" /><path d="M6 4h11l-2 4 2 4H6" /></symbol>
        <symbol id="ic-refresh" viewBox="0 0 24 24"><path d="M4 12a8 8 0 0 1 13.7-5.6L20 8" /><polyline points="20 4 20 8 16 8" /><path d="M20 12a8 8 0 0 1-13.7 5.6L4 16" /><polyline points="4 20 4 16 8 16" /></symbol>
        <symbol id="ic-external" viewBox="0 0 24 24"><path d="M14 4h6v6" /><line x1="20" y1="4" x2="11" y2="13" /><path d="M18 14v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h5" /></symbol>
        <symbol id="ic-map-pin" viewBox="0 0 24 24"><path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></symbol>
        <symbol id="ic-logout" viewBox="0 0 24 24"><path d="M9 21H6a1.5 1.5 0 0 1-1.5-1.5v-15A1.5 1.5 0 0 1 6 3h3" /><polyline points="16 16 20 12 16 8" /><line x1="20" y1="12" x2="9" y2="12" /></symbol>
      </defs>
    </svg>
  );
}
