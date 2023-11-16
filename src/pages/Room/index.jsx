import React, {useState, useEffect} from 'react'
import { useRef } from 'react'
import WhiteBoard from '../../components/Whiteboard'
import './index.css'
import Chat from "../../components/Chat/index"
import { RiRectangleLine } from "react-icons/ri";
import { FaRegCircle, FaPen } from "react-icons/fa";
import { CiRedo, CiUndo } from "react-icons/ci";
import { RxCross1 } from "react-icons/rx";
import { IoArrowUpOutline } from "react-icons/io5";

const RoomPage = ({user, socket, users}) => {
    
    const canvasRef = useRef(null)
    const ctxRef = useRef(null)
    const [tool, setTool] = useState("pencil")
    const [ color, setColor] = useState("black")
    const [elements, setElements] = useState([])
    const [ history, setHistory] = useState([])
    
    const handleCanvasClear = () => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        ctx.fillRect = "white"
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

        socket.emit("clearCanvas")
        setElements([])
    }

    const undo = () => {
        const undoneElement = elements[elements.length - 1];
        socket.emit('whiteboardUndo', { element: undoneElement });

        setHistory((prevHistory) => [
          ...prevHistory,
          elements[elements.length - 1],
        ]);
        setElements((prevElements) =>
          prevElements.filter((ele, index) => index !== elements.length - 1)
        );
        console.log("elements",elements)
      };
      
    const redo = () => {
        const redoneElement = history[history.length - 1];
        socket.emit('whiteboardRedo', { element: redoneElement });

        setElements((prevElements) => [
            ...prevElements,
            history[history.length - 1],
        ]);
        setHistory((prevHistory) =>
            prevHistory.filter((ele, index) => index !== history.length - 1)
        );
    };

    const [tab, setTab] = useState("chat")

    const toggle = (tabVal) => {
        setTab(tabVal)
    }

    return (
        <div className="d-flex" style={{height:"100vh", flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
            <div className='col' style={{ width:"17%", height:"100%", position:"absolute", left:"0"}}>
                <div className='d-flex p-2 align-items-center justify-content-around m-0'>
                    <h5 onClick={() => toggle("chat")} style={{width: "100%", padding:"10px"}} className={`${tab=="chat" ? "activeTab" : "notActive"} m-2`}>Chat</h5>
                    <h5 onClick={() => toggle("users")} style={{width: "100%", padding:"10px"}} className={`${tab=="users" ? "activeTab" : "notActive"} m-2`}>Users ({`${users.length}`})</h5>
                </div>
                {
                    tab == "chat" && (
                        <Chat socket={socket}/>
                    )
                }
                {
                    tab === "users" && (
                        <div style={{padding: "10px"}}>
                        {users.map((user) => (
                            <div>
                            <h5>{user.name}</h5>
                            </div>
                        ))}
                        </div>
                    )
                }
            </div>
            <div className='boardBG' style={{width: "83%", height:"100%", position:"absolute", right:"0"}}>
                <WhiteBoard 
                canvasRef={canvasRef} 
                ctxRef={ctxRef}
                elements={elements}
                setElements={setElements}
                color={color}
                tool={tool}
                user={user}
                socket={socket}
                />
            </div>
            <div style={{position:"absolute", right:"10px"}} className="d-flex flex-column align-items-center justify-content-around">
                <button
                    onClick={() => setTool('pencil')}
                    className={`p-4 tools ${tool=="pencil"? "activePen":""}`}
                >
                    <FaPen/>
                </button>
                <button
                    onClick={() => setTool('line')}
                    className={`p-4 tools ${tool=="line"? "activeLine":""}`}
                >
                    <IoArrowUpOutline/>
                </button>
                <button
                    onClick={() => setTool('rect')}
                    className={`p-4 tools ${tool=="rect"? "activeRect":""}`}
                >
                    <RiRectangleLine/>
                </button>
                <button
                    onClick={() => setTool('circle')}
                    className={`p-4 tools ${tool=="circle"? "activeCir":""}`}
                >
                    <FaRegCircle />
                </button>
                <input
                    type="color"
                    id="color"
                    value={color}
                    className={`pick tools}`}
                    onChange={(e) => setColor(e.target.value)}
                >
                </input>
                <button disabled={elements?.length === 0}  onClick={() => undo()} className="p-4 tools">
                    <CiUndo />
                </button>
                <button disabled={history.length < 1} onClick={() => redo()} className="p-4 tools">
                    <CiRedo/>
                </button>
                <button onClick={handleCanvasClear} className="p-4 tools">
                    <RxCross1/>
                </button>
            </div>
        </div>
  )
}

export default RoomPage

