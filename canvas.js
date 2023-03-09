const canvas= document.querySelector('.view__canvas');
const canvasContainer= document.querySelector('.view__container')
const canvasRes=document.querySelector('.canvas__size')
const ctx= canvas.getContext('2d');
const canvasSaving= document.createElement('canvas');
const savingCtx = canvasSaving.getContext('2d')   

const toolConfig= document.querySelector('.editor__tools--config')

//make canvas a responsive sive for the section editor__config-tools
const aspectToggle= document.getElementById('resizer__aspect')
const heightInput =document.getElementById('resizer__input--height')
const fileInput= document.getElementById('resizer__file');
const widthInput =document.getElementById('resizer__input--width')
let activeImage, isDrawing;
let originalWidthToHeightRatio='1x1';
const availableRes=document.getElementsByName('ratio')

const imgFillCanvas= document.getElementById('imgFillCanvas')


let rectangleBtn='rectangle';
let circleBtn='circle';
let triangleBtn='triangle'
let lineBtn= 'line';
let curvedLineBtn='curved-line'
let bucketBtn = 'paint-bucket'
const shapes=[rectangleBtn,circleBtn,triangleBtn, lineBtn, curvedLineBtn, bucketBtn]

for (let i=0; i<shapes.length; i++){
    let item=shapes[i]
    shapes[i]=document.getElementById(item)
    shapes[i].addEventListener('click', ()=>{
        ctx.beginPath()
        isDrawing=item
    })
}

availableRes.forEach((res)=>{
    res.addEventListener('click',(e)=>{
        changeCanvasByCheck(e.target.value)
        canvasRes.textContent= `${canvas.clientWidth}x${canvas.clientHeight}`
}) 

})

keepRatioAndResize()

function changeCanvasByCheck(res){
    originalWidthToHeightRatio=res;
    const index=res.indexOf('x')
    let width = parseInt(res.slice(0, index),10)
    let height = parseInt(res.slice(index+1,),10)
    keepRatioAndResize(width,height)
}

window.addEventListener('resize', () => {
    keepRatioAndResize(canvas.width,canvas.height)
    // if(widthInput.value!=='0'){ // img doesnt load after resize 
    //     console.log(widthInput.value)
    //     ctx.drawImage(activeImage,0,0, widthInput.value+1, heightInput.value+1)
    // }
})

// resizeCanvasToAnotherRatio()
fileInput.addEventListener("change", (e)=>{
    const reader= new FileReader(); // Web API, not 'fs'
    
    reader.addEventListener("load", ()=>{
        openImage(reader.result)
    })

    reader.readAsDataURL(e.target.files[0]);
})

function divideRatio(){
    const i=parseInt(originalWidthToHeightRatio.indexOf('x'));
    const width=parseInt(originalWidthToHeightRatio.slice(0,i))
    const height=parseInt(originalWidthToHeightRatio.slice(i+1,))
    return width/height
}

function storeOldCanvas(){
    canvasSaving.width=canvas.width;
    canvasSaving.height=canvas.height
    savingCtx.drawImage(canvas,0,0)
}

widthInput.addEventListener("change", ()=>{
    // if (!activeImage)return;

    console.log(heightInput.value, originalWidthToHeightRatio)
    const heightValue= aspectToggle.checked ? widthInput.value / divideRatio() : heightInput.value;
    resize({width:widthInput.value, height:heightValue})
    canvasRes.textContent= `${canvas.clientWidth}x${canvas.clientHeight}`
})
heightInput.addEventListener("change", ()=>{
    //if (!activeImage)return;
    console.log(heightInput.value)
    const widthValue= aspectToggle.checked ? heightInput.value * divideRatio() : widthInput.value;
    
    
    resize({width:widthValue, height:heightInput.value})
})
function approximateOriginalRes(widthNum,heightNum){
    if (widthNum<canvas.width && heightNum<canvas.height){
        return {widthNum,heightNum}
    }
    return approximateOriginalRes(widthNum/1.2,heightNum/1.2)
}

