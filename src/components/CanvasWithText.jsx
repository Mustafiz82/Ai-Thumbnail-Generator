import React, { useState, useRef, useEffect } from "react";
import {
    Stage,
    Layer,
    Image as KonvaImage,
    Text as KonvaText,
    Rect,
    Transformer
} from "react-konva";
import useImage from "use-image";
import { FaEdit } from "react-icons/fa";
import { IoCheckmarkDoneSharp } from "react-icons/io5";

const CanvasWithText = ({ imageUrl, textConfig }) => {
    const containerRef = useRef(null);
    const captureRef = useRef(null);
    const textRef = useRef(null);
    const transformerRef = useRef(null);
    const inputRef = useRef(null);
    const [textAlign, setTextAlign] = useState(textConfig?.align || "center");

    const [bgOpacity, setBgOpacity] = useState(0.6); // default value

    const [containerWidth, setContainerWidth] = useState(1024);
    const [image, setImage] = useState(null);
    const [textPosition, setTextPosition] = useState({ x: 40, y: 80 });
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingText, setIsEditingText] = useState(false);
    const [text, setText] = useState("Your \nText Here");
    const [textDims, setTextDims] = useState({ width: 0, height: 0 });
    const [fontSize, setFontSize] = useState(textConfig?.fontSize || 34);
    const [inputStyle, setInputStyle] = useState({ top: 0, left: 0, width: 0, height: 0 });

    const [loadedImage] = useImage(imageUrl);

    const updateTextDims = () => {
        if (textRef.current) {
            const node = textRef.current;
            setTextDims({
                width: node.width(),
                height: node.height() * node.lineHeight()
            });
        }
    };


    useEffect(() => {
        setImage(loadedImage);
    }, [loadedImage]);

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };
        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    useEffect(() => {
        if (textConfig?.text !== undefined) setText(textConfig.text);
    }, [textConfig]);

    useEffect(() => {
        updateTextDims();
    }, [text, fontSize, containerWidth]);


    useEffect(() => {
        if (isEditingText && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditingText]);

    useEffect(() => {
        if (isEditing && transformerRef.current && textRef.current) {
            transformerRef.current.nodes([textRef.current]);
            transformerRef.current.getLayer().batchDraw();
        }
    }, [isEditing]);

    const handleTextClick = (e) => {
        if (!isEditing) return;

        const textNode = e.target;
        const stage = textNode.getStage();
        const containerRect = containerRef.current.getBoundingClientRect();
        const stageBox = stage.container().getBoundingClientRect();

        const offsetX = stageBox.left;
        const offsetY = stageBox.top;

        const left = textNode.x() + offsetX - containerRect.left;
        const top = textNode.y() + offsetY - containerRect.top;

        setInputStyle({
            top,
            left,
            width: textNode.width(),
            height: textNode.height() * textNode.lineHeight()
        });

        setIsEditingText(true);
    };

    const finishEditing = () => {
        setIsEditingText(false);

        requestAnimationFrame(() => {
            updateTextDims();

            if (isEditing && transformerRef.current && textRef.current) {
                transformerRef.current.nodes([textRef.current]);
                transformerRef.current.getLayer().batchDraw();
            }
        });
    };


    const toggleEditing = () => {
        setIsEditing((prev) => !prev);
    };

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    return (
        <div
            ref={containerRef}
            className="relative w-full"
            style={{ maxWidth: 1024, userSelect: isEditingText ? "none" : "auto" }}
        >
            {/* Edit Button */}
            <button
                onClick={toggleEditing}
                className="absolute top-2 right-2 z-20 bg-yellow-500 hover:bg-yellow-600 text-sm text-black px-4 py-1 rounded shadow-md select-none"
            >
                {isEditing ? (
                    <div className="flex gap-2 items-center">
                        <IoCheckmarkDoneSharp />
                        <p>Done</p>
                    </div>
                ) : (
                    <div className="flex gap-2 items-center">
                        <FaEdit />
                        <p>Edit</p>
                    </div>
                )}
            </button>

            {/* Canvas */}
            <div ref={captureRef} className="w-full">
                <Stage width={containerWidth} height={(containerWidth * 9) / 16}>
                    <Layer>
                        {/* Background image */}
                        {image && (
                            <KonvaImage
                                image={image}
                                width={containerWidth}
                                height={(containerWidth * 9) / 16}
                            />
                        )}

                        {/* Background box */}
                        {!isEditingText && (
                            <Rect
                                x={textPosition.x - 16}
                                y={textPosition.y - 16}
                                width={textDims.width + 32}
                                height={textDims.height + 20}
                                fill={`rgba(0,0,0,${bgOpacity})`}

                                cornerRadius={8}
                            />
                        )}

                        {/* Resizable text */}
                        <KonvaText
                            ref={textRef}
                            text={text}
                            x={textPosition.x}
                            y={textPosition.y}
                            fontSize={fontSize}
                            fontFamily={textConfig?.fontFamily || "Arial Black"}
                            fontStyle={textConfig?.fontStyle || "bold"}
                            fill={textConfig?.fill || "#ffffff"}
                            lineHeight={textConfig?.lineHeight || 1.2}
                            align={textAlign}

                            letterSpacing={textConfig?.letterSpacing || 1}
                            shadowColor="#000000"
                            shadowBlur={12}
                            shadowOffset={{ x: 0, y: 2 }}
                            shadowOpacity={0.8}
                            draggable={isEditing && !isEditingText}
                            visible={!isEditingText || true} // Always render, hide visually during edit
                            onDragEnd={(e) => {
                                if (isEditing) {
                                    setTextPosition({ x: e.target.x(), y: e.target.y() });
                                }
                            }}
                            onClick={handleTextClick}
                            onTransformEnd={(e) => {
                                const node = textRef.current;
                                const scaleX = node.scaleX();
                                const scaleY = node.scaleY();

                                const newFontSize = fontSize * scaleY;
                                setFontSize(newFontSize);

                                node.scaleX(1);
                                node.scaleY(1);
                            }}
                        />


                        {/* Resize box */}
                        {isEditing && !isEditingText && (
                            <Transformer
                                ref={transformerRef}
                                rotateEnabled={false}
                                enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
                                boundBoxFunc={(oldBox, newBox) => {
                                    if (newBox.width < 30 || newBox.height < 30) {
                                        return oldBox;
                                    }
                                    return newBox;
                                }}
                            />
                        )}
                    </Layer>
                </Stage>
            </div>

            {/* Textarea for editing */}
            {isEditingText && (
                <textarea
                    ref={inputRef}
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value)
                        updateTextDims();
                    }
                    }
                    onBlur={finishEditing}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            finishEditing();
                        }
                    }}
                    style={{
                        position: "absolute",
                        top: inputStyle.top,
                        left: inputStyle.left,
                        width: inputStyle.width + 10,
                        height: inputStyle.height,
                        fontSize: fontSize,
                        fontWeight: textConfig?.fontStyle || "bold",
                        color: textConfig?.fill || "white",
                        background: "rgba(0,0,0,0.9)",
                        border: "none",
                        outline: "none",
                        padding: "0 4px",
                        textAlign: textAlign,
                        margin: 0,
                        zIndex: 30,
                        userSelect: "text",
                        fontFamily: textConfig?.fontFamily || "Arial",
                        letterSpacing: textConfig?.letterSpacing || 1,
                        lineHeight: textConfig?.lineHeight || 1.2
                    }}
                />
            )}
            {isEditing && (
               <div className="flex absolute top-2 left-2 gap-10">
                 <div className=" z-20 flex gap-2 bg-white/80 p-1 rounded shadow-md">
                    <button
                        onClick={() => setTextAlign("left")}
                        className={`px-1  py-[] text-sm ${textAlign === "left" ? "bg-yellow-500 text-black" : "bg-gray-200"}`}
                    >
                        Left
                    </button>
                    <button
                        onClick={() => setTextAlign("center")}
                        className={`px-1 py-[] text-sm ${textAlign === "center" ? "bg-yellow-500 text-black" : "bg-gray-200"}`}
                    >
                        Center
                    </button>
                    <button
                        onClick={() => setTextAlign("right")}
                        className={`px-2 py-[] text-sm ${textAlign === "right" ? "bg-yellow-500 text-black" : "bg-gray-200"}`}
                    >
                        Right
                    </button>
                </div>

                  <div className="z-20 flex gap-2 bg-white/80 p-1 rounded shadow-md">
                    <div className="flex items-center gap-2">
                        <label className="text-xs whitespace-nowrap">BG Opacity</label>
                        <input
                            type="range"
                            writing-mode="vertical-lr" 
                            direction="rtl"
                            min={0}
                            max={1}
                            step={0.01}
                            value={bgOpacity}
                            onChange={(e) => setBgOpacity(parseFloat(e.target.value))}
                            className="w-24 bg-white/80  "
                        />
                        <span className="text-xs">{bgOpacity.toFixed(2)}</span>
                    </div>
                </div>
               </div>
            )}
        





        </div>
    );
};

export default CanvasWithText;
