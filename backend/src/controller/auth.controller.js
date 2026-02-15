import { generateToken } from "../lib/util.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js";
export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {

        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        //check password length must be >6 
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 character" });
        }
        //check that mail already in db
        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "Email already exists " });

        //Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        //create the new User
        const newUser = new User({
            fullName: fullName,
            email: email,
            password: hashPassword,
        }
        )

        // is user creation success
        if (newUser) {
            //generate the JWT Token
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic
            })
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }


    } catch (error) {
        console.log("Error in SignUp Controller ", error.message);
        res.status(500).json({ message: "Internal Server Error" });

    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        //check the user is alreadt in database or not
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" })

        //if user found check the password is correcr or not
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" })

        // if password correct generate the token with a response
        generateToken(user._id, res);
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic

        })

    } catch (error) {
        console.log("Error in Login Controller ", error.message);
        res.status(500).json({ message: "Internal Server Error" });

    }
}

export const logout = (req, res) => {
    //if user log out just clear the cookies
    try {
        res.cookie("jwt", "", {
            maxAge: 0
        });
        res.status(200).json({ message: "Logged Out SuccessFully! " })
    } catch (error) {
        console.log("Error  in Log out  Controller ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }

}


export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id

        if (!profilePic) {
            res.status(400).json({ message: "Profile Pic is Required" });
        }
        const uploadResponse = await cloudinary.uploader.upload(profilePic) // uplod the pic in cloudnary
        //update in database now
        const updateUser = await User.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true })
        res.status(200).json(updateUser)
    } catch (error) {
        console.log("error in upload profile pic ", error);
        res.status(500).json({ message: "Internal Server Error " })
    }
}


export const checkAuth = async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}