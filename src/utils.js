export function showDialogue(text, end) {
    const dialogueContainer = document.getElementById("textbox-container");
    const dialogue = document.getElementById("dialogue");
  
    dialogueContainer.style.display = "block";
    let index = 0;
    let currentText = "";
    const interval = setInterval(() => {
      if (index < text.length) {
        currentText += text[index];
        dialogue.innerHTML = currentText;
        index++;
        return;
      }
  
      clearInterval(interval);
    }, 1);
  
    const close = document.getElementById("close");
  
    function handleCloseClick() {
      end();
      dialogueContainer.style.display = "none";
      dialogue.innerHTML = "";
      clearInterval(interval);
      close.removeEventListener("click", handleCloseClick);
    }
  
    close.addEventListener("click", handleCloseClick);
  
    addEventListener("keypress", (key) => {
      if (key.code === "Enter") {
        close.click();
      }
    });
  }
  
  export const setCamScale = (k) => {
    const resize = k.width() / k.height();
    if (resize < 1) {
      k.camScale(k.vec2(1));
    } else {
      k.camScale(k.vec2(1.5));
    }
  }
  