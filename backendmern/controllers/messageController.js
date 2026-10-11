import mongoose from "mongoose";

import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

export const getMessages =
  async (req, res) => {
    try {
      const { conversationId } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          conversationId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid conversation ID",
        });
      }

      const conversation =
        await Conversation.findOne({
          _id: conversationId,
          participants: req.user._id,
        });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message:
            "Conversation not found",
        });
      }

      const page = Math.max(
        Number(req.query.page) || 1,
        1
      );

      const limit = Math.min(
        Math.max(
          Number(req.query.limit) || 50,
          1
        ),
        100
      );

      const skip = (page - 1) * limit;

      const messages =
        await Message.find({
          conversation: conversationId,
        })
          .populate(
            "sender",
            "name username avatar"
          )
          .populate(
            "receiver",
            "name username avatar"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit);

      const total =
        await Message.countDocuments({
          conversation: conversationId,
        });

      res.json({
        success: true,

        messages: messages.reverse(),

        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(
            total / limit
          ),
        },
      });
    } catch (error) {
      console.error(
        "Get messages error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to fetch messages",
      });
    }
  };

export const sendMessage =
  async (req, res) => {
    try {
      const {
        conversationId,
        text,
        messageType = "text",
        attachment,
      } = req.body;

      if (!conversationId) {
        return res.status(400).json({
          success: false,
          message:
            "conversationId is required",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          conversationId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid conversation ID",
        });
      }

      if (
        messageType === "text" &&
        !text?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Message text is required",
        });
      }

      const conversation =
        await Conversation.findOne({
          _id: conversationId,
          participants: req.user._id,
        });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message:
            "Conversation not found",
        });
      }

      const receiver = conversation.participants.find(
        (participant) =>
          participant.toString() !==
          req.user._id.toString()
      );

      if (!receiver) {
        return res.status(400).json({
          success: false,
          message:
            "Receiver not found",
        });
      }

      const message =
        await Message.create({
          conversation: conversationId,

          sender: req.user._id,

          receiver,

          text:
            messageType === "text"
              ? text.trim()
              : "",

          messageType,

          attachment:
            attachment || undefined,
        });

      conversation.lastMessage =
        message._id;

      conversation.lastMessageText =
        message.text ||
        `${messageType} message`;

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

      res.status(201).json({
        success: true,
        message: populatedMessage,
      });
    } catch (error) {
      console.error(
        "Send message error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to send message",
      });
    }
  };

export const markMessagesAsRead =
  async (req, res) => {
    try {
      const { conversationId } =
        req.params;

      const result =
        await Message.updateMany(
          {
            conversation:
              conversationId,

            receiver: req.user._id,

            isRead: false,
          },
          {
            $set: {
              isRead: true,
              readAt: new Date(),
            },
          }
        );

      res.json({
        success: true,
        message:
          "Messages marked as read",

        updatedCount:
          result.modifiedCount,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          "Unable to update messages",
      });
    }
  };