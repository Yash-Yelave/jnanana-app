"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import {
  getNotifications,
  markAllNotificationsRead,
  type AppNotification,
} from "@/lib/api";
import styles from "./notification-bell.module.css";

/** SRS §38 — in-app notification for mentorship request activity. */
export function NotificationBell() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const load = useCallback(
    () =>
      getNotifications()
        .then((res) => {
          setItems(res.items);
          setUnread(res.unread);
        })
        .catch(() => null),
    [],
  );

  useEffect(() => {
    load();
    // Event-day traffic is short-lived; a light poll keeps the badge honest
    // without adding realtime infrastructure the SRS defers to a later phase.
    const timer = setInterval(load, 30_000);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      setUnread(0);
      await markAllNotificationsRead().catch(() => null);
      await load();
    }
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.bell}
        onClick={() => void toggle()}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
      >
        <Bell size={20} />
        {unread > 0 && <span className={styles.badge}>{unread > 9 ? "9+" : unread}</span>}
      </button>

      {open && (
        <div className={styles.panel} role="dialog" aria-label="Notifications">
          <h2>Notifications</h2>
          {items.length === 0 ? (
            <p className={styles.empty}>Nothing yet.</p>
          ) : (
            <ul>
              {items.slice(0, 12).map((item) => (
                <li key={item.id} className={item.read_at ? "" : styles.fresh}>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                  <time dateTime={item.created_at}>
                    {new Date(item.created_at).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
