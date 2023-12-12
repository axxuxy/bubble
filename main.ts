import { WebBubbleCanvas } from "./src/web";
import backage from "./backage.jpg";

const canvas = new WebBubbleCanvas({ maxBubbleCount: 20 });
const style: Partial<CSSStyleDeclaration> = {
  position: "fixed",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  background: `url(${backage}) center/cover no-repeat`
}
Object.assign(canvas.canvas.style, style);

document.body.append(canvas.canvas);

window.addEventListener("keydown", (ev) => {
  if (ev.key === " ")
    if (canvas.isAnimation) canvas.stopAnimation();
    else canvas.animation();
})