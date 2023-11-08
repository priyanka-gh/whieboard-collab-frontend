// import React, { useEffect, useState } from 'react';
// import "./index.css";

// const Chat = ({ openedUserTab, socket }) => {
//     const [chat, setChat] = useState([]);
//     const [message, setMessage] = useState("");

//     useEffect(() => {
//         // Use a cleanup function to remove the socket event listener when the component unmounts.
//         const messageResponseHandler = (data) => {
//             setChat((prevChat) => [...prevChat, data]);
//         };
//         socket.on("messageResponse", messageResponseHandler);

//         return () => {
//             socket.off("messageResponse", messageResponseHandler);
//         };
//     }, [socket]);

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         if (message.trim() !== "") {
//             socket.emit("message", { message });
//             setChat((prevChat) => [...prevChat, { message, name: "You" }]);
//             setMessage(""); 
//         }
//     }

//     return (
//         <div className={`d-flex text-white ${openedUserTab ? "hidechat" : ""}`} style={{ flexDirection: "column", justifyContent: "space-around", alignItems: "center" }}>
//             <div className='bg-dark content' style={{width: "14rem"}}>
//                 {
//                     chat.map((msg, idx) => (
//                         <div key={idx}>
//                             <p style={{textAlign: "left", wordWrap: "break-word"}}>{msg.name} : {msg.message}</p>
//                         </div>
//                     ))
//                 }
//             </div>
//             <div>
//             <form onSubmit={handleSubmit} className="mt-4 position-fixed" style={{ bottom: "8%", left:"2.5%" }}>
//                 <div className=''>
//                     <input type="text" placeholder='Enter message' className='p-1 h-100 input-field w-auto' value={message} onChange={(e) => setMessage(e.target.value)} />
//                     <button className='p-1' type="submit">Send</button>
//                 </div>
//             </form>
//             </div>
//         </div>
//     );
// }

// export default Chat;



import React, { useEffect, useState } from 'react';
import "./index.css";

const Chat = ({ openedUserTab, socket }) => {
    const [chat, setChat] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        // Use a cleanup function to remove the socket event listener when the component unmounts.
        const messageResponseHandler = (data) => {
            setChat((prevChat) => [...prevChat, data]);
        };
        socket.on("messageResponse", messageResponseHandler);

        return () => {
            socket.off("messageResponse", messageResponseHandler);
        };
    }, [socket]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() !== "") {
            socket.emit("message", { message });
            setChat((prevChat) => [...prevChat, { message, name: "You" }]);
            setMessage("");
        }
    }

    return (
        <div className={`d-flex text-white ${openedUserTab ? "hidechat" : ""}`} style={{ flexDirection: "column", justifyContent: "space-around", alignItems: "center" }}>
            <h5>Chats</h5>
            <div className=' content' style={{ width: "14rem", overflowY: 'auto', marginBottom:"3rem" }}>
                {chat.map((msg, idx) => (
                    <div key={idx}>
                        <p style={{ textAlign: "left", wordWrap: "break-word" }}>{msg.name} : {msg.message}</p>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="mt-4 position-fixed" style={{ bottom: "8%", left: "2.5%" }}>
                <div className='d-flex'>
                    <input type="text" placeholder='Enter message' className='p-1 h-100 input-field w-auto' value={message} onChange={(e) => setMessage(e.target.value)} />
                    <button className='p-1 bg-white' type="submit">Send</button>
                </div>
            </form>
        </div>
    );
}

export default Chat;
