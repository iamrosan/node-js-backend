import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { cloudinaryUpload } from "../utils/cloudinaryFileHandling.js";
import { ApiResponse } from "../utils/apiResponse.js";

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
  console.log(username);
  if (
    [username, email, fullname, password].some(
      (curElem) => curElem?.trim() === "",
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  const avatarFilePath = req.files?.avatar[0]?.path;
  const coverImgFilePath = req.files?.coverImage[0]?.path;

  if (!avatarFilePath) {
    throw new ApiError(400, "Avatar File is Required");
  }

  const avatar = await cloudinaryUpload(avatarFilePath);
  const coverImg = await avatarFilePath(coverImgFilePath);

  if (!avatar) {
    throw new ApiError(400, "Avatar File is Required");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullname,
    password,
    avatar: avatar.url,
    coverImg: coverImg?.url || "",
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

export { registerUser };
