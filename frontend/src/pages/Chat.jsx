import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import EmptyChat from "../components/EmptyChat";

import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";

function Chat() {
  const { user } = useAuth();

  const {
    conversations,
    selectedConversation,
    messages,
    searchResults,
    loadingConversations,
    loadingMessages,

    selectConversation,
    sendMessage,
    fetchConversations,
    searchUsers,
    createConversation,
  } = useChat();

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const getUserId = (value) => {
    if (!value) return "";

    if (typeof value === "object") {
      return String(
        value._id || value.id || value.userId || ""
      );
    }

    return String(value);
  };

  const getUserName = (value, fallback = "User") => {
    if (!value) return fallback;

    if (typeof value === "string") {
      return value || fallback;
    }

    return (
      value.name ||
      value.username ||
      value.email ||
      fallback
    );
  };

  // Find the other participant
  const activeUser = useMemo(() => {
    if (!selectedConversation) {
      return null;
    }

    const currentUserId = getUserId(user);
    const participants =
      selectedConversation.participants || [];

    const otherParticipant =
      participants.find((participant) => {
        const participantId = getUserId(participant);

        return (
          participantId &&
          currentUserId &&
          participantId.toString() !==
            currentUserId.toString()
        );
      }) ||
      participants.find((participant) => {
        const participantName = getUserName(
          participant,
          ""
        );
        const currentUserName = getUserName(
          user,
          ""
        );

        return (
          participantName &&
          currentUserName &&
          participantName.toLowerCase() !==
            currentUserName.toLowerCase()
        );
      }) ||
      participants[0] ||
      null;

    return otherParticipant;
  }, [selectedConversation, user]);

  // Load conversations when Chat page opens
  useEffect(() => {
    fetchConversations();
  }, []);

  // Automatically select first conversation
  useEffect(() => {
    if (
      !selectedConversation &&
      conversations.length > 0
    ) {
      selectConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  // Select existing conversation
  const handleSelectConversation = async (
    conversation
  ) => {
    setError("");

    try {
      await selectConversation(conversation);
    } catch (err) {
      console.error(
        "Select conversation failed:",
        err
      );

      setError(
        "Unable to load this conversation."
      );
    }
  };

  // Search users
  const handleSearchUsers = async (value) => {
    try {
      await searchUsers(value);
    } catch (err) {
      console.error(
        "User search failed:",
        err
      );
    }
  };

  // Start a new conversation
  const handleNewChat = async (selectedUser) => {
    // If no user is passed, Sidebar only opens search mode.
    if (!selectedUser) {
      return;
    }

    setError("");

    try {
      console.log(
        "Creating conversation with:",
        selectedUser
      );

      const newConversation =
        await createConversation(
          selectedUser._id
        );

      console.log(
        "Created conversation:",
        newConversation
      );

      if (!newConversation) {
        throw new Error(
          "Conversation was not created."
        );
      }

      // Refresh sidebar conversations
      await fetchConversations();

      // Select newly created conversation
      await selectConversation(
        newConversation
      );
    } catch (err) {
      console.error(
        "Create conversation failed:",
        err
      );

      setError(
        err.message ||
          "Unable to start new conversation."
      );
    }
  };

  // Send message
  const handleSendMessage = async (text) => {
    const cleanText = text?.trim();

    if (
      !cleanText ||
      !selectedConversation ||
      sending
    ) {
      return;
    }

    setError("");
    setSending(true);

    try {
      await sendMessage({
        conversationId:
          selectedConversation._id,
        text: cleanText,
      });

      // Message is updated in real time via socket; avoid re-fetching
      // the whole conversation list here because it triggers the loading state.
    } catch (err) {
      console.error(
        "Send message failed:",
        err
      );

      setError(
        err.message ||
          "Message could not be sent."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-app">
      <Sidebar
        conversations={conversations}
        activeUserId={activeUser?._id}
        onSelectConversation={
          handleSelectConversation
        }
        onSearchUsers={handleSearchUsers}
        searchResults={searchResults}
        onNewChat={handleNewChat}
      />

      <main className="chat-main">
        {selectedConversation && activeUser ? (
          <>
            <ChatHeader user={activeUser} />

            {error && (
              <div
                className="chat-error"
                role="alert"
              >
                {error}
              </div>
            )}

            {loadingMessages ? (
              <div className="chat-loading">
                Loading messages...
              </div>
            ) : (
              <MessageList
                messages={messages}
              />
            )}

            <MessageInput
              onSend={handleSendMessage}
            />
          </>
        ) : (
          <EmptyChat />
        )}
      </main>
    </div>
  );
}

export default Chat;
