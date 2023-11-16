import CreateRoomForm from './CreateRoomForm'
import './index.css'
import JoinRoomForm from './JoinRoomForm'

const Forms = ({uuid, socket, setUser}) => {
    return (
        <div className="row d-flex align-items-center justify-content-center formBG" style={{height:"100vh"}}>
            <div className="form-box col-md-4 mx-auto border border-2 rounded-2 p-5 px-5 d-flex flex-column align-items-center justify-content-center">
                <h1 className="fw-bold" style={{color: "#796b6b"}}>Create Room</h1>
                <CreateRoomForm uuid={uuid} socket={socket} setUser={setUser}/>
            </div>
            <div className="form-box2 col-md-4 mx-auto border border-2 rounded-2 p-5 px-5 d-flex flex-column align-items-center justify-content-center">
                <h1 className="fw-bold" style={{color: "#796b6b"}}>Join Room</h1>
                <JoinRoomForm uuid={uuid} socket={socket} setUser={setUser}/>
            </div>
        </div>
    )
}

export default Forms