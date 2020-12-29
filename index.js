const gameState = new Object;
gameState.startTime = new Date() ;
const sceneData = new Object;
var tracerProgram;
var renderProgram;
var tracer_fragment_sources;
var recompile = function(){;}
const Settings = new Object;
//individual transform setting panels
var ts = [];
var fs;
var gs;


function initSettings(s){
    function newTransform(){
        this.axis = vec3.create();
        this.axis[0] = 1.0;
        this.theta = 0;
        this.source='';
        this.type='empty';
        return this;
    }
    if(s.example == null){
        //first time init
        
        s.AtomSize = 5.0;
        s.Iterations = 7.0;
        
        s.Rotate1 = 0.0;
        s.Rotate2 = 0.0;
        s.Rotate3 = 0.0;
        
        s.Scale = 2.0;
        s.Offset = vec3.create();
        s.Offset[0] = 1.0;
        s.Offset[1] = 1.0;
        s.Offset[2] = 1.0;
        
        s.Animation = false;
        s.example = "Tetrahedron";
        
        s.transforms = [];
        for(let i=0;i<5;i++){
            s.transforms.push(new newTransform());
        }
        initSettings(s);
    }
    else if(s.example == "Square"){
        gameState.eyePos = vec3.fromValues(0.,0.,-4.);
        gameState.currentEyeCenter = vec3.fromValues(0.,0.,-1);
        s.Animation = false;
        s.Scale = 3.0;
        s.AtomSize = 5.0;
        s.Iterations = 7.0;
        s.Offset[0] = 1.0;
        s.Offset[1] = 1.0;
        s.Offset[2] = 1.0;
        s.Rotate1 = 0.0;
        s.Rotate2 = 0.0;
        s.Rotate3 = 0.0;
        const t1 = s.transforms[0];
        t1.type='reflect_square';

        const t2 = s.transforms[1];
        t2.type='reflect_tetra_2';
        
        const t3 = s.transforms[2];      
        t3.type='custom';
        t3.source = 'p.z-=0.5*Offset.z*(Scale-1.0)/Scale;p.z=-abs(-p.z);p.z+=0.5*Offset.z*(Scale-1.0)/Scale;';
        
        const t4 = s.transforms[3];
        t4.type='custom';
        t4.source = 'p.x=Scale*p.x-Offset.x*(Scale-1.0);\np.y=Scale*p.y-Offset.y*(Scale-1.0);';
        

        const t5 = s.transforms[4];
        t5.type='custom';
        t5.source = 'p.z=Scale*p.z;\nrescale+=1;';
    }
    else if(s.example == "Tetrahedron"){
        gameState.eyePos = vec3.fromValues(-3.336812973022461, -0.052767179906368256, 3.4492571353912354);
        gameState.currentEyeCenter = vec3.fromValues(-3.971825122833252, 0.2389293909072876, 4.164570331573486);
        s.Animation = false;
        s.Scale = 2.0;
        s.AtomSize = 5.0;
        s.Iterations = 11.0;
        s.Offset[0] = 5.0;
        s.Offset[1] = 5.0;
        s.Offset[2] = 5.0;
        s.Rotate1 = 0.016;
        s.Rotate2 = -0.78;
        s.Rotate3 = 0.116;
        const t1 = s.transforms[0];
        t1.type='reflect_tetra_1';
        
        const t2 = s.transforms[1];
        t2.type='scale';
        
        const t3 = s.transforms[2];        
        t3.type='reflect_tetra_1';
        t3.source='';

        const t4 = s.transforms[3];
        t4.type='scale';
        t4.source='';

        const t5 = s.transforms[4];
        t5.type='empty';
        t5.source='';
    }
    else if(s.example == 'Mushroom'){
        s.Animation = false;
        gameState.eyePos = vec3.fromValues(-0.0171196386218071, -0.0018011084757745266, -11.683709144592285);
        gameState.currentEyeCenter = vec3.fromValues(0.,0.,-1);
        Settings.Iterations = 7.0;
        const ts = Settings.transforms;
        Settings.Scale = 2.0;
        Settings.Offset = vec3.fromValues(2.0,2.0,2.0);
        ts[0].type = 'reflect_tetra_1';
        ts[1].type = 'reflect_tetra_2';
        ts[2].type = 'translate';
        ts[2].axis[0] = -0.20000000298023224;
        ts[2].axis[1] = -0.699999988079071;
        ts[2].axis[2] = -0.3499999940395355;
        ts[3].type='rotate';
        ts[3].axis[0] = 1.0;
        ts[3].axis[1] = 0.0;
        ts[3].axis[2] = 0.8500000238418579;
        ts[3].theta = -0.591592653589793;
        ts[4].type = 'scale';
    }
    else if(s.example == 'Space Ship'){
        //gameState.eyePos = vec3.fromValues(1.1971062421798706, 1.6426268815994263, -3.4021072387695312);
        //gameState.currentEyeCenter = vec3.fromValues(0.9001787900924683, 1.2421846389770508, -2.5352277755737305);
        s.Animation = false;
        gameState.eyePos = vec3.fromValues(0.1971062421798706, 0.1426268815994263, -4.4021072387695312);
        gameState.currentEyeCenter = vec3.fromValues(0.0001787900924683, 0.0421846389770508, -2.5352277755737305);
        Settings.AtomSize = 5.7;
        Settings.Iterations = 11.0;
        
        Settings.Scale = 2.32;
        Settings.Offset = vec3.fromValues(1.0,1.0,1.0);
        Settings.Rotate1 = -4.68318530717959;
        Settings.Rotate2 =  2.51681469282041;
        Settings.Rotate3 = -2.38318530717959;
        const ts = Settings.transforms;
        ts[0].type = 'reflect_tetra_1';
        ts[1].type = 'rotate';
        ts[1].axis[0] = 0.0;
        ts[1].axis[1] = 0.0;
        ts[1].axis[2] = -0.8;
        ts[1].theta = -0.7;
        ts[2].type = 'reflect_square';
        
        ts[3].type='custom';
        ts[3].source="p.z-=0.5*Offset.z*(Scale-1.0)/Scale;p.z=-abs(-p.z);p.z+=0.5*Offset.z*(Scale-1.0)/Scale;p.x=Scale*p.x-Offset.x*(Scale-1.0);p.y=Scale*p.y-Offset.y*(Scale-1.0);";
        ts[4].type = 'custom';
        ts[4].source="p.z=Scale*p.z;rescale+=1;";
    }
    else if(s.example == 'Animation'){
        s.Animation = true;
        gameState.eyePos = vec3.fromValues(2.140253782272339, -2.149275779724121, -2.668018341064453);
        gameState.currentEyeCenter = vec3.fromValues(1.605492353439331, -1.5981570482254028, -2.027472972869873);
        s.Scale = 2.0;
        s.AtomSize = 5.0;
        s.Iterations = 5.0;
        s.Offset[0] = 1.95;
        s.Offset[1] = 1.95;
        s.Offset[2] = 1.95;
        s.Rotate1 = 0.0168;
        s.Rotate2 = 0.0168;
        s.Rotate3 = 0.0168;
        const t1 = s.transforms[0];
        t1.type='reflect_tetra_1';
        
        const t2 = s.transforms[1];
        t2.type='scale';
        
        const t3 = s.transforms[2];        
        t3.type='reflect_tetra_1';
        t3.source='';

        const t4 = s.transforms[3];
        t4.type='scale';
        t4.source='';

        const t5 = s.transforms[4];
        t5.type='custom';
        t5.source='p = rotate(p,Offset,pi*(max(sin(timeSinceStart/30.0)+0.7,0.0)));';
    }
    else{
        console.log("error: unknown setting.example");
    }
}

