import { useState, useEffect, useRef, useCallback } from "react";

const VESSEL_DATA = {
  id: "IMO-9876543",
  name: "MV ARCTIC SHADOW",
  flag: "PA",
  type: "Bulk Carrier",
  mmsi: "352001234",
};

const generateTrack = () => {
  const points = [];
  const events = [];
  let lat = 24.5;
  let lng = 56.2;

  for (let i = 0; i < 96; i++) {
    const hour = i * 0.25;
    const hasAIS = !(i >= 28 && i <= 44) && !(i >= 62 && i <= 70);
    const speed = hasAIS ? 2 + Math.random() * 12 : null;
    const heading = 45 + Math.sin(i * 0.1) * 30;

    if (hasAIS) {
      lat += Math.sin(i * 0.08) * 0.04 + 0.015;
      lng += Math.cos(i * 0.06) * 0.03 + 0.02;
    }

    points.push({
      idx: i,
      lat: lat + (Math.random() - 0.5) * 0.01,
      lng: lng + (Math.random() - 0.5) * 0.01,
      time: new Date(2024, 2, 15, Math.floor(hour), (hour % 1) * 60),
      hasAIS,
      speed,
      heading,
      draught: 8.2 + Math.sin(i * 0.05) * 0.3,
    });
  }

  events.push({
    idx: 0,
    type: "PORT_DEPARTURE",
    label: "Departed Fujairah",
    severity: "info",
  });
  events.push({
    idx: 28,
    type: "AIS_DARK",
    label: "AIS transmission lost",
    severity: "warning",
  });
  events.push({
    idx: 36,
    type: "SANCTIONED_PROXIMITY",
    label: "Entered sanctioned entity proximity zone",
    severity: "critical",
  });
  events.push({
    idx: 44,
    type: "AIS_RESTORE",
    label: "AIS restored — position jump detected",
    severity: "warning",
  });
  events.push({
    idx: 58,
    type: "SPEED_ANOMALY",
    label: "Speed anomaly: 0.2 kn for 3hrs",
    severity: "warning",
  });
  events.push({
    idx: 62,
    type: "AIS_DARK",
    label: "AIS transmission lost again",
    severity: "warning",
  });
  events.push({
    idx: 70,
    type: "AIS_RESTORE",
    label: "AIS restored near port approach",
    severity: "info",
  });
  events.push({
    idx: 88,
    type: "PORT_ARRIVAL",
    label: "Approaching Bandar Abbas",
    severity: "critical",
  });

  return { points, events };
};

const { points: TRACK_POINTS, events: EVENTS } = generateTrack();

