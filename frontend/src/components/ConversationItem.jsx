import { CheckCheck } from "lucide-react";

function ConversationItem({
  conversation,
  active,
  onClick,
}) {
  return (
    <div
      className={`conversation-item ${
        active ? "conversation-active" : ""
      }`}
      onClick={onClick}
    >
      <div className="avatar-wrapper">
        <img
          src={
            conversation.avatar ||
            "https://ui-avatars.com/api/?name=" +
              encodeURIComponent(
                conversation.name ||
                  conversation.username ||
                  "User"
              ) +
              "&background=E2E8F0&color=1F2937"
          }
          alt={conversation.name}
          className="conversation-avatar"
        />

        {conversation.status === "Online" && (
          <span className="online-dot"></span>
        )}
      </div>

      <div className="conversation-content">
        <div className="conversation-top">
          <h4>{conversation.name}</h4>

          <span className="conversation-time">
            {conversation.time}
          </span>
        </div>

        <div className="conversation-bottom">
          <p>
            {conversation.lastMessageText}
          </p>

          {conversation.unread > 0 && (
            <span className="unread-count">
              {conversation.unread}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConversationItem;