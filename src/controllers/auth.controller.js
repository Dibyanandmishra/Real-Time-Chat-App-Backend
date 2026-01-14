import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required")
  }

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new ApiError(409, "User already exists with this email")
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  })

  const safeUser = await User.findById(user._id).select("-password")

  return res
    .status(201)
    .json(new ApiResponse(201, safeUser, "User registered successfully"))
})

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required")
  }

  const user = await User.findOne({ email })
  if (!user) {
    throw new ApiError(401, "Invalid email or password")
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password)
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password")
  }

  const token = jwt.sign(
    { _id: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
  )

  const safeUser = await User.findById(user._id).select("-password")

  return res
    .status(200)
    .json(
      new ApiResponse(200, { user: safeUser, token }, "Login successful")
    )
})