function openImage(imageSrc){
    activeImage= new Image();
    activeImage.src=imageSrc;
    activeImage.addEventListener("load",()=>{
        originalWidthToHeightRatio = `${activeImage.width}x${activeImage.height}`;
        console.log(activeImage.width,activeImage.height)
        console.log(imgFillCanvas.checked)
        if(imgFillCanvas.checked){
            ctx.drawImage(activeImage,0,0, canvas.width, canvas.height)
        }else {
            const rescaledRes=approximateOriginalRes(activeImage.width,activeImage.height)
            ctx.drawImage(activeImage,0,0, rescaledRes.widthNum, rescaledRes.heightNum)
        }
        
    })
}

function resize(dimensions){
const {width,height}= dimensions
if (canvas.width>0 && canvas.height>0){
    storeOldCanvas()
}
 canvas.width=width;
 canvas.height=height;
widthInput.value=width;
heightInput.value=height;
console.log (width,height)
if (canvas.width>0 && canvas.height>0){
    colorCanvasBg()
ctx.drawImage(canvasSaving,0,0)
}}
 
function keepRatioAndResize(cWidth,cHeight){
    let width= cWidth? cWidth:1000;
    let height = cHeight? cHeight:1000;
    let maxWidth, maxHeight, ratio; //different ratio
    storeOldCanvas()
    getLimitSize()
    getNonStretchRatio()
    resizeCanvas()
    colorCanvasBg()
    ctx.drawImage(canvasSaving,0,0)

function getLimitSize(){
    maxWidth= canvasContainer.clientWidth;
    maxHeight= canvasContainer.clientHeight;
    canvasRes.textContent= `${maxWidth}x${maxHeight}`
}
function getNonStretchRatio(){
    ratio= maxWidth/width;
    if (height*ratio>maxHeight){
        ratio=maxHeight/height;
    }
    
}
function resizeCanvas(){
    canvas.width=width*ratio;
    canvas.height=height*ratio;
}
    
}

let brushWidth=document.querySelector('#line-width');
let shapeStart,shapeEnd;

const startDraw= (e)=>{
    ctx.lineWidth= brushWidth.value;
    if (activeTool==="drawing"){
        ctx.beginPath()
        isDrawing='pencil';
    }
    if (activeTool==='shapes'){
        storeOldCanvas()
    }
    if (isDrawing==='paint-bucket') {
        fillBucket(e)
    }
    
}
const setShapeStart= (e) =>{
    shapeStart={'x':e.offsetX,'y':e.offsetY}
}

const setShapeEnd= (e)=>{
    shapeEnd={'x':e.offsetX, 'y':e.offsetY}
    
}

//fill bucket: a stack which cuts column pixel checking activating again 
//upon dectecting a different pixel color on its sides. Image data colors. startPos = start position
// followed this tutorial for filling:https://cantwell-tom.medium.com/flood-fill-and-line-tool-for-html-canvas-65e08e31aec6

