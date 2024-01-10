import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { cloudinaryUpload } from "../utils/cloudinaryFileHandling.js";
import { ApiResponse } from "../utils/apiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token",
    );
  }
};
const registerUser = asyncHandler(async (req, res) => {
  /*
  1. geting user details from frontend
  2. validation : not empty
  3. check if user is already existed ; username, email
  4. check for images, check for avatar
  5. upload them to cloudinary
  6. create user object - create entry in db
  7. remove password and refresh token field from response
  8. check for user creation
  9. return res
  */

  const { username, email, fullname, password } = req.body;
  console.log("username", username);
  if (
    [username, email, fullname, password].some(
      (curElem) => curElem?.trim() === "",
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  const avatarFilePath = req.files?.avatar[0]?.path;
  console.log("avatarpath", avatarFilePath);
  const coverImgFilePath = req.files?.coverImage[0]?.path;

  if (!avatarFilePath) {
    throw new ApiError(400, "Avatar File is Required");
  }

  const avatar = await cloudinaryUpload(avatarFilePath);
  console.log("avara", avatar);
  const coverImg = await cloudinaryUpload(coverImgFilePath);

  if (!avatar) {
    throw new ApiError(400, "Avatar File is Required");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullname,
    password,
    avatar: avatar.url,
    coverImage: coverImg?.url || "",
  });

  const isUserCreated = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!isUserCreated) {
    throw new ApiError(500, "Something went wrong while creating user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, isUserCreated, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  /* 
1. user data from req.body
2. login with username, email
3. find user
4. check password
5. generate access and refresh token
6. send cookies
*/
  const { email, username, password } = req.body;
  if (!(email || username)) {
    throw new ApiError(400, "email or username is required");
  }

  const user = awaitUser.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(400, "User not Found");
  }

  const isValidPassword = awaituser.isPasswordCorrect(password);

  if (!isValidPassword) {
    throw new ApiError(400, "Invalid Password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const user = req.user;
  await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    },
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
