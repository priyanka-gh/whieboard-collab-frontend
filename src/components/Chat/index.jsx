import React, { useEffect, useState } from 'react';
import "./index.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const Chat = ({ socket }) => {
    const [chat, setChat] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
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
        <div className= "d-flex chat text-dark w-auto" style={{ flexDirection: "column",  alignItems: "center" }}>
            <div className='hide content w-100' style={{ width: "14rem", overflowY: 'auto', marginBottom:"3rem" }}>
                {chat.map((msg, idx) => (
                    <div key={idx}>
                        <p style={{ textAlign: "left", wordWrap: "break-word", color: "white"}}>{msg.name} : {msg.message}</p>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="mt-4 position-absolute form" style={{ bottom: "4%" }}>
                <div className='gap-2 d-flex'>
                    <input type="text" placeholder='Enter message' className='p-1 input-field' value={message} onChange={(e) => setMessage(e.target.value)} />
                    <button className='bg-white btn' type="submit"><FontAwesomeIcon className='faPlane' icon={faPaperPlane} /></button>
                </div>
            </form>
        </div>
    );
}

export default Chat;
