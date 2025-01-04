"use client"

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer, Pause, Play, RotateCcw, GitBranch } from "lucide-react";

const PomodoroGitTracker = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState({
    startTime: null,
    commits: 0,
    type: "work",
  });

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleSessionComplete = () => {
    const newSession = {
      ...currentSession,
      duration: 25 * 60 - timeLeft,
      endTime: new Date(),
    };
    setSessions([...sessions, newSession]);
    setTimeLeft(currentSession.type === "work" ? 5 * 60 : 25 * 60);
    setCurrentSession({
      startTime: new Date(),
      commits: 0,
      type: currentSession.type === "work" ? "break" : "work",
    });
    setIsRunning(false);
  };

  const startTimer = () => {
    if (!isRunning && timeLeft === 25 * 60) {
      setCurrentSession({
        ...currentSession,
        startTime: new Date(),
      });
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
    setCurrentSession({
      startTime: null,
      commits: 0,
      type: "work",
    });
  };

  const logCommit = () => {
    setCurrentSession({
      ...currentSession,
      commits: currentSession.commits + 1,
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2">
          <Timer className="w-6 h-6" />
          Pomodoro Git Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-6xl font-bold mb-8">{formatTime(timeLeft)}</div>
          <div className="space-x-4 mb-8">
            {!isRunning ? (
              <Button onClick={startTimer} className="gap-2">
                <Play className="w-4 h-4" />
                Start
              </Button>
            ) : (
              <Button onClick={pauseTimer} className="gap-2">
                <Pause className="w-4 h-4" />
                Pause
              </Button>
            )}
            <Button onClick={resetTimer} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <Button onClick={logCommit} variant="outline" className="gap-2">
              <GitBranch className="w-4 h-4" />
              Log Commit
            </Button>
          </div>

          <div className="text-left">
            <h3 className="font-semibold mb-2">Current Session</h3>
            <p>Type: {currentSession.type}</p>
            <p>Commits: {currentSession.commits}</p>
          </div>

          {sessions.length > 0 && (
            <div className="mt-8 text-left">
              <h3 className="font-semibold mb-2">Previous Sessions</h3>
              <div className="space-y-2">
                {sessions.map((session, index) => (
                  <div key={index} className="p-2 bg-gray-100 rounded">
                    <p>Type: {session.type}</p>
                    <p>Commits: {session.commits}</p>
                    <p>Duration: {formatTime(session.duration)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PomodoroGitTracker;
