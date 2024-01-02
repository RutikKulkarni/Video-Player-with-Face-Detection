import React, { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { fabric } from "fabric";

const FaceDetectionCanvas = ({ videoElement, isPlaying }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current);
    const loadFaceAPI = async () => {
      try {
        console.log("Loading FaceAPI models...");
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
        await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
        await faceapi.nets.ageGenderNet.loadFromUri("/models");
        console.log("FaceAPI models loaded successfully.");
      } catch (error) {
        console.error("Error loading FaceAPI models:", error);
      }
    };

    const faceDetection = async () => {
      if (videoElement && isPlaying) {
        try {
          console.log("Detecting faces...");
          const detections = await faceapi
            .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withAgeAndGender();
          console.log("Detected faces:", detections);

          canvas.getObjects("rect").forEach((rect) => {
            if (canvas.contains(rect)) {
              canvas.remove(rect);
            }
          });

          if (detections.length > 0) {
            detections.forEach((face) => {
              const { x, y, width, height, gender, age } = face.alignedRect.box;
              const rect = new fabric.Rect({
                left: x,
                top: y,
                width,
                height,
                fill: "transparent",
                stroke: "red",
                strokeWidth: 2,
                selectable: false,
                evented: false,
              });

              const text = new fabric.Text(
                `Age: ${Math.round(age)} years, Gender: ${gender}`,
                {
                  left: x,
                  top: y + height + 5,
                  fontSize: 16,
                  fill: "red",
                  selectable: false,
                  evented: false,
                }
              );
              canvas.add(rect, text);
            });
          }
        } catch (error) {
          console.error("Error detecting faces:", error);
        }
      }
    };

    loadFaceAPI();
    const intervalId = setInterval(faceDetection, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, [videoElement, isPlaying]);

  return <canvas ref={canvasRef} />;
};
export default FaceDetectionCanvas;