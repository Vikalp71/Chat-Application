import { useState } from "react";
import {
  Paperclip,
  Smile,
  Mic,
  Send,
} from "lucide-react";

function MessageInput({ onSend }) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    onSend(message.trim());
    setMessage("");
  };

  return (
    <form
      className="message-input-wrapper"
      onSubmit={handleSubmit}
    >
      <button
        type="button"
        className="input-icon-button"
      >
        <Paperclip size={21} />
      </button>

      <input
        type="text"
        placeholder="Write a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        type="button"
        className="input-icon-button"
      >
        <Smile size={21} />
      </button>

      {message.trim() ? (
        <button
          type="submit"
          className="send-button"
        >
          <Send size={19} />
        </button>
      ) : (
        <button
          type="button"
          className="input-icon-button"
        >
          <Mic size={21} />
        </button>
      )}
    </form>
  );
}

export default MessageInput;