"use client";
import React, { useState, useEffect, useCallback } from "react";
import styles from "../styles/layout.module.scss";
import d from "../styles/dashboard.module.scss";

// ─── DATA ──────────────────────────────────────────────────
const trucks = [
  {
    id: "C51",
    name: "Caterpillar 777F",
    status: "idle",
    load: 0,
    fuel: 62,
    route: "Ожидание у Карьера 2",
    driver: "Иванов И.И.",
    idle: "18 мин",
  },
  {
    id: "C48",
    name: "Caterpillar 777F",
    status: "ok",
    load: 100,
    fuel: 88,
    route: "Карьер 1 → Склад",
    driver: "Петров А.В.",
    speed: 32,
  },
  {
    id: "C14",
    name: "Caterpillar 777F",
    status: "alert",
    load: 0,
    fuel: 31,
    route: "Остановка — топливо",
    driver: "Сидоров К.П.",
  },
  {
    id: "C25",
    name: "Caterpillar 395",
    status: "ok",
    load: 85,
    fuel: 75,
    route: "Промсклад №6 → К-3",
    driver: "Козлов Р.М.",
    speed: 28,
  },
  {
    id: "C40",
    name: "Caterpillar 777F",
    status: "ok",
    load: 100,
    fuel: 91,
    route: "Карьер 3 → Отвал",
    driver: "Морозов С.Л.",
    speed: 35,
  },
  {
    id: "C11",
    name: "Caterpillar 777F",
    status: "idle",
    load: 0,
    fuel: 55,
    route: "Ожидание у Карьера 1",
    driver: "Новиков В.Г.",
    idle: "7 мин",
  },
];

const recommendations = [
  {
    id: "R-047",
    truck: "C51",
    priority: "high",
    from: "Карьер 2",
    to: "Liebherr ER9350 №1",
    desc: "Самосвал C51 простаивает 18 мин. Рекомендуется перенаправить к экскаватору Liebherr №1.",
    eff: 87,
    time: "17:13",
  },
  {
    id: "R-046",
    truck: "C11",
    priority: "normal",
    from: "Карьер 1",
    to: "Caterpillar 395 №3",
    desc: "Самосвал C11 свободен 7 мин. Оптимальный маршрут — CAT 395 №3, минимальная очередь.",
    eff: 74,
    time: "17:10",
  },
];

const incidents = [
  {
    icon: "⛽",
    type: "red",
    title: "Низкий уровень топлива",
    desc: "C14 — 31%, требуется дозаправка",
    time: "17:10",
  },
  {
    icon: "⚠️",
    type: "yellow",
    title: "Медленное движение",
    desc: "C48 снизил скорость до 8 км/ч на участке Б-3",
    time: "17:08",
  },
  {
    icon: "🔧",
    type: "yellow",
    title: "Плановое ТО",
    desc: "Liebherr №2 — техобслуживание через 4 ч",
    time: "17:05",
  },
  {
    icon: "📋",
    type: "muted",
    title: "Смена водителя",
    desc: "C25 — Козлов Р.М. принял смену",
    time: "17:00",
  },
  {
    icon: "✅",
    type: "muted",
    title: "Рекомендация принята",
    desc: "C40 направлен к Caterpillar 395 №3",
    time: "16:58",
  },
];

const vehicles = [
  { id: "C51", type: "truck", x: 28, y: 42, status: "idle", label: "C51" },
  { id: "C11", type: "truck", x: 22, y: 62, status: "idle", label: "C11" },
  { id: "C48", type: "truck", x: 55, y: 35, status: "ok", label: "C48" },
  { id: "C14", type: "truck", x: 70, y: 55, status: "alert", label: "C14" },
  { id: "C25", type: "truck", x: 45, y: 70, status: "ok", label: "C25" },
  { id: "C40", type: "truck", x: 78, y: 30, status: "ok", label: "C40" },
  {
    id: "EX-1",
    type: "excavator",
    x: 32,
    y: 30,
    status: "ok",
    label: "Liebherr №1",
  },
  {
    id: "EX-2",
    type: "excavator",
    x: 60,
    y: 55,
    status: "ok",
    label: "CAT 395 №2",
  },
  {
    id: "EX-3",
    type: "excavator",
    x: 42,
    y: 82,
    status: "ok",
    label: "CAT 395 №3",
  },
];

