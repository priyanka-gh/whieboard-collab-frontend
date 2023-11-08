import React, { useEffect } from 'react'
import Forms from "./components/Forms/index"
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import RoomPage from './pages/Room'
import io from "socket.io-client"
import { useState } from 'react'
import {toast, ToastContainer} from 'react-toastify'
import { useCallback } from 'react'

const server = "http://localhost:5000"
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
  }, []);

  const handleAllUsers = useCallback((data) => {
    setUsers(data);
  }, []);

  const handleUserJoinedMessage = useCallback((data) => {
    toast.info(`${data} joined the room`);
  }, []);

  useEffect(() => {
    socket.on("userIsJoined", handleUserIsJoined);
    socket.on("allUsers", handleAllUsers);
    return () => {
      socket.off("userIsJoined", handleUserIsJoined);
      socket.off("allUsers", handleAllUsers);
    };
  }, [handleUserIsJoined, handleAllUsers]);

  useEffect(() => {
    socket.on("userLeftMessageBroadcasted", (data) => {
      console.log("dta",data)
      toast.info(`${data} left the room`)
    })
    return () => {
      socket.off("userLeftMessageBroadcasted");
    };
  },[])

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
    <div>
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