import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage, Text as KonvaText } from "react-konva";
import useImage from "use-image";
import { FaEdit } from "react-icons/fa";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { RiDownload2Fill } from "react-icons/ri";

const CanvasWithText = ({ imageUrl, textConfig }) => {
    const containerRef = useRef(null);
    const captureRef = useRef(null); // for html2canvas capture
    const [containerWidth, setContainerWidth] = useState(1024);
    const [image, setImage] = useState(null);
    const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingText, setIsEditingText] = useState(false);
    const [text, setText] = useState("Your \nText Here");

    const [loadedImage] = useImage(imageUrl); // no 'anonymous'

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

    const inputRef = useRef(null);

    useEffect(() => {
        if (isEditingText && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditingText]);

    const [inputStyle, setInputStyle] = useState({ top: 0, left: 0, width: 0, height: 0 });

    const toggleEditing = () => {
        setIsEditing((prev) => !prev);
    };

    const handleTextClick = (e) => {
        if (!isEditing) return;

        const textNode = e.target;
        const stage = textNode.getStage();

        const textPos = textNode.position();
        const containerRect = containerRef.current.getBoundingClientRect();
        const stageBox = stage.container().getBoundingClientRect();
        const offsetX = stageBox.left;
        const offsetY = stageBox.top;

        const left = textPos.x + offsetX - containerRect.left;
        const top = textPos.y + offsetY - containerRect.top;

        setInputStyle({
            top,
            left,
            width: textNode.width(),
            height: textNode.height(),
        });

        setIsEditingText(true);
    };

    const finishEditing = () => {
        setIsEditingText(false);
    };

  

    return (
        <div
            ref={containerRef}
            className="relative w-full"
            style={{ maxWidth: 1024, userSelect: isEditingText ? "none" : "auto" }}
        >
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

            

            <div ref={captureRef} className="w-full">
                <Stage width={containerWidth} height={(containerWidth * 9) / 16}>
                    <Layer>
                        {image && (
                            <KonvaImage image={image} width={containerWidth} height={(containerWidth * 9) / 16} />
                        )}
                        {!isEditingText && (
                            <KonvaText
                                {...textConfig}
                                text={text}
                                x={textPosition.x}
                                y={textPosition.y}
                                width={400}
                                fontSize={textConfig.fontSize * 0.7}
                                lineHeight={textConfig.lineHeight || 1.2}
                                draggable={isEditing}
                                onDragEnd={(e) => {
                                    if (!isEditing) return;
                                    setTextPosition({ x: e.target.x(), y: e.target.y() });
                                }}
                                onClick={handleTextClick}
                                style={{ cursor: isEditing ? "pointer" : "default" }}
                            />
                        )}
                    </Layer>
                </Stage>
            </div>

            {isEditingText && (
                <textarea
                    ref={inputRef}
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
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
                        fontSize: 40,
                        fontWeight: textConfig?.fontStyle || "bold",
                        color: textConfig?.fill || "white",
                        background: "rgba(0,0,0,0.6)",
                        border: "none",
                        outline: "none",
                        padding: "0 4px",
                        margin: 0,
                        zIndex: 30,
                        userSelect: "text",
                        fontFamily: textConfig?.fontFamily || "Arial",
                        letterSpacing: textConfig?.letterSpacing || 0,
                        lineHeight: textConfig?.lineHeight || 1.2,
                    }}
                />
            )}
        </div>
    );
};

export default CanvasWithText;
