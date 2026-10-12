// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
// } from "react";

// import api from "../services/api";
// import {
//   getSocket,
//   connectSocket,
// } from "../services/socket";

// import { useAuth } from "./AuthContext";

// const ChatContext = createContext(null);

// export const ChatProvider = ({ children }) => {
//   const { user, token } = useAuth();

//   const [conversations, setConversations] = useState([]);
//   const [selectedConversation, setSelectedConversation] =
//     useState(null);
//   const [messages, setMessages] = useState([]);
//   const [searchResults, setSearchResults] = useState([]);
//   const [loadingConversations, setLoadingConversations] =
//     useState(false);
//   const [loadingMessages, setLoadingMessages] = useState(false);
//   const [typingUser, setTypingUser] = useState(null);
//   const [onlineUsers, setOnlineUsers] = useState([]);

//   // --------------------------------
//   // FETCH CONVERSATIONS
//   // --------------------------------

//   const fetchConversations = async () => {
//     try {
//       setLoadingConversations(true);

//       const response = await api.get(
//         "/conversations"
//       );

//       setConversations(response.data.conversations);
//     } catch (error) {
//       console.error(
//         "Fetch conversations error:",
//         error
//       );
//     } finally {
//       setLoadingConversations(false);
//     }
//   };

//   // --------------------------------
//   // SEARCH USERS
//   // --------------------------------

//   const searchUsers = async (search) => {
//     const value = search?.trim();

//     if (!value) {
//       setSearchResults([]);
//       return [];
//     }

//     try {
//       const response = await api.get(
//         `/users?search=${encodeURIComponent(value)}`
//       );

//       const users = response.data?.users || [];

//       setSearchResults(users);

//       console.log(
//         "User search results:",
//         users
//       );

//       return users;
//     } catch (error) {
//       console.error(
//         "Search users error:",
//         error
//       );

//       setSearchResults([]);

//       return [];
//     }
//   };

//   // --------------------------------
//   // CREATE / GET CONVERSATION
//   // --------------------------------

//   const createConversation = async (userId) => {
//     if (!userId) {
//       throw new Error(
//         "User ID is required."
//       );
//     }

//     try {
//       console.log(
//         "Creating conversation with user:",
//         userId
//       );

//       const response = await api.post(
//         "/conversations",
//         {
//           userId,
//         }
//       );

//       const conversation =
//         response.data?.conversation;

//       if (!conversation) {
//         throw new Error(
//           "Conversation was not returned by server."
//         );
//       }

//       console.log(
//         "Conversation created:",
//         conversation
//       );

//       setConversations((previous) => {
//         const exists = previous.some(
//           (item) =>
//             item._id?.toString() ===
//             conversation._id?.toString()
//         );

//         if (exists) {
//           return previous.map((item) =>
//             item._id?.toString() ===
//             conversation._id?.toString()
//               ? conversation
//               : item
//           );
//         }

//         return [conversation, ...previous];
//       });

//       setSelectedConversation(conversation);

//       return conversation;
//     } catch (error) {
//       console.error(
//         "Create conversation error:",
//         error
//       );

//       throw error;
//     }
//   };

//   // --------------------------------
//   // FETCH MESSAGES
//   // --------------------------------

//   const fetchMessages = async (
//     conversationId
//   ) => {
//     if (!conversationId) return [];

//     try {
//       setLoadingMessages(true);

//       const response = await api.get(
//         `/messages/${conversationId}`
//       );

//       const messageList =
//         response.data?.messages || [];

//       setMessages(messageList);

//       return messageList;
//     } catch (error) {
//       console.error(
//         "Fetch messages error:",
//         error
//       );

//       setMessages([]);

//       throw error;
//     } finally {
//       setLoadingMessages(false);
//     }
//   };

//   // --------------------------------
//   // SELECT CONVERSATION
//   // --------------------------------

//   const selectConversation = async (
//     conversation
//   ) => {
//     if (!conversation?._id) {
//       console.error(
//         "Invalid conversation:",
//         conversation
//       );

//       return;
//     }

//     setSelectedConversation(conversation);

//     setMessages([]);

//     await fetchMessages(conversation._id);

//     const socket = getSocket();

//     if (socket) {
//       socket.emit(
//         "conversation:join",
//         conversation._id.toString()
//       );
//     }

//     try {
//       await api.patch(
//         `/messages/${conversation._id}/read`
//       );
//     } catch (error) {
//       console.error(
//         "Mark read error:",
//         error
//       );
//     }
//   };

