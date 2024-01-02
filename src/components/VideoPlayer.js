import React, { useState, useRef, useEffect } from "react";
import FaceDetectionCanvas from "./FaceDetectionCanvas";
import {
  Container,
  FormControlLabel,
  Radio,
  RadioGroup,
  Button,
  Input,
  Typography,
  Box,
  Paper,
  AppBar,
  Toolbar,
} from "@mui/material";
import { PlayArrow, Pause } from "@mui/icons-material";

const VideoPlayer = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const videoRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (useCamera) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [useCamera]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      if (cameraRef.current) {
        cameraRef.current.srcObject = stream;
        cameraRef.current.play();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopCamera = () => {
    if (cameraRef.current) {
      const stream = cameraRef.current.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
      cameraRef.current.srcObject = null;
    }
  };

  const handleVideoChange = (e) => {
    stopCamera();
    setVideoUrl(URL.createObjectURL(e.target.files[0]));
    setUploadMessage("");
  };

  const handlePlayPause = () => {
    if (!videoUrl) {
      setUploadMessage("Please upload a video first.");
      return;
    }

    const video = videoRef.current;

    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
    }

    setIsPlaying(!isPlaying);
  };

  const handleToggleCamera = () => {
    setUseCamera(!useCamera);
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Video Player with Face Detection</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 3 }}>
        <RadioGroup
          row
          aria-label="source"
          name="source"
          value={useCamera ? "camera" : "upload"}
          onChange={handleToggleCamera}
        >
          <FormControlLabel
            value="upload"
            control={<Radio />}
            label="Upload Video"
          />
          <FormControlLabel
            value="camera"
            control={<Radio />}
            label="Live Camera"
          />
        </RadioGroup>

        {uploadMessage && (
          <Box mt={3}>
            <Typography color="error">{uploadMessage}</Typography>
          </Box>
        )}

        {useCamera ? (
          <Box mt={3}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <video ref={cameraRef} width="100%" height="auto" />
              <FaceDetectionCanvas
                videoElement={cameraRef.current}
                isPlaying={isPlaying}
              />
            </Paper>
          </Box>
        ) : (
          <Box mt={3}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={isPlaying ? <Pause /> : <PlayArrow />}
                onClick={handlePlayPause}
                sx={{ mt: 2 }}
              >
                {isPlaying ? "Pause" : "Play"}
              </Button>
              {videoUrl && (
                <div>
                  <video ref={videoRef} controls width="100%" src={videoUrl} />
                  {/* <video ref={videoRef} controls width="100%" height="auto" /> */}
                  <FaceDetectionCanvas
                    videoUrl={videoUrl}
                    isPlaying={isPlaying}
                  />
                </div>
              )}
            </Paper>
          </Box>
        )}

        {isPlaying && (
          <Box mt={3}>
            <Paper elevation={3} sx={{ p: 2 }}>
              {videoUrl && (
                <FaceDetectionCanvas
                  videoElement={
                    useCamera ? cameraRef.current : videoRef.current
                  }
                  isPlaying={isPlaying}
                />
              )}
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default VideoPlayer;