const formatTime = (date) => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const formatDate = (date) => {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const severityColors = {
  info: "#4A9EFF",
  warning: "#F5A623",
  critical: "#FF3B5C",
};

const eventIcons = {
  PORT_DEPARTURE: "⚓",
  PORT_ARRIVAL: "⚓",
  AIS_DARK: "◉",
  AIS_RESTORE: "◎",
  SANCTIONED_PROXIMITY: "⚠",
  SPEED_ANOMALY: "◈",
};

export default function TheiaTemporalReplay() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const intervalRef = useRef(null);
  const canvasRef = useRef(null);

  const currentPoint = TRACK_POINTS[currentIdx];
  const visiblePoints = TRACK_POINTS.slice(0, currentIdx + 1);
  const activeEvents = EVENTS.filter((e) => e.idx <= currentIdx);
  const upcomingEvent = EVENTS.find((e) => e.idx > currentIdx);

  const play = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIdx((prev) => {
        if (prev >= TRACK_POINTS.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 80 / playSpeed);
  }, [playSpeed]);

  useEffect(() => {
    if (isPlaying) play();
    else if (intervalRef.current) clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, play]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    const lats = TRACK_POINTS.map((p) => p.lat);
    const lngs = TRACK_POINTS.map((p) => p.lng);
    const minLat = Math.min(...lats) - 0.3;
    const maxLat = Math.max(...lats) + 0.3;
    const minLng = Math.min(...lngs) - 0.3;
    const maxLng = Math.max(...lngs) + 0.3;

    const toX = (lng) => ((lng - minLng) / (maxLng - minLng)) * (W - 60) + 30;
    const toY = (lat) =>
      H - (((lat - minLat) / (maxLat - minLat)) * (H - 60) + 30);

    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = "rgba(74, 158, 255, 0.06)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 8; i++) {
      ctx.beginPath();
      ctx.moveTo((i * W) / 8, 0);
      ctx.lineTo((i * W) / 8, H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, (i * H) / 8);
      ctx.lineTo(W, (i * H) / 8);
      ctx.stroke();
    }

    // Full ghost track
    ctx.beginPath();
    ctx.strokeStyle = "rgba(74, 158, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    TRACK_POINTS.forEach((p, i) => {
      if (i === 0) ctx.moveTo(toX(p.lng), toY(p.lat));
      else ctx.lineTo(toX(p.lng), toY(p.lat));
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw track segments
    let segStart = 0;
    for (let i = 1; i < visiblePoints.length; i++) {
      const prev = visiblePoints[i - 1];
      const curr = visiblePoints[i];
      const inDarkZone = !curr.hasAIS;
      const wasInDark = !prev.hasAIS;

      if (inDarkZone !== wasInDark || i === visiblePoints.length - 1) {
        ctx.beginPath();
        ctx.strokeStyle = wasInDark
          ? "rgba(255, 59, 92, 0.5)"
          : "rgba(74, 158, 255, 0.7)";
        ctx.lineWidth = wasInDark ? 1.5 : 2;
        if (wasInDark) ctx.setLineDash([4, 6]);
        else ctx.setLineDash([]);

        for (let j = segStart; j <= i; j++) {
          const p = visiblePoints[j];
          if (j === segStart) ctx.moveTo(toX(p.lng), toY(p.lat));
          else ctx.lineTo(toX(p.lng), toY(p.lat));
        }
        ctx.stroke();
        ctx.setLineDash([]);
        segStart = i;
      }
    }

    // Draw full visible track cleanly
    ctx.beginPath();
    ctx.setLineDash([]);
    for (let i = 0; i < visiblePoints.length; i++) {
      const p = visiblePoints[i];
      if (i === 0) ctx.moveTo(toX(p.lng), toY(p.lat));
      else {
        if (!p.hasAIS) {
          ctx.strokeStyle = "rgba(255, 59, 92, 0.4)";
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 5]);
        } else {
          ctx.strokeStyle = "rgba(74, 158, 255, 0.8)";
          ctx.lineWidth = 2;
          ctx.setLineDash([]);
        }
        ctx.beginPath();
        ctx.moveTo(
          toX(visiblePoints[i - 1].lng),
          toY(visiblePoints[i - 1].lat)
        );
        ctx.lineTo(toX(p.lng), toY(p.lat));
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);

    // Event markers
    EVENTS.filter((e) => e.idx <= currentIdx).forEach((event) => {
      const p = TRACK_POINTS[event.idx];
      const x = toX(p.lng);
      const y = toY(p.lat);
      const color = severityColors[event.severity];

      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = color + "22";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });

    // Current position
    if (currentPoint) {
      const cx = toX(currentPoint.lng);
      const cy = toY(currentPoint.lat);

      // Pulse rings
      const pulse = (Date.now() % 1500) / 1500;
      ctx.beginPath();
      ctx.arc(cx, cy, 8 + pulse * 16, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(74, 158, 255, ${0.4 * (1 - pulse)})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(74, 158, 255, 0.15)";
      ctx.fill();
      ctx.strokeStyle = "#4A9EFF";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
    }
  }, [currentIdx, visiblePoints, currentPoint]);

  // Animate canvas
  useEffect(() => {
    let animFrame;
    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const W = canvas.width;
      const H = canvas.height;
      const lats = TRACK_POINTS.map((p) => p.lat);
      const lngs = TRACK_POINTS.map((p) => p.lng);
      const minLng = Math.min(...lngs) - 0.3;
      const maxLng = Math.max(...lngs) + 0.3;
      const minLat = Math.min(...lats) - 0.3;
      const maxLat = Math.max(...lats) + 0.3;
      const toX = (lng) => ((lng - minLng) / (maxLng - minLng)) * (W - 60) + 30;
      const toY = (lat) =>
        H - (((lat - minLat) / (maxLat - minLat)) * (H - 60) + 30);

      if (currentPoint) {
        const cx = toX(currentPoint.lng);
        const cy = toY(currentPoint.lat);
        const pulse = (Date.now() % 1500) / 1500;

        ctx.clearRect(cx - 30, cy - 30, 60, 60);

        // Redraw bg dot
        ctx.beginPath();
        ctx.arc(cx, cy, 8 + pulse * 16, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(74, 158, 255, ${0.4 * (1 - pulse)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(74, 158, 255, 0.15)";
        ctx.fill();
        ctx.strokeStyle = "#4A9EFF";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
      }
      animFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animFrame);
  }, [currentPoint]);

  const darkZones = [];
  let inDark = false;
  let darkStart = null;
  TRACK_POINTS.forEach((p, i) => {
    if (!p.hasAIS && !inDark) {
      inDark = true;
      darkStart = i;
    }
    if (p.hasAIS && inDark) {
      inDark = false;
      darkZones.push({ start: darkStart, end: i });
    }
  });

  const progress = (currentIdx / (TRACK_POINTS.length - 1)) * 100;

  return (
    <div
      style={{
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        background: "#080C14",
        color: "#C8D8F0",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "0",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0D1420; }
        ::-webkit-scrollbar-thumb { background: #1E2D45; border-radius: 2px; }
        .event-row:hover { background: rgba(74, 158, 255, 0.06) !important; }
        .speed-btn:hover { background: rgba(74, 158, 255, 0.15) !important; }
        .ctrl-btn:hover { filter: brightness(1.3); }
      `}</style>

      {/* Header */}
      <div
        style={{
          background: "#0A0F1A",
          borderBottom: "1px solid #1A2535",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#4A9EFF",
              boxShadow: "0 0 8px #4A9EFF",
            }}
          />
          <span
            style={{
              fontSize: 11,
              letterSpacing: "0.15em",
              color: "#4A9EFF",
              fontWeight: 500,
            }}
          >
            THEIA · TEMPORAL REPLAY
          </span>
          <span style={{ color: "#2A3B55", fontSize: 11 }}>|</span>
          <span
            style={{ fontSize: 11, color: "#6B8CAE", letterSpacing: "0.08em" }}
          >
            VESSEL BEHAVIORAL ANALYSIS
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{ fontSize: 10, color: "#4A6080", letterSpacing: "0.1em" }}
          >
            {formatDate(currentPoint.time)} · {formatTime(currentPoint.time)}{" "}
            UTC
          </div>
          <div
            style={{
              padding: "3px 8px",
              border: "1px solid #FF3B5C40",
              borderRadius: 2,
              fontSize: 10,
              color: "#FF3B5C",
              letterSpacing: "0.1em",
              background: "#FF3B5C08",
            }}
          >
            ⚠ HIGH RISK
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          height: "calc(100vh - 45px)",
        }}
      >
        {/* Left panel - vessel info */}
        <div
          style={{
            width: 220,
            background: "#0A0F1A",
            borderRight: "1px solid #1A2535",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          {/* Vessel ID */}
          <div
            style={{ padding: "14px 16px", borderBottom: "1px solid #1A2535" }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#4A6080",
                letterSpacing: "0.12em",
                marginBottom: 6,
              }}
            >
              VESSEL
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#E8F0FF",
                letterSpacing: "0.05em",
                marginBottom: 2,
              }}
            >
              {VESSEL_DATA.name}
            </div>
            <div style={{ fontSize: 10, color: "#6B8CAE" }}>
              {VESSEL_DATA.type} · {VESSEL_DATA.flag}
            </div>
            <div style={{ fontSize: 9, color: "#4A6080", marginTop: 4 }}>
              MMSI {VESSEL_DATA.mmsi}
            </div>
          </div>

          {/* Current telemetry */}
          <div
            style={{ padding: "14px 16px", borderBottom: "1px solid #1A2535" }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#4A6080",
                letterSpacing: "0.12em",
                marginBottom: 10,
              }}
            >
              TELEMETRY
            </div>
            {[
              {
                label: "STATUS",
                value: currentPoint.hasAIS ? "AIS ACTIVE" : "DARK",
                color: currentPoint.hasAIS ? "#4A9EFF" : "#FF3B5C",
              },
              {
                label: "SOG",
                value: currentPoint.speed
                  ? `${currentPoint.speed.toFixed(1)} kn`
                  : "—",
                color: "#C8D8F0",
              },
              {
                label: "HDG",
                value: currentPoint.speed
                  ? `${Math.round(currentPoint.heading)}°`
                  : "—",
                color: "#C8D8F0",
              },
              {
                label: "DRAUGHT",
                value: `${currentPoint.draught.toFixed(1)}m`,
                color: "#C8D8F0",
              },
              {
                label: "LAT",
                value: `${currentPoint.lat.toFixed(4)}°N`,
                color: "#C8D8F0",
              },
              {
                label: "LON",
                value: `${currentPoint.lng.toFixed(4)}°E`,
                color: "#C8D8F0",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 7,
                  alignItems: "baseline",
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    color: "#4A6080",
                    letterSpacing: "0.1em",
                  }}
                >
                  {label}
                </span>
                <span style={{ fontSize: 11, color, fontWeight: 500 }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* AIS coverage indicator */}
          <div
            style={{ padding: "14px 16px", borderBottom: "1px solid #1A2535" }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#4A6080",
                letterSpacing: "0.12em",
                marginBottom: 10,
              }}
            >
              AIS COVERAGE
            </div>
            <div
              style={{
                position: "relative",
                height: 8,
                background: "#0D1420",
                borderRadius: 1,
                overflow: "hidden",
                marginBottom: 6,
              }}
            >
              {darkZones.map((zone, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: `${(zone.start / TRACK_POINTS.length) * 100}%`,
                    width: `${
                      ((zone.end - zone.start) / TRACK_POINTS.length) * 100
                    }%`,
                    top: 0,
                    height: "100%",
                    background: "#FF3B5C",
                    opacity: 0.7,
                  }}
                />
              ))}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  width: `${progress}%`,
                  top: 0,
                  height: "100%",
                  background: "transparent",
                  borderRight: "2px solid #fff",
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 9, color: "#4A6080" }}>
                2× DARK PERIODS
              </span>
              <span style={{ fontSize: 9, color: "#FF3B5C" }}>
                6h 42m total
              </span>
            </div>
          </div>

          {/* Risk indicators */}
          <div style={{ padding: "14px 16px" }}>
            <div
              style={{
                fontSize: 10,
                color: "#4A6080",
                letterSpacing: "0.12em",
                marginBottom: 10,
              }}
            >
              RISK SIGNALS
            </div>
            {[
              {
                label: "Sanctions Proximity",
                active: currentIdx >= 36,
                severity: "critical",
              },
              {
                label: "AIS Manipulation",
                active: currentIdx >= 44,
                severity: "warning",
              },
              {
                label: "Speed Anomaly",
                active: currentIdx >= 58,
                severity: "warning",
              },
              {
                label: "Dark Voyage Pattern",
                active: currentIdx >= 44,
                severity: "critical",
              },
            ].map(({ label, active, severity }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 7,
                  opacity: active ? 1 : 0.25,
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: active ? severityColors[severity] : "#2A3B55",
                    boxShadow: active
                      ? `0 0 6px ${severityColors[severity]}`
                      : "none",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    color: active ? "#C8D8F0" : "#4A6080",
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Center - map */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Map canvas */}
          <div style={{ flex: 1, position: "relative", background: "#060B12" }}>
            {/* Ocean texture overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `
                radial-gradient(ellipse at 30% 40%, rgba(20, 50, 90, 0.3) 0%, transparent 60%),
                radial-gradient(ellipse at 70% 70%, rgba(10, 30, 60, 0.4) 0%, transparent 50%)
              `,
                pointerEvents: "none",
                zIndex: 1,
              }}
            />

            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              style={{ width: "100%", height: "100%", display: "block" }}
            />

            {/* Map label */}
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                fontSize: 9,
                color: "#2A3B55",
                letterSpacing: "0.12em",
                zIndex: 2,
              }}
            >
              GULF OF OMAN · STRAIT OF HORMUZ
            </div>

            {/* Legend */}
            <div
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "rgba(8, 12, 20, 0.85)",
                border: "1px solid #1A2535",
                borderRadius: 3,
                padding: "8px 10px",
                zIndex: 2,
                backdropFilter: "blur(8px)",
              }}
            >
              {[
                { color: "#4A9EFF", dash: false, label: "AIS track" },
                { color: "#FF3B5C", dash: true, label: "Dark period" },
                { color: "#F5A623", dot: true, label: "Warning event" },
                { color: "#FF3B5C", dot: true, label: "Critical event" },
              ].map(({ color, dash, dot, label }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 4,
                  }}
                >
                  {dot ? (
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: color,
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 16,
                        height: 2,
                        flexShrink: 0,
                        background: dash ? "transparent" : color,
                        borderTop: dash ? `2px dashed ${color}` : "none",
                      }}
                    />
                  )}
                  <span style={{ fontSize: 9, color: "#6B8CAE" }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Upcoming event banner */}
            {upcomingEvent && (
              <div
                style={{
                  position: "absolute",
                  bottom: 12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(8, 12, 20, 0.9)",
                  border: `1px solid ${
                    severityColors[upcomingEvent.severity]
                  }40`,
                  borderRadius: 3,
                  padding: "6px 12px",
                  fontSize: 10,
                  color: severityColors[upcomingEvent.severity],
                  letterSpacing: "0.08em",
                  zIndex: 2,
                  whiteSpace: "nowrap",
                }}
              >
                UPCOMING · {upcomingEvent.label}
              </div>
            )}
          </div>

          {/* Timeline scrubber */}
          <div
            style={{
              background: "#0A0F1A",
              borderTop: "1px solid #1A2535",
              padding: "12px 20px 14px",
            }}
          >
            {/* Time labels */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 9, color: "#4A6080" }}>
                {formatDate(TRACK_POINTS[0].time)}{" "}
                {formatTime(TRACK_POINTS[0].time)}
              </span>
              <span style={{ fontSize: 9, color: "#4A9EFF", fontWeight: 500 }}>
                T+{Math.round(currentIdx * 0.25)}h
              </span>
              <span style={{ fontSize: 9, color: "#4A6080" }}>
                {formatDate(TRACK_POINTS[95].time)}{" "}
                {formatTime(TRACK_POINTS[95].time)}
              </span>
            </div>

            {/* Scrubber track */}
            <div style={{ position: "relative", marginBottom: 8 }}>
              {/* Dark zone highlights */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 20,
                  pointerEvents: "none",
                }}
              >
                {darkZones.map((zone, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: `${
                        (zone.start / (TRACK_POINTS.length - 1)) * 100
                      }%`,
                      width: `${
                        ((zone.end - zone.start) / (TRACK_POINTS.length - 1)) *
                        100
                      }%`,
                      top: 0,
                      height: "100%",
                      background: "rgba(255, 59, 92, 0.1)",
                      borderLeft: "1px solid rgba(255, 59, 92, 0.4)",
                      borderRight: "1px solid rgba(255, 59, 92, 0.4)",
                    }}
                  />
                ))}
              </div>

              <input
                type="range"
                min={0}
                max={TRACK_POINTS.length - 1}
                value={currentIdx}
                onChange={(e) => {
                  setCurrentIdx(Number(e.target.value));
                  setIsPlaying(false);
                }}
                style={{
                  width: "100%",
                  height: 20,
                  WebkitAppearance: "none",
                  appearance: "none",
                  background: `linear-gradient(to right, #4A9EFF ${progress}%, #1A2535 ${progress}%)`,
                  borderRadius: 1,
                  cursor: "pointer",
                  outline: "none",
                  border: "none",
                }}
              />

              {/* Event tick marks */}
              {EVENTS.map((event) => (
                <div
                  key={event.idx}
                  style={{
                    position: "absolute",
                    left: `${(event.idx / (TRACK_POINTS.length - 1)) * 100}%`,
                    top: -2,
                    width: 2,
                    height: 24,
                    background: severityColors[event.severity],
                    opacity: event.idx <= currentIdx ? 1 : 0.3,
                    transform: "translateX(-50%)",
                    pointerEvents: "none",
                  }}
                />
              ))}
            </div>

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                className="ctrl-btn"
                onClick={() => setCurrentIdx(0)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#4A6080",
                  cursor: "pointer",
                  fontSize: 14,
                  padding: 2,
                }}
              >
                ⏮
              </button>
              <button
                className="ctrl-btn"
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 4))}
                style={{
                  background: "none",
                  border: "none",
                  color: "#4A6080",
                  cursor: "pointer",
                  fontSize: 14,
                  padding: 2,
                }}
              >
                ⏪
              </button>
              <button
                className="ctrl-btn"
                onClick={() => setIsPlaying((p) => !p)}
                style={{
                  background: isPlaying ? "#4A9EFF20" : "#4A9EFF",
                  border: isPlaying ? "1px solid #4A9EFF" : "none",
                  color: isPlaying ? "#4A9EFF" : "#060B12",
                  cursor: "pointer",
                  fontSize: 13,
                  padding: "4px 12px",
                  borderRadius: 2,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
              >
                {isPlaying ? "⏸ PAUSE" : "▶ PLAY"}
              </button>
              <button
                className="ctrl-btn"
                onClick={() =>
                  setCurrentIdx((prev) =>
                    Math.min(TRACK_POINTS.length - 1, prev + 4)
                  )
                }
                style={{
                  background: "none",
                  border: "none",
                  color: "#4A6080",
                  cursor: "pointer",
                  fontSize: 14,
                  padding: 2,
                }}
              >
                ⏩
              </button>
              <button
                className="ctrl-btn"
                onClick={() => setCurrentIdx(TRACK_POINTS.length - 1)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#4A6080",
                  cursor: "pointer",
                  fontSize: 14,
                  padding: 2,
                }}
              >
                ⏭
              </button>

              <div
                style={{
                  width: 1,
                  height: 16,
                  background: "#1A2535",
                  margin: "0 4px",
                }}
              />

              {[1, 2, 4, 8].map((s) => (
                <button
                  key={s}
                  className="speed-btn"
                  onClick={() => setPlaySpeed(s)}
                  style={{
                    background: playSpeed === s ? "#4A9EFF20" : "none",
                    border:
                      playSpeed === s
                        ? "1px solid #4A9EFF40"
                        : "1px solid transparent",
                    color: playSpeed === s ? "#4A9EFF" : "#4A6080",
                    cursor: "pointer",
                    fontSize: 9,
                    padding: "3px 6px",
                    borderRadius: 2,
                    fontFamily: "inherit",
                    letterSpacing: "0.08em",
                    transition: "all 0.1s",
                  }}
                >
                  {s}×
                </button>
              ))}

              <div
                style={{
                  marginLeft: "auto",
                  fontSize: 9,
                  color: "#4A6080",
                  letterSpacing: "0.08em",
                }}
              >
                FRAME {currentIdx + 1} / {TRACK_POINTS.length}
              </div>
            </div>
          </div>
        </div>

        {/* Right panel - event log */}
        <div
          style={{
            width: 240,
            background: "#0A0F1A",
            borderLeft: "1px solid #1A2535",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          <div
            style={{ padding: "12px 16px", borderBottom: "1px solid #1A2535" }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#4A6080",
                letterSpacing: "0.12em",
              }}
            >
              EVENT LOG
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
            {EVENTS.map((event, i) => {
              const isPast = event.idx <= currentIdx;
              const isCurrent =
                EVENTS.filter((e) => e.idx <= currentIdx).slice(-1)[0]?.idx ===
                event.idx;
              return (
                <div
                  key={i}
                  className="event-row"
                  onClick={() => setCurrentIdx(event.idx)}
                  style={{
                    padding: "10px 16px",
                    cursor: "pointer",
                    opacity: isPast ? 1 : 0.3,
                    borderLeft: isCurrent
                      ? `2px solid ${severityColors[event.severity]}`
                      : "2px solid transparent",
                    background: isCurrent
                      ? `${severityColors[event.severity]}08`
                      : "transparent",
                    transition: "all 0.15s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 12 }}>
                      {eventIcons[event.type]}
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        color: severityColors[event.severity],
                        letterSpacing: "0.1em",
                        fontWeight: 500,
                      }}
                    >
                      {event.severity.toUpperCase()}
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        color: "#2A3B55",
                        marginLeft: "auto",
                      }}
                    >
                      T+{Math.round(event.idx * 0.25)}h
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: isPast ? "#8AAAC8" : "#4A6080",
                      lineHeight: 1.4,
                    }}
                  >
                    {event.label}
                  </div>
                  <div style={{ fontSize: 9, color: "#4A6080", marginTop: 3 }}>
                    {formatTime(TRACK_POINTS[event.idx].time)} UTC
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid #1A2535",
              background: "#060B12",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#4A6080",
                letterSpacing: "0.12em",
                marginBottom: 8,
              }}
            >
              ANALYSIS
            </div>
            <div style={{ fontSize: 10, color: "#6B8CAE", lineHeight: 1.6 }}>
              Vessel exhibits classic dark voyage pattern. AIS loss coincides
              with sanctioned entity proximity. Position jump on restoration
              indicates possible transponder manipulation.
            </div>
            <div
              style={{
                marginTop: 10,
                padding: "6px 8px",
                background: "#FF3B5C10",
                border: "1px solid #FF3B5C30",
                borderRadius: 2,
                fontSize: 9,
                color: "#FF3B5C",
                letterSpacing: "0.08em",
              }}
            >
              RECOMMEND: ESCALATE FOR REVIEW
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
