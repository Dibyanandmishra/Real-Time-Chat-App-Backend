import mongoose from "mongoose"
import { Message } from "../models/message.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

export const sendMessage = asyncHandler(async (req, res) => {
  const senderId = req.user._id
  const { receiverId, content } = req.body

  if (!receiverId || !content) {
    throw new ApiError(400, "Receiver and content are required")
  }

  if (!mongoose.Types.ObjectId.isValid(receiverId)) {
    throw new ApiError(400, "Invalid receiver id")
  }

  const message = await Message.create({
    sender: senderId,
    receiver: receiverId,
    content,
  })

  return res
    .status(201)
    .json(new ApiResponse(201, message, "Message sent successfully"))
})

export const getMessages = asyncHandler(async (req, res) => {
  const loggedInUserId = req.user._id
  const { userId } = req.params

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user id")
  }

  const messages = await Message.find({
    $or: [
      { sender: loggedInUserId, receiver: userId },
      { sender: userId, receiver: loggedInUserId },
    ],
  })
    .sort({ createdAt: 1 }) 
    .populate("sender", "name email")
    .populate("receiver", "name email")

  return res
    .status(200)
    .json(new ApiResponse(200, messages, "Messages fetched successfully"))
})
