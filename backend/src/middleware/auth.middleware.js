import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

export const protectRoute = async (req, res, next) => {
    try {

        const token = req.cookies.jwt

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No Token Provided" });
        }
        //check weather the token is valid or not
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }

        //if toekn is valid then find the userId

        const user = await User.findById(decoded.userID).select("-password");

        if (!user) {
            return res.status(404).json({ message: "No User Found" });
        }
        req.user = user;
        next() //call the next Function which is updateProfile and so on
    } catch (error) {
        console.log("Error in protectRoute middleware", error.message);
        return res.status(500).json({ message: "Internal Server Error " });

    }

}