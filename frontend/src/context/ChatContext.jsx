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

//   const [searchResults, setSearchResults] =
//     useState([]);

//   const [loadingConversations, setLoadingConversations] =
//     useState(false);

//   const [loadingMessages, setLoadingMessages] =
//     useState(false);

//   const [typingUser, setTypingUser] =
//     useState(null);

//   const [onlineUsers, setOnlineUsers] =
//     useState([]);

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
//     if (!search.trim()) {
//       setSearchResults([]);
//       return;
//     }

//     try {
//       const response = await api.get(
//         `/users?search=${encodeURIComponent(search)}`
//       );

//       setSearchResults(response.data.users);
//     } catch (error) {
//       console.error(
//         "Search users error:",
//         error
//       );
//     }
//   };

//   // --------------------------------
//   // CREATE / GET CONVERSATION
//   // --------------------------------

//   const createConversation = async (userId) => {
//     try {
//       const response = await api.post(
//         "/conversations",
//         {
//           userId,
//         }
//       );

//       const conversation =
//         response.data.conversation;

//       setConversations((prev) => {
//         const exists = prev.find(
//           (item) => item._id === conversation._id
//         );

//         if (exists) {
//           return prev;
//         }

//         return [conversation, ...prev];
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
//     if (!conversationId) return;

//     try {
//       setLoadingMessages(true);

//       const response = await api.get(
//         `/messages/${conversationId}`
//       );

//       setMessages(response.data.messages);
//     } catch (error) {
//       console.error(
//         "Fetch messages error:",
//         error
//       );

//       setMessages([]);
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
//     setSelectedConversation(conversation);

//     setMessages([]);

//     await fetchMessages(conversation._id);

//     const socket = getSocket();

//     if (socket) {
//       socket.emit(
//         "conversation:join",
//         conversation._id
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

//       socket.emit(
//         "message:send",
//         {
//           conversationId,
//           text,
//           messageType: "text",
//         },
//         (response) => {
//           if (response?.success) {
//             resolve(response.message);
//           } else {
//             reject(
//               new Error(
//                 response?.message ||
//                   "Message sending failed"
//               )
//             );
//           }
//         }
//       );
//     });
//   };

//   // --------------------------------
//   // TYPING
//   // --------------------------------

//   const startTyping = (conversationId) => {
//     const socket = getSocket();

//     if (!socket) return;

//     socket.emit(
//       "typing:start",
//       conversationId
//     );
//   };

//   const stopTyping = (conversationId) => {
//     const socket = getSocket();

//     if (!socket) return;

//     socket.emit(
//       "typing:stop",
//       conversationId
//     );
//   };

//   // --------------------------------
//   // SOCKET EVENTS
//   // --------------------------------

//   useEffect(() => {
//     if (!user || !token) return;

//     const socket =
//       getSocket() || connectSocket(token);

//     if (!socket) return;

//     const handleNewMessage = (message) => {
//       setMessages((prev) => {
//         const exists = prev.some(
//           (item) => item._id === message._id
//         );

//         if (exists) {
//           return prev;
//         }

//         if (
//           selectedConversation &&
//           message.conversation ===
//             selectedConversation._id
//         ) {
//           return [...prev, message];
//         }

//         return prev;
//       });

//       fetchConversations();
//     };

//     const handleConversationUpdate = () => {
//       fetchConversations();
//     };

//     const handleOnlineUsers = (users) => {
//       setOnlineUsers(users);
//     };

//     // const handleUserOnline = (userId) => {
//     //   setOnlineUsers((prev) => {
//     //     if (prev.includes(userId)) {
//     //       return prev;
//     //     }

//     //     return [...prev, userId];
//     //   });
//     // };


//     const handleUserOnline = (userId) => {
//   setOnlineUsers((prev) => {
//     // Ensure previous state is an array
//     const users = Array.isArray(prev) ? prev : [];

//     // Avoid duplicate user IDs
//     if (users.includes(userId)) {
//       return users;
//     }

//     return [...users, userId];
//   });
// };

//     const handleUserOffline = (userId) => {
//       setOnlineUsers((prev) =>
//         prev.filter((id) => id !== userId)
//       );
//     };

//     const handleTypingStart = ({
//       conversationId,
//       userId,
//     }) => {
//       if (
//         selectedConversation?._id ===
//         conversationId &&
//         userId !== user._id
//       ) {
//         setTypingUser(userId);
//       }
//     };

//     const handleTypingStop = ({
//       conversationId,
//     }) => {
//       if (
//         selectedConversation?._id ===
//         conversationId
//       ) {
//         setTypingUser(null);
//       }
//     };

//     socket.on(
//       "message:new",
//       handleNewMessage
//     );

//     socket.on(
//       "conversation:update",
//       handleConversationUpdate
//     );

//     socket.on(
//       "online:users",
//       handleOnlineUsers
//     );

//     socket.on(
//       "user:online",
//       handleUserOnline
//     );

//     socket.on(
//       "user:offline",
//       handleUserOffline
//     );

//     socket.on(
//       "typing:start",
//       handleTypingStart
//     );

//     socket.on(
//       "typing:stop",
//       handleTypingStop
//     );

//     return () => {
//       socket.off(
//         "message:new",
//         handleNewMessage
//       );

//       socket.off(
//         "conversation:update",
//         handleConversationUpdate
//       );