//   // --------------------------------
//   // SEND MESSAGE
//   // --------------------------------

//   const sendMessage = ({
//     conversationId,
//     text,
//   }) => {
//     return new Promise((resolve, reject) => {
//       const socket = getSocket();

//       if (!socket) {
//         reject(
//           new Error("Socket is not connected")
//         );
//         return;
//       }

//       if (!conversationId) {
//         reject(
//           new Error("Conversation ID is required")
//         );
//         return;
//       }

//       if (!text?.trim()) {
//         reject(
//           new Error("Message cannot be empty")
//         );
//         return;
//       }

//       socket.emit(
//         "message:send",
//         {
//           conversationId,
//           text: text.trim(),
//           messageType: "text",
//         },
//         (response) => {
//           if (response?.success) {
//             resolve(response.message);
//             return;
//           }

//           reject(
//             new Error(
//               response?.message ||
//                 "Message sending failed"
//             )
//           );
//         }
//       );
//     });
//   };

//   // --------------------------------
//   // TYPING
//   // --------------------------------

//   const startTyping = (conversationId) => {
//     const socket = getSocket();

//     if (!socket || !conversationId) {
//       return;
//     }

//     socket.emit("typing:start", {
//       conversationId: conversationId.toString(),
//     });
//   };

//   const stopTyping = (conversationId) => {
//     const socket = getSocket();

//     if (!socket || !conversationId) {
//       return;
//     }

//     socket.emit("typing:stop", {
//       conversationId: conversationId.toString(),
//     });
//   };

//   // --------------------------------
//   // SOCKET CONNECTION + EVENTS
//   // --------------------------------

//   useEffect(() => {
//     if (!user || !token) {
//       return;
//     }

//     const socket =
//       getSocket() || connectSocket(token);

//     if (!socket) {
//       console.error(
//         "Socket connection failed."
//       );

//       return;
//     }

//     // ------------------------------------------
//     // NEW MESSAGE
//     // ------------------------------------------

//     const handleNewMessage = (
//       message
//     ) => {
//       console.log(
//         "New socket message:",
//         message
//       );

//       const messageConversationId =
//         message?.conversation?._id ||
//         message?.conversation;

//       const selectedConversationId =
//         selectedConversation?._id;

//       const isCurrentConversation =
//         messageConversationId &&
//         selectedConversationId &&
//         messageConversationId
//           .toString() ===
//           selectedConversationId
//             .toString();

//       setMessages((previous) => {
//         const exists = previous.some(
//           (item) =>
//             item._id?.toString() ===
//             message?._id?.toString()
//         );

//         if (exists) {
//           return previous;
//         }

//         if (isCurrentConversation) {
//           return [...previous, message];
//         }

//         return previous;
//       });

//       setConversations((previous) => {
//         if (!Array.isArray(previous)) {
//           return previous;
//         }

//         const incomingId =
//           messageConversationId?.toString();

//         if (!incomingId) {
//           return previous;
//         }

//         const next = previous.map((conversation) => {
//           const conversationId =
//             conversation?._id?.toString();

//           if (conversationId !== incomingId) {
//             return conversation;
//           }

//           return {
//             ...conversation,
//             lastMessage: message,
//             lastMessageText:
//               message?.text ||
//               conversation?.lastMessageText ||
//               "New message",
//             lastMessageAt:
//               message?.createdAt ||
//               conversation?.lastMessageAt ||
//               new Date().toISOString(),
//           };
//         });

//         const exists = next.some(
//           (conversation) =>
//             conversation?._id?.toString() ===
//             incomingId
//         );

//         if (!exists) {
//           return [
//             {
//               _id: incomingId,
//               participants:
//                 message?.sender &&
//                 message?.receiver
//                   ? [
//                       message.sender,
//                       message.receiver,
//                     ]
//                   : [],
//               lastMessage: message,
//               lastMessageText:
//                 message?.text ||
//                 "New message",
//               lastMessageAt:
//                 message?.createdAt ||
//                 new Date().toISOString(),
//             },
//             ...next,
//           ];
//         }

//         return next.sort((a, b) => {
//           const timeA = new Date(
//             a?.lastMessageAt || 0
//           ).getTime();
//           const timeB = new Date(
//             b?.lastMessageAt || 0
//           ).getTime();

//           return timeB - timeA;
//         });
//       });

//       if (!isCurrentConversation) {
//         fetchConversations({ silent: true });
//       }
//     };

//     const handleConversationUpdate = (conversation) => {
//       if (!conversation) {
//         fetchConversations({ silent: true });
//         return;
//       }

//       setConversations((previous) => {
//         const incomingId = conversation?._id?.toString();

//         if (!incomingId) {
//           return previous;
//         }

//         const exists = previous.some(
//           (item) => item._id?.toString() === incomingId
//         );

//         if (!exists) {
//           return [conversation, ...previous];
//         }

//         return previous.map((item) =>
//           item._id?.toString() === incomingId ? conversation : item
//         );
//       });
//     };

//     const handleOnlineUsers = (users) => {
//       setOnlineUsers(Array.isArray(users) ? users : []);
//     };

//     const handleUserOnline = (userId) => {
//       setOnlineUsers((previous) => {
//         const users = Array.isArray(previous) ? previous : [];

//         if (users.some((id) => id?.toString() === userId?.toString())) {
//           return users;
//         }

//         return [...users, userId];
//       });
//     };

//     const handleUserOffline = (userId) => {
//       setOnlineUsers((previous) => {
//         const users = Array.isArray(previous) ? previous : [];
//         return users.filter((id) => id?.toString() !== userId?.toString());
//       });
//     };

//     const handleTypingStart = ({ conversationId, userId }) => {
//       if (
//         selectedConversation?._id?.toString() === conversationId?.toString() &&
//         userId?.toString() !== user?._id?.toString()
//       ) {
//         setTypingUser(userId);
//       }
//     };

//     const handleTypingStop = ({ conversationId }) => {
//       if (selectedConversation?._id?.toString() === conversationId?.toString()) {
//         setTypingUser(null);
//       }
//     };

//     socket.on("message:new", handleNewMessage);
//     socket.on("conversation:update", handleConversationUpdate);
//     socket.on("online:users", handleOnlineUsers);
//     socket.on("user:online", handleUserOnline);
//     socket.on("user:offline", handleUserOffline);
//     socket.on("typing:start", handleTypingStart);
//     socket.on("typing:stop", handleTypingStop);

//     return () => {
//       socket.off("message:new", handleNewMessage);
//       socket.off("conversation:update", handleConversationUpdate);
//       socket.off("online:users", handleOnlineUsers);
//       socket.off("user:online", handleUserOnline);
//       socket.off("user:offline", handleUserOffline);
//       socket.off("typing:start", handleTypingStart);
//       socket.off("typing:stop", handleTypingStop);
//     };
//   }, [user, token, selectedConversation]);

//   // --------------------------------
//   // INITIAL FETCH
//   // --------------------------------

//   useEffect(() => {
//     if (user) {
//       fetchConversations();
//     }
//   }, [user]);

//   return (
//     <ChatContext.Provider
//       value={{
//         conversations,
//         selectedConversation,
//         messages,
//         searchResults,
//         loadingConversations,
//         loadingMessages,
//         typingUser,
//         onlineUsers,

//         fetchConversations,
//         searchUsers,
//         createConversation,
//         selectConversation,
//         sendMessage,
//         startTyping,
//         stopTyping,

//         setSelectedConversation,
//       }}
//     >
//       {children}
//     </ChatContext.Provider>
//   );
// };

// export const useChat = () => {
//   const context = useContext(ChatContext);

//   if (!context) {
//     throw new Error(
//       "useChat must be used inside ChatProvider"
//     );
//   }

//   return context;
// };





import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";
import {
  getSocket,
  connectSocket,
} from "../services/socket";
import { useAuth } from "./AuthContext";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] =
    useState(null);
  const [messages, setMessages] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loadingConversations, setLoadingConversations] =
    useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // ==========================================
  // FETCH CONVERSATIONS
  // ==========================================

  const fetchConversations = async (
    options = {}
  ) => {
    const { silent = false } = options;

    try {
      if (!silent) {
        setLoadingConversations(true);
      }

      const response = await api.get(
        "/conversations"
      );

      const conversationList =
        response.data?.conversations || [];

      setConversations(conversationList);
      return conversationList;
    } catch (error) {
      console.error(
        "Fetch conversations error:",
        error
      );

      setConversations([]);
      return [];
    } finally {
      if (!silent) {
        setLoadingConversations(false);
      }
    }
  };

  // ==========================================
  // SEARCH USERS
  // ==========================================

  const searchUsers = async (search) => {
    const value = search?.trim();

    if (!value) {
      setSearchResults([]);
      return [];
    }

    try {
      const response = await api.get(
        `/users?search=${encodeURIComponent(value)}`
      );

      const users = response.data?.users || [];

      setSearchResults(users);

      console.log(
        "User search results:",
        users
      );

      return users;
    } catch (error) {
      console.error(
        "Search users error:",
        error
      );

      setSearchResults([]);

      return [];
    }
  };

  // ==========================================
  // CREATE / GET CONVERSATION
  // ==========================================

  const createConversation = async (userId) => {
    if (!userId) {
      throw new Error(
        "User ID is required."
      );
    }

    try {
      console.log(
        "Creating conversation with user:",
        userId
      );

      const response = await api.post(
        "/conversations",
        {
          userId,
        }
      );

      const conversation =
        response.data?.conversation;

      if (!conversation) {
        throw new Error(
          "Conversation was not returned by server."
        );
      }

      console.log(
        "Conversation created:",
        conversation
      );

      setConversations((previous) => {
        const exists = previous.some(
          (item) =>
            item._id?.toString() ===
            conversation._id?.toString()
        );

        if (exists) {
          return previous.map((item) =>
            item._id?.toString() ===
            conversation._id?.toString()
              ? conversation
              : item
          );
        }

        return [conversation, ...previous];
      });

      setSelectedConversation(conversation);

      return conversation;
    } catch (error) {
      console.error(
        "Create conversation error:",
        error
      );

      throw error;
    }
  };

  // ==========================================
  // FETCH MESSAGES
  // ==========================================

  const fetchMessages = async (
    conversationId
  ) => {
    if (!conversationId) return [];

    try {
      setLoadingMessages(true);

      const response = await api.get(
        `/messages/${conversationId}`
      );

      const messageList =
        response.data?.messages || [];

      setMessages(messageList);

      return messageList;
    } catch (error) {
      console.error(
        "Fetch messages error:",
        error
      );

      setMessages([]);

      throw error;
    } finally {
      setLoadingMessages(false);
    }
  };

  // ==========================================
  // SELECT CONVERSATION
  // ==========================================

  const selectConversation = async (
    conversation
  ) => {
    if (!conversation?._id) {
      console.error(
        "Invalid conversation:",
        conversation
      );

      return;
    }

    setSelectedConversation(conversation);

    setMessages([]);

    await fetchMessages(
      conversation._id
    );

    const socket = getSocket();

    if (socket) {
      socket.emit(
        "conversation:join",
        conversation._id.toString()
      );
    }

    try {
      await api.patch(
        `/messages/${conversation._id}/read`
      );
    } catch (error) {
      console.error(
        "Mark read error:",
        error
      );
    }
  };

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const sendMessage = ({
    conversationId,
    text,
  }) => {
    return new Promise((resolve, reject) => {
      const socket = getSocket();

      if (!socket) {
        reject(
          new Error("Socket is not connected.")
        );
        return;
      }

      if (!conversationId) {
        reject(
          new Error("Conversation ID is required.")
        );
        return;
      }

      if (!text?.trim()) {
        reject(
          new Error("Message cannot be empty.")
        );
        return;
      }

      socket.emit(
        "message:send",
        {
          conversationId,
          text: text.trim(),
          messageType: "text",
        },
        (response) => {
          console.log(
            "Message send response:",
            response
          );

          if (response?.success) {
            resolve(
              response.message
            );
          } else {
            reject(
              new Error(
                response?.message ||
                  "Message sending failed."
              )
            );
          }
        }
      );
    });
  };

  // ==========================================
  // TYPING START
  // ==========================================

  const startTyping = (
    conversationId
  ) => {
    const socket = getSocket();

    if (!socket || !conversationId) {
      return;
    }

    socket.emit(
      "typing:start",
      conversationId.toString()
    );
  };

  // ==========================================
  // TYPING STOP
  // ==========================================

  const stopTyping = (
    conversationId
  ) => {
    const socket = getSocket();

    if (!socket || !conversationId) {
      return;
    }

    socket.emit(
      "typing:stop",
      conversationId.toString()
    );
  };

  // ==========================================
  // SOCKET CONNECTION + EVENTS
  // ==========================================

  useEffect(() => {
    if (!user || !token) {
      return;
    }

    const socket =
      getSocket() || connectSocket(token);

    if (!socket) {
      console.error(
        "Socket connection failed."
      );

      return;
    }

    // ------------------------------------------
    // NEW MESSAGE
    // ------------------------------------------

    const handleNewMessage = (
      message
    ) => {
      console.log(
        "New socket message:",
        message
      );

      const messageConversationId =
        message?.conversation?._id ||
        message?.conversation;

      const selectedConversationId =
        selectedConversation?._id;

      const isCurrentConversation =
        messageConversationId &&
        selectedConversationId &&
        messageConversationId.toString() ===
          selectedConversationId.toString();

      setMessages((previous) => {
        const exists = previous.some(
          (item) =>
            item._id?.toString() ===
            message?._id?.toString()
        );

        if (exists) {
          return previous;
        }

        if (isCurrentConversation) {
          return [...previous, message];
        }

        return previous;
      });

      setConversations((previous) => {
        if (!Array.isArray(previous)) {
          return previous;
        }

        const incomingId =
          messageConversationId?.toString();

        if (!incomingId) {
          return previous;
        }

        const next = previous.map((conversation) => {
          const conversationId =
            conversation?._id?.toString();

          if (conversationId !== incomingId) {
            return conversation;
          }

          return {
            ...conversation,
            lastMessage: message,
            lastMessageText:
              message?.text ||
              conversation?.lastMessageText ||
              "New message",
            lastMessageAt:
              message?.createdAt ||
              conversation?.lastMessageAt ||
              new Date().toISOString(),
          };
        });

        const exists = next.some(
          (conversation) =>
            conversation?._id?.toString() ===
            incomingId
        );

        if (!exists) {
          return [
            {
              _id: incomingId,
              participants:
                message?.sender &&
                message?.receiver
                  ? [
                      message.sender,
                      message.receiver,
                    ]
                  : [],
              lastMessage: message,
              lastMessageText:
                message?.text ||
                "New message",
              lastMessageAt:
                message?.createdAt ||
                new Date().toISOString(),
            },
            ...next,
          ];
        }

        return next.sort((a, b) => {
          const timeA = new Date(
            a?.lastMessageAt || 0
          ).getTime();
          const timeB = new Date(
            b?.lastMessageAt || 0
          ).getTime();

          return timeB - timeA;
        });
      });

      if (!isCurrentConversation) {
        fetchConversations({ silent: true });
      }
    };

    const handleConversationUpdate = (conversation) => {
      if (!conversation) {
        fetchConversations({ silent: true });
        return;
      }

      setConversations((previous) => {
        const incomingId = conversation?._id?.toString();

        if (!incomingId) {
          return previous;
        }

        const exists = previous.some(
          (item) => item._id?.toString() === incomingId
        );

        if (!exists) {
          return [conversation, ...previous];
        }

        return previous.map((item) =>
          item._id?.toString() === incomingId ? conversation : item
        );
      });
    };

    const handleOnlineUsers = (users) => {
      setOnlineUsers(Array.isArray(users) ? users : []);
    };

    const handleUserOnline = (userId) => {
      setOnlineUsers((previous) => {
        const users = Array.isArray(previous) ? previous : [];

        if (users.some((id) => id?.toString() === userId?.toString())) {
          return users;
        }

        return [...users, userId];
      });
    };

    const handleUserOffline = (userId) => {
      setOnlineUsers((previous) => {
        const users = Array.isArray(previous) ? previous : [];
        return users.filter((id) => id?.toString() !== userId?.toString());
      });
    };

    const handleTypingStart = ({ conversationId, userId }) => {
      if (
        selectedConversation?._id?.toString() === conversationId?.toString() &&
        userId?.toString() !== user?._id?.toString()
      ) {
        setTypingUser(userId);
      }
    };

    const handleTypingStop = ({ conversationId }) => {
      if (selectedConversation?._id?.toString() === conversationId?.toString()) {
        setTypingUser(null);
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("conversation:update", handleConversationUpdate);
    socket.on("online:users", handleOnlineUsers);
    socket.on("user:online", handleUserOnline);
    socket.on("user:offline", handleUserOffline);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("conversation:update", handleConversationUpdate);
      socket.off("online:users", handleOnlineUsers);
      socket.off("user:online", handleUserOnline);
      socket.off("user:offline", handleUserOffline);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
    };
  }, [user, token, selectedConversation]);

  // --------------------------------
  // INITIAL FETCH
  // --------------------------------

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        selectedConversation,
        messages,
        searchResults,
        loadingConversations,
        loadingMessages,
        typingUser,
        onlineUsers,

        fetchConversations,
        searchUsers,
        createConversation,
        selectConversation,
        sendMessage,
        startTyping,
        stopTyping,

        setSelectedConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChat must be used inside ChatProvider");
  }

  return context;
};
