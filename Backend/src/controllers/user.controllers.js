import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken'
import mongoose from "mongoose"

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave : false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Tokens")
    }
};

const registerUser = asyncHandler(async (req,res) => {
    const {email, password} = req.body;

    console.log(email)
    console.log(password)

    if([email,password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required.")
    }

    const existedUser = await User.findOne({email});

    if(existedUser){
        throw new ApiError(409,"User already exists.")
    }

    try {
        const user = await User.create({
            email,
            password
        })

        if(!user){
            throw new ApiError(500, "User Creation Failed, Please try again later")
        }

        console.log(user)

        const createdUser = await User.findById(user._id).select("-password")
        if(!createdUser){
            throw new ApiError(500, "Error reteriving saved user.")
        }

        const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(createdUser._id);

        if(!accessToken || !refreshToken){
            throw new ApiError(500, "Failed to generate Authentication Tokens.");
        }

        res.status(200).json(new ApiResponse(201,createdUser,"User created Successfully"));

    } catch (error) {
        console.error("error in registeringUser",error);
        throw new ApiError(500,"Internal Server error");
    }
});

const loginUser = asyncHandler(async(req,res) => {
    const {email,password} = req.body;

    if([email,password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required.")
    }

    const user = await User.findOne({email});

    if(!user){
        throw new ApiError(404,"Email doesn't exists.") 
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401,"Password is incorrect")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    res.status(200).json(new ApiResponse(201,loggedInUser,"User created successfully"))
})
export {
    registerUser,
    loginUser
}