function createSettingPanels(){
    // use external css for setting panels
    QuickSettings.useExtStyleSheet();
    createFractalSettings();
    createGlobalSettings();
    createTransformSettings();
}

function createFractalSettings(){
    //Fractal Setting 
    fs = QuickSettings.create(1150, 80, "Fractal Settings");
    fs.addDropDown("examples",["Tetrahedron","Square","Mushroom","Space Ship","Animation"],(p)=>{Settings.example=p.value;initSettings(Settings);refreshPanels();});
    fs.addRange("Atom Size",0.0,10.0,5.0,0.1,(p)=>{Settings.AtomSize=p;sceneData.frameCount = 0;});
    fs.addRange("Iterations",0,20,5,1,(p)=>{console.log(p);Settings.Iterations=p;recompile();});
    fs.addRange("Scale",1,4,2,0.01,(p)=>{Settings.Scale = p;sceneData.frameCount=0;});

    fs.addRange("Offset_ALL",0.0,5.0,1.0,0.01,(p)=>{
        for(let i=0;i<3;i++){
            fs.setValue("Offset_"+(i+1).toString(),p);
        }
    })
    for(let i=0;i<3;i++)
        fs.addRange("Offset_"+(i+1).toString(), 0.0 , 5.0 , 1.0 , 0.01 ,(p)=>{Settings.Offset[i]=p;sceneData.frameCount=0;});
    fs.addBoolean('Animation',false,(p)=>{Settings.Animation=p;});
}