// got a problem at the color format, which now gets converted to RGB. Also reversed canvas variable names. 
let source= canvasSaving.toDataURL();
let img= new Image()
function actionFill(startX, startY, currentColor) {
    //get imageData
    let colorLayer = savingCtx.getImageData(
      0,
      0,
      canvasSaving.width,
      canvasSaving.height
    );
    let startPos = (startY * canvasSaving.width + startX) * 4;
    //clicked color
    let startR = colorLayer.data[startPos];
    let startG = colorLayer.data[startPos + 1];
    let startB = colorLayer.data[startPos + 2];
      //exit if color is the same
  if (
    currentColor.r === startR &&
    currentColor.g === startG &&
    currentColor.b === startB
  ) {
    return;
  }
  //Start with click coords
  let pixelStack = [[startX, startY]];
  let newPos, x, y, pixelPos, reachLeft, reachRight;
  floodFill();
  function floodFill() {
    newPos = pixelStack.pop();
    x = newPos[0];
    y = newPos[1];
    //get current pixel position
    pixelPos = (y * canvasSaving.width + x) * 4;
    // Go up as long as the color matches and are inside the canvas
    while (y >= 0 && matchStartColor(pixelPos)) {
      y--;
      pixelPos -= canvasSaving.width * 4;
    }
    //Don't overextend
    pixelPos += canvasSaving.width * 4;
    y++;
    reachLeft = false;
    reachRight = false;
    // Go down as long as the color matches and in inside the canvas
    while (y < canvasSaving.height && matchStartColor(pixelPos)) {
      colorPixel(pixelPos);
      if (x > 0) {
        if (matchStartColor(pixelPos - 4)) {
          if (!reachLeft) {
            //Add pixel to stack
            pixelStack.push([x - 1, y]);
            reachLeft = true;
          }
        } else if (reachLeft) {
          reachLeft = false;
        }
      }
      if (x < canvasSaving.width - 1) {
        if (matchStartColor(pixelPos + 4)) {
          if (!reachRight) {
            //Add pixel to stack
            pixelStack.push([x + 1, y]);
            reachRight = true;
          }
        } else if (reachRight) {
          reachRight = false;
        }
      }
      y++;
      pixelPos += canvasSaving.width * 4;
    }
    //recursive until no more pixels to change
    if (pixelStack.length) {
      floodFill();
    }
  }
  //render floodFill result
  savingCtx.putImageData(colorLayer, 0, 0);
  //helpers
  function matchStartColor(pixelPos) {
    let r = colorLayer.data[pixelPos];
    let g = colorLayer.data[pixelPos + 1];
    let b = colorLayer.data[pixelPos + 2];
    return r === startR && g === startG && b === startB;
  }
  function colorPixel(pixelPos) {
    colorLayer.data[pixelPos] = currentColor.r;
    colorLayer.data[pixelPos + 1] = currentColor.g;
    colorLayer.data[pixelPos + 2] = currentColor.b;
    colorLayer.data[pixelPos + 3] = 255;
  }
}
const fillBucket = (e) => {
    let trueRatio = canvas.offsetWidth / canvas.width;
  let mouseX = Math.floor(e.offsetX / trueRatio);
  let mouseY = Math.floor(e.offsetY / trueRatio);
  console.log(ctx.fillStyle)
  let hexToRgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(ctx.fillStyle);
  hexToRgb = {r: parseInt(hexToRgb[1],16),g: parseInt(hexToRgb[2],16),b: parseInt(hexToRgb[3],16)}
  console.log(hexToRgb)
actionFill(mouseX, mouseY, hexToRgb);
//Render onto onscreen canvas
source = canvasSaving.toDataURL();
renderImage();
}

