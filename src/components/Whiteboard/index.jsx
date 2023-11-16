import React from 'react'
import { useEffect, useState, useLayoutEffect } from 'react'
import rough from "roughjs"
import "./index.css"

const roughGenerator = rough.generator()

const WhiteBoard = ({canvasRef, ctxRef, elements, setElements, color, tool, user, socket}) => {

    useLayoutEffect(() => {
        socket.on('whiteboardUndoBroadcast', ({ element }) => {
            setElements((prevElements) =>
            prevElements.filter((ele, index) => index !== elements.length - 1)
        );
        console.log("elements",elements)

        });
      
        socket.on('whiteboardRedoBroadcast', ({ element }) => {
            setElements((prevElements) => [
                ...prevElements,
                element,
            ]);
        });

        socket.on("clearCanvasBroadcast", () => {
            setElements([])
        })
      
        return () => {
          socket.off('whiteboardUndoBroadcast');
          socket.off('whiteboardRedoBroadcast');
        };
      }, [elements]);

      
    useLayoutEffect(() => {
        socket.on("whiteboardDataResponse", (data) => {
            const res = data.updatedData;
            console.log(elements)
            if (canvasRef) {
              if (res?.length > 0) {
                ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              }
          
              if (res?.tool === "pencil") {
                setElements((prevElements) => {
                    const isDuplicate = prevElements.some((ele) => (
                        ele.type === "pencil" &&
                        ele.offsetX === res.offsetX &&
                        ele.offsetY === res.offsetY &&
                        ele.path === res.path &&
                        ele.stroke === res.color
                    ));
            
                    if (!isDuplicate) {
                        return [
                            ...prevElements,
                            {
                                type: "pencil",
                                offsetX: res.offsetX,
                                offsetY: res.offsetY,
                                path: res.path,
                                stroke: res.color,
                            },
                        ];
                    }
            
                    return prevElements;
                });
            }
              
               if (res?.tool === "line") {
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
              
              if (res?.tool === "rect" && res.x1 !== undefined && res.y1 !== undefined && res.x2 !== undefined && res.y2 !== undefined) {
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

               if (res?.tool === "circle") {
                setElements((prevElements) => [
                    ...prevElements,
                    {
                        type: "circle",
                        offsetX: res.offsetX,
                        offsetY: res.offsetY,
                        radius: res.radius,
                        stroke: res.color
                    }
                ])
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
                            strokeWidth: 2,
                            roughness: 0
                        }
                    )
                }
                else if(element.type === "line"){
                roughCanvas.draw(
                    roughGenerator.line(element.offsetX, element.offsetY, element.width, element.height,
                        {
                            stroke: element.stroke,
                            strokeWidth: 2,
                            roughness: 0
                        })
                )
                }

                else if (element.type === "rect"){ 
                    roughCanvas.draw(
                        roughGenerator.rectangle(element.offsetX, element.offsetY, element.width, element.height,
                        {
                            stroke: element.stroke,
                            strokeWidth: 2,
                            roughness: 0
                        }
                        )
                    )
                }

                else if (element.type == "circle"){
                    roughCanvas.draw(
                        roughGenerator.circle(
                          element.offsetX, 
                          element.offsetY, 
                          element.radius * 2,  // Diameter = 2 * radius
                          {
                            stroke: element.stroke,
                            strokeWidth: 2,
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
        else if(tool === "circle"){
            setElements((prevElements) => [
                ...prevElements,
                {
                    type: 'circle',
                    offsetX,
                    offsetY,
                    diameter: 0,
                    stroke: color
                }
            ])
        }

        setIsDrawing(true)
    }

    const handleMouseUp = (e) => {
        setIsDrawing(false)
        if (tool === "pencil") {
            const lastElement = elements[elements.length - 1];
        
            if (lastElement.type === "pencil" && lastElement.path.length > 1) {
              const movementData = {
                tool,
                offsetX: lastElement.offsetX,
                offsetY: lastElement.offsetY,
                path: lastElement.path,
                color: lastElement.stroke,
              };
              console.log("Sent")
              socket.emit("whiteboardData", movementData);
            }
          }

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
        if (tool === "circle") {
            const ele = elements[elements.length - 1];
            const movementData = {
              tool,
              offsetX: ele.offsetX,
              offsetY: ele.offsetY,
              radius: ele.radius,
              color: elements[elements.length - 1].stroke,
            };
            socket.emit("whiteboardData", movementData);
          }

    }

    const handleMouseMove = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;
        
        if (isDrawing) {
            if (tool === "pencil") {
            setElements((prevElements) => {
                return prevElements.map((ele, index) => {
                if (index === elements.length - 1) {
                    return {
                    ...ele,
                    path: [...ele.path, [offsetX, offsetY]],
                    };
                } else {
                    return ele;
                }
                });
            });

            const lastElement = elements[elements.length - 1];

            if (lastElement.type === "pencil" && lastElement.path.length > 1) {
                const movementData = {
                tool,
                offsetX: lastElement.offsetX,
                offsetY: lastElement.offsetY,
                path: lastElement.path,
                color: lastElement.stroke,
                };

                // socket.emit("whiteboardData", movementData);
            }
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

            else if (tool === "circle") {
                setElements((prevElements) => {
                  return prevElements.map((ele, index) => {
                    if (index === elements.length - 1) {
                      return {
                        ...ele,
                        radius: Math.sqrt(Math.pow(offsetX - ele.offsetX, 2) + Math.pow(offsetY - ele.offsetY, 2)),
                      };
                    } else {
                      return ele;
                    }
                  });
                });
              }
        }
    }
    
  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      className='w-100 canvas overflow-hidden'
    >
    <canvas
      ref={canvasRef}></canvas>
    </div>
  )
}

export default WhiteBoard