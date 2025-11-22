import Message from "../models/message.models.js";
export const getFriendList = async (req, res) => {
    try {
        const meUserIFD= req.user._id;
        const FriendIDlist= await user.find({_id:{$ne:meUserIFD}}).select("-password");

        res.status(200).json(FriendIDlist)
    } catch (error) {
        console.error("Error in getFriendList: ",error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id:IDToChat } = req.params;
        const meUserID= req.user._id;
        const messages = await Message.find({
            $or: [
                { senderID: meUserID, receiverID: IDToChat },
                { senderID: IDToChat, receiverID: meUserID }
            ]
        }).populate("senderID", "name").populate("receiverID", "name");

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessages: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { id: receiverID } = req.params;
        const me = req.user._id;
        const { text, image } = req.body;

        let imageURL = "";
        if (image)
            {
                const uploadResponse = await cloudinary.uploader.upload(image);
                imageURL = uploadResponse.secure_url;
            }        
        const newMessage = await Message.create({
            senderID: me,
            receiverID: receiverID,
            text,
            image: imageURL
        });
        await newMessage.save();

        // todo: realtime => socket.io

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}