function createGlobalSettings(){
    //global panel create and setting 
    gs = QuickSettings.create(1150,600, "Rotation Settings");
    for(let i=0;i<3;i++)
        gs.addRange("Rotate"+(i+1).toString(), -2*Math.PI , 2*Math.PI ,0.0, 0.1 ,(p)=>{Settings["Rotate"+(i+1).toString()]=p;sceneData.frameCount=0;});
    
}

function createTransformSettings(){
    //transform panel create and setting     
    function initPanel(s,i){//setting and transform data
        s.addDropDown("type",["translate","rotate","scale","reflect_tetra_1","reflect_tetra_2","reflect_square","reflect_octa","custom","empty"],(p)=>{
            (Settings.transforms[i]).type = p.value;
            updateTransPanel(s,(Settings.transforms[i]));
        });
        for(let j=0;j<3;j++)
            s.addRange("axis_"+(j+1).toString(),-1.0,1.0,1.0,0.05,(p)=>{
                (Settings.transforms[i]).axis[j]=p;
                recompile();
                
            });
        s.addRange("theta",-Math.PI,Math.PI,0.0,0.01,(p)=>{
            (Settings.transforms[i]).theta=p;
            recompile();
        });
        s.addTextArea("source code","",(p)=>{
            (Settings.transforms[i]).source = p;
        });
        s.addButton("compile",(p)=>{
            recompile();
        });
    }
    for(let i=0;i<5;i++){
        ts.push(QuickSettings.create(1400,80+i*127, "Transform-"+(i+1).toString()));   
        initPanel(ts[i],i);
    }
}

function updateTransPanel(s,t){
    //hide all controls
    s.hideControl('type');
    s.hideControl('axis_1');
    s.hideControl('axis_2');
    s.hideControl('axis_3');
    s.hideControl('theta');
    s.hideControl('source code');
    s.hideControl('compile');
    s.hideAllTitles();

    //enable needed controls
    s.showControl('type');
    s.showTitle('type');
    if(t.type =='translate'){
        for(let i=0;i<3;i++){
            s.showControl('axis_'+(i+1).toString());
            s.showTitle('axis_'+(i+1).toString());
        }
            
    }
    else if(t.type =='scale'){
    }
    else if(t.type == 'rotate'){
        for(let i=0;i<3;i++){
            s.showControl('axis_'+(i+1).toString());
            s.showTitle('axis_'+(i+1).toString());
        }
        s.showControl('theta')
        s.showTitle('theta');
    }
    else if(t.type == 'custom'){
        s.showControl('source code');
        s.showTitle('source code');
        s.showControl('compile');
    }
    recompile();
}

function refreshPanels(){
    fs.setValue('Atom Size',Settings.AtomSize);
    fs.setValue('Iterations',Settings.Iterations);
    fs.setValue('Scale',Settings.Scale);
    fs.setValue('Offset_1',Settings.Offset[0]);
    fs.setValue('Offset_2',Settings.Offset[1]);
    fs.setValue('Offset_3',Settings.Offset[2]);
    fs.setValue('Animation',Settings.Animation);
    for(let i=0;i<5;i++){
        setTransPanel(ts[i],(Settings.transforms)[i]);
    }
}

function setTransPanel(s,t){
    updateTransPanel(s,t);
    const type_options = ["translate","rotate","scale","reflect_tetra_1","reflect_tetra_2","reflect_square","reflect_octa","custom","empty"];
    s.setValue('type',type_options.indexOf(t.type));
    if(t.type =='translate'){
        for(let i=0;i<3;i++)
            s.setValue('axis_'+(i+1).toString(),t.axis[i]);
    }
    else if(t.type == 'rotate'){
        for(let i=0;i<3;i++)
            s.setValue('axis_'+(i+1).toString(),t.axis[i]);
        s.setValue('theta',t.theta);
    }
    else if(t.type == 'custom'){
        s.setValue('source code',t.source);
    }
}


Main();

