import { useState } from "react"
import { useNavigate } from "react-router-dom"
import clipboardCopy from "clipboard-copy"; 
import './index.css'

const CreateRoomForm = ({uuid, socket, setUser}) => {
    const [roomId, setRoomId] = useState(uuid())
    const [name, setName] = useState("")

    const navigate = useNavigate()

    const handleCreateRoom = (e) => {
        e.preventDefault()
        const roomData = {
            name: name,
            roomId,
            user: uuid(),
            host: true,
            presenter: true,
        }
        setUser(roomData)
        navigate(`/${roomId}`)
        socket.emit("userJoined", roomData)
    }

    const copyToClipboard = () => {
        clipboardCopy(roomId);
      };
    return (
        <form className="form col-md-12 mt-5">
            <div className="form-group">
                <input 
                    type="text" 
                    placeholder="Enter your name" 
                    className="form-control my-2" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    />
            </div>
            <div className="form-group border">
                <div className="input-group d-flex align-items-center jutify-content-center">
                    <input value={roomId} type="text" placeholder="Generate room code" disabled className="form-control my-2 border-0" />
                    <div className="input-group-append d-flex gap-1">
                        <button onClick={() => setRoomId(uuid())} className="btn btn-primary me-1" type="button" style={{backgroundColor: "#796b6b"}}>Generate</button>
                        <button className="btn btn-outline-danger btn-sm me-1" type="button" onClick={() => copyToClipboard()}>Copy</button>
                    </div>
                </div>
            </div>
            <button type="submit" onClick={handleCreateRoom} className="mt-4 btn btn-primary btn-block form-control"
            style={{backgroundColor: "#796b6b"}}>Generate Room</button>
        </form>
    )
}

export default CreateRoomForm