import React, { useSyncExternalStore } from "react";

// Subscribe to localStorage 'lang' changes
function subscribe(callback) {
    // Listen for both 'storage' (other tabs) and custom event (same tab)
    window.addEventListener("storage", callback);
    window.addEventListener("lang-changed", callback);
    return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener("lang-changed", callback);
    };
}
function getLang() {
    return localStorage.getItem("lang") || "en";
}

export default function T({ en, kh }) {
    // This will re-render when localStorage 'lang' changes (from other tabs/windows or same tab)
    const lang = useSyncExternalStore(subscribe, getLang, getLang);
    return <>{lang === "kh" ? kh : en}</>;
}