const kpis = [
  { label: "Всего самосвалов", value: 6, color: "", sub: "в текущей смене" },
  {
    label: "В работе",
    value: 4,
    color: "green",
    sub: "↑ +1 за час",
    trend: "up",
  },
  { label: "Простаивают", value: 2, color: "yellow", sub: "требуют решения" },
  { label: "Инциденты", value: 1, color: "red", sub: "критических" },
  { label: "Рекомендаций", value: 2, color: "orange", sub: "ожидают решения" },
  {
    label: "Принято за смену",
    value: "34",
    color: "green",
    sub: "↑ 91% rate",
    trend: "up",
  },
];

// ─── LIVE TIME ─────────────────────────────────────────────
function LiveTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("ru", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);
  return <span>{time}</span>;
}

// ─── MAP ROADS (theme-aware via CSS vars) ───────────────────
function MapRoads() {
  return (
    <svg
      className={d["map-svg"]}
      viewBox="0 0 800 450"
      preserveAspectRatio="none"
    >
      {/* Road fill */}
      <g
        stroke="var(--map-road)"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
      >
        <path d="M150 200 Q250 180 350 220 Q450 260 560 250" />
        <path d="M350 220 Q380 300 420 360" />
        <path d="M150 200 Q180 280 220 330" />
        <path d="M560 250 Q620 200 680 160" />
        <path d="M560 250 Q600 310 640 340" />
        <path d="M220 330 Q300 350 420 360" />
      </g>
      {/* Road center dash */}
      <g
        stroke="var(--map-road-center)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="7,9"
      >
        <path d="M150 200 Q250 180 350 220 Q450 260 560 250" />
        <path d="M350 220 Q380 300 420 360" />
        <path d="M150 200 Q180 280 220 330" />
        <path d="M560 250 Q620 200 680 160" />
        <path d="M560 250 Q600 310 640 340" />
        <path d="M220 330 Q300 350 420 360" />
      </g>
      {/* Quarry zones */}
      <ellipse
        cx="230"
        cy="185"
        rx="65"
        ry="45"
        stroke="var(--map-zone-stroke)"
        strokeWidth="1.5"
        fill="var(--map-zone-fill)"
        strokeDasharray="4,5"
      />
      <ellipse
        cx="500"
        cy="240"
        rx="55"
        ry="40"
        stroke="var(--map-zone-stroke)"
        strokeWidth="1.5"
        fill="var(--map-zone-fill)"
        strokeDasharray="4,5"
      />
      <ellipse
        cx="380"
        cy="350"
        rx="50"
        ry="35"
        stroke="var(--map-zone-stroke)"
        strokeWidth="1"
        opacity="0.7"
        fill="var(--map-zone-fill)"
        strokeDasharray="4,5"
      />
      {/* Active route */}
      <path
        d="M224 189 Q250 178 350 220 Q400 238 482 242"
        stroke="rgba(246,83,24,0.55)"
        strokeWidth="2.5"
        fill="none"
        strokeDasharray="7,6"
        strokeLinecap="round"
      />
      {/* Zone labels */}
      <text
        x="185"
        y="172"
        fill="var(--map-label)"
        fontSize="9"
        fontWeight="600"
        fontFamily="sans-serif"
        letterSpacing="1"
        textAnchor="middle"
      >
        КАРЬЕР 1
      </text>
      <text
        x="500"
        y="228"
        fill="var(--map-label)"
        fontSize="9"
        fontWeight="600"
        fontFamily="sans-serif"
        letterSpacing="1"
        textAnchor="middle"
      >
        КАРЬЕР 2
      </text>
      <text
        x="380"
        y="340"
        fill="var(--map-label)"
        fontSize="9"
        fontWeight="600"
        fontFamily="sans-serif"
        letterSpacing="1"
        textAnchor="middle"
      >
        КАРЬЕР 3
      </text>
      <text
        x="680"
        y="155"
        fill="var(--map-label)"
        fontSize="9"
        opacity="0.7"
        fontWeight="600"
        fontFamily="sans-serif"
        letterSpacing="1"
        textAnchor="middle"
      >
        СКЛАД
      </text>
      <text
        x="200"
        y="345"
        fill="var(--map-label)"
        fontSize="9"
        opacity="0.7"
        fontWeight="600"
        fontFamily="sans-serif"
        letterSpacing="1"
        textAnchor="middle"
      >
        ОТВАЛ
      </text>
    </svg>
  );
}

