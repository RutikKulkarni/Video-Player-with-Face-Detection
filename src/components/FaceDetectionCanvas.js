import React, { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { fabric } from "fabric";

const FaceDetectionCanvas = ({ videoElement, isPlaying, detectFaces }) => {
  const canvasRef = useRef(null);
  const objectsRef = useRef([]);

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
      if (videoElement && isPlaying && detectFaces) {
        try {
          console.log("Detecting faces...");
          const detection = await faceapi
            .detectSingleFace(
              videoElement,
              new faceapi.TinyFaceDetectorOptions()
            )
            .withFaceLandmarks()
            .withAgeAndGender();
          console.log("Detected face:", detection);

          objectsRef.current.forEach((obj) => {
            canvas.remove(obj);
          });
          objectsRef.current = [];

          if (detection) {
            const { x, y, width, height } = detection.detection.box;

            const rect = new fabric.Rect({
              left: Math.max(
                0,
                (x / videoElement.videoWidth) * videoElement.clientWidth
              ),
              top: Math.max(
                0,
                (y / videoElement.videoHeight) * videoElement.clientHeight
              ),
              width: Math.min(
                (width / videoElement.videoWidth) * videoElement.clientWidth,
                videoElement.clientWidth -
                  (x / videoElement.videoWidth) * videoElement.clientWidth
              ),
              height: Math.min(
                (height / videoElement.videoHeight) * videoElement.clientHeight,
                videoElement.clientHeight -
                  (y / videoElement.videoHeight) * videoElement.clientHeight
              ),
              fill: "transparent",
              stroke: "red",
              strokeWidth: 2,
              selectable: false,
              evented: false,
            });

            const text = new fabric.Text(
              `Age: ${Math.round(detection.age)} years, Gender: ${
                detection.gender
              }`,
              {
                left: Math.max(
                  0,
                  (x / videoElement.videoWidth) * videoElement.clientWidth
                ),
                top: Math.max(
                  0,
                  (y / videoElement.videoHeight) * videoElement.clientHeight +
                    (height / videoElement.videoHeight) *
                      videoElement.clientHeight +
                    5
                ),
                fontSize: 16,
                fill: "red",
                selectable: false,
                evented: false,
              }
            );

            canvas.add(rect);
            objectsRef.current.push(rect);

            text.set({
              left: rect.left,
              top: rect.top + rect.height + 5,
            });

            canvas.add(text);
            objectsRef.current.push(text);
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
  }, [videoElement, isPlaying, detectFaces]);

  return <canvas ref={canvasRef} />;
};

export default FaceDetectionCanvas;
