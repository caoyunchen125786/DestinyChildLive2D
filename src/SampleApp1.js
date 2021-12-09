var thisRef = this;
var $msg;

window.onerror = function(msg, url, line, col, error) {
    var errmsg = "file:" + url + "<br>line:" + line + " " + msg;
    l2dError(errmsg);
}

function sampleApp1(defaultModel = 'c521_10')
{
    this.platform = window.navigator.platform.toLowerCase();
    
    this.live2DMgr = new LAppLive2DManager();

    this.isDrawStart = false;
    
    this.gl = null;
    this.canvas = null;
    
    this.dragMgr = null; /*new L2DTargetPoint();*/ 
    this.viewMatrix = null; /*new L2DViewMatrix();*/
    this.projMatrix = null; /*new L2DMatrix44()*/
    this.deviceToScreen = null; /*new L2DMatrix44();*/
    
    this.drag = false; 
    this.oldLen = 0;    
    
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    
    this.isModelShown = false;
    
    initL2dCanvas("glcanvas");

    init(defaultModel);
}


function initL2dCanvas(canvasId)
{
    
    this.canvas = document.getElementById(canvasId);
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    if(this.canvas.addEventListener) {
        this.canvas.addEventListener("mousewheel", mouseEvent, false);
        this.canvas.addEventListener("click", mouseEvent, false);
        
        this.canvas.addEventListener("mousedown", mouseEvent, false);
        this.canvas.addEventListener("mousemove", mouseEvent, false);
        
        this.canvas.addEventListener("mouseup", mouseEvent, false);
        this.canvas.addEventListener("mouseout", mouseEvent, false);
        this.canvas.addEventListener("contextmenu", mouseEvent, false);
        
        
        this.canvas.addEventListener("touchstart", touchEvent, false);
        this.canvas.addEventListener("touchend", touchEvent, false);
        this.canvas.addEventListener("touchmove", touchEvent, false);
        
    }
    
}
var showMessage = function (text, delay) {
    if ($msg === undefined) {
        $msg = $('<div></div>').attr('class', 'message');
        $('body').append($msg);
    }
    if ($msg.css('display') != 'none') {
        $msg.finish();
    }
    $msg.html(text);
    $msg.fadeIn(500).delay(delay).fadeOut(500);
}
var getUrlParam = function () {
    var url = window.location.href;
    param = url.split('?')[1];
    if (url === undefined) {
        return;
    }
    for (var i in nameList) {
        if (param == nameList[i]) {
            return param;
        }
    }
}
var setUrlParam = function () {
    var url = window.location.href;
    url = url.split('?')[0];
    url += '?' + $currentModel.text();
    return url;
}
var scrollToCurrent = function(){
    $box.animate({scrollTop: $box.scrollTop() + $currentModel.offset().top - $(window).height() / 2}, 1000);
}

function init(defaultModel)
{
    defaultModel = getUrlParam() || defaultModel;
    showMessage('滚动滚轮以缩放<br>点击左下角图标开始拖动', 4000);

    // set translate method
    isMoving = false;
    $move = $('#move');
    $move.on('click', function(){
        if(isMoving == true){
            isMoving = false;
            $move.removeClass('moving');
            $(document).off('mousedown');
        }
        else{
            isMoving = true;
            $move.addClass('moving');
            $(document).on('mousedown', function(e){
                if(e.button != 0)
                    return;
                var startX = e.clientX, startY = e.clientY;
                $(document).on('mousemove', function(e){
                    offsetX = e.clientX - startX, offsetY = e.clientY - startY;
                    startX = e.clientX, startY = e.clientY;
                    thisRef.viewMatrix.multTranslate(offsetX / 225, - offsetY / 225);
                })
                $(document).on('mouseup', function(){
                    $(document).off('mousemove');
                    $(document).off('mouseup');
                })
            })
        }
    })

    // set model list
    $box = $('#box');
    $currentModel = null;
    for(var i=0;i<nameList.length;i++) {
        var $button = $('<button></button>');
        $button.text(nameList[i]);
        $button.on('click', function(){
            $currentModel.removeClass('current');
            $(this).addClass('current');
            $currentModel = $(this);
            changeModel(this.innerHTML);
            scrollToCurrent();
        })
        $box.append($button);
        if(nameList[i] == defaultModel){
            $button.addClass('current')
            $currentModel = $button;
        }
    }

    //set scroll method
    $box.hover(null, function(){
        setTimeout(function(){
            scrollToCurrent();
        }, 500);
    })

    // set share method
	$('#share').on('click', function () {
		var url = setUrlParam();
		var input = $('<input>').attr('value', url).attr('readonly', 'readonly');
		$('body').append(input);
		input.select();
		document.execCommand('copy');
		input.remove();
		showMessage('链接已复制至剪贴板', 1000);
	})
	$('#share').on('mouseenter', function () {
		showMessage('点击左上分享按钮，即可将当前角色及动作分享给他人', 4000);
	})

    // set scale method
    document.onwheel = function(e){
        if(e.target != canvas)
            return;
        if(e.wheelDelta > 0)
            modelScaling(1.1);
        else modelScaling(0.9);
    }

    var width = this.canvas.width;
    var height = this.canvas.height;
    
    this.dragMgr = new L2DTargetPoint();

    
    var ratio = height / width;
    var left = LAppDefine.VIEW_LOGICAL_LEFT;
    var right = LAppDefine.VIEW_LOGICAL_RIGHT;
    var bottom = -ratio;
    var top = ratio;

    this.viewMatrix = new L2DViewMatrix();

    
    this.viewMatrix.setScreenRect(left, right, bottom, top);
    
    
    this.viewMatrix.setMaxScreenRect(LAppDefine.VIEW_LOGICAL_MAX_LEFT,
                                     LAppDefine.VIEW_LOGICAL_MAX_RIGHT,
                                     LAppDefine.VIEW_LOGICAL_MAX_BOTTOM,
                                     LAppDefine.VIEW_LOGICAL_MAX_TOP); 

    this.viewMatrix.setMaxScale(LAppDefine.VIEW_MAX_SCALE);
    this.viewMatrix.setMinScale(LAppDefine.VIEW_MIN_SCALE);

    this.projMatrix = new L2DMatrix44();
    // this.projMatrix.multScale(1, (width / height)); // adjust to width
    this.projMatrix.multScale((height / width), 1); // adjust to height
    this.projMatrix.multScale(.6, .6);

    
    this.deviceToScreen = new L2DMatrix44();
    this.deviceToScreen.multTranslate(-width / 2.0, -height / 2.0);
    this.deviceToScreen.multScale(2 / width, -2 / width);
    
    
    
    this.gl = getWebGLContext();
    if (!this.gl) {
        l2dError("Failed to create WebGL context.");
        return;
    }
    
    Live2D.setGL(this.gl);

    
    this.gl.clearColor(0.5, 0.5, 0.5, 1.0);

    changeModel(defaultModel);
    scrollToCurrent();
    
    startDraw();
}