// ─── THEME TOGGLE BUTTON ────────────────────────────────────
function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: string;
  onToggle: () => void;
}) {
  const isLight = theme === "light";
  return (
    <button
      onClick={onToggle}
      className={`${styles["theme-toggle"]} ${isLight ? styles["theme-toggle--light"] : ""}`}
      title={isLight ? "Включить ночной режим" : "Включить дневной режим"}
    >
      <div className={styles["theme-toggle__knob"]}>
        {isLight ? "☀️" : "🌙"}
      </div>
    </button>
  );
}

// ─── PAGE ───────────────────────────────────────────────────
export default function DashboardPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState("dispatcher");

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const idleCount = trucks.filter((t) => t.status === "idle").length;
  const alertCount = trucks.filter((t) => t.status === "alert").length;
  const workingCount = trucks.filter((t) => t.status === "ok").length;

  return (
    <div className={styles.layout}>
      {/* ── SIDEBAR ── */}
      <aside className={styles.sidebar}>
        <div className={styles["sidebar__logo"]}>
          <div className={styles["logo-icon"]}>Ф</div>
          <div className={styles["logo-text"]}>
            ФОРК ИТ
            <span>Диспетчер</span>
          </div>
        </div>

        <nav className={styles["sidebar__nav"]}>
          <div className={styles["sidebar__section-label"]}>Основное</div>
          {[
            { icon: "▦", label: "Главная", active: true },
            { icon: "🚛", label: "Техника", badge: "22" },
            { icon: "📋", label: "История" },
            { icon: "📊", label: "Логи расчётов" },
          ].map((item) => (
            <div
              key={item.label}
              className={`${styles["sidebar__item"]} ${item.active ? styles["sidebar__item--active"] : ""}`}
            >
              <span style={{ fontSize: 13 }}>{item.icon}</span>
              {item.label}
              {item.badge && (
                <span className={styles["nav-badge"]}>{item.badge}</span>
              )}
            </div>
          ))}

          <div
            className={styles["sidebar__section-label"]}
            style={{ marginTop: 6 }}
          >
            Управление
          </div>
          {[
            { icon: "📜", label: "История очередей" },
            { icon: "⚙️", label: "Константы" },
            { icon: "📦", label: "Настройка грузов" },
            { icon: "⚠️", label: "Штрафники", badge: "3" },
            { icon: "🔧", label: "Типы простоев" },
            { icon: "📝", label: "Журнал действий" },
          ].map((item) => (
            <div key={item.label} className={styles["sidebar__item"]}>
              <span style={{ fontSize: 13 }}>{item.icon}</span>
              {item.label}
              {item.badge && (
                <span
                  className={styles["nav-badge"]}
                  style={{
                    background: "var(--bg-card)",
                    color: "var(--text-muted)",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </nav>

        <div className={styles["sidebar__bottom"]}>
          <div className={styles["shift-block"]}>
            <div className={styles["shift-label"]}>Смена 2</div>
            <div className={styles["shift-value"]}>06:00 — 18:00</div>
            <div className={styles["shift-progress"]}>
              <div className={styles["shift-fill"]} style={{ width: "62%" }} />
            </div>
            <div className={styles["shift-sub"]}>7 ч 26 мин прошло</div>
          </div>
          <div className={styles["sidebar__item"]} style={{ marginTop: 2 }}>
            <span style={{ fontSize: 13 }}>🚪</span>
            Выйти
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles["header__title"]}>Оптимизатор простоев</div>
          <div className={styles["header__divider"]} />

          <div className={styles["header__tabs"]}>
            {[
              { key: "dispatcher", label: "Диспетчер" },
              { key: "map", label: "Карта" },
              { key: "analytics", label: "Аналитика" },
            ].map((tab) => (
              <div
                key={tab.key}
                className={`${styles["header__tab"]} ${activeTab === tab.key ? styles["header__tab--active"] : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </div>
            ))}
          </div>

          <div className={styles["header__right"]}>
            {/* Live indicator */}
            <div className={styles["live-indicator"]}>
              <div className={styles.pulse} />
              Онлайн
            </div>

            <div className={styles["header__divider"]} />

            {/* Time */}
            <div className={styles["time-block"]}>
              <div className={styles["header__time"]}>
                <LiveTime />
              </div>
              <div className={styles["header__date"]}>27 апреля 2026</div>
            </div>

            <div className={styles["header__divider"]} />

            {/* Theme toggle */}
            <ThemeToggle theme={theme} onToggle={toggleTheme} />

            {/* Actions */}
            <div className={styles["icon-btn"]} title="Уведомления">
              🔔
            </div>
            <div className={styles["icon-btn"]} title="Настройки">
              ⚙️
            </div>

            <div className={styles["header__divider"]} />

            {/* Dispatcher */}
            <div className={styles["dispatcher"]}>
              <div className={styles["avatar"]}>ИС</div>
              <div className={styles["disp-name"]}>Имя сотрудника</div>
            </div>
          </div>
        </header>

        {/* Dashboard body */}
        <div className={d.dashboard}>
          {/* KPI Strip */}
          <div className={d["kpi-strip"]}>
            {kpis.map((kpi) => (
              <div key={kpi.label} className={d.kpi}>
                <div className={d["kpi__label"]}>{kpi.label}</div>
                <div
                  className={`${d["kpi__value"]} ${kpi.color ? d[`kpi__value--${kpi.color}`] : ""}`}
                >
                  {kpi.value}
                </div>
                <div className={d["kpi__sub"]}>
                  {kpi.trend ? (
                    <>
                      <span className={d[`trend--${kpi.trend}`]}>
                        {kpi.sub.split(" ")[0]}
                      </span>{" "}
                      {kpi.sub.split(" ").slice(1).join(" ")}
                    </>
                  ) : (
                    kpi.sub
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Left — Map + Fleet */}
          <div className={d["content-left"]}>
            {/* Map */}
            <div className={d["map-area"]}>
              <MapRoads />

              {/* Vehicles */}
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  className={d.vehicle}
                  style={{ left: `${v.x}%`, top: `${v.y}%` }}
                  title={v.label}
                >
                  <div className={d["vehicle__label"]}>{v.label}</div>
                  {v.type === "truck" ? (
                    <>
                      <div
                        className={`${d["vehicle__dot"]} ${d["vehicle__dot--truck"]} ${d[`status-${v.status}`]}`}
                      >
                        🚛
                      </div>
                      {v.status === "idle" && (
                        <div className={d["vehicle__pulse"]} />
                      )}
                    </>
                  ) : (
                    <div
                      className={`${d["vehicle__dot"]} ${d["vehicle__dot--excavator"]}`}
                    >
                      ⛏
                    </div>
                  )}
                </div>
              ))}

              {/* Map controls */}
              <div className={d["map-controls"]}>
                <div className={d["ctrl-btn"]}>+</div>
                <div className={d["ctrl-btn"]}>−</div>
                <div className={d["ctrl-btn"]}>⤢</div>
              </div>

              {/* Legend */}
              <div className={d["map-legend"]}>
                {[
                  { cls: "truck", label: "В работе" },
                  { cls: "idle", label: "Простой" },
                  { cls: "alert", label: "Инцидент" },
                  { cls: "excavator", label: "Экскаватор" },
                ].map((l) => (
                  <div key={l.cls} className={d["legend-item"]}>
                    <div
                      className={`${d["legend-dot"]} ${d[`legend-dot--${l.cls}`]}`}
                    />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Fleet table */}
            <div className={d["fleet-table-wrap"]}>
              <div className={d["section-header"]}>
                <div className={d.title}>Парк техники</div>
                <div className={d["count-badge"]}>{trucks.length}</div>
                <div className={d["ml-auto"]}>
                  <button className={d["filter-btn"]}>Фильтр</button>
                </div>
              </div>
              <div className={d["fleet-table"]}>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Модель</th>
                      <th>Статус</th>
                      <th>Маршрут</th>
                      <th>Загрузка</th>
                      <th>Топливо</th>
                      <th>Водитель</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {trucks.map((t) => (
                      <tr
                        key={t.id}
                        className={
                          t.status === "idle"
                            ? d["row--idle"]
                            : t.status === "alert"
                              ? d["row--alert"]
                              : ""
                        }
                      >
                        <td>
                          <span className={d["cell-id"]}>{t.id}</span>
                        </td>
                        <td>
                          <span className={d["cell-name"]}>{t.name}</span>
                        </td>
                        <td>
                          {t.status === "ok" && (
                            <span className="badge badge--green">
                              <span className="dot dot--green" />В работе
                            </span>
                          )}
                          {t.status === "idle" && (
                            <span className="badge badge--yellow">
                              <span className="dot dot--yellow" />
                              Простой {(t as any).idle}
                            </span>
                          )}
                          {t.status === "alert" && (
                            <span className="badge badge--red">
                              <span className="dot dot--red" />
                              Инцидент
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            maxWidth: 170,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {t.route}
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <div className={d["progress-mini"]}>
                              <div
                                className={`${d.fill} ${t.load < 30 ? d["fill--yellow"] : ""}`}
                                style={{ width: `${t.load}%` }}
                              />
                            </div>
                            <span
                              style={{
                                color: "var(--text-muted)",
                                fontSize: 10,
                              }}
                            >
                              {t.load}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <div className={d["progress-mini"]}>
                              <div
                                className={`${d.fill} ${t.fuel < 40 ? d["fill--red"] : ""}`}
                                style={{ width: `${t.fuel}%` }}
                              />
                            </div>
                            <span
                              style={{
                                color:
                                  t.fuel < 40
                                    ? "var(--red)"
                                    : "var(--text-muted)",
                                fontSize: 10,
                              }}
                            >
                              {t.fuel}%
                            </span>
                          </div>
                        </td>
                        <td>{t.driver}</td>
                        <td>
                          {t.status === "idle" && (
                            <button className={d["action-btn"]}>
                              Назначить
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className={d["panel-right"]}>
            {/* Recommendations */}
            <div className={d.recommendations}>
              <div className={d["section-header"]}>
                <div className={d.title}>Рекомендации</div>
                <span
                  className={d["badge-count"]}
                  style={{ background: "var(--orange)" }}
                >
                  {recommendations.length}
                </span>
                <div className={d["ml-auto"]}>
                  <span className={d.chevron}>▼</span>
                </div>
              </div>
              <div className={d["rec-list"]}>
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className={`${d["rec-card"]} ${rec.priority === "high" ? d["rec-card--high"] : ""}`}
                  >
                    <div className={d["rec-card__header"]}>
                      <div
                        className={`${d["rec-priority"]} ${d[`rec-priority--${rec.priority}`]}`}
                      />
                      <div className={d["rec-card__id"]}>
                        {rec.id} · Самосвал {rec.truck}
                      </div>
                      <div className={d["rec-card__time"]}>{rec.time}</div>
                    </div>

                    <div className={d["rec-card__desc"]}>{rec.desc}</div>

                    <div className={d["rec-card__route"]}>
                      <span className={d.from}>{rec.truck}</span>
                      <span className={d.arrow}>→</span>
                      <span className={d.to}>{rec.to}</span>
                    </div>

                    <div className={d["rec-card__eff"]}>
                      <span className={d["eff-label"]}>Эффект</span>
                      <div className={d["eff-bar"]}>
                        <div
                          className={d.fill}
                          style={{ width: `${rec.eff}%` }}
                        />
                      </div>
                      <span className={d["eff-value"]}>{rec.eff}%</span>
                    </div>

                    <div className={d["rec-card__actions"]}>
                      <button className={`${d.btn} ${d["btn--accept"]}`}>
                        ✓ Принять
                      </button>
                      <button className={`${d.btn} ${d["btn--decline"]}`}>
                        Отклонить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Incidents */}
            <div className={d.incidents}>
              <div className={d["section-header"]}>
                <div className={d.title}>Уведомления</div>
                <span
                  className={d["badge-count"]}
                  style={{ background: "var(--red)" }}
                >
                  {alertCount}
                </span>
                <div className={d["ml-auto"]}>
                  <span className={d["see-all"]}>Все →</span>
                </div>
              </div>
              <div className={d["incident-list"]}>
                {incidents.map((inc, i) => (
                  <div key={i} className={d["incident-item"]}>
                    <div
                      className={`${d["inc-icon"]} ${d[`inc-icon--${inc.type}`]}`}
                    >
                      {inc.icon}
                    </div>
                    <div className={d["inc-body"]}>
                      <div className={d["inc-title"]}>{inc.title}</div>
                      <div className={d["inc-desc"]}>{inc.desc}</div>
                    </div>
                    <div className={d["inc-time"]}>{inc.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optimizer bar */}
            <div className={d["optimizer-bar"]}>
              <div className={d["opt-label"]}>⚡ Оптимизатор</div>
              <div className={d["opt-status"]}>
                <span className="dot dot--green" />
                Активен · обновление 18 сек
              </div>
              <div className={d["ml-auto"]}>
                <button className={d["opt-btn"]}>Настройки</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