//       socket.off(
//         "online:users",
//         handleOnlineUsers
//       );

//       socket.off(
//         "user:online",
//         handleUserOnline
//       );

//       socket.off(
//         "user:offline",
//         handleUserOffline
//       );

//       socket.off(
//         "typing:start",
//         handleTypingStart
//       );

//       socket.off(
//         "typing:stop",
//         handleTypingStop
//       );
//     };
//   }, [
//     user,
//     token,
//     selectedConversation,
//   ]);

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

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [typingUser, setTypingUser] = useState(null);

  const [onlineUsers, setOnlineUsers] = useState([]);

  // ==========================================
  // FETCH CONVERSATIONS
  // ==========================================

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);

      const response = await api.get(
        "/conversations"
      );

      const conversationList =
        response.data?.conversations || [];

      setConversations(conversationList);
    } catch (error) {
      console.error(
        "Fetch conversations error:",
        error
      );

      setConversations([]);
    } finally {
      setLoadingConversations(false);
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
    if (!conversationId) {
      return;
    }

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
    return new Promise(
      (resolve, reject) => {
        const socket = getSocket();

        if (!socket) {
          reject(
            new Error(
              "Socket is not connected."
            )
          );

          return;
        }

        if (!conversationId) {
          reject(
            new Error(
              "Conversation ID is required."
            )
          );

          return;
        }

        if (!text?.trim()) {
          reject(
            new Error(
              "Message cannot be empty."
            )
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
      }
    );
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
        messageConversationId
          .toString() ===
          selectedConversationId
            .toString();

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
          return [
            ...previous,
            message,
          ];
        }

        return previous;
      });

      fetchConversations();
    };

    // ------------------------------------------
    // CONVERSATION UPDATE
    // ------------------------------------------

    const handleConversationUpdate = (
      conversation
    ) => {
      console.log(
        "Conversation updated:",
        conversation
      );

      fetchConversations();
    };

    // ------------------------------------------
    // ONLINE USERS
    // ------------------------------------------

    const handleOnlineUsers = (
      users
    ) => {
      setOnlineUsers(
        Array.isArray(users)
          ? users
          : []
      );
    };

    // ------------------------------------------
    // USER ONLINE
    // ------------------------------------------

    const handleUserOnline = (
      userId
    ) => {
      setOnlineUsers((previous) => {
        const users = Array.isArray(
          previous
        )
          ? previous
          : [];

        const exists = users.some(
          (id) =>
            id?.toString() ===
            userId?.toString()
        );

        if (exists) {
          return users;
        }

        return [
          ...users,
          userId,
        ];
      });
    };

    // ------------------------------------------
    // USER OFFLINE
    // ------------------------------------------

    const handleUserOffline = (
      userId
    ) => {
      setOnlineUsers((previous) => {
        const users = Array.isArray(
          previous
        )
          ? previous
          : [];

        return users.filter(
          (id) =>
            id?.toString() !==
            userId?.toString()
        );
      });
    };

    // ------------------------------------------
    // TYPING START
    // ------------------------------------------

    const handleTypingStart = ({
      conversationId,
      userId,
    }) => {
      if (
        selectedConversation?._id
          ?.toString() ===
          conversationId?.toString() &&
        userId?.toString() !==
          user?._id?.toString()
      ) {
        setTypingUser(userId);
      }
    };

    // ------------------------------------------
    // TYPING STOP
    // ------------------------------------------

    const handleTypingStop = ({
      conversationId,
    }) => {
      if (
        selectedConversation?._id
          ?.toString() ===
        conversationId?.toString()
      ) {
        setTypingUser(null);
      }
    };

    // ------------------------------------------
    // REGISTER SOCKET EVENTS
    // ------------------------------------------

    socket.on(
      "message:new",
      handleNewMessage
    );

    socket.on(
      "conversation:update",
      handleConversationUpdate
    );

    socket.on(
      "online:users",
      handleOnlineUsers
    );

    socket.on(
      "user:online",
      handleUserOnline
    );

    socket.on(
      "user:offline",
      handleUserOffline
    );

    socket.on(
      "typing:start",
      handleTypingStart
    );

    socket.on(
      "typing:stop",
      handleTypingStop
    );

    // ------------------------------------------
    // CLEANUP
    // ------------------------------------------

    return () => {
      socket.off(
        "message:new",
        handleNewMessage
      );

      socket.off(
        "conversation:update",
        handleConversationUpdate
      );

      socket.off(
        "online:users",
        handleOnlineUsers
      );

      socket.off(
        "user:online",
        handleUserOnline
      );

      socket.off(
        "user:offline",
        handleUserOffline
      );

      socket.off(
        "typing:start",
        handleTypingStart
      );

      socket.off(
        "typing:stop",
        handleTypingStop
      );
    };
  }, [
    user,
    token,
    selectedConversation,
  ]);

  // ==========================================
  // INITIAL FETCH
  // ==========================================

  useEffect(() => {
    if (!user) {
      return;
    }

    fetchConversations();
  }, [user]);

  // ==========================================
  // CONTEXT
  // ==========================================

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

// ==========================================
// USE CHAT HOOK
// ==========================================

export const useChat = () => {
  const context =
    useContext(ChatContext);

  if (!context) {
    throw new Error(
      "useChat must be used inside ChatProvider"
    );
  }

  return context;
};
