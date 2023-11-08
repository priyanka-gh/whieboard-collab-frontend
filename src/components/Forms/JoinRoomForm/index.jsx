import { useState } from "react"
import { useNavigate } from "react-router-dom"

const JoinRoomForm = ({uuid, socket, setUser}) => {
    const [roomId, setRoomId] = useState("")
    const [name, setName] = useState("")

    const navigate = useNavigate()

    const handleRoomJoin = (e) => {
        e.preventDefault()
        const roomData = {
            name,
            roomId,
            user: uuid(),
            host: false,
            presenter: false
        }
        setUser(roomData)
        navigate(`/${roomId}`)
        socket.emit("userJoined", roomData)
    }
    return (
        <form className="form col-md-12 mt-5">
            <div className="form-group">
                <input 
                    type="text" 
                    placeholder="Enter your name" 
                    className="form-control my-2" 
                    onChange={(e) => setName(e.target.value)}
                    />
            </div>
            <div className="form-group border">
                <input 
                    type="text" 
                    placeholder="Enter room code" 
                    className="form-control my-2 border-0" 
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    />
            </div>
            <button 
                type="submit" 
                onClick={handleRoomJoin}
                className="mt-4 btn btn-primary btn-block form-control"
                style={{backgroundColor: "blue"}}>Join Room</button>
        </form>
    )
}

export default JoinRoomForm