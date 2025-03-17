import mongoose from "mongoose";
import app from "./app";
import { Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import config from "./app/config/config";
import Message from "./app/routes/socket.model";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
let server: Server;
const io = new SocketIOServer();

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    server = app.listen(config.port, () => {
      console.log(`Example app listening on port ${config.port}`);
      console.log("Database Connected !! 😊😊");
    });

    io.attach(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    // ----------------------------------------------------------
    // Cloudinary Configuration
    cloudinary.config({
      cloud_name: config.cloud_name,
      api_key: config.api_key,
      api_secret: config.api_secret,
    });
    // Configure Multer for Cloudinary
    const storage = new CloudinaryStorage({
      cloudinary,
      params: { folder: "chat-audios", resource_type: "audio" },
    });
    const upload = multer({ storage });
    // ------------------------------------------------------------
    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("sendMessage", async (data) => {
        try {
          const { sender, receiver, text, voice, emoji } = data;
          console.log(data);

          if (!sender || !receiver) {
            console.error("Missing sender or receiver!");
            return;
          }

          // Save to database
          const message = new Message({ sender, receiver, text, voice, emoji });
          await message.save();

          console.log("Message saved:", message);

          // Emit to receiver
          io.to(receiver).emit("receiveMessage", message);
        } catch (error) {
          console.error("Error saving message:", error);
        }
      });
      // -----------------------------------------------------------
      // **Handle Audio Upload via Socket.io**
      socket.on("sendAudioMessage", async ({ sender, receiver, audio }) => {
        try {
          if (!audio || !sender || !receiver) {
            return;
          }

          // Upload to Cloudinary
          const uploadResponse = await cloudinary.uploader.upload(audio, {
            resource_type: "auto", // Cloudinary treats audio as "video"
            folder: "chat-audios",
            format: "mp3", // Ensure it's an audio format
          });

          const message = new Message({
            sender,
            receiver,
            voice: uploadResponse.secure_url,
          });
          await message.save();

          // Emit the audio message in real-time
          io.to(receiver).emit("receiveMessage", message);
          socket.to(sender).emit("receiveMessage", message);
        } catch (error) {
          console.error("Audio upload error:", error);
        }
      });
      // -----------------------------------------------------------
      socket.on("fetchMessages", async ({ sender, receiver }) => {
        try {
          const messages = await Message.find({
            $or: [
              { sender, receiver },
              { sender: receiver, receiver: sender },
            ],
          }).sort({ createdAt: 1 });

          socket.emit("previousMessages", messages);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      });

      socket.on("joinChat", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined chat room`);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });
  } catch (error) {
    console.log(error);
  }
}

main();

// import mongoose from "mongoose";
// import app from "./app";
// import { Server } from "http";
// import config from "./app/config/config";
// let server: Server;
// async function main() {
//   try {
//     await mongoose.connect(config.database_url as string);
//     server = app.listen(config.port, () => {
//       console.log(`Example app listening on port ${config.port}`);
//       console.log("Database Connected !! 😊😊");
//     });
//   } catch (error) {
//     console.log(error);
//   }
// }
// main();
// process.on("unhandledRejection", () => {
//   console.log(`😭😭 unhandledRejection is detected, shutting down....`);

//   if (server) {
//     server.close(() => {
//       process.exit(1);
//     });
//   }
//   process.exit(1);
// });
// process.on("uncaughtException", () => {
//   console.log(`😭😭 uncaughtException is detected, shutting down....`);
//   process.exit(1);
// });
