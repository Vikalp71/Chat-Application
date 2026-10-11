import { useEffect, useRef } from "react";
import { CheckCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function MessageList({ messages = [] }) {
  const { user } = useAuth();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const getId = (value) => {
    if (!value) return "";
    return String(value._id || value.id || value);
  };

  const formatTime = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="messages-container">
      <div className="date-divider">
        <span>Messages</span>
      </div>

      {messages.length === 0 ? (
        <div className="no-results">
          <p>No messages yet. Say hello!</p>
        </div>
      ) : (
        messages.map((message, index) => {
          const senderId = getId(message.sender);
          const currentUserId = getId(user);

          const isMine =
            senderId !== "" &&
            currentUserId !== "" &&
            senderId === currentUserId;

          return (
            <div
              key={message._id || message.id || index}
              className={`message-row ${
                isMine ? "message-row-mine" : ""
              }`}
            >
              <div
                className={`message-bubble ${
                  isMine
                    ? "message-mine"
                    : "message-other"
                }`}
              >
                {message.messageType === "text" ||
                !message.messageType ? (
                  <p>{message.text}</p>
                ) : (
                  <p>{message.text || "Unsupported message type"}</p>
                )}

                <div className="message-meta">
                  <span>
                    {formatTime(
                      message.createdAt || message.time
                    )}
                  </span>

                  {isMine && message.isRead && (
                    <CheckCheck
                      size={14}
                      className="message-check"
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      <div ref={bottomRef} />
    </div>
  );
}

export default MessageList;