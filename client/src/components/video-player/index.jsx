import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import {
  Maximize,
  Minimize,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  RotateCw,
} from "lucide-react";
import { progress } from "framer-motion";

const VideoPlayer = ({ width = "100%", height = "100%", url, useProgressUpdate,  onProgressUpdate, progressData }) => {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const handlePlayAndPause = () => {
    setPlaying(!playing);
  };

  const handleProgress = (state) => {
    if (!seeking) {
      setPlayed(state.played);
    }
  };

  const handleRewind = () => {
    playerRef.current?.seekTo(playerRef?.current?.getCurrentTime() - 5);
  };

  const handleForward = () => {
    playerRef.current?.seekTo(playerRef?.current?.getCurrentTime() + 5);
  };

  const handleToggleMute = () => {
    setMuted(!muted);
  };

  const handleSeekChange = (newValue) => {
    
    setPlayed(newValue);
    setSeeking(true);
  };

  const handleSeekMouseUp = () => {
    setSeeking(false);
    playerRef.current?.seekTo(played);
  };

  const handleVolumeChange = (newValue) => {
    setVolume(newValue[0]);
  };

  const pad = (string) => {
    return ("0" + string).slice(-2);
  };

  const formatTime = (seconds) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = pad(date.getUTCSeconds());

    if (hh) {
      return `${hh} : ${pad(mm)} : ${(ss)}`;
    }

    return `${mm} : ${ss}`;
  };

  const handleFullScreen = useCallback(() => {
    if (!isFullScreen) {//Then, it is sure to go full screen
      if (playerContainerRef?.current?.requestFullscreen) { //Check if the browser supports requestFullscreen. 
        playerContainerRef?.current?.requestFullscreen(); //This is called on the specific element you want to show in fullscreen. 
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen(); //Fullscreen mode is controlled at the document level. So to exit, you must tell the browser: “exit fullscreen mode”, not “exit fullscreen of this element”.
      }
    }
  }, [isFullScreen]);

  //This keeps track of the state "isFullScreen"
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement); //"document.fullscreenElement" gives null if no component is in Fullscreen, else gives that DOM element that is in fullscreen
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange); //"fullscreenchange" is a built-in browser event. It is fired whenever an element takes fullscreen or exits. So the "handleFullScreenChange" is called whenever an entry or exit from fullscreen occurs.

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    }; // This cleanup runs ONLY WHEN the component unmounts.
  }, []);

  useEffect(() => {
    if(!useProgressUpdate){
      return
    }
   if(played === 1){
    onProgressUpdate({
      ...progressData,
      progressValue : played  
    })
   }
  }, [played])

   const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  return (
    <div
      ref={playerContainerRef}
      className={`relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ease-in-out 
    ${isFullScreen ? `w-screen h-screen` : ``}`}
      style={{ width, height }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)} //This vanishes the controls in case pointer is moved out of the video  box 
    >
      <ReactPlayer
        ref={playerRef}
        className="absolute top-0 left-0"
        width="100%"
        height="100%"
        url={url}
        playing={playing}
        volume={volume}
        muted={muted}
        onProgress={handleProgress} //onProgress is called every 0.5 s by default. So, it takes care of updating the state "played" , except in case of seeking. In that case, Slider takes care
      />
      {showControls && (
        <div
          className={` absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-75 p-4 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <Slider
            value={[played * 100]}
            max={100}
            step={0.1}
            onValueChange={(value) => handleSeekChange(value[0] / 100)} //slider manages the value itself. Value is an array that has  the % of video played
            onValueCommit={handleSeekMouseUp}
            className="w-full mb-4"
          />
          <div className="flex items-center  justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePlayAndPause}
                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
              >
                {playing ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>
              <Button
                onClick={handleRewind}
                variant="ghost"
                size="icon"
                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
              >
                <RotateCcw className="h-6 w-6" />
              </Button>

              <Button
                onClick={handleForward}
                variant="ghost"
                size="icon"
                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
              >
                <RotateCw className="h-6 w-6" />
              </Button>
              <Button
                onClick={handleToggleMute}
                variant="ghost"
                size="icon"
                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
              >
                {muted ? (
                  <VolumeX className="h-6 w-6" />
                ) : (
                  <Volume2 className="h-6 w-6" />
                )}
              </Button>
              <Slider
                value={[volume * 100]}
                max={100}
                step={1}
                onValueChange={(value) => handleVolumeChange([value[0] / 100])}
                className="w-24 bg-red-900"
              />
            </div>
            <div className="flex items-center space-x-2 ">
              <div className="text-white ">
                {formatTime(played * (playerRef?.current?.getDuration() || 0))}/{" "}
                {formatTime(playerRef?.current?.getDuration() || 0)}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                onClick={handleFullScreen}
              >
                {isFullScreen ? (
                  <Minimize className="h-6 w-6" />
                ) : (
                  <Maximize className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
