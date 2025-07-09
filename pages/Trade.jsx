import React, { useEffect, useState } from "react";
import axios from "axios";

const Trade = () => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get("http://localhost:5000/api/nse-live-data", {
          timeout: 45000 // 45 second timeout
        });
        
        let rawData = response.data.tableData || [];
        
        // Clean and structure the data
        const cleanedData = rawData.map(row => {
          if (!Array.isArray(row)) return null;
          
          // Remove empty cells and clean up
          const filteredRow = row.filter(cell => cell && cell.trim() !== '');
          
          // If row has too few cells, skip it
          if (filteredRow.length < 6) return null;
          
          // Take first 8 meaningful cells
          return filteredRow.slice(0, 8);
        }).filter(row => row !== null);
        
        setMarketData(cleanedData);
        setLastUpdate(new Date().toLocaleString());
        console.log("✅ Data fetched successfully:", cleanedData.length, "rows");
        
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError(err.response?.data?.details || err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 120000); // refresh every 2 minutes (less aggressive)
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    // Trigger a fresh fetch
    const event = new Event('refresh');
    window.dispatchEvent(event);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>📈 NSE Live Equity Market Data</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button 
            onClick={handleRefresh} 
            disabled={loading}
            style={{
              padding: "8px 16px",
              backgroundColor: loading ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
          {lastUpdate && (
            <span style={{ fontSize: "12px", color: "#666" }}>
              Last updated: {lastUpdate}
            </span>
          )}
        </div>
      </div>

      {loading && (
        <div style={{ 
          textAlign: "center", 
          padding: "40px", 
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          margin: "20px 0"
        }}>
          <div>🔄 Loading NSE data...</div>
          <div style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
            This may take 10-30 seconds due to NSE's security measures
          </div>
        </div>
      )}

      {error && (
        <div style={{ 
          backgroundColor: "#f8d7da", 
          color: "#721c24", 
          padding: "15px", 
          borderRadius: "8px",
          margin: "20px 0",
          border: "1px solid #f5c6cb"
        }}>
          <strong>❌ Error:</strong> {error}
          <div style={{ marginTop: "10px", fontSize: "12px" }}>
            Possible causes: NSE anti-bot protection, network issues, or site changes
          </div>
        </div>
      )}

      {!loading && !error && marketData.length === 0 && (
        <div style={{ 
          textAlign: "center", 
          padding: "40px", 
          backgroundColor: "#fff3cd",
          borderRadius: "8px",
          margin: "20px 0"
        }}>
          ⚠️ No data available. Try refreshing or check if the NSE website is accessible.
        </div>
      )}

      {!loading && marketData.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <div style={{ marginBottom: "10px", fontSize: "14px", color: "#666" }}>
            Showing {marketData.length} stocks
          </div>
          <table 
            border="1" 
            cellPadding="8" 
            cellSpacing="0"
            style={{ 
              width: "100%", 
              borderCollapse: "collapse",
              backgroundColor: "white",
              fontSize: "14px"
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th style={{ minWidth: "50px" }}>#</th>
                <th style={{ minWidth: "100px" }}>Symbol</th>
                <th style={{ minWidth: "200px" }}>Company</th>
                <th style={{ minWidth: "100px" }}>Price</th>
                <th style={{ minWidth: "100px" }}>Change</th>
                <th style={{ minWidth: "100px" }}>% Change</th>
                <th style={{ minWidth: "120px" }}>Volume</th>
                <th style={{ minWidth: "140px" }}>Turnover</th>
              </tr>
            </thead>
            <tbody>
              {marketData.map((row, idx) => (
                <tr key={idx} style={{ 
                  backgroundColor: idx % 2 === 0 ? "#f8f9fa" : "white",
                  transition: "background-color 0.2s"
                }}>
                  <td style={{ textAlign: "center", fontWeight: "bold" }}>{idx + 1}</td>
                  {row.map((cell, i) => (
                    <td 
                      key={i} 
                      style={{ 
                        padding: "8px",
                        borderBottom: "1px solid #dee2e6",
                        color: i === 4 || i === 5 ? (cell.includes('-') ? '#dc3545' : '#28a745') : 'inherit'
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Trade;