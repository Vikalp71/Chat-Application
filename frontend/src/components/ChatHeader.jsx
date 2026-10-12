import {
  Phone,
  Video,
  Search,
  MoreVertical,
} from "lucide-react";

function ChatHeader({ user }) {
  return (
    <header className="chat-header">

      <div className="chat-user-info">

        <div className="chat-avatar-wrapper">
          <img
            src={
              user?.avatar ||
              "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(
                  user?.name ||
                    user?.username ||
                    "User"
                ) +
                "&background=E2E8F0&color=1F2937"
            }
            alt={user?.name || "User"}
            className="chat-avatar"
          />

          {user.status === "Online" && (
            <span className="online-dot"></span>
          )}
        </div>

        <div>
          <h3>{user.name}</h3>

          <p>
            {user.status === "Online"
              ? "Active now"
              : `Last seen ${user.lastSeen}`}
          </p>
        </div>
      </div>

      <div className="chat-actions">

        <button className="chat-action-button">
          <Search size={20} />
        </button>

        <button className="chat-action-button">
          <Phone size={20} />
        </button>

        <button className="chat-action-button">
          <Video size={20} />
        </button>

        <button className="chat-action-button">
          <MoreVertical size={20} />
        </button>

      </div>
    </header>
  );
}

export default ChatHeader;