function startDraw() {
    if(!this.isDrawStart) {
        this.isDrawStart = true;
        (function tick() {
                draw(); 

                var requestAnimationFrame = 
                    window.requestAnimationFrame || 
                    window.mozRequestAnimationFrame ||
                    window.webkitRequestAnimationFrame || 
                    window.msRequestAnimationFrame;

                
                requestAnimationFrame(tick ,this.canvas);   
        })();
    }
}


function draw()
{
    // l2dLog("--> draw()");

    MatrixStack.reset();
    MatrixStack.loadIdentity();
    
    this.dragMgr.update(); 
    this.live2DMgr.setDrag(this.dragMgr.getX(), this.dragMgr.getY());
    
    
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    
    MatrixStack.multMatrix(projMatrix.getArray());
    MatrixStack.multMatrix(viewMatrix.getArray());
    MatrixStack.push();
    
    for (var i = 0; i < this.live2DMgr.numModels(); i++)
    {
        var model = this.live2DMgr.getModel(i);

        if(model == null) return;
        
        if (model.initialized && !model.updating)
        {
            model.update();
            model.draw(this.gl);
            
            if (!this.isModelShown && i == this.live2DMgr.numModels()-1) {
                this.isModelShown = !this.isModelShown;
            }
        }
    }
    
    MatrixStack.pop();
}


function changeModel(name)
{
    this.isModelShown = false;
    
    this.live2DMgr.reloadFlg = true;
    this.live2DMgr.count++;

    this.live2DMgr.changeModel(this.gl, name);
}




function modelScaling(scale)
{   
    var isMaxScale = thisRef.viewMatrix.isMaxScale();
    var isMinScale = thisRef.viewMatrix.isMinScale();
    
    thisRef.viewMatrix.adjustScale(0, 0, scale);

    
    if (!isMaxScale)
    {
        if (thisRef.viewMatrix.isMaxScale())
        {
            thisRef.live2DMgr.maxScaleEvent();
        }
    }
    
    if (!isMinScale)
    {
        if (thisRef.viewMatrix.isMinScale())
        {
            thisRef.live2DMgr.minScaleEvent();
        }
    }
}



function modelTurnHead(event)
{
    thisRef.drag = true;
    
    var rect = event.target.getBoundingClientRect();
    
    var sx = transformScreenX(event.clientX - rect.left);
    var sy = transformScreenY(event.clientY - rect.top);
    var vx = transformViewX(event.clientX - rect.left);
    var vy = transformViewY(event.clientY - rect.top);
    
    if (LAppDefine.DEBUG_MOUSE_LOG)
        l2dLog("onMouseDown device( x:" + event.clientX + " y:" + event.clientY + " ) view( x:" + vx + " y:" + vy + ")");

    thisRef.lastMouseX = sx;
    thisRef.lastMouseY = sy;

    thisRef.dragMgr.setPoint(vx, vy); 
    
    if(isMoving)
        return;
    thisRef.live2DMgr.tapEvent(vx, vy, event);
}



