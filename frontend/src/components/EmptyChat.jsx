import { MessageCircle } from "lucide-react";

function EmptyChat() {
  return (
    <div className="empty-chat">

      <div className="empty-chat-icon">
        <MessageCircle size={42} />
      </div>

      <h2>Welcome to ChatFlow</h2>

      <p>
        Select a conversation from the sidebar
        to start chatting.
      </p>

      <span>
        Your messages are private and secure.
      </span>

    </div>
  );
}

export default EmptyChat;