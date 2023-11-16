import React, { useEffect } from 'react'
import Forms from "./components/Forms/index"
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import RoomPage from './pages/Room'
import io from "socket.io-client"
import { useState } from 'react'
import {toast, ToastContainer} from 'react-toastify'
import { useCallback } from 'react'
import "./App.css"

// const server = "https://whiteboard-collab.onrender.com/"
const server = "http://localhost:5000/"

const connectionOptions = {
  "force new connection": true,
  reconnectionAttempts: "Infinity",
  timeout: 10000,
  transports: ["websocket"]
}

const socket = io(server, connectionOptions)

const App = () => {

  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  const handleUserIsJoined = useCallback((data) => {
    if (data.success) {
      setUser(data.data);
      setUsers(data.users);
    } else {
      console.log("error");
    }
  }, [users]);

  const handleAllUsers = useCallback((data) => {
    setUsers(data);
    console.log("data",data.length)
  }, []);

  const handleUserJoinedMessage = useCallback((data) => {
    toast.info(`${data} joined the room`);
  }, []);

  
  const userLeftMessage = (data) => {
    toast.info(`${data} left the room`)
  }

  useEffect(() => {
    socket.on("userIsJoined", handleUserIsJoined);
    socket.on("allUsers", handleAllUsers);
    socket.on("userLeftMessageBroadcasted", userLeftMessage)
  
    return () => {
      socket.off("userIsJoined", handleUserIsJoined);
      socket.off("allUsers", handleAllUsers);
      socket.off("userLeftMessageBroadcasted");
    };
  }, [handleUserIsJoined, userLeftMessage]);


  useEffect(() => {
    socket.on("userJoinedMessageBroadcasted", handleUserJoinedMessage);
    return () => {
      socket.off("userJoinedMessageBroadcasted", handleUserJoinedMessage);
    };
  }, [handleUserJoinedMessage]);

  const uuid = () => {
    let S4 = () => {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (
      S4() +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      S4() +
      S4()
    );
  };
  return (
    <div className='App'>
      <ToastContainer/>
      <div className="container">
        <Router>
        <Routes>
          <Route path='/' element={<Forms uuid={uuid} socket={socket} setUser={setUser}/>}/>
          <Route path='/:roomId' element={<RoomPage user={user} socket={socket} users={users}/>}/>
        </Routes>
        </Router>
      </div>
    </div>
  )
}

export default App