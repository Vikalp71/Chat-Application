import mongoose from "mongoose";

import Conversation from "../models/Conversation.js";
import User from "../models/User.js";

export const createOrGetConversation =
  async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "userId is required",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(userId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid userId",
        });
      }

      if (
        req.user._id.toString() === userId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot create a conversation with yourself",
        });
      }

      const otherUser =
        await User.findById(userId);

      if (!otherUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      let conversation =
        await Conversation.findOne({
          participants: {
            $all: [
              req.user._id,
              userId,
            ],
          },

          $expr: {
            $eq: [
              {
                $size: "$participants",
              },
              2,
            ],
          },
        })
          .populate(
            "participants",
            "name username email avatar bio isOnline lastSeen"
          )
          .populate(
            "lastMessage",
            "sender receiver text messageType createdAt isRead"
          );

      if (!conversation) {
        conversation =
          await Conversation.create({
            participants: [
              req.user._id,
              userId,
            ],
          });

        conversation =
          await Conversation.findById(
            conversation._id
          ).populate(
            "participants",
            "name username email avatar bio isOnline lastSeen"
          );
      }

      res.status(200).json({
        success: true,
        conversation,
      });
    } catch (error) {
      console.error(
        "Conversation error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to create conversation",
      });
    }
  };

export const getConversations =
  async (req, res) => {
    try {
      const conversations =
        await Conversation.find({
          participants: req.user._id,
        })
          .populate(
            "participants",
            "name username email avatar bio isOnline lastSeen"
          )
          .populate(
            "lastMessage",
            "sender receiver text messageType createdAt isRead"
          )
          .sort({
            lastMessageAt: -1,
          });

      res.json({
        success: true,
        conversations,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Unable to fetch conversations",
      });
    }
  };