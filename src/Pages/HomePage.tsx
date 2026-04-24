"use client";

import { useState, useEffect } from "react";

// --- Types ---
type Player = {
  id: number;
  first_name: string;
  second_name: string;
  total_points: number;
  now_cost: number;
  form: string;
  selected_by_percent: string;
  photo: string;
};

type PlayerSummary = {
  fixtures: {
    id: number;
    event_name: string;
    difficulty: number;
    is_home: boolean;
  }[];
  history: {
    element: number;
    total_points: number;
    round: number;
    minutes: number;
  }[];
};

export default function HomePage() {
  // --- State ---
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [summary, setSummary] = useState<PlayerSummary | null>(null);
  const [, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // 1. Initial Load: Only fetch the player list once on mount.
  useEffect(() => {
    async function getFPLData() {
      setLoading(true);
      try {
        const res = await fetch("/api-fpl/bootstrap-static/");
        const data = await res.json();
        setPlayers(data.elements);
      } catch (err) {
        console.error("Database sync error:", err);
      } finally {
        setLoading(false);
      }
    }
    getFPLData();
  }, []);

  // 2. Event-Driven Fetching:
  // Instead of an Effect watching 'selectedPlayer', we fetch inside the click handler.
  // This prevents cascading renders triggered by state-to-state synchronization.
  const handleSelectPlayer = async (player: Player) => {
    setQuery(`${player.first_name} ${player.second_name}`);
    setSelectedPlayer(player);
    setShowDropdown(false);
    setSummary(null); // Clear old summary immediately

    try {
      const res = await fetch(`/api-fpl/element-summary/${player.id}/`);
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error("Failed to fetch player details:", err);
    }
  };

  // 3. Logic: Pure filtering (calculated during render)
  const filteredResults =
    query.length > 1 && !selectedPlayer
      ? players
          .filter((p) =>
            `${p.first_name} ${p.second_name}`
              .toLowerCase()
              .includes(query.toLowerCase()),
          )
          .slice(0, 8)
      : [];

  const getDifficultyColor = (level: number) => {
    if (level <= 2) return "#01ff86";
    if (level === 3) return "#ebebe0";
    return "#ff005a";
  };

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <header style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ color: "#37003c", marginBottom: "0.5rem" }}>FPL Gaffer</h1>
        <p style={{ color: "#666" }}>
          Select a player to analyze performance and fixtures.
        </p>
      </header>

      {/* SEARCH INTERFACE */}
      <div style={{ position: "relative", marginBottom: "2rem" }}>
        <input
          type="text"
          placeholder="Search Premier League players..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selectedPlayer) {
              setSelectedPlayer(null);
              setSummary(null);
            }
            setShowDropdown(true);
          }}
          style={{
            width: "100%",
            padding: "12px 20px",
            fontSize: "16px",
            borderRadius: "30px",
            border: "2px solid #37003c",
            outline: "none",
          }}
        />

        {showDropdown && filteredResults.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "105%",
              left: 0,
              right: 0,
              backgroundColor: "white",
              borderRadius: "12px",
              zIndex: 10,
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              border: "1px solid #eee",
            }}
          >
            {filteredResults.map((p) => (
              <div
                key={p.id}
                onClick={() => handleSelectPlayer(p)}
                style={{
                  padding: "12px 20px",
                  cursor: "pointer",
                  borderBottom: "1px solid #f9f9f9",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f0f0f0")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                {p.first_name} {p.second_name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DASHBOARD */}
      {selectedPlayer && (
        <div style={{ animation: "fadeIn 0.3s ease-in" }}>
          <section
            style={{
              display: "flex",
              gap: "2rem",
              backgroundColor: "#37003c",
              color: "white",
              padding: "2rem",
              borderRadius: "20px",
              alignItems: "center",
            }}
          >
            <img
              src={`https://resources.premierleague.com/premierleague/photos/players/250x250/p${selectedPlayer.photo.replace(".jpg", ".png")}`}
              alt={selectedPlayer.second_name}
              style={{
                width: "120px",
                height: "auto",
                borderRadius: "12px",
                background: "white",
              }}
              onError={(e) =>
                (e.currentTarget.src =
                  "https://resources.premierleague.com/premierleague/photos/players/250x250/Photo-Missing.png")
              }
            />
            <div>
              <h2 style={{ margin: 0, fontSize: "2rem" }}>
                {selectedPlayer.first_name} {selectedPlayer.second_name}
              </h2>
              <p style={{ opacity: 0.8, fontSize: "1.2rem" }}>
                £{(selectedPlayer.now_cost / 10).toFixed(1)}m
              </p>
              <div
                style={{ display: "flex", gap: "1.5rem", marginTop: "1rem" }}
              >
                <span>
                  Form: <strong>{selectedPlayer.form}</strong>
                </span>
                <span>
                  Total Pts: <strong>{selectedPlayer.total_points}</strong>
                </span>
              </div>
            </div>
          </section>

          {summary && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
                marginTop: "1.5rem",
              }}
            >
              <div
                style={{
                  border: "1px solid #ddd",
                  padding: "1.5rem",
                  borderRadius: "15px",
                }}
              >
                <h3 style={{ marginTop: 0 }}>Recent Points</h3>
                <div style={{ display: "flex", gap: "8px" }}>
                  {summary.history.slice(-5).map((gw, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        textAlign: "center",
                        background: "#f4f4f4",
                        padding: "8px",
                        borderRadius: "8px",
                      }}
                    >
                      <small style={{ color: "#666" }}>GW{gw.round}</small>
                      <div style={{ fontWeight: "bold", color: "#37003c" }}>
                        {gw.total_points}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  border: "1px solid #ddd",
                  padding: "1.5rem",
                  borderRadius: "15px",
                }}
              >
                <h3 style={{ marginTop: 0 }}>Next 5 Fixtures</h3>
                {summary.fixtures.slice(0, 5).map((fix, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "6px 12px",
                      marginBottom: "6px",
                      borderRadius: "6px",
                      backgroundColor: getDifficultyColor(fix.difficulty),
                      fontWeight: "bold",
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "13px",
                    }}
                  >
                    <span>{fix.event_name}</span>
                    <span>FDR {fix.difficulty}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
