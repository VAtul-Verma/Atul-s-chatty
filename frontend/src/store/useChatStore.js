import { create } from "zustand"
import toast from "react-hot-toast"
import { axiosInstance } from "../lib/axios"
import { useAuthStore } from "./useAuthStore";

export const userChatStore = create((set, get) => ({
    messages: [],  //initially it is an empty array
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users");
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: false });
        }
    },
    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isMessagesLoading: false });
        }
    },
    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: [...messages, res.data] });
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;// no selected chat  return then

        const socket = useAuthStore.getState().socket;  //get the socker from useAuthStore

        socket.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
            if (!isMessageSentFromSelectedUser) return; // only update on selected chats

            set({
                messages: [...get().messages, newMessage],  //keep the all previous message and add the new message at the end
            });
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;  //when we close or logout window
        socket.off("newMessage");
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),



}))





// import { create } from "zustand";
// import toast from "react-hot-toast";
// import { axiosInstance } from "../lib/axios";
// import { useAuthStore } from "./useAuthStore";

// export const userChatStore = create((set, get) => ({
//     messages: [],
//     users: [],
//     selectedUser: null,
//     isUsersLoading: false,
//     isMessagesLoading: false,

//     getUsers: async () => {
//         set({ isUsersLoading: true });
//         try {
//             const res = await axiosInstance.get("/messages/users");
//             set({ users: res.data });
//         } catch (error) {
//             toast.error(error.response.data.message);
//         } finally {
//             set({ isUsersLoading: false });
//         }
//     },

//     getMessages: async (userId) => {
//         set({ isMessagesLoading: true });
//         try {
//             const res = await axiosInstance.get(`/messages/${userId}`);
//             set({ messages: res.data });
//         } catch (error) {
//             toast.error(error.response.data.message);
//         } finally {
//             set({ isMessagesLoading: false });
//         }
//     },
//     sendMessage: async (messageData) => {
//         const { selectedUser, messages } = get();
//         try {
//             const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
//             set({ messages: [...messages, res.data] });
//         } catch (error) {
//             toast.error(error.response.data.message);
//         }
//     },

//     subscribeToMessages: () => {
//         const { selectedUser } = get();
//         if (!selectedUser) return;

//         const socket = useAuthStore.getState().socket;

//         socket.on("newMessage", (newMessage) => {
//             const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
//             if (!isMessageSentFromSelectedUser) return;

//             set({
//                 messages: [...get().messages, newMessage],
//             });
//         });
//     },

//     unsubscribeFromMessages: () => {
//         const socket = useAuthStore.getState().socket;
//         socket.off("newMessage");
//     },

//     setSelectedUser: (selectedUser) => set({ selectedUser }),
// }));
