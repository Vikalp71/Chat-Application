import { useState } from "react";
import {
  Search,
  MessageCircle,
  MoreVertical,
  LogOut,
  Settings,
  UserPlus,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import ConversationItem from "./ConversationItem";
import { useAuth } from "../context/AuthContext";

function Sidebar({
  conversations = [],
  activeUserId,
  onSelectConversation,
  onSearchUsers,
  searchResults = [],
  onNewChat,
}) {
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const filteredConversations = conversations.filter((conversation) =>
    (conversation.name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleSearch = (value) => {
    setSearch(value);

    if (onSearchUsers) {
      onSearchUsers(value);
    }
  };

  const handleNewChat = () => {
    setShowSearch(true);
    setSearch("");

    if (onNewChat) {
      onNewChat();
    }
  };

  const handleSelectUser = async (selectedUser) => {
    if (!selectedUser?._id) {
      console.error("Selected user does not have _id:", selectedUser);
      return;
    }

    console.log("Starting conversation with:", selectedUser);

    if (onNewChat) {
      await onNewChat(selectedUser);
    }

    setShowSearch(false);
    setSearch("");
  };

  return (
    <aside className="sidebar">
      {/* HEADER */}
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-icon">
            <MessageCircle size={22} />
          </div>

          <div>
            <h2>ChatFlow</h2>
            <span>Messages</span>
          </div>
        </div>

        <button
          type="button"
          className="icon-button"
          aria-label="More options"
        >
          <MoreVertical size={20} />
        </button>
      </div>

      {/* PROFILE */}
      <div className="profile-card">
        <div className="profile-avatar-wrapper">
          <img
            src={
              user?.avatar ||
              "https://i.pravatar.cc/150?img=12"
            }
            alt={user?.name || "Profile"}
            className="profile-avatar"
          />

          <span className="profile-online" />
        </div>

        <div className="profile-info">
          <h3>{user?.name || "My Profile"}</h3>

          <p>
            {user?.username
              ? `@${user.username}`
              : user?.email || "My account"}
          </p>
        </div>

        <button
          type="button"
          className="icon-button"
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* SEARCH */}
      <div className="search-container">
        <Search size={18} />

        <input
          type="text"
          placeholder={
            showSearch
              ? "Search users..."
              : "Search conversations..."
          }
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />

        {search && (
          <button
            type="button"
            className="icon-button"
            aria-label="Clear search"
            onClick={() => handleSearch("")}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* MESSAGE HEADING */}
      <div className="conversation-heading">
        <div>
          <span>
            {showSearch ? "Start New Chat" : "Messages"}
          </span>

          <small>
            {showSearch
              ? searchResults.length
              : filteredConversations.length}
          </small>
        </div>

        <button
          type="button"
          className="new-chat-button"
          aria-label="Start new chat"
          onClick={handleNewChat}
        >
          <UserPlus size={17} />
        </button>
      </div>

      {/* USER SEARCH RESULTS */}
      {showSearch ? (
        <div className="conversation-list">
          {searchResults.length > 0 ? (
            searchResults.map((searchUser) => (
              <button
                key={searchUser._id}
                type="button"
                className="user-search-item"
                onClick={() => handleSelectUser(searchUser)}
              >
                <div className="profile-avatar-wrapper">
                  <img
                    src={
                      searchUser.avatar ||
                      "https://i.pravatar.cc/150?img=12"
                    }
                    alt={searchUser.name}
                    className="profile-avatar"
                  />

                  <span className="profile-online" />
                </div>

                <div className="profile-info">
                  <h3>{searchUser.name}</h3>

                  <p>
                    {searchUser.username
                      ? `@${searchUser.username}`
                      : searchUser.email}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="no-results">
              <Search size={28} />

              <p>
                {search
                  ? "No users found"
                  : "Search for a user to start a new conversation."}
              </p>
            </div>
          )}

          <button
            type="button"
            className="footer-action"
            onClick={() => {
              setShowSearch(false);
              setSearch("");
            }}
          >
            <X size={18} />
            Close Search
          </button>
        </div>
      ) : (
        /* EXISTING CONVERSATIONS */
        <div className="conversation-list">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id || conversation._id}
                conversation={conversation}
                active={
                  activeUserId === conversation.userId
                }
                onClick={() =>
                  onSelectConversation(
                    conversation.userId
                  )
                }
              />
            ))
          ) : (
            <div className="no-results">
              <Search size={28} />

              <p>No conversations found</p>
            </div>
          )}
        </div>
      )}

      {/* HINT */}
      {/* {!showSearch && (
        <p className="sidebar-hint">
          Click + to search for a user and start a new
          conversation.
        </p>
      )} */}

      {/* FOOTER */}
      <div className="sidebar-footer">
        <button
          type="button"
          className="footer-action"
          onClick={() => {
            if (onNewChat) {
              onNewChat();
            }
          }}
        >
          <Settings size={18} />
          Settings
        </button>

        <button
          type="button"
          className="footer-action logout"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
