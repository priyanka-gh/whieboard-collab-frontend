import React from 'react'
import { useEffect, useState, useLayoutEffect } from 'react'
import rough from "roughjs"
import "./index.css"

const roughGenerator = rough.generator()

const WhiteBoard = ({canvasRef, ctxRef, elements, setElements, color, tool, user, socket}) => {
    
    const [img, setImg] = useState(null)
    const [userr, setUserr] = useState(user)

    useEffect(() => {
        socket.on("whiteboardDataResponse", (data) => {
            setImg(data.imgURL)
        })
    },[])

    if(userr?.presenter == false){
        return (
            <div className='border border-dark border-3 w-100 canvas overflow-hidden'>
                {img? <img src={img} alt="Real time img" /> : ""}
            </div>
        )
    } 

    const [isDrawing, setIsDrawing] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        canvas.height = window.innerHeight * 2
        canvas.width = window.innerWidth * 2

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineCap = "round"
        ctxRef.current = ctx
    },[])


    useEffect(() => {
        ctxRef.current.strokeStyle = color
    },[color])

    useLayoutEffect(() => {
        if(canvasRef){
            const roughCanvas = rough.canvas(canvasRef.current)

            if(elements.length > 0){
                ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
            }
            elements.forEach((element) => {
                if(element.type === "pencil"){
                    roughCanvas.linearPath(element.path, 
                        {
                            stroke: element.stroke,
                            strokeWidth: 5,
                            roughness: 0
                        }
                    )
                }
                else if(element.type === "line"){
                roughCanvas.draw(
                    roughGenerator.line(element.offsetX, element.offsetY, element.width, element.height,
                        {
                            stroke: element.stroke,
                            strokeWidth: 5,
                            roughness: 0
                        })
                )
                }
                else if (element.type === "rect"){ 
                    roughCanvas.draw(
                        roughGenerator.rectangle(element.offsetX, element.offsetY, element.width, element.height,
                        {
                            stroke: element.stroke,
                            strokeWidth: 5,
                            roughness: 0
                        }
                        )
                    )
                }
            })
        }
    },[elements])

    const handleMouseDown = (e) => {
        const {offsetX, offsetY} = e.nativeEvent

        if(tool === "pencil"){
        setElements((prevElements) => [
            ...prevElements,
            {
                type: "pencil",
                offsetX,
                offsetY,
                path: [[offsetX, offsetY]],
                stroke: color
            }
        ])} 
        else if(tool === "line"){
            setElements((prevElements) => [
                ...prevElements,
                {
                    type: "line",
                    offsetX,
                    offsetY,
                    width: offsetX,
                    height: offsetY,
                    stroke: color
                }
            ])
        }
        else if(tool === "rect"){
            setElements((prevElements) => [
                ...prevElements,
                {
                    type: 'rect',
                    offsetX,
                    offsetY,
                    width: 0,
                    height: 0,
                    stroke: color
                }
            ])
        }
        setIsDrawing(true)
    }

    const handleMouseUp = (e) => {
        setIsDrawing(false)
    }

    const handleMouseMove = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;
        if (isDrawing) {
            if(tool === "pencil")
            {
                const { path } = elements[elements.length - 1];
                const newPath = [...path, [offsetX, offsetY]];
                setElements((prevElements) => {
                return prevElements.map((ele, index) => {
                    if (index === elements.length - 1) {
                        return {
                            ...ele,
                            path: newPath
                        };
                    } else {
                        return ele;
                    }
                });
            });
            }
            else if(tool === "line"){
                setElements((prevElements) => {
                    return prevElements.map((ele, index) => {
                        if (index === elements.length - 1) {
                            return {
                                ...ele,
                                width: offsetX,
                                height: offsetY,
                            };
                        } else {
                            return ele;
                        }
                    });
                });   
            }
            else if(tool === "rect"){
                setElements((prevElements) => {
                    return prevElements.map((ele, index) => {
                        if (index === elements.length - 1) {
                            return {
                                ...ele,
                                width: offsetX - ele.offsetX,
                                height: offsetY - ele.offsetY,
                            };
                        } else {
                            return ele;
                        }
                    });
                }); 
            }
            const canvasImage = canvasRef.current.toDataURL()
            socket.emit("whiteboardData", canvasImage)
        }
    }
    
  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      className='rounded-4 border border-3 w-100 canvas overflow-hidden'
      style={{borderColor: "blue"}}
    >
    <canvas
      ref={canvasRef}></canvas>
    </div>
  )
}

export default WhiteBoard