function followPointer(event)
{    
    var rect = event.target.getBoundingClientRect();
    
    var sx = transformScreenX(event.clientX - rect.left);
    var sy = transformScreenY(event.clientY - rect.top);
    var vx = transformViewX(event.clientX - rect.left);
    var vy = transformViewY(event.clientY - rect.top);
    
    if (LAppDefine.DEBUG_MOUSE_LOG)
        l2dLog("onMouseMove device( x:" + event.clientX + " y:" + event.clientY + " ) view( x:" + vx + " y:" + vy + ")");

    if (thisRef.drag)
    {
        thisRef.lastMouseX = sx;
        thisRef.lastMouseY = sy;

        thisRef.dragMgr.setPoint(vx, vy); 
    }
}



function lookFront()
{   
    if (thisRef.drag)
    {
        thisRef.drag = false;
    }

    thisRef.dragMgr.setPoint(0, 0);
}


function mouseEvent(e)
{
    e.preventDefault();
    
    if (e.type == "mousewheel") {
        if (e.clientX < 0 || thisRef.canvas.clientWidth < e.clientX || 
        e.clientY < 0 || thisRef.canvas.clientHeight < e.clientY)
        {
            return;
        }
        
        if (e.wheelDelta > 0) modelScaling(1.1); 
        else modelScaling(0.9); 

        
    } else if (e.type == "mousedown") {

        
        if("button" in e && e.button == 1) return;
        
        modelTurnHead(e);
        
    } else if (e.type == "mousemove") {
        
        followPointer(e);
        
    } else if (e.type == "mouseup") {
        
        
        if("button" in e && e.button != 0) return;
        
        lookFront();
        
    } else if (e.type == "mouseout") {
        
        lookFront();
        
    }
}


function touchEvent(e)
{
    e.preventDefault();
    
    var touch = e.touches[0];
    
    if (e.type == "touchstart") {
        if (e.touches.length == 1) modelTurnHead(touch);
        // onClick(touch);
        
    } else if (e.type == "touchmove") {
        followPointer(touch);
        
        if (e.touches.length == 2) {
            var touch1 = e.touches[0];
            var touch2 = e.touches[1];
            
            var len = Math.pow(touch1.pageX - touch2.pageX, 2) + Math.pow(touch1.pageY - touch2.pageY, 2);
            if (thisRef.oldLen - len < 0) modelScaling(1.025); 
            else modelScaling(0.975); 
            
            thisRef.oldLen = len;
        }
        
    } else if (e.type == "touchend") {
        lookFront();
    }
}




function transformViewX(deviceX)
{
    var screenX = this.deviceToScreen.transformX(deviceX); 
    return viewMatrix.invertTransformX(screenX); 
}


function transformViewY(deviceY)
{
    var screenY = this.deviceToScreen.transformY(deviceY); 
    return viewMatrix.invertTransformY(screenY); 
}


function transformScreenX(deviceX)
{
    return this.deviceToScreen.transformX(deviceX);
}


function transformScreenY(deviceY)
{
    return this.deviceToScreen.transformY(deviceY);
}



function getWebGLContext()
{
    var NAMES = [ "webgl" , "experimental-webgl" , "webkit-3d" , "moz-webgl"];

    for( var i = 0; i < NAMES.length; i++ ){
        try{
            var ctx = this.canvas.getContext(NAMES[i], {premultipliedAlpha : true});
            if(ctx) return ctx;
        }
        catch(e){}
    }
    return null;
};



function l2dLog(msg) {
    if(!LAppDefine.DEBUG_LOG) return;
    
    console.log(msg);
}



function l2dError(msg)
{
    if(!LAppDefine.DEBUG_LOG) return;
    
    l2dLog( "<span style='color:red'>" + msg + "</span>");
    
    console.error(msg);
};