function renderImage() {
    img.src = source;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawCanvas();
    };
  }

  function drawCanvas() {
    //Prevent blurring
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

canvas.addEventListener('mousedown', setShapeStart)
canvas.addEventListener('mouseup', setShapeEnd)
const drawing = (e)=> {
    if(!isDrawing) return
    if(isDrawing==='pencil'){
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke()
        //mouseMove happens 2 times fast enough, that's why it marks the canvas without a starter point.
        return
    }
    if(isDrawing==='rectangle' && shapeStart){
        ctx.beginPath()
        ctx.clearRect(0,0,canvas.width,canvas.height)
        ctx.drawImage(canvasSaving,0,0)
        setShapeEnd(e)
        console.log(shapeStart['x'],shapeStart['y'])
        ctx.strokeRect(shapeStart['x'], shapeStart['y'], shapeEnd['x'] - shapeStart['x'], shapeEnd['y'] - shapeStart['y']) 
    }
    if(isDrawing==='circle' && shapeStart){
        ctx.beginPath()
        ctx.clearRect(0,0,canvas.width,canvas.height)
        ctx.drawImage(canvasSaving,0,0)
        setShapeEnd(e)
        let circleRadius;
        if (Math.abs(shapeEnd['x'] - shapeStart['x']) > Math.abs(shapeEnd['y'] - shapeStart['y'])){
            circleRadius=Math.abs(shapeEnd['x'] - shapeStart['x'])
        }  else {
            circleRadius= Math.abs(shapeEnd['y'] - shapeStart['y'])
        }
        ctx.arc(shapeStart['x'],shapeStart['y'], circleRadius, 0, Math.PI*2)
        ctx.stroke()
    }
    if(isDrawing==='triangle' && shapeStart){
        ctx.beginPath();
        ctx.clearRect(0,0,canvas.width,canvas.height)
        ctx.drawImage(canvasSaving,0,0)
        setShapeEnd(e)
        ctx.moveTo(shapeStart['x'],shapeStart['y']);
        ctx.lineTo(shapeEnd['x'],shapeEnd['y']);
        ctx.lineTo(shapeEnd['x'],shapeStart['y']);
        ctx.closePath()
        ctx.stroke();
        
    }
    if(isDrawing==='line' && shapeStart){
        ctx.beginPath()
        ctx.clearRect(0,0,canvas.width,canvas.height)
        ctx.drawImage(canvasSaving,0,0)
        setShapeEnd(e)
        ctx.moveTo(shapeStart['x'],shapeStart['y'])
        ctx.lineTo(shapeEnd['x'],shapeEnd['y'])
        ctx.stroke()
    }
    if (isDrawing==='curved-line' && shapeStart){
        ctx.beginPath()
        ctx.clearRect(0,0,canvas.width,canvas.height)
        ctx.drawImage(canvasSaving,0,0)
        setShapeEnd(e)
        ctx.moveTo(shapeStart['x'],shapeStart['y'])
        ctx.bezierCurveTo(shapeEnd['x']-100,shapeEnd['y']-100,shapeEnd['x']-200,shapeEnd['y']-200,shapeEnd['x'],shapeEnd['y'])
        ctx.stroke()
    }
    inspect the JS:https://blogs.sitepointstatic.com/examples/tech/canvas-curves/bezier-curve.html
}

const endDraw = ()=>{
    shapeStart=false;
    if(isDrawing==='rectangle'){
        //shapeStart=false
    }
    console.log(isDrawing)
    if(isDrawing==='pencil'){isDrawing=false;
    }
}
// Open tools config
let toggleCounter;
let activeTool;
const toggleToolConfig = () =>{
    if (!toggleCounter) {
        toolConfig.style.display='block'
        toolConfig.style.flex=1;
        toggleCounter=1;
        return
    }
    toolConfig.style.display='none'
    toolConfig.style.flex=0;
    toggleCounter=0;
} 
//button for tools
const closeConfigIcon= document.getElementById('close__config')
const selectTool = (e) =>{
    if (toggleCounter===0){
        toggleToolConfig()
    }
    
    const previousActiveTool=  document.querySelector('.tools__open--active');
    console.log(previousActiveTool)
    if (previousActiveTool) {
        previousActiveTool.classList.remove('tools__open--active')
        const previousActiveToolConfig = previousActiveTool.id
        const activeToolOptions=document.getElementById(`${previousActiveToolConfig.toLowerCase()}__config`)
        if(activeToolOptions){
            activeToolOptions.classList.add('config--hidden')

        }
    }
    if (e.target.tagName!=='LABEL') {
        e.target.classList.add('tools__open--active')}
    if (e.target.tagName==='LABEL') {
        e.target.parentElement.classList.add('tools__open--active')
    }
    activeTool= e.target.id || e.target.parentElement.id;
    console.log(activeTool)
    const activeToolOptions=document.getElementById(`${activeTool.toLowerCase()}__config`)
    if(activeToolOptions){
        activeToolOptions.classList.remove('config--hidden')
    }
}
const colorBtns= document.getElementsByName('color');
console.log(colorBtns)
colorBtns.forEach((btn)=>{
    btn.addEventListener('click', ()=>{
        console.log(btn.value)
        ctx.fillStyle= btn.value
        ctx.strokeStyle= btn.value
    })
})
//arrumar o click nas labels e a disposição das labels na UI. Teste de memória: qual a tag que vou agrupar radio 

closeConfigIcon.addEventListener('click', toggleToolConfig)

const allTools=document.querySelectorAll('.tools__open')
allTools.forEach((toolEle) => {toolEle.addEventListener('click', selectTool)})

canvas.addEventListener('mousedown', startDraw)
canvas.addEventListener('mousemove', drawing)
window.addEventListener('mouseup', endDraw)

//canvas doesn't start with a color, so I need to color it both at the start and at resizing.
function colorCanvasBg(){
    ctx.rect(0,0,canvas.width,canvas.height)
    ctx.fillStyle='#ffffff';
    ctx.fill()
}
colorCanvasBg()
