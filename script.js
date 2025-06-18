  const canvas = document.querySelector("canvas"),
      toolBtns = document.querySelectorAll(".tool"),
      fillColor = document.querySelector("#fill-color"),
      sizeSlider = document.querySelector("#size-slider"),
      colorBtns = document.querySelectorAll(".colors .option"),
      colorPicker = document.querySelector("#color-picker"),
      clearCanvas = document.querySelector(".clear-canvas"),
      saveImg = document.querySelector(".save-img"),
      imgUpload = document.querySelector("#img-upload"),
      ctx = canvas.getContext("2d");

      let prevMouseX, prevMouseY, snapshot,
      isDrawing = false,
      selectedTool = "brush",
      brushWidth = 5,
      selectedColor = "#000";

      const setCanvasBackground = () => {
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = selectedColor;
      };

      const resizeCanvas = () => {
          const canvasRect = canvas.getBoundingClientRect();
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          canvas.width = canvasRect.width;
          canvas.height = canvasRect.height;
          setCanvasBackground();
          // Restore the image if it exists
          if (imageData.width > 0 && imageData.height > 0) {
              ctx.putImageData(imageData, 0, 0);
          }
      };

      window.addEventListener("load", () => {
          resizeCanvas();
      });

      const drawRect = (e) => {
          const rect = canvas.getBoundingClientRect();
          const x = (e.clientX || e.touches[0].clientX) - rect.left;
          const y = (e.clientY || e.touches[0].clientY) - rect.top;
          
          if(!fillColor.checked) {
              return ctx.strokeRect(x, y, prevMouseX - x, prevMouseY - y);
          }
          ctx.fillRect(x, y, prevMouseX - x, prevMouseY - y);
      };

      const drawCircle = (e) => {
          const rect = canvas.getBoundingClientRect();
          const x = (e.clientX || e.touches[0].clientX) - rect.left;
          const y = (e.clientY || e.touches[0].clientY) - rect.top;
          
          ctx.beginPath();
          let radius = Math.sqrt(Math.pow((prevMouseX - x), 2) + Math.pow((prevMouseY - y), 2));
          ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
          fillColor.checked ? ctx.fill() : ctx.stroke();
      };

      const drawTriangle = (e) => {
          const rect = canvas.getBoundingClientRect();
          const x = (e.clientX || e.touches[0].clientX) - rect.left;
          const y = (e.clientY || e.touches[0].clientY) - rect.top;
          
          ctx.beginPath();
          ctx.moveTo(prevMouseX, prevMouseY);
          ctx.lineTo(x, y);
          ctx.lineTo(prevMouseX * 2 - x, y);
          ctx.closePath();
          fillColor.checked ? ctx.fill() : ctx.stroke();
      };

      const getEventPos = (e) => {
          const rect = canvas.getBoundingClientRect();
          return {
              x: (e.clientX || e.touches[0].clientX) - rect.left,
              y: (e.clientY || e.touches[0].clientY) - rect.top
          };
      };

      const startDraw = (e) => {
          e.preventDefault();
          isDrawing = true;
          const pos = getEventPos(e);
          prevMouseX = pos.x;
          prevMouseY = pos.y;
          ctx.beginPath();
          ctx.lineWidth = brushWidth;
          ctx.strokeStyle = selectedColor;
          ctx.fillStyle = selectedColor;
          snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      };

      const drawing = (e) => {
          e.preventDefault();
          if(!isDrawing) return;
          ctx.putImageData(snapshot, 0, 0);
          const pos = getEventPos(e);
          
          if(selectedTool === "brush" || selectedTool === "eraser") {
              ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
              ctx.lineTo(pos.x, pos.y);
              ctx.stroke();
          } else if(selectedTool === "rectangle") {
              drawRect(e);
          } else if(selectedTool === "circle") {
              drawCircle(e);
          } else if(selectedTool === "triangle") {
              drawTriangle(e);
          }
      };

      toolBtns.forEach(btn => {
          btn.addEventListener("click", () => {
              document.querySelector(".options .active")?.classList.remove("active");
              btn.classList.add("active");
              selectedTool = btn.id;
              canvas.style.cursor = selectedTool === "text" ? "text" : "crosshair";
          });
      });

      sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value);

      colorBtns.forEach(btn => {
          btn.addEventListener("click", () => {
              document.querySelector(".options .selected")?.classList.remove("selected");
              btn.classList.add("selected");
              selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
          });
      });

      colorPicker.addEventListener("change", () => {
          colorPicker.parentElement.style.background = colorPicker.value;
          colorPicker.parentElement.click();
      });

      clearCanvas.addEventListener("click", () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          setCanvasBackground();
      });

      saveImg.addEventListener("click", () => {
          const link = document.createElement("a");
          link.download = `drawing-${Date.now()}.jpg`;
          link.href = canvas.toDataURL();
          link.click();
      });

      // Mouse events
      canvas.addEventListener("mousedown", startDraw);
      canvas.addEventListener("mousemove", drawing);
      canvas.addEventListener("mouseup", () => isDrawing = false);

      // Touch events for mobile
      canvas.addEventListener("touchstart", startDraw);
      canvas.addEventListener("touchmove", drawing);
      canvas.addEventListener("touchend", () => isDrawing = false);

      // Text tool logic
      let textInput = null;

      const createTextInput = (x, y) => {
          if (textInput) return;
          textInput = document.createElement("input");
          textInput.type = "text";
          textInput.className = "canvas-text-input";
          textInput.style.left = `${x}px`;
          textInput.style.top = `${y}px`;
          textInput.onblur = () => {
              const value = textInput.value;
              if (value.trim()) {
                  ctx.fillStyle = selectedColor;
                  ctx.font = `${brushWidth * 3}px Poppins`;
                  ctx.fillText(value, x, y + brushWidth * 3);
              }
              textInput.remove();
              textInput = null;
          };
          textInput.addEventListener('keypress', (e) => {
              if (e.key === 'Enter') {
                  textInput.blur();
              }
          });
          document.body.appendChild(textInput);
          textInput.focus();
      };

      canvas.addEventListener("click", (e) => {
          if (selectedTool === "text") {
              const rect = canvas.getBoundingClientRect();
              createTextInput(e.clientX - rect.left, e.clientY - rect.top);
          }
      });

      // Fullscreen toggle
      document.querySelector(".fullscreen-toggle").addEventListener("click", () => {
          if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
          } else {
              document.exitFullscreen();
          }
      });

      // Responsive canvas resizing on window size change
      window.addEventListener("resize", resizeCanvas);

      // Prevent scrolling when touching the canvas
      document.body.addEventListener("touchstart", (e) => {
          if (e.target === canvas) {
              e.preventDefault();
          }
      }, { passive: false });

      document.body.addEventListener("touchend", (e) => {
          if (e.target === canvas) {
              e.preventDefault();
          }
      }, { passive: false });

      document.body.addEventListener("touchmove", (e) => {
          if (e.target === canvas) {
              e.preventDefault();
          }
      }, { passive: false });