async function Main(){
    //fetch shader source
    var fetch_tracer_vert = fetch("tracer_vert.glsl").then(r => r.text());
    var fetch_tracer_frag = fetch("tracer_frag.glsl").then(r => r.text());
    var fetch_render_vert = fetch("render_vert.glsl").then(r => r.text());
    var fetch_render_frag = fetch("render_frag.glsl").then(r => r.text());

    //get canvas, attach mouse event handelers
    const canvas = getCanvas();
    //get WebGL context
    const gl = getGL(canvas);

    //get shader source
    var tracerVertexSource = await fetch_tracer_vert;
    var tracerFragSource = await   fetch_tracer_frag;
    var renderVertexSource = await fetch_render_vert;
    var renderFragSource = await   fetch_render_frag;

    tracer_fragment_sources = tracerFragSource.split('$$$');

    //creat framebuffer and  textures
    initSceneData(gl, sceneData);
    //define position, radius, color, material, lighting, eye, of the scene
    initGameState(gameState);

    // create fractal settings
    initSettings(Settings);
    createSettingPanels();
    refreshPanels();

    recompile = function(){
        console.log(Settings);
        var  FragSource = '';
        FragSource += tracer_fragment_sources[0];
        FragSource += '\n';
        FragSource += makeSDF(Settings);
        FragSource += tracer_fragment_sources[1];
        tracerProgram = initShaderProgram(gl,tracerVertexSource,FragSource);
        sceneData.frameCount = 0;

    }

    // compile and link shader source
    recompile();
    //tracerProgram = initShaderProgram(gl, tracerVertexSource, tracerFragSource);
    renderProgram = initShaderProgram(gl, renderVertexSource, renderFragSource);

    const fpsElem = document.querySelector("#fps");
    let then = 0;
    function updateAndRender(now) {
	    now *= 0.001;                          // convert to seconds
	    const deltaTime = now - then;          // compute time since last frame
	    then = now;                            // remember time for next frame
	    const fps = 1 / deltaTime;             // compute frames per second
	    fpsElem.textContent = fps.toFixed(1);  // update fps display
	    update(gl,tracerProgram, gameState, sceneData);
        render(gl,renderProgram, sceneData)
        requestAnimationFrame(updateAndRender);
        // for animation 
        if(sceneData.frameCount>2 && Settings.Animation === true){sceneData.frameCount = 0;};
    }
    requestAnimationFrame(updateAndRender);
    //setInterval(()=>{update(gl,tracerProgram, gameState, sceneData); render(gl, renderProgram, sceneData); }, deltaT);
    //console.log("current framrate = ", 1000/(deltaT));
}


function update(gl, tracerProgram, gameState, sceneData){
    if(sceneData.frameCount > 1000) { return;}
    //console.log('frameCount = ',sceneData.frameCount)
    //set ray directions
    gameState.viewProjectionMatrix = getViewProjMat(gl,gameState.eyePos, gameState.currentEyeCenter, gameState.eyeUp);
    gameState.ray00 = getEyeRay(gameState.viewProjectionMatrix,gameState.eyePos,-1,-1);
    gameState.ray01 = getEyeRay(gameState.viewProjectionMatrix,gameState.eyePos,-1,1);
    gameState.ray10 = getEyeRay(gameState.viewProjectionMatrix,gameState.eyePos,1,-1);
    gameState.ray11 = getEyeRay(gameState.viewProjectionMatrix,gameState.eyePos,1,1);
    gameState.timeSinceStart = (new Date() - gameState.startTime)* 0.01;
    gameState.textureWeight = sceneData.frameCount / (sceneData.frameCount + 1.0);

    gl.useProgram(tracerProgram);
    // bind texture[0] to fragmentshader
    gl.bindTexture(gl.TEXTURE_2D, sceneData.textures[0]);
    //bind fragmentshader output framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, sceneData.framebuffer);
    // bind framebuffer color data  to texture[1]
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sceneData.textures[1], 0);

    enableSquareVAO(gl, tracerProgram);

    setUniforms(gl, tracerProgram, gameState);
    setUniforms(gl, tracerProgram, Settings);
    const offset = 0;
    const vertextCount =4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertextCount);


    sceneData.frameCount++;
    sceneData.textures.reverse();
}

function render(gl, renderProgram, sceneData){
    gl.useProgram(renderProgram);
    gl.bindTexture(gl.TEXTURE_2D, sceneData.textures[0]);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    enableSquareVAO(gl,renderProgram);
    const offset = 0;
    const vertextCount =4;
    gl.drawArrays(gl.TRIANGLE_STRIP,offset,vertextCount);
}

function initSceneData(gl, sceneData){
    sceneData.framebuffer = gl.createFramebuffer();
    // create textures
    var type = gl.getExtension('OES_texture_float') ? gl.FLOAT : gl.UNSIGNED_BYTE;
    sceneData.textures = [];
    for(var i = 0; i < 2; i++) {
	sceneData.textures.push(gl.createTexture());
	gl.bindTexture(gl.TEXTURE_2D, sceneData.textures[i]);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1000, 700, 0, gl.RGB, type, null);
    }
    gl.bindTexture(gl.TEXTURE_2D, null);
    sceneData.frameCount = 0.0;
}

function initGameState(gameState){
    gameState.eyePos = vec3.fromValues(0.0,0.0,-4.0);
    gameState.eyeCenter = vec3.fromValues(0.0,0.0,-1.0);
    gameState.currentEyeCenter = vec3.fromValues(0.0,0.0,-1.0);
    gameState.eyeUp = vec3.fromValues(0.0,1.0,0.0);

}


function setUniforms(gl, program, data){
    for(var name in data){
	var value =  data[name];
	var location = gl.getUniformLocation(program, name);
	if(location == null) continue;
	if(typeof(value) == 'number'){
	    gl.uniform1f(location, value);
	}
	else if(value instanceof Array){
	    if(value.length % 3 == 0)
		gl.uniform3fv(location, value);
	    else if( value.length % 4 == 0)
		gl.uniform4fv(location, value);
	    else
		gl.uniform1fv(location, value);

	}
	else if(value instanceof Float32Array){
	    if(value.length == 3)
		gl.uniform3fv(location, value);
	    else if(value.length == 4)
		gl.uniform4fv(location, value);
	    else
	    {continue;}
	}
	else{
	    {continue;}
	}
    }

}

// setup VAO for a single square in gl state machine
function enableSquareVAO(gl, shaderProgram){
    vertexPosition = gl.getAttribLocation(shaderProgram, 'vertex');
    //create a buffer for square's positions.
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    const vertexes = [
	-1.0, 1.0,
	1.0,  1.0,
	-1.0, -1.0,
	1.0, -1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER,
		  new Float32Array(vertexes),
		  gl.STATIC_DRAW);

    //Tell WebGL how to pull out the position from the position buffer to the
    //vertexPosition attribute
    {
	const numComponents = 2; // pull out 2 variables per iteration
	const type = gl.FLOAT; // the data in buffer is 32bit floats
	const normalize = false; // don't normalize
	const stride = 0;// how many bytes to get from one set of values to the next
	const offset = 0;// how many bytes inside the buffer to start from;

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.vertexAttribPointer(
	    vertexPosition,
	    numComponents,
	    type,
	    normalize,
	    stride,
	    offset
	);
	gl.enableVertexAttribArray(vertexPosition);
    }

}



const getViewProjMat = function (gl, eyePos, eyeCenter, eyeUp){
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix,
		     fieldOfView,
		     aspect,
		     zNear,
		     zFar);
    const viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix,eyePos,eyeCenter,eyeUp);
    const ans = mat4.create();
    return mat4.multiply(ans,  projectionMatrix , viewMatrix );
}

function getEyeRay(matrix,eyePos, x, y){
    const p0 = vec4.create();
    const inv = mat4.create();
    mat4.invert(inv,matrix)
    vec4.transformMat4(p0, vec4.fromValues(x, y, -1.0, 1.0),inv );
    const p1 = vec3.create();
    vec3.scale(p1, vec3.fromValues(p0[0],p0[1],p0[2]), (1.0/p0[3]));
    const ans = vec3.create();
    vec3.subtract(ans,p1,eyePos);
    return ans;
}

function initShaderProgram(gl,vsSource,fsSource){
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // create shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
	aler('Uable to initialize the shader program: '+ gl.getProgramInfoLog(shaderProgram));
	return null;
    }
    return shaderProgram;
}

//create a shader of the given type, upload the source
//and compiles it
function loadShader(gl, type, source){
    const shader = gl.createShader(type);
    // send the source to the shader object
    gl.shaderSource(shader,source);

    // compile the shader program
    gl.compileShader(shader);

    //see if it compiled successfully
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
	alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
	gl.deleteShader(shader);
	return null;
    }

    return shader;
}