nameList=["c000_01","c000_10","c000_11","c000_12","c000_13","c000_14","c000_15","c000_16","c000_17","c001_01","c001_02","c001_12","c001_14","c001_16","c001_17","c002_00","c002_01","c002_02","c002_10","c002_11","c002_12","c003_01","c003_02","c003_10","c003_11","c003_13","c003_14","c003_15","c003_16","c003_17","c003_18","c003_89","c004_00","c004_01","c004_02","c005_00","c005_01","c005_02","c007_00","c007_01","c007_02","c008_00","c008_01","c008_02","c009_00","c009_01","c009_02","c010_00","c010_01","c010_02","c011_00","c011_01","c011_02","c012_00","c012_01","c012_02","c013_00","c013_01","c013_02","c014_00","c014_01","c014_02","c015_01","c017_00","c017_01","c017_02","c018_00","c018_01","c018_02","c019_00","c019_01","c019_02","c020_00","c020_01","c020_02","c022_00","c022_01","c022_02","c022_10","c023_01","c024_00","c024_01","c024_02","c026_00","c026_01","c026_02","c027_00","c027_01","c027_02","c028_00","c028_01","c028_02","c028_10","c029_00","c029_01","c029_02","c030_00","c030_01","c030_02","c031_00","c031_01","c031_02","c032_00","c032_01","c032_02","c033_00","c033_01","c033_02","c034_00","c034_01","c034_02","c035_00","c035_01","c035_02","c036_00","c036_01","c036_02","c036_10","c037_00","c037_01","c037_02","c038_00","c038_01","c038_02","c038_10","c039_00","c039_01","c039_02","c040_00","c040_01","c040_02","c041_00","c041_01","c041_02","c043_00","c043_01","c043_02","c043_10","c044_00","c044_01","c044_02","c045_00","c045_01","c045_02","c045_10","c045_11","c045_12","c045_13","c045_89","c047_00","c047_01","c047_02","c048_00","c048_01","c048_02","c048_10","c049_00","c049_01","c049_02","c049_10","c050_02","c051_00","c051_01","c051_02","c051_10","c051_11","c051_12","c051_21","c051_89","c052_00","c052_01","c052_02","c053_00","c053_01","c053_02","c054_00","c054_01","c054_02","c056_00","c056_01","c056_02","c057_00","c057_01","c057_02","c058_00","c058_01","c058_02","c060_00","c060_01","c060_02","c061_00","c061_01","c061_02","c062_00","c062_01","c062_02","c063_00","c063_01","c063_02","c064_00","c064_01","c064_02","c065_00","c065_01","c065_02","c066_00","c066_01","c066_02","c067_00","c067_01","c067_02","c068_00","c068_01","c068_02","c069_00","c069_01","c069_02","c070_00","c070_01","c070_02","c072_00","c072_01","c072_02","c073_00","c073_01","c073_02","c074_00","c074_01","c074_02","c075_01","c075_02","c081_00","c081_01","c081_02","c082_00","c082_01","c082_02","c083_00","c083_01","c083_02","c085_00","c085_01","c085_02","c086_00","c086_01","c086_02","c087_01","c087_02","c090_00","c090_01","c090_02","c091_00","c091_01","c091_02","c092_01","c095_00","c095_01","c095_02","c099_00","c099_01","c099_02","c101_00","c101_01","c101_02","c106_01","c106_02","c107_00","c107_01","c107_02","c109_01","c109_02","c110_00","c110_01","c110_02","c110_10","c112_00","c112_01","c112_02","c113_00","c115_00","c115_01","c115_02","c116_01","c116_02","c117_00","c117_01","c117_02","c120_00","c120_01","c120_02","c121_00","c121_01","c121_02","c122_01","c123_00","c123_01","c123_02","c124_00","c124_01","c124_02","c124_10","c124_11","c124_12","c125_00","c125_01","c125_02","c125_10","c125_89","c126_00","c126_01","c126_02","c127_00","c127_01","c127_02","c127_10","c128_00","c128_01","c128_02","c129_01","c129_02","c130_00","c130_01","c130_02","c131_00","c131_01","c131_02","c132_00","c132_01","c132_02","c132_10","c132_11","c133_00","c133_01","c133_02","c135_00","c135_01","c135_02","c139_00","c139_01","c139_02","c140_01","c141_00","c141_01","c141_02","c142_00","c142_01","c142_02","c144_00","c144_01","c144_02","c147_00","c147_01","c147_02","c148_00","c148_01","c148_02","c148_10","c148_11","c149_00","c149_01","c149_02","c152_00","c152_01","c152_02","c153_00","c153_01","c153_02","c154_00","c154_01","c154_02","c155_00","c155_01","c155_02","c156_00","c156_01","c156_02","c158_00","c158_01","c158_02","c158_10","c159_00","c159_01","c159_02","c160_00","c160_01","c160_02","c161_01","c164_00","c164_01","c164_02","c167_00","c167_01","c167_02","c167_10","c167_11","c168_00","c168_01","c168_02","c169_00","c169_01","c169_02","c172_00","c172_01","c172_02","c173_00","c173_01","c173_02","c173_10","c174_00","c174_01","c174_02","c174_10","c174_11","c174_12","c175_00","c175_01","c175_02","c176_01","c176_02","c178_00","c178_01","c178_02","c180_00","c180_01","c180_02","c183_00","c183_01","c183_02","c184_00","c184_01","c184_02","c185_00","c185_01","c185_02","c186_00","c186_01","c186_02","c187_00","c187_01","c187_02","c187_89","c188_00","c188_01","c188_02","c189_00","c189_01","c189_02","c190_00","c190_01","c190_02","c191_00","c191_01","c191_02","c193_00","c193_01","c193_02","c193_10","c194_00","c194_01","c194_02","c195_00","c195_01","c195_02","c195_20","c196_00","c196_01","c196_02","c198_00","c198_01","c198_02","c198_10","c199_00","c199_01","c199_02","c199_10","c200_00","c200_01","c200_02","c202_00","c202_01","c202_02","c203_01","c203_02","c203_88","c205_00","c205_01","c205_02","c206_00","c206_01","c206_02","c208_00","c208_01","c208_02","c209_00","c209_01","c209_02","c209_10","c210_00","c210_01","c210_02","c214_00","c214_01","c214_02","c214_10","c215_00","c216_00","c216_01","c216_02","c218_00","c218_01","c218_02","c219_00","c219_01","c219_02","c220_00","c220_01","c220_02","c221_00","c221_01","c221_02","c222_00","c222_01","c222_02","c223_00","c223_01","c223_02","c224_00","c224_01","c224_02","c225_00","c225_01","c225_02","c226_01","c227_00","c227_01","c227_02","c229_00","c229_01","c229_02","c229_10","c230_00","c230_01","c230_02","c231_00","c231_01","c231_02","c232_00","c232_01","c232_02","c233_00","c233_01","c233_02","c234_00","c234_01","c234_02","c234_10","c235_00","c235_01","c235_02","c237_00","c237_01","c237_02","c238_00","c238_01","c238_02","c238_10","c239_01","c239_02","c241_01","c242_00","c242_01","c242_02","c244_01","c244_02","c245_01","c245_02","c246_00","c246_01","c246_02","c246_10","c246_11","c246_88","c246_89","c247_00","c247_01","c247_02","c251_01","c251_02","c252_00","c252_01","c252_02","c252_10","c252_11","c252_12","c252_13","c252_88","c252_89","c253_00","c253_01","c253_02","c253_10","c253_88","c253_89","c254_01","c255_01","c256_01","c257_01","c257_02","c258_01","c258_02","c261_01","c261_02","c262_00","c262_01","c262_02","c265_01","c266_00","c266_01","c266_02","c267_00","c267_01","c267_02","c267_10","c267_11","c267_88","c267_89","c269_01","c269_02","c270_01","c270_02","c271_01","c271_02","c272_01","c272_02","c274_00","c274_01","c274_02","c275_00","c275_01","c275_02","c277_00","c277_01","c277_02","c278_01","c278_02","c279_01","c279_02","c279_88","c279_89","c280_01","c280_02","c281_00","c281_01","c281_02","c283_00","c283_01","c283_02","c283_10","c283_11","c283_12","c283_89","c285_01","c285_02","c285_10","c285_11","c286_00","c286_01","c286_02","c287_00","c287_01","c287_02","c287_88","c287_89","c289_00","c289_01","c289_02","c289_10","c290_00","c290_01","c290_02","c292_00","c292_01","c292_02","c294_00","c294_01","c294_02","c294_10","c295_00","c295_01","c295_02","c295_10","c296_00","c296_01","c296_02","c297_00","c297_01","c297_02","c299_00","c299_01","c299_02","c300_00","c300_01","c300_02","c301_01","c301_02","c302_00","c302_01","c304_01","c304_02","c305_01","c305_02","c305_10","c305_89","c308_00","c308_01","c308_02","c308_10","c310_00","c310_01","c310_02","c311_00","c311_01","c311_02","c311_89","c312_00","c312_01","c312_02","c314_01","c315_01","c315_02","c315_10","c315_89","c316_00","c316_01","c316_02","c317_00","c317_01","c317_02","c318_00","c318_01","c318_02","c318_10","c318_11","c318_88","c318_89","c319_00","c319_01","c319_02","c320_00","c320_01","c320_02","c321_01","c321_02","c322_00","c322_01","c322_02","c322_10","c324_01","c324_02","c324_21","c325_00","c325_01","c326_01","c327_01","c328_01","c329_01","c329_02","c330_01","c331_01","c332_01","c332_02","c333_00","c333_01","c333_02","c333_88","c334_01","c334_02","c336_01","c336_02","c336_89","c338_01","c338_02","c339_01","c339_02","c342_01","c342_02","c343_01","c343_02","c344_01","c344_02","c344_10","c344_88","c344_89","c345_01","c345_02","c345_10","c345_88","c345_89","c346_01","c346_02","c347_01","c347_02","c348_00","c348_01","c348_02","c348_10","c349_00","c349_01","c349_02","c350_00","c350_01","c350_02","c351_00","c351_01","c351_02","c352_00","c353_00","c353_01","c353_02","c354_01","c354_02","c354_10","c354_89","c355_01","c355_02","c357_01","c357_02","c358_01","c358_02","c359_01","c359_02","c360_01","c360_02","c360_10","c361_01","c361_02","c361_10","c361_87","c361_88","c361_89","c362_01","c362_02","c362_10","c362_11","c363_01","c363_02","c364_01","c364_02","c365_01","c365_02","c366_01","c366_02","c367_01","c369_00","c370_01","c370_02","c370_10","c371_01","c371_02","c371_10","c372_01","c372_02","c372_10","c374_01","c374_02","c375_01","c376_01","c377_00","c377_01","c377_02","c377_10","c377_11","c377_89","c378_00","c378_01","c378_02","c379_01","c379_02","c381_01","c381_02","c382_01","c382_02","c384_01","c384_02","c385_01","c385_02","c385_10","c385_11","c385_12","c386_01","c386_02","c386_10","c386_11","c386_12","c386_13","c386_88","c387_01","c387_02","c387_10","c387_11","c388_01","c388_02","c389_01","c389_02","c389_89","c390_01","c390_02","c390_88","c390_89","c391_01","c391_02","c392_01","c392_02","c392_10","c392_89","c393_01","c393_02","c393_10","c394_01","c394_02","c395_01","c395_02","c396_01","c396_02","c397_01","c397_02","c398_01","c398_02","c398_89","c399_01","c400_01","c400_02","c401_01","c401_02","c402_01","c402_02","c402_10","c403_01","c403_02","c404_01","c404_02","c405_01","c405_02","c405_88","c405_89","c406_01","c406_02","c407_01","c407_02","c408_01","c408_02","c409_01","c409_02","c410_00","c410_01","c410_02","c411_01","c412_00","c412_01","c412_02","c412_88","c412_89","c413_00","c413_21","c414_00","c414_01","c414_02","c414_10","c414_89","c415_00","c415_01","c415_02","c416_00","c416_01","c416_02","c417_00","c417_01","c417_02","c417_10","c417_87","c417_89","c418_01","c418_02","c419_01","c419_02","c420_01","c420_02","c420_10","c420_89","c421_01","c421_02","c422_01","c422_02","c422_88","c423_01","c423_02","c424_01","c425_01","c425_02","c425_10","c425_87","c425_88","c425_89","c426_00","c426_01","c426_02","c428_01","c428_02","c428_88","c428_89","c429_00","c429_01","c429_02","c429_10","c429_88","c430_00","c430_01","c430_02","c430_10","c431_01","c431_02","c431_10","c432_01","c432_02","c433_01","c433_02","c434_01","c434_02","c435_01","c435_02","c435_10","c436_01","c436_02","c436_10","c436_89","c437_01","c437_02","c438_01","c438_02","c438_10","c438_11","c438_12","c439_01","c439_02","c440_01","c440_02","c440_10","c441_01","c441_02","c442_00","c442_01","c442_02","c442_10","c442_11","c443_01","c443_02","c444_01","c444_10","c445_01","c445_02","c445_10","c445_11","c445_88","c445_89","c446_01","c446_02","c446_88","c447_01","c447_02","c447_10","c447_89","c448_00","c448_01","c448_02","c448_88","c449_01","c449_02","c450_01","c450_02","c451_01","c451_02","c451_10","c452_01","c452_02","c452_10","c453_01","c453_02","c454_01","c454_02","c454_88","c454_89","c455_01","c455_02","c455_10","c455_11","c455_87","c456_01","c456_02","c457_01","c457_02","c458_01","c458_02","c458_10","c459_01","c459_02","c460_01","c460_02","c460_10","c460_88","c461_01","c461_02","c461_10","c462_01","c462_02","c463_01","c463_02","c464_01","c464_02","c464_10","c464_11","c465_01","c465_02","c465_88","c466_01","c466_02","c467_01","c467_02","c468_00","c468_01","c468_02","c469_01","c469_02","c469_10","c470_01","c470_02","c471_01","c471_02","c471_88","c472_01","c472_02","c473_01","c473_02","c474_01","c474_02","c474_10","c474_88","c474_89","c475_01","c475_02","c476_00","c476_01","c476_02","c476_88","c479_00","c479_01","c479_02","c479_20","c480_00","c480_01","c480_02","c480_20","c481_00","c481_01","c481_02","c481_88","c482_00","c482_01","c482_02","c483_00","c483_01","c483_02","c484_01","c485_01","c485_02","c485_10","c486_01","c486_02","c486_10","c486_87","c486_88","c486_89","c488_00","c488_01","c488_02","c488_20","c489_01","c489_02","c489_10","c489_11","c489_87","c489_88","c489_89","c490_00","c490_01","c490_02","c490_10","c490_88","c491_00","c491_01","c491_02","c491_10","c492_00","c493_00","c493_01","c493_02","c493_88","c494_00","c494_01","c494_02","c495_00","c495_01","c495_02","c496_00","c496_01","c496_02","c497_01","c497_02","c497_10","c501_01","c501_02","c501_10","c501_87","c501_88","c501_89","c502_01","c502_02","c502_10","c503_01","c503_02","c503_10","c503_88","c504_00","c504_01","c504_02","c505_00","c505_01","c505_02","c505_10","c506_00","c506_01","c506_02","c507_00","c507_01","c507_02","c507_10","c507_88","c508_01","c508_02","c509_01","c509_02","c509_10","c509_87","c509_88","c509_89","c510_01","c510_02","c510_10","c511_01","c511_02","c512_01","c512_02","c513_01","c513_02","c513_10","c513_87","c513_88","c513_89","c514_01","c514_02","c515_00","c517_01","c517_02","c518_01","c518_02","c518_88","c519_01","c519_02","c520_01","c520_02","c520_10","c520_87","c520_88","c520_89","c521_01","c521_02","c521_10","c521_87","c521_88","c521_89","c522_01","c522_02","m007_00","m008_01","m009_01","m010_01","m011_01","m012_02","m018_01","m018_02","m021_01","m021_02","m022_01","m022_02","m026_01","m026_02","m026_10","m028_01","m028_02","m029_01","m029_02","m030_01","m030_02","m031_01","m031_02","m038_00","m038_01","m038_02","m038_10","m038_11","m040_00","m045_00","m045_01","m045_02","m047_01","m047_02","m048_01","m048_02","m049_00","m050_00","m051_00","m051_10","m052_01","m052_02","m053_00","m054_00","m054_01","m054_02","m056_00","m056_01","m056_02","m057_00","m057_01","m057_02","m057_10","m059_00","m059_01","m059_02","m061_01","m061_02","m062_01","m062_02","m063_00","m063_01","m063_02","m064_01","m064_02","m065_01","m065_02","m066_01","m066_02","m067_01","m067_02","m068_01","m068_02","m069_01","m069_02","m070_01","m070_02","m071_01","m071_02","m072_01","m072_02","m073_01","m073_02","m074_01","m074_02","m075_01","m075_02","m076_01","m076_02","m077_00","m077_01","m077_02","m077_10","m077_11","m078_01","m078_02","m080_01","m080_02","m081_01","m081_02","m082_01","m082_02","m083_01","m083_02","m084_01","m084_02","m086_01","m086_02","m087_01","m087_02","m089_01","m089_02","m090_01","m090_02","m092_01","m092_02","m093_01","m093_02","m095_01","m095_02","m096_01","m096_02","m097_01","m097_02","m098_01","m098_02","m100_01","m100_02","m101_01","m101_02","m102_01","m102_02","m103_01","m103_02","m104_01","m104_02","m105_01","m105_02","m107_01","m107_02","m109_01","m109_02","m110_01","m110_02","m111_01","m111_02","m112_01","m112_02","m113_01","m113_02","m114_01","m114_02","m117_01","m117_02","m124_01","m124_02","m125_01","m125_02","m126_01","m126_02","m127_01","m127_02","m128_01","m128_02","m136_00","m139_01","m141_00","m142_01","m142_02","m143_01","m143_02","m144_01","m144_02","m145_01","m145_02","m146_01","m146_02","m154_00","m154_01","m154_02","m155_01","m155_02","m156_01","m156_02","m157_01","m157_02","m158_01","m158_02","m159_01","m159_02","m160_01","m160_02","m161_01","m161_02","m162_01","m162_02","m163_01","m163_02","m164_01","m164_02","m165_01","m165_02","m166_01","m166_02","m167_01","m167_02","m168_01","m168_02","m169_01","m169_02","m170_01","m170_02","m171_01","m171_02","m172_01","m172_02","m173_01","m173_02","m174_01","m174_02","m175_01","m175_02","m176_01","m176_02","m177_01","m177_02","m178_01","m178_02","m184_01","m185_01","m185_02","m185_10","m186_01","m186_02","m187_01","m187_02","m188_01","m188_02","m189_01","m189_02","m190_01","m190_02","m191_00","m191_01","m191_02","m192_01","m192_02","m193_01","m193_02","m194_01","m194_02","m195_01","m195_02","m196_01","m196_02","m197_01","m197_02","m198_01","m198_02","m199_01","m199_02","m200_00","m200_01","m200_02","m201_00","m201_01","m201_02","m202_00","m202_01","m202_02","m203_00","m203_01","m203_02","m205_01","m205_02","m206_01","m206_02","m211_01","m211_02","m212_01","m212_02","m214_01","m214_02","m215_01","m215_02","m215_88","m215_89","m216_01","m216_02","m217_01","m217_02","m218_01","m219_01","m220_01","m221_01","m222_01","m223_01","m223_02","m224_01","m224_02","m224_89","m225_01","m225_02","m228_89","m229_01","m229_02","m230_01","m230_02","m231_01","m231_02","m232_89","m233_89","m234_89","m235_89","m236_89","m237_89","m238_89","m239_89","m240_01","m241_01","m242_01","m243_01","m244_01","m245_01","m245_02","m253_01","m253_02","m254_01","m254_02","m255_01","m255_02","m256_89","m261_01","m261_02","m261_88","m261_89","m262_89","m263_01","m264_01","m264_02","m264_88","m264_89","m265_01","m266_01","m267_01","m268_01","m269_01","m270_01","m271_01","m272_01","m273_01","m274_01","m275_01","m276_01","m277_01","m278_01","m278_02","m279_01","m279_02","m280_01","m280_02","m281_01","m281_02","m282_01","m282_02","sc001_01","sc002_01","sc003_01","sc004_01","sc005_01","sc007_01","sc008_01","sc009_01","sc010_01","sc011_01","sc012_01","sc013_01","sc014_01","sc017_01","sc018_01","sc019_01","sc020_01","sc022_01","sc026_01","sc027_01","sc028_01","sc029_01","sc030_01","sc031_01","sc032_01","sc033_01","sc034_01","sc035_01","sc036_01","sc037_01","sc038_01","sc039_01","sc040_01","sc041_01","sc043_01","sc044_01","sc045_01","sc047_01","sc048_01","sc049_01","sc051_01","sc052_01","sc053_01","sc054_01","sc056_01","sc057_01","sc058_01","sc060_01","sc061_01","sc062_01","sc063_01","sc064_01","sc065_01","sc066_01","sc067_01","sc068_01","sc069_01","sc072_01","sc073_01","sc074_01","sc082_01","sc083_01","sc086_01","sc090_01","sc095_01","sc099_01","sc101_01","sc106_01","sc107_01","sc110_01","sc112_01","sc115_01","sc117_01","sc120_01","sc121_01","sc123_01","sc124_01","sc125_01","sc126_01","sc127_01","sc130_01","sc132_01","sc133_01","sc135_01","sc139_01","sc141_01","sc142_01","sc144_01","sc147_01","sc148_01","sc149_01","sc153_01","sc154_01","sc155_01","sc156_01","sc158_01","sc159_01","sc160_01","sc164_01","sc167_01","sc169_01","sc172_01","sc173_01","sc174_01","sc175_01","sc176_01","sc178_01","sc180_01","sc183_01","sc184_01","sc187_01","sc188_01","sc189_01","sc190_01","sc191_01","sc193_01","sc194_01","sc195_01","sc196_01","sc198_01","sc199_01","sc200_01","sc202_01","sc205_01","sc206_01","sc208_01","sc209_01","sc210_01","sc214_01","sc216_01","sc218_01","sc219_01","sc220_01","sc221_01","sc222_01","sc223_01","sc225_01","sc227_01","sc229_01","sc230_01","sc231_01","sc232_01","sc233_01","sc234_01","sc235_01","sc237_01","sc238_01","sc242_01","sc246_01","sc247_01","sc252_01","sc253_01","sc262_01","sc266_01","sc267_01","sc274_01","sc275_01","sc277_01","sc278_01","sc279_01","sc280_01","sc283_01","sc285_01","sc286_01","sc287_01","sc289_01","sc290_01","sc292_01","sc294_01","sc295_01","sc296_01","sc297_01","sc299_01","sc300_01","sc301_01","sc304_01","sc305_01","sc308_01","sc310_01","sc311_01","sc312_01","sc315_01","sc316_01","sc317_01","sc318_01","sc319_01","sc320_01","sc321_01","sc324_01","sc329_01","sc332_01","sc333_01","sc334_01","sc336_01","sc338_01","sc339_01","sc343_01","sc344_01","sc345_01","sc346_01","sc347_01","sc348_01","sc349_01","sc350_01","sc351_01","sc353_01","sc354_01","sc355_01","sc360_01","sc361_01","sc362_01","sc363_01","sc364_01","sc365_01","sc366_01","sc370_01","sc371_01","sc372_01","sc374_01","sc377_01","sc378_01","sc379_01","sc381_01","sc382_01","sc383_01","sc385_01","sc386_01","sc387_01","sc390_01","sc391_01","sc392_01","sc393_01","sc394_01","sc395_01","sc396_01","sc397_01","sc398_01","sc400_01","sc402_01","sc403_01","sc404_01","sc405_01","sc406_01","sc407_01","sc408_01","sc409_01","sc410_01","sc412_01","sc414_01","sc415_01","sc416_01","sc417_01","sc418_01","sc419_01","sc420_01","sc421_01","sc422_01","sc423_01","sc425_01","sc426_01","sc428_01","sc429_01","sc430_01","sc431_01","sc432_01","sc433_01","sc434_01","sc435_01","sc436_01","sc437_01","sc438_01","sc439_01","sc440_01","sc441_01","sc442_01","sc443_01","sc445_01","sc446_01","sc447_01","sc448_01","sc449_01","sc450_01","sc451_01","sc452_01","sc453_01","sc454_01","sc455_01","sc456_01","sc457_01","sc458_01","sc459_01","sc460_01","sc461_01","sc462_01","sc463_01","sc464_01","sc465_01","sc466_01","sc467_01","sc468_01","sc469_01","sc470_01","sc471_01","sc472_01","sc473_01","sc474_01","sc475_01","sc476_01","sc479_01","sc480_01","sc481_01","sc482_01","sc483_01","sc485_01","sc486_01","sc488_01","sc489_01","sc493_01","sc494_01","sc497_01","sm003_01","sm007_01","sm036_01","sm037_01","sm038_01","sm039_01","sm040_01","sm045_01","sm049_01","sm050_01","sm051_01","sm052_01","sm053_01","sm056_01","sm057_01","sm059_01","sm063_01","sm077_01","sm136_01","sm137_01","sm141_01","sm142_01","sm143_01","sm144_01","sm145_01","sm146_01","sm148_01","sm149_01","sm150_01","sm151_01","sm152_01","sm153_01","sm154_01","sm189_01","sm190_01","sm191_01","sm192_01","sm193_01","sm194_01","sm195_01","sm196_01","sm197_01","sm198_01","sm199_01","sm200_01","sm215_01","sm216_01","sm217_01","sm223_01","sm224_01","sm245_01","sm261_01","sm264_01","xc005_10","xc036_10","xc043_10","xc044_10","xc045_10","xc047_10","xc049_10","xc051_10","xc053_10","xc057_10","xc058_10","xc061_10","xc064_10","xc067_10","xc101_10","xc124_01","xc124_10","xc127_10","xc132_10","xc149_10","xc153_10","xc156_10","xc158_10","xc167_10","xc173_10","xc174_10","xc175_10","xc180_10","xc183_10","xc199_10","xc214_10","xc216_10","xc219_10","xc227_10","xc229_10","xc238_10","xc246_10","xc266_10","xc267_10","xc289_10","xc297_10","xc301_10","xc318_10","xc319_10","xc354_10","xc391_10","xm003_01","xm004_01","xm038_10","xm039_01","xm051_10","xm052_01","xm054_01","xm056_01","xm056_10","xm057_10","xm077_10","xm124_01","xm125_01","xm126_01","xm127_01","xm128_01","xm141_01","xm142_01","xm143_01","xm144_01","xm145_01","xm146_01","xm155_01","xm156_01","xm157_01","xm158_01","xm159_01","xm189_01","xm190_01","xm194_01","xm195_01","xm196_01","xm197_01","xm198_01","xm201_01","xm227_01"];