import React from 'react'
import { useEffect, useState, useLayoutEffect } from 'react'
import rough from "roughjs"
import "./index.css"

const roughGenerator = rough.generator()

const WhiteBoard = ({canvasRef, ctxRef, elements, setElements, color, tool, user, socket}) => {


    useEffect(() => {
        socket.on("whiteboardDataResponse", (data) => {
            const res = data.updatedData;

            if (canvasRef) {
              const roughCanvas = rough.canvas(canvasRef.current);
          
              if (res.length > 0) {
                ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              }
          
              if (res.tool === "pencil") {
                setElements((prevElements) => [
                  ...prevElements,
                  {
                    type: "pencil",
                    offsetX: res.offsetX,
                    offsetY: res.offsetY,
                    path: res.path,
                    stroke: res.color,
                  },
                ]);
              } 
              
              else if (res.tool === "line") {
                setElements((prevElements) => [
                  ...prevElements,
                  {
                    type: "line",
                    offsetX: res.x1,
                    offsetY: res.y1,
                    width: res.x2,
                    height: res.y2,
                    stroke: res.color
                  },
                ]);
              } 
              
              else if (res.tool === "rect") {
          
                setElements((prevElements) => [
                  ...prevElements,
                  {
                    type: "rect",
                    offsetX: res.x1,
                    offsetY: res.y1,
                    width: res.x2,
                    height: res.y2,
                    stroke: res.color,
                  },
                ]);
              }
            }
          });
          
            
        return () => {
            socket.off("whiteboardDataResponse");
        };
    }, [elements]);
    

    const [isDrawing, setIsDrawing] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.height = window.innerHeight * 2;
        canvas.width = window.innerWidth * 2;
    
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
    
        ctxRef.current = ctx;
        

    }, [color]);

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
            setElements((prevElements) =>( [
                ...prevElements,
                {
                    type: "line",
                    offsetX,
                    offsetY,
                    width: offsetX,
                    height: offsetY,
                    stroke: color
                }
            ]))
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
        if(tool === "line"){
            const ele = elements[elements.length-1];
            const movementData = {
                tool,
                x1: ele.offsetX,
                y1: ele.offsetY,
                x2: ele.width,
                y2: ele.height,
                color : elements[elements.length - 1].stroke

            };
            socket.emit("whiteboardData", movementData);
        }
        if(tool == "rect"){
            const ele = elements[elements.length-1];
            const movementData = {
                tool,
                x1: ele.offsetX,
                y1: ele.offsetY,
                x2: ele.width,
                y2: ele.height,
                color : elements[elements.length - 1].stroke

            };
            socket.emit("whiteboardData", movementData);
        }
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
            const movementData = {
                tool,
                offsetX : offsetX,
                offsetY : offsetY,
                path: newPath,
                color : elements[elements.length - 1].stroke
            };
            socket.emit("whiteboardData", movementData);
            }
            
            else if(tool === "line"){
                setElements((prevElements) => {
                    return prevElements.map((ele, index) => {
                        if (index === elements.length - 1) {
                            return {
                                ...ele,
                                width: offsetX,
                                height: offsetY,
                            }
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

                const movementData = {
                    tool,
                    width: offsetX - elements[elements.length - 1].offsetX,
                    height: offsetY - elements[elements.length - 1].offsetY,
                    color : elements[elements.length - 1].stroke

                };
                socket.emit("whiteboardData", movementData);
            }
        }
    }
    
  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      className='border border-dark border-3 w-100 canvas overflow-hidden'
    >
    <canvas
      ref={canvasRef}></canvas>
    </div>
  )
}

export default WhiteBoard