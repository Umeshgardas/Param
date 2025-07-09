import React, { useEffect, useState } from "react";
import "../styles/Monetization.css";

// Configuration
const CONFIG = {
  YOUTUBE_API_KEY: "AIzaSyDTGHUUWtRPxX5MEb1w9FlioeOB3S2U7Jk",
  REGION_CODE: "IN",
  MAX_RESULTS: 10,
};

const Monetization = () => {
  const [selectedCategory, setSelectedCategory] = useState("today");
  const [todayTrending, setTodayTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendingVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiKey = CONFIG.YOUTUBE_API_KEY;

        if (!apiKey) {
          throw new Error("YouTube API key not configured");
        }

        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=${CONFIG.REGION_CODE}&maxResults=${CONFIG.MAX_RESULTS}&key=${apiKey}`
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        if (data.error) {
          throw new Error(`YouTube API error: ${data.error.message}`);
        }

        const formatted = Array.isArray(data.items)
          ? data.items.map((item, index) => ({
              id: index + 1,
              title: item.snippet.title,
              channel: item.snippet.channelTitle,
              views: parseFloat(
                (item.statistics.viewCount / 1_000_000).toFixed(2)
              ),
              videoId: item.id,
              thumbnail:
                item.snippet.thumbnails.medium?.url ||
                item.snippet.thumbnails.default?.url ||
                "https://via.placeholder.com/320x180",
              publishedAt: item.snippet.publishedAt,
              description: item.snippet.description,
              duration: item.contentDetails?.duration || "N/A",
              categoryId: item.snippet.categoryId,
            }))
          : [];

        const sorted = formatted.sort((a, b) => b.views - a.views);
        setTodayTrending(sorted);
      } catch (err) {
        console.error("Error fetching YouTube trending videos:", err);
        setError(err.message);

        // Fallback to mock data
        setTodayTrending(
          Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            title: `🔥 Trending Video ${i + 1} (Demo)`,
            channel: `Channel ${i + 1}`,
            views: parseFloat((Math.random() * 50 + 1).toFixed(2)),
            videoId: `dQw4w9WgXcQ`,
            thumbnail: "https://via.placeholder.com/320x180",
            publishedAt: new Date().toISOString(),
            description: `This is a demo video ${i + 1}`,
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingVideos();
  }, []);

  const getSelectedData = () => {
    const dummyThumb = "https://via.placeholder.com/320x180";
    const addThumbnails = (list) =>
      list.map((v) => ({
        ...v,
        thumbnail: v.thumbnail || dummyThumb,
      }));

    switch (selectedCategory) {
      case "today":
        return todayTrending;
      default:
        return [];
    }
  };

  // Custom function to get video metadata using YouTube API
  const getVideoMetadata = async (videoId) => {
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${CONFIG.YOUTUBE_API_KEY}`
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      return data.items[0] || null;
    } catch (err) {
      console.error("Error fetching video metadata:", err);
      return null;
    }
  };

  // Function to extract video information (metadata only)
  const handleVideoInfo = async (videoId, videoTitle) => {
    try {
      const metadata = await getVideoMetadata(videoId);

      if (metadata) {
        const videoInfo = {
          title: metadata.snippet.title,
          channel: metadata.snippet.channelTitle,
          views: parseInt(metadata.statistics.viewCount).toLocaleString(),
          likes: parseInt(metadata.statistics.likeCount || 0).toLocaleString(),
          publishedAt: new Date(
            metadata.snippet.publishedAt
          ).toLocaleDateString(),
          description: metadata.snippet.description,
          duration: metadata.contentDetails.duration,
          thumbnail:
            metadata.snippet.thumbnails.maxres?.url ||
            metadata.snippet.thumbnails.high?.url,
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        };

        // Display video information in a modal or alert
        const infoText = `
📺 Title: ${videoInfo.title}
📺 Channel: ${videoInfo.channel}
👁️ Views: ${videoInfo.views}
👍 Likes: ${videoInfo.likes}
📅 Published: ${videoInfo.publishedAt}
🔗 URL: ${videoInfo.videoUrl}
        `;

        alert(infoText);

        // You can also log to console for debugging
        console.log("Video Information:", videoInfo);

        return videoInfo;
      } else {
        alert("Could not fetch video information.");
        return null;
      }
    } catch (err) {
      console.error("Error getting video info:", err);
      alert("Error fetching video information: " + err.message);
      return null;
    }
  };

  // Function to copy video URL to clipboard
  const copyVideoURL = (videoId) => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert("Video URL copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert("Video URL copied to clipboard!");
      });
  };

  const renderTable = () => {
    const data = getSelectedData();

    if (data.length === 0) {
      return <p>No videos available for this category.</p>;
    }

    return (
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Thumbnail</th>
              <th>Video Title</th>
              <th>Channel</th>
              <th>Views (M)</th>
              <th>Published</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((video, index) => (
              <tr key={`${video.videoId}-${index}`}>
                <td>{index + 1}</td>
                <td>
                  <img
                    src={video.thumbnail}
                    alt={`${video.title} thumbnail`}
                    width="120"
                    height="68"
                    style={{ borderRadius: "4px", cursor: "pointer" }}
                    onClick={() =>
                      window.open(
                        `https://www.youtube.com/watch?v=${video.videoId}`,
                        "_blank"
                      )
                    }
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/320x180";
                    }}
                  />
                </td>
                <td>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none", color: "#1976d2" }}
                  >
                    {video.title.length > 50
                      ? `${video.title.substring(0, 50)}...`
                      : video.title}
                  </a>
                </td>
                <td>{video.channel}</td>
                <td>{video.views}</td>
                <td>
                  {video.publishedAt
                    ? new Date(video.publishedAt).toLocaleDateString()
                    : "N/A"}
                </td>
                <td>
                  <div
                    style={{
                      display: "flex",
                      gap: "4px",
                      flexDirection: "column",
                    }}
                  >
                    <button
                      onClick={() =>
                        handleVideoInfo(video.videoId, video.title)
                      }
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "11px",
                      }}
                    >
                      📊 Info
                    </button>
                    <button
                      onClick={() => copyVideoURL(video.videoId)}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#2196F3",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "11px",
                      }}
                    >
                      📋 Copy URL
                    </button>
                    <a
                      href={`https://www.youtube.com/watch?v=${video.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#ff4444",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "4px",
                        textAlign: "center",
                        fontSize: "11px",
                      }}
                    >
                      ▶ Watch
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="monetization-container">
      <h2>💸 YouTube Trending Videos Dashboard</h2>

      {error && (
        <div
          style={{
            padding: "10px",
            backgroundColor: "#ffebee",
            border: "1px solid #f44336",
            borderRadius: "4px",
            margin: "10px 0",
            color: "#c62828",
          }}
        >
          <strong>API Error:</strong> {error}
          <br />
          <small>Using demo data instead. Check your API key and quota.</small>
        </div>
      )}

      {selectedCategory === "today" && loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <p>Loading trending videos from YouTube API...</p>
        </div>
      ) : (
        renderTable()
      )}
    </div>
  );
};

export default Monetization;