//get canvas dom element and attach mouse event handelers to canvas
function getCanvas(){
    const canvas = document.querySelector("#glCanvas");
    //canvas.width  = window.innerWidth;
    //canvas.height = window.innerHeight;
    function mouseEventHandler (e){
	    var cRect = canvas.getBoundingClientRect();        // Gets CSS pos, and width/height
	    var canvasX = Math.round(e.clientX - cRect.left);  // Subtract the 'left' of the canvas
	    var canvasY = Math.round(e.clientY - cRect.top);   // from the X/Y positions to make
	    //console.log(canvasX, canvasY , e.buttons);
	    if(e.buttons == 0){
	        if(sceneData.mousePressed == 1){
	    	    const toCenter = vec3.create();
	    	    vec3.subtract(toCenter, gameState.currentEyeCenter, gameState.eyePos);
	    	    const toCenterNormal = vec3.create();
                vec3.normalize(toCenterNormal,toCenter);
                //normalize currentEyeCenter and save to  eyeCenter
	    	    vec3.add(gameState.eyeCenter, toCenterNormal, gameState.eyePos);
	    	    sceneData.mousePressed = 0;
	    	    sceneData.frameCount = 0.0;
	        }
	        else{
	    	    sceneData.mousePressed = 0;
	        }
	    }
	    if(e.buttons == 1){ // left mouse buttom is pressed
	        if(sceneData.mousePressed == 0){
                // the pos edge, save initial canvas position
	    	    sceneData.mouseDownX = canvasX;
	    	    sceneData.mouseDownY = canvasY;
	    	    sceneData.mousePressed = 1;
	        }
	        else{
                // when pressed, dynamically update current eyeCenter
	    	    dx =  - sceneData.mouseDownX + canvasX;
                dy =  - sceneData.mouseDownY + canvasY;
                const udMat = mat4.create();
                const lrMat = mat4.create();

                // find eye looking direction
	    	    var eyeDir = vec4.create();
	    	    vec3.subtract(eyeDir, gameState.eyeCenter, gameState.eyePos);
                vec3.normalize(eyeDir,eyeDir);
                // calculate the right axis for rotation
                var rightDir = vec3.create();
                vec3.cross(rightDir, eyeDir, gameState.eyeUp);
                vec3.normalize(rightDir,rightDir);  
                if(vec3.len(rightDir)==0.0) rightDir = vec3.fromValues(1.0,0.0,0.0);
                mat4.fromRotation(udMat,dy/500, rightDir);
                mat4.fromRotation(lrMat,dx/500, gameState.eyeUp);
                // rotate eye direction 
                
                var dummy = vec4.create();
                vec4.transformMat4(dummy ,eyeDir,udMat);
                vec4.transformMat4(eyeDir, dummy, lrMat);
                //console.log(eyeDir);
                vec3.add(gameState.currentEyeCenter, gameState.eyePos, eyeDir );

              
	    	    //vec3.add(gameState.currentEyeCenter,  gameState.eyeCenter,  vec3.scale(dummy, rightDir, -dx / 500 ));

	    	    //vec3.add(gameState.currentEyeCenter,  gameState.currentEyeCenter,  vec3.scale(dummy, gameState.eyeUp, dy / 700));
	    	    //console.log( gameState.currentEyeCenter);
	    	    sceneData.frameCount = 0.0;

	        }

	    }
    }

    function scrollEventHandler(e){
	    const toCenter = vec3.create();
	    vec3.subtract(toCenter, gameState.currentEyeCenter, gameState.eyePos);
	    vec3.scale(toCenter, toCenter, e.deltaY * 0.001);
	    vec3.add(gameState.eyePos, gameState.eyePos , toCenter);
	    vec3.add(gameState.currentEyeCenter, gameState.currentEyeCenter , toCenter);
	    vec3.add(gameState.eyeCenter, gameState.eyeCenter, toCenter);
	    sceneData.frameCount = 0.0;
    }
    canvas.addEventListener("wheel",scrollEventHandler);
    canvas.addEventListener("mousemove",mouseEventHandler);
    return canvas;
}


function getGL(canvas){
    // Initialize the GL context
    const gl = canvas.getContext("webgl2");
    if(gl === null){
	alert("Unable to initialize WebGL, your browser or machine may not support it");
	return null ;
    }
    return gl;
}

