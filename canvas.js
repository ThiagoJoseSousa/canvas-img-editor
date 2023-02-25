const canvas= document.querySelector('.view__canvas');
const canvasContainer= document.querySelector('.view__container')
const canvasRes=document.querySelector('.canvas__size')
const ctx= canvas.getContext('2d');

const toolConfig= document.querySelector('.editor__tools--config')

//make canvas a responsive sive for the section editor__config-tools
const aspectToggle= document.querySelector('.resizer__aspect')
const heightInput =document.querySelector('.resizer__input--height')
const fileInput= document.querySelector('.resizer__file');
const widthInput =document.querySelector('.resizer__input--width')
let activeImage, originalWidthToHeightRatio, isDrawing;

const availableRes=document.getElementsByName('ratio')
availableRes.forEach((res)=>{
    res.addEventListener('click',(e)=>{
        changeCanvasByCheck(e.target.value)
        canvasRes.textContent= `${canvas.clientWidth}x${canvas.clientHeight}`
}) 

})

keepRatioAndResize()

function changeCanvasByCheck(res){
    const index=res.indexOf('x')
    let width = parseInt(res.slice(0, index),10)
    let height = parseInt(res.slice(index+1,),10)
    keepRatioAndResize(width,height)
}

window.addEventListener('resize', () => {
    keepRatioAndResize();
    if(widthInput.value!=='0'){ // img doesnt load after resize 
        ctx.drawImage(activeImage,0,0, widthInput.value+1, heightInput.value+1)
    }
})

// resizeCanvasToAnotherRatio()
fileInput.addEventListener("change", e=>{
    const reader= new FileReader(); // Web API, not 'fs'
    
    reader.addEventListener("load", ()=>{
        openImage(reader.result)
    })

    reader.readAsDataURL(e.target.files[0]);
})

widthInput.addEventListener("change", ()=>{
    if (!activeImage)return;

    const heightValue= aspectToggle.checked ? widthInput.value / originalWidthToHeightRatio : heightInput.value;

    resize({width:widthInput.value, height:heightValue})
})

heightInput.addEventListener("change", ()=>{
    if (!activeImage)return;
    
    const widthValue= aspectToggle.checked ? heightInput.value / originalWidthToHeightRatio : heightInput.value;
    
    
    resize({width:widthValue, height:heightInput.value})
})


function openImage(imageSrc){
    activeImage= new Image();
    activeImage.src=imageSrc;
    activeImage.addEventListener("load",()=>{
        originalWidthToHeightRatio = activeImage.width/activeImage.height;

        resize({width:activeImage.width, height:activeImage.height})
    })
}

function resize(dimensions){
const {width,height}= dimensions
// canvas.width=width;
// canvas.height=height;
widthInput.value=width;
heightInput.value=height;

ctx.drawImage(activeImage,0,0, width, height)
}


function keepRatioAndResize(cWidth,cHeight){
    let width= cWidth? cWidth:1920;
    let height = cHeight? cHeight:1080;
let maxWidth, maxHeight, ratio; //different ratio
getLimitSize()
getNonStretchRatio()
resizeCanvas()
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

const startDraw= ()=>{
    if (activeTool==="Drawing"){
       ctx.beginPath()
        isDrawing=true;
        ctx.lineWidth= brushWidth.value;
        console.log(ctx.lineWidth)
    }
}

const drawing = (e)=> {
    if(!isDrawing) return
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke()
}

const endDraw = ()=>{
    isDrawing=false;
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
canvas.addEventListener('mouseup', endDraw)

