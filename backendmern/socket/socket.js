import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

const onlineUsers = new Map();

export const initializeSocket = (
  io
) => {
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token;

      if (!token) {
        return next(
          new Error(
            "Authentication token required"
          )
        );
      }

      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );

      const user =
        await User.findById(decoded.id);

      if (!user) {
        return next(
          new Error("User not found")
        );
      }

      socket.user = {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
      };

      next();
    } catch (error) {
      next(
        new Error(
          "Socket authentication failed"
        )
      );
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.user.id;

    console.log(
      `User connected: ${socket.user.name}`
    );

    onlineUsers.set(userId, socket.id);

    await User.findByIdAndUpdate(
      userId,
      {
        isOnline: true,
        socketId: socket.id,
      }
    );

    socket.join(`user:${userId}`);

    io.emit("user:online", {
      userId,
    });

    socket.emit("online:users", {
      userIds: Array.from(
        onlineUsers.keys()
      ),
    });

    /* =========================
       Join Conversation
    ========================== */

    socket.on(
      "conversation:join",
      (conversationId) => {
        if (!conversationId) return;

        socket.join(
          `conversation:${conversationId}`
        );
      }
    );

    /* =========================
       Leave Conversation
    ========================== */

    socket.on(
      "conversation:leave",
      (conversationId) => {
        if (!conversationId) return;

        socket.leave(
          `conversation:${conversationId}`
        );
      }
    );

    /* =========================
       Send Message
    ========================== */

    socket.on(
      "message:send",
      async (data, callback) => {
        try {
          const {
            conversationId,
            text,
          } = data;

          if (
            !conversationId ||
            !text?.trim()
          ) {
            return callback?.({
              success: false,
              message:
                "Invalid message data",
            });
          }

          const conversation =
            await Conversation.findOne({
              _id: conversationId,
              participants: userId,
            });

          if (!conversation) {
            return callback?.({
              success: false,
              message:
                "Conversation not found",
            });
          }

          const receiver =
            conversation.participants.find(
              (participant) =>
                participant.toString() !==
                userId
            );

          if (!receiver) {
            return callback?.({
              success: false,
              message:
                "Receiver not found",
            });
          }

          const message =
            await Message.create({
              conversation:
                conversationId,

              sender: userId,

              receiver,

              text: text.trim(),

              messageType: "text",
            });

          conversation.lastMessage =
            message._id;

          conversation.lastMessageText =
            message.text;

          conversation.lastMessageAt =
            message.createdAt;

          await conversation.save();

          const populatedMessage =
            await Message.findById(
              message._id
            )
              .populate(
                "sender",
                "name username avatar"
              )
              .populate(
                "receiver",
                "name username avatar"
              );

          io.to(
            `conversation:${conversationId}`
          ).emit(
            "message:new",
            populatedMessage
          );

          io.to(
            `user:${receiver.toString()}`
          ).emit(
            "conversation:update",
            {
              conversationId,
              message:
                populatedMessage,
            }
          );

          callback?.({
            success: true,
            message:
              populatedMessage,
          });
        } catch (error) {
          console.error(
            "Socket message error:",
            error
          );

          callback?.({
            success: false,
            message:
              "Message could not be sent",
          });
        }
      }
    );

    /* =========================
       Typing Start
    ========================== */

    socket.on(
      "typing:start",
      ({ conversationId }) => {
        if (!conversationId) return;

        socket
          .to(
            `conversation:${conversationId}`
          )
          .emit("typing:start", {
            userId,
            conversationId,
          });
      }
    );

    /* =========================
       Typing Stop
    ========================== */

    socket.on(
      "typing:stop",
      ({ conversationId }) => {
        if (!conversationId) return;

        socket
          .to(
            `conversation:${conversationId}`
          )
          .emit("typing:stop", {
            userId,
            conversationId,
          });
      }
    );

    /* =========================
       Mark Read
    ========================== */

    socket.on(
      "message:read",
      async ({
        conversationId,
      }) => {
        try {
          if (!conversationId) return;

          await Message.updateMany(
            {
              conversation:
                conversationId,

              receiver: userId,

              isRead: false,
            },
            {
              $set: {
                isRead: true,
                readAt: new Date(),
              },
            }
          );

          socket
            .to(
              `conversation:${conversationId}`
            )
            .emit("message:read", {
              conversationId,
              userId,
            });
        } catch (error) {
          console.error(
            "Read message error:",
            error
          );
        }
      }
    );

    /* =========================
       Disconnect
    ========================== */

    socket.on(
      "disconnect",
      async () => {
        console.log(
          `User disconnected: ${socket.user.name}`
        );

        onlineUsers.delete(userId);

        await User.findByIdAndUpdate(
          userId,
          {
            isOnline: false,
            lastSeen: new Date(),
            socketId: null,
          }
        );

        io.emit("user:offline", {
          userId,
          lastSeen: new Date(),
        });
      }
    );
  });
};