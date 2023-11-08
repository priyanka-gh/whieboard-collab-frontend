import React, {useState, useEffect} from 'react'
import { useRef } from 'react'
import WhiteBoard from '../../components/Whiteboard'
import './index.css'
import Chat from "../../components/Chat/index"

const RoomPage = ({user, socket, users}) => {
    
    const canvasRef = useRef(null)
    const ctxRef = useRef(null)
    const [tool, setTool] = useState("pencil")
    const [ color, setColor] = useState("black")
    const [elements, setElements] = useState([])
    const [ history, setHistory] = useState([])
    const [openedUserTab, setOpenedUserTab] = useState(false)
    
    const handleCanvasClear = () => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        ctx.fillRect = "white"
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

        setElements([])
    }

    const undo = () => {
        setHistory((prevHistory) => [
          ...prevHistory,
          elements[elements.length - 1],
        ]);
        setElements((prevElements) =>
          prevElements.filter((ele, index) => index !== elements.length - 1)
        );
      };
      
    const redo = () => {
    setElements((prevElements) => [
        ...prevElements,
        history[history.length - 1],
    ]);
    setHistory((prevHistory) =>
        prevHistory.filter((ele, index) => index !== history.length - 1)
    );
    };

    const showsidebar = () => {
        setOpenedUserTab(!openedUserTab)
    }

    return (
        <div className="row d-flex align-items-center justify-content-center ">
            <div className='mt-4'>
            <button type='button' 
                onClick={showsidebar}
                className='btn text-white' 
                style={{ 
                    position: "absolute", 
                    top: "2%", 
                    left: "2%",
                    height:"40px", 
                    width: "100px",
                    backgroundColor: "blue"}}>
                    Users ({users.length})
            </button>
            {
                openedUserTab && (
                    <div className="position-fixed top-0 h-100 text-white" 
                        style={{width:"250px", left: "0%", padding:"1rem", backgroundColor: "blue"}}
                    >
                        <button 
                            type='button' 
                            onClick={() => setOpenedUserTab(!openedUserTab)}
                            className='btn btn-light mt-3 position-relative'
                            style={{left: "10rem", borderRadius: "50%"}}>
                                X
                        </button>
                        {
                            users.map((usr, index) => (
                                <p style={{marginTop : "1rem"}} key={index*999}>{usr?.name}</p>
                            ))
                        }
                    </div>
                )
            }
            </div>
            {
                user?.presenter == true && (
                    <div className="col-md-10 gap-3 px-2 mt-2 mb-3 d-flex align-items-center justify-content-around">
                        <div className="d-flex gap-2 px-3 col-md-2 justify-content-between">
                        <select
                            id="toolSelect"
                            value={tool}
                            onChange={(e) => setTool(e.target.value)}
                            className="p-2 border text-white"
                            style={{backgroundColor: "#7777c7"}}
                        >
                            <option value="pencil">Pencil</option>
                            <option value="line">Line</option>
                            <option value="rect">Rectangle</option>
                        </select>
                        </div>
                        <div className="col-md-2">
                            <div className="d-flex mx-3 ">
                                <input
                                    type="color"
                                    id="color"
                                    className='mt-1 ms-3 '
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}>
                                </input>
                            </div>
                        </div>
                        <div className="col-md-2 d-flex gap-2">
                            <button className='btn btn-primary mt-1' disabled={elements.length === 0} style={{backgroundColor: "blue"}} onClick={() => undo()}>Undo</button>
                            <button className='btn btn-outline-primary mt-1' disabled={history.length < 1} onClick={() => redo()}>Redo</button>
                        </div>
                        <div className="col-md-2">
                            <button className='btn btn-danger' onClick={handleCanvasClear}>Clear Canvas</button>
                        </div>
                    </div>
                )
            }
            
            <div className="d-flex gap-2 col-md-12 mb-4 mx-auto mt-3 canvas-box" style={{height: '80%'}}>
                <div className={`px-5 rounded-4 d-flex justify-content-center ${openedUserTab? "hidechat":""} hide`} style={{width: "350px", backgroundColor: "blue"}}>
                    <Chat openedUserTab={openedUserTab} socket={socket}/>
                </div>
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
        </div>
  )
}

export default RoomPage