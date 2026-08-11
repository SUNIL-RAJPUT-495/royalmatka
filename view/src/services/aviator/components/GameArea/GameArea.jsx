import React, { useEffect, useRef } from "react";
import { useAviatorStore } from "../../store/aviatorStore";
import planeSvg from "../../../../assets/icons/flight.svg";
import rotorSvg from "../../../../assets/icons/gamin.svg";
import timerIcon from "../../../../assets/icons/003122d0-9da3-4481-a743-b54e6cfe7ad0.svg";
import bgSvg from "../../../../assets/icons/e1b329bd-6b34-417a-a99d-a4610ebf9405.svg";

export const GameArea = () => {
  const { status, multiplier, countdown, crashMultiplier } = useAviatorStore();
  const canvasRef = useRef(null);
  const planeImgRef = useRef(null);
  const animationRef = useRef(null);
  const statusRef = useRef(status);
  const multiplierRef = useRef(multiplier);
  const startTimeRef = useRef(Date.now());
  const planeOffsetRef = useRef({ x: 0, y: 0, crashSpeedX: 0, crashSpeedY: 0 });

  useEffect(() => {
    statusRef.current = status;
    multiplierRef.current = multiplier;

    if (status === "flying") {
      startTimeRef.current = Date.now();
      planeOffsetRef.current = { x: 0, y: 0, crashSpeedX: 0, crashSpeedY: 0 };
    }
  }, [status, multiplier]);

  useEffect(() => {
    const img = new Image();
    img.src = planeSvg;
    img.onload = () => {
      planeImgRef.current = img;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const render = () => {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, w, h);

      const currentStatus = statusRef.current;
      const currentMult = multiplierRef.current;

      const gridStartX = 24;
      const gridEndX = w - 36;
      const gridStartY = h - 24;
      const gridEndY = 28;
      const gridW = gridEndX - gridStartX;
      const gridH = gridStartY - gridEndY;

      let elapsed = 0;
      if (currentStatus === "flying") {
        elapsed = (Date.now() - startTimeRef.current) / 1000;
      } else if (currentStatus === "crashed") {
        elapsed = Math.max(1, Math.log(currentMult) / 0.1);
      }

      let maxX = 8.0;
      if (elapsed > 6.0) {
        maxX = elapsed + 2.0;
      }

      let maxY = 2.0;
      if (currentMult > 1.8) {
        maxY = currentMult + 0.2;
      }



      if (currentStatus === "flying" || currentStatus === "crashed") {
        const getPixelCoords = (sec, mult) => {
          const progress = Math.min(1.0, (mult - 1.0) / (maxY - 1.0));
          const px = gridStartX + progress * gridW * 0.85;
          const py = gridStartY - progress * gridH * 0.82;
          return { x: px, y: py };
        };

        let planeCoord = getPixelCoords(elapsed, currentMult);
        let planeX = planeCoord.x;
        let planeY = planeCoord.y;

        planeX = Math.min(gridEndX, Math.max(gridStartX, planeX));
        planeY = Math.min(gridStartY, Math.max(gridEndY, planeY));

        ctx.beginPath();
        ctx.moveTo(gridStartX, gridStartY);
        const controlX = gridStartX + (planeX - gridStartX) * 0.7;
        const controlY = gridStartY;

        if (currentStatus === "crashed") {
          const crashSec = Math.max(1, Math.log(currentMult) / 0.1);
          const crashPixel = getPixelCoords(crashSec, currentMult);
          const crashCX = gridStartX + (crashPixel.x - gridStartX) * 0.7;
          ctx.quadraticCurveTo(crashCX, controlY, crashPixel.x, crashPixel.y);
        } else {
          ctx.quadraticCurveTo(controlX, controlY, planeX, planeY);
        }

        ctx.strokeStyle = "#e11d48";
        ctx.lineWidth = 3.5;
        ctx.lineCap = "round";
        ctx.shadowColor = "rgba(225, 29, 72, 0.6)";
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.moveTo(gridStartX, gridStartY);
        if (currentStatus === "crashed") {
          const crashSec = Math.max(1, Math.log(currentMult) / 0.1);
          const crashPixel = getPixelCoords(crashSec, currentMult);
          const crashCX = gridStartX + (crashPixel.x - gridStartX) * 0.7;
          ctx.quadraticCurveTo(crashCX, controlY, crashPixel.x, crashPixel.y);
          ctx.lineTo(crashPixel.x, gridStartY);
        } else {
          ctx.quadraticCurveTo(controlX, controlY, planeX, planeY);
          ctx.lineTo(planeX, gridStartY);
        }
        ctx.closePath();

        const pathGradient = ctx.createLinearGradient(gridStartX, gridStartY, gridStartX, gridEndY);
        pathGradient.addColorStop(0, "rgba(225, 29, 72, 0.6)");
        pathGradient.addColorStop(1, "rgba(225, 29, 72, 0.02)");
        ctx.fillStyle = pathGradient;
        ctx.fill();

        if (currentStatus === "crashed") {
          if (planeOffsetRef.current.crashSpeedX === 0) {
            planeOffsetRef.current.crashSpeedX = 14;
            planeOffsetRef.current.crashSpeedY = -8;
          }
          planeOffsetRef.current.x += planeOffsetRef.current.crashSpeedX;
          planeOffsetRef.current.y += planeOffsetRef.current.crashSpeedY;
          planeX += planeOffsetRef.current.x;
          planeY += planeOffsetRef.current.y;
        }

        let angle = 0;

        if (currentStatus === "flying") {
          const hoverOffset = Math.sin(Date.now() / 180) * 3.5;
          planeY += hoverOffset;
          angle = Math.sin(Date.now() / 130) * 0.02; // Subtle level hover wobble
        } else if (currentStatus === "crashed") {
          angle = -Math.PI / 15; // Slight tilt when flying away
        }

        if (planeX < w + 40 && planeY > -40) {
          ctx.save();
          ctx.translate(planeX, planeY);
          ctx.rotate(angle);
          ctx.shadowColor = "rgba(225, 29, 72, 0.8)";
          ctx.shadowBlur = 10;

          if (planeImgRef.current) {
            const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
            const planeW = isMobile ? 75 : 100;
            const planeH = isMobile ? 38 : 50;
            const offsetX = isMobile ? -10 : -13;
            const offsetY = isMobile ? -28 : -37;
            ctx.drawImage(planeImgRef.current, offsetX, offsetY, planeW, planeH);
          } else {
            ctx.fillStyle = "#e11d48";
            ctx.beginPath();
            ctx.ellipse(0, 0, 16, 5, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="relative rounded-3xl w-full h-[370px] sm:h-[340px] md:h-[380px] lg:h-[270px]  overflow-hidden select-none bg-black">
      <div
        className="absolute pointer-events-none select-none overflow-hidden z-0"
        style={{
          left: 0,
          bottom: 0,
          width: "280%",
          aspectRatio: "1 / 1",
          transform: "translate(-50%, 50%)",
        }}
      >
        <img
          src={rotorSvg}
          alt="Rotor Watermark"
          className="w-full h-full object-cover  pointer-events-none select-none"
          style={{
            animation: status === "flying" ? "spin 35s linear infinite" : "none",
          }}
        />
      </div>

      <img
        src={bgSvg}
        alt="Spotlight Glow"
        className="absolute -bottom-[35%] -left-[30%] w-[160%] h-[130%] object-cover opacity-[0.1] pointer-events-none mix-blend-screen select-none z-0"
      />

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />

      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/50 rounded-full px-3 py-2 z-20 text-sm font-bold">
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-bold">👤</div>
          <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-xs font-bold">👤</div>
          <div className="w-6 h-6 rounded-full bg-red-400 flex items-center justify-center text-xs font-bold">👤</div>
        </div>
        <span className="text-white ml-1">98</span>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 px-4">
          

        {status === "waiting" && (
          <div className="flex flex-col items-center justify-center text-center animate-fade-in z-30">
            <div className="relative mb-3 flex items-center justify-center select-none w-11 h-11 rounded-full bg-white/10 ring-1 ring-white/10">
              <img src={timerIcon} alt="Timer Icon" className="w-9 h-9 animate-pulse select-none" />
            </div>
            <span className="text-white font-black text-sm uppercase tracking-[0.25em] leading-none mb-2 select-none">
              Waiting for next round
            </span>
            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-red-600 transition-all ease-linear"
                style={{ width: `${(countdown / 5.0) * 100}%` }}
              />
            </div>
            <span className="text-gray-400 font-mono text-[10px] font-bold">
              Placing bets... {countdown.toFixed(1)}s
            </span>
          </div>
        )}

        {status === "flying" && (
          <div className="flex flex-col items-center justify-center">
            
            <h1 className="text-6xl sm:text-7xl md:text-7xl font-bold   text-white tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              {multiplier.toFixed(2)}x
            </h1>
          </div>
        )}

        {status === "crashed" && (
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-white text-[30px]  uppercase  mb-1 select-none">
              FLEW AWAY!
            </span>
            <h1 className="text-6xl sm:text-7xl md:text-7xl font-bold text-[#e11d48] tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              {crashMultiplier.toFixed(2)}x
            </h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameArea;
