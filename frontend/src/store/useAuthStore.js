import { create } from "zustand"
import { axiosInstance } from "../lib/axios"
import toast from "react-hot-toast"
import { io } from "socket.io-client"

// const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    onlineUsers: [],
    socket: null,

    isCheckingAuth: true,
    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check")
            set({ authUser: res.data }) //user is authenticated the set the data to the user 
            get().connectSocket();
        } catch (error) {
            console.log("Error in check auth ", error)
            set({ authUser: null })// not tuhenticated the set null
        } finally {
            set({ isCheckingAuth: false })
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });

        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data })
            toast.success("Account created successfully");
            get().connectSocket();

        } catch (error) {
            toast.error(error.response.data.message)

        } finally {
            set({ isSigningUp: false })
        }
    },
    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            toast.success("Logged in successfully");
            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isLoggingIn: false });
        }
    },
    logout: async () => {
        try {
            axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");
            get().disconnectSocket();


        } catch (error) {
            toast.error(error.response.data.message)

        }
    },
    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });// mark my state true
        try {
            const res = await axiosInstance.put("auth/update-profile", data);
            set({ authUser: res.data });//set the authUser with new uploaded profile data
            toast.success("Profile Uploaded Successfully");// show pop up
        } catch (error) {
            console.log("Error in update profile:", error);
            toast.error(error.response.data.message);

        } finally {
            set({ isUpdatingProfile: false })
        }

    },
    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return; // if not auth user or already connected then not connect socket againa and again
        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            },
        });
        socket.connect();
        set({ socket: socket });

        //Listen for the online use Updates
        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });

    },
    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
    }

}))