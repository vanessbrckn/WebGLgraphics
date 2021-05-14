var canvas;
var gl;
var program;

// Shader transformation matrices

var modelViewMatrix;
var modelViewMatrix2;
var projectionMatrix;
var instanceMatrix = mat4();

var texture1, texture2;
var t1, t2;


var NumVertices = 36; //(6 faces)(2 triangles/face)(3 vertices/triangle)
var texSize = 128;
var numChecks = 4;

var points = [];
var colors = [];
var normalsArray = [];
var texCoordsArray = [];

var lightPosition = vec4(1.0, 1.0, 1.0, 1.0 );  
//var lightPosition = vec4(0.0, 0.0, 5.0, 1.0 );  

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0,1.0,1.0, 1.0 );

var materialAmbient = vec4(0, 0, 0, 1.0);
var materialDiffuse = vec4( 1.0, 1.0 , 1.0, 1.0);
var materialSpecular = vec4( 0.5, 0.5, 0.5, 1.0 );
var materialShininess = 25;


var ctm;
var ambientColor, diffuseColor, specularColor;
var flag;


var image1 = new Uint8Array(4*texSize*texSize);

    for ( var i = 0; i < texSize; i++ ) {
        for ( var j = 0; j <texSize; j++ ) {
            var patchx = Math.floor(i/(texSize/numChecks));
            var patchy = Math.floor(j/(texSize/numChecks));
            if(patchx%2 ^ patchy%2) c = 255;
            else c = 0;
            //c = 255*(((i & 0x8) == 0) ^ ((j & 0x8)  == 0))
            image1[4*i*texSize+4*j] = c;
            image1[4*i*texSize+4*j+1] = c;
            image1[4*i*texSize+4*j+2] = c;
            image1[4*i*texSize+4*j+3] = 255;
        }
    }
    
var image2 = new Uint8Array(4*texSize*texSize);

    // Create a checkerboard pattern
    for ( var i = 0; i < texSize; i++ ) {
        for ( var j = 0; j <texSize; j++ ) {
            image2[4*i*texSize+4*j] = 127*127*(Math.acos(Math.cos(0.1*i*j)));
            image2[4*i*texSize+4*j+1] = 127*127*(Math.acos(Math.cos(0.1*i*j)));
            image2[4*i*texSize+4*j+2] = 127*127*(Math.acos(Math.cos(0.1*i*j)));
            image2[4*i*texSize+4*j+3] = 255;
           }
    }

var viewer = 
{
	eye: vec3(-10.0, 25.0, 50),
	at:  vec3(0.0, 0.0, 0.0),  
	up:  vec3(0.0, 1.0, 0.0),
	
	// for moving around object; set vals so at origin
	radius: null,
    theta: 0,
    phi: 0
};

// Create better params that suit your geometry
var perspProj = 
 {
	fov: 45,
	aspect: 1,
	near: 0.1,
	far:  200
 }

// mouse interaction
 
var mouse =
{
    prevX: 0,
    prevY: 0,

    leftDown: false,
    rightDown: false,
};

// this is just a cube centered around the orgin, it's used for all the other parts of 
//the avatar. == prototype

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];
var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

var bodyColor = vec4(.36, .25, .20 ,1.0);
var headColor = vec4(.36, .25, .20 ,1.0);
var frontlegColor = vec4(.36, .25, .20 ,1.0);
var backlegColor = vec4(.36, .25, .20 ,1.0);
var earColor = vec4(0.72, 0.45,0.20, 1.0);
var noseColor = vec4(0.0, 0.0, 0.0, 1.0);
var tailColor = vec4(0.0, 0.0, 0.0, 1.0);
var planeColor = vec4( 0.0,  0.5,  0.0,  1.0)

/*Tan = color red 0.858824 green 0.576471 blue 0.439216
Thistle = color red 0.847059 green 0.74902 blue 0.84705
Copper = color red 0.72 green 0.45 blue 0.20
DarkWood = color red 0.52 green 0.37 blue 0.26
BakersChoc = color red 0.36 green 0.20 blue 0.09
DarkBrown = color red 0.36 green 0.25 blue 0.20*/

//ID's to identify each piece of the avatar
var bodyID = 0;
var headID = 1;
var noseID = 2;
var ears1ID = 3;
var ears2ID = 4;
var frontLeftID = 5;
var frontRightID = 6;
var backLeftID = 7;
var backRightID = 8;
var tailID = 9; 

var numNodes = 9;
var numAngles = 9;

//Parameters of plane...
var planeHeight = .1;
var planeWidth = 85;


// Parameters controlling the size of the avatars parts

var BODY_HEIGHT = 3.0;
var BODY_WIDTH = 4.0;
var BODY_LENGTH = 6.0;
var HEAD_WIDTH = 2.5;
var HEAD_HEIGHT = 2.5;
var LEG_HEIGHT = 2.5;
var LEG_WIDTH = 1.0;
var NOSE_HEIGHT = .5;
var NOSE_WIDTH = .5;
var EAR_HEIGHT = 1.5;
var EAR_WIDTH = .5;
var EAR_LENGTH = 1;
var TAIL_HEIGHT = 3.0;
var TAIL_WIDTH = .25;

var stack = [];

var avatar = [];

for(var i=0; i<=numNodes; i++)
	avatar[i] = createNode(null,null,null,null);

var theta= [45, 0, 0, 180, 180, 0, 0, 0, 0, -90]; // angles for the UI, all oriented at the orgin

var angle = 0;

var modelViewMatrixLoc;
var colorLoc;

var vBuffer, cBuffer;

//----------------------------------------------------------------------------

function quad(  a,  b,  c,  d ) { 

     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);
     var normal = vec3(normal);
     normal = normalize(normal);

     points.push(vertices[a]); 
     normalsArray.push(normal); 
	 texCoordsArray.push(texCoord[0]);
	   
     points.push(vertices[b]); 
     normalsArray.push(normal);
	 texCoordsArray.push(texCoord[1]); 
	 
     points.push(vertices[c]); 
     normalsArray.push(normal);
	 texCoordsArray.push(texCoord[2]); 
	 
     points.push(vertices[a]);  
     normalsArray.push(normal); 
	 texCoordsArray.push(texCoord[0]); 
	 
     points.push(vertices[c]); 
     normalsArray.push(normal); 
	 texCoordsArray.push(texCoord[2]); 
	 
     points.push(vertices[d]); 
     normalsArray.push(normal);
	 texCoordsArray.push(texCoord[3]); 
}


function cube() {
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

//____________________________________________

// Remmove when scale in MV.js supports scale matrices

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}


//--------------------------------------------------
//This creates the nodes
function createNode(transform, render, sibling, child)
{
	var node = {
		transform: transform,
		render: render,
		sibling: sibling,
		child: child
	}
	return node;
}
//we need to initialize the nodes using this function:
function initNodes(ID){
	
	var m = mat4();
	
	switch(ID){
		
		case bodyID:
			//m = translate(0.0, 0.0, 0.0);
			//m = mult(m,rotate(theta[bodyID], 0,1,0));
			m = rotate(theta[bodyID], 0,1,0);
			avatar[bodyID] = createNode(m, draw_body, null, headID);
		break;
		
		case headID: 
			m = translate(0.0, BODY_HEIGHT, .65*BODY_LENGTH);
			m = mult(m, rotate(theta[headID], 0,1,0));
			avatar[headID] = createNode(m, draw_head, frontLeftID, noseID);
		break;
		
		case frontLeftID:
			m = translate(.3*(BODY_WIDTH+LEG_WIDTH),  0.1*LEG_HEIGHT, .35*BODY_LENGTH);
			m = mult(m,rotate(theta[frontLeftID], 1, 0,0));
			avatar[frontLeftID] = createNode(m, front_left, frontRightID, null);
		break;
		
		case frontRightID:
			m = translate(-.3*(BODY_WIDTH+LEG_WIDTH), 0.1*LEG_HEIGHT, .35*BODY_LENGTH);
			m = mult(m, rotate(theta[frontRightID], 1,0, 0));
			avatar[frontRightID] = createNode(m, front_right, backLeftID, null);
		break;
		
		case backLeftID:
			m = translate(.3*(BODY_WIDTH+LEG_WIDTH), 0.1*LEG_HEIGHT, -.35*BODY_LENGTH);
			m = mult(m, rotate(theta[backLeftID], 1,0,0));
			avatar[backLeftID] = createNode(m, back_left, backRightID, null);
		break;
		
		case backRightID:
			m = translate(-.3*(BODY_WIDTH+LEG_WIDTH),  0.1*LEG_HEIGHT, -.35*BODY_LENGTH);
			m = mult(m, rotate(theta[backRightID], 1,0,0));
			avatar[backRightID] = createNode(m, back_right, tailID, null);
		break;
		
		case tailID:
			m = translate(0.0,BODY_HEIGHT,-0.5*BODY_LENGTH);
			m = mult(m, rotate(theta[tailID], 0, 0, 1));
			avatar[tailID] = createNode(m, tail, null, null);
		break;
		
		case noseID:
			m = translate(0.0,.5*HEAD_HEIGHT, .6*HEAD_HEIGHT);
			m = mult(m, rotate(theta[noseID], 0,1,0));
			avatar[noseID] = createNode(m,nose,ears1ID,null);
		
		case ears1ID:
			m = translate(-.60*HEAD_WIDTH, HEAD_HEIGHT, 0.0);
			m = mult(m, rotate(theta[ears1ID], 0,0,1));
			avatar[ears1ID] = createNode(m, ears, ears2ID, null);
		break;
		
		case ears2ID:
			m = translate(.60*HEAD_WIDTH, HEAD_HEIGHT, 0.0);
			m = mult(m, rotate(theta[ears2ID], 0,0,1));
			avatar[ears2ID] = createNode(m, ears, null, null);
		break;
		
	}
}

//function to traverse the tree:

function traverse(ID) {

	if(ID == null) 
		return;
	stack.push(modelViewMatrix);
	modelViewMatrix = mult(modelViewMatrix, avatar[ID].transform);
	avatar[ID].render();
	
	if(avatar[ID].child != null)
		traverse(avatar[ID].child);
	
	modelViewMatrix = stack.pop();
	
	if(avatar[ID].sibling != null) 
		traverse(avatar[ID].sibling);
}

//----Draw functions----------------------------------------------------------

function tail (){
	
	instanceMatrix = mult(modelViewMatrix, translate(0.0,0.5*TAIL_HEIGHT,0.0));
	instanceMatrix = mult(instanceMatrix, scale4(TAIL_WIDTH,TAIL_HEIGHT,TAIL_WIDTH));
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(instanceMatrix) );
	gl.uniform4fv(colorLoc, flatten(tailColor) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
	
}

function draw_body() {
	
    instanceMatrix = mult(modelViewMatrix, translate(0.0,0.5*BODY_HEIGHT,0.0));
	instanceMatrix = mult(instanceMatrix, scale4(BODY_WIDTH,BODY_HEIGHT,BODY_LENGTH));
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(instanceMatrix) );
	gl.uniform4fv(colorLoc, flatten(bodyColor) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}
function draw_head() {
	
    instanceMatrix = mult(modelViewMatrix, translate(0.0,0.5*HEAD_HEIGHT,0.0));
	instanceMatrix = mult(instanceMatrix, scale4(HEAD_WIDTH, HEAD_HEIGHT, HEAD_WIDTH));
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(instanceMatrix) );
	gl.uniform4fv(colorLoc, flatten(headColor) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}
function front_left()
{
    instanceMatrix = mult(modelViewMatrix, translate(0.0,0.5*-LEG_HEIGHT,0.0));
	instanceMatrix = mult(instanceMatrix, scale4(LEG_WIDTH, LEG_HEIGHT, LEG_WIDTH));
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(instanceMatrix) );
	gl.uniform4fv(colorLoc, flatten(frontlegColor) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function front_right()
{
    instanceMatrix = mult(modelViewMatrix, translate(0.0,0.5*-LEG_HEIGHT,0.0));
	instanceMatrix = mult(instanceMatrix, scale4(LEG_WIDTH, LEG_HEIGHT, LEG_WIDTH));
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(instanceMatrix) );
	gl.uniform4fv(colorLoc, flatten(frontlegColor) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function back_right()
{
    instanceMatrix = mult(modelViewMatrix, translate(0.0,0.5*-LEG_HEIGHT,0.0));
	instanceMatrix = mult(instanceMatrix, scale4(LEG_WIDTH, LEG_HEIGHT, LEG_WIDTH));
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(instanceMatrix) );
	gl.uniform4fv(colorLoc, flatten(backlegColor) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function back_left()
{
    instanceMatrix = mult(modelViewMatrix, translate(0.0,0.5*-LEG_HEIGHT,0.0));
	instanceMatrix = mult(instanceMatrix, scale4(LEG_WIDTH, LEG_HEIGHT, LEG_WIDTH));
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(instanceMatrix) );
	gl.uniform4fv(colorLoc, flatten(backlegColor) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function ears()
{
	instanceMatrix = mult(modelViewMatrix, translate(0.0,0.5*EAR_HEIGHT,0.0));
	instanceMatrix = mult(instanceMatrix, scale4(EAR_WIDTH, EAR_HEIGHT, EAR_LENGTH));
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(instanceMatrix) );
	gl.uniform4fv(colorLoc, flatten(earColor) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function nose()
{
	instanceMatrix = mult(modelViewMatrix, translate(0.0,0.5*NOSE_HEIGHT,0.0));
	instanceMatrix = mult(instanceMatrix, scale4(NOSE_WIDTH, NOSE_HEIGHT, NOSE_WIDTH));
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(instanceMatrix) );
	gl.uniform4fv(colorLoc, flatten(noseColor) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}
function surface()
{
	instanceMatrix = mult(modelViewMatrix2, translate(10,-LEG_HEIGHT,-10));
	instanceMatrix = mult(instanceMatrix, scale4(planeWidth, planeHeight, planeWidth));
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(instanceMatrix) );
	gl.uniform4fv(colorLoc, flatten(planeColor) );
	gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
	
}

function configureTexture() {
    texture1 = gl.createTexture();       
    gl.bindTexture( gl.TEXTURE_2D, texture1 );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image1);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    texture2 = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture2 );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image2);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

// --------------INIT----------------------------------------------------------------
window.addEventListener("contextmenu", e => e.preventDefault()); 
window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    gl.clearColor( 0.3, 0.3, 0.3, 1.0);
    gl.enable( gl.DEPTH_TEST ); 
    
    //
    //  Load shaders and initialize attribute buffers

    program = initShaders( gl, "vertex-shader", "fragment-shader" );    
    gl.useProgram( program );
	
	cube();
	
	flag = 1;
	
	projectionMatrix = perspective(perspProj.fov, perspProj.aspect, perspProj.near, perspProj.far);
	modelViewMatrix = lookAt(viewer.eye, viewer.at , viewer.up);
	modelViewMatrix2 = lookAt(viewer.eye, viewer.at , viewer.up);
	
	ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
	
	modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );
	
	colorLoc = gl.getUniformLocation(program, "color");
	gl.uniform4fv(colorLoc, flatten(bodyColor) );
	
	
	
	var diff = subtract(viewer.eye,viewer.at);
	viewer.radius = length(diff);

    // Create and initialize  buffer objects
    
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
	
	 var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );
	
	var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

	for(var i= 0; i <= numNodes; i++)
		initNodes(i);
	
	instanceMatrix = mat4();
		
	configureTexture();
    
    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, texture1 );
    gl.uniform1i(gl.getUniformLocation( program, "Tex0"), 0);
            
    gl.activeTexture( gl.TEXTURE1 );
    gl.bindTexture( gl.TEXTURE_2D, texture2 );
    gl.uniform1i(gl.getUniformLocation( program, "Tex1"), 1);
	
	// ========================== Camera control via mouse ============================================
	// There are 4 event listeners: onmouse down, up, leave, move
	//
	// on onmousedown event
	// check if left/right button not already down
	// if just pressed, flag event with mouse.leftdown/rightdown and stores current mouse location
    document.getElementById("gl-canvas").onmousedown = function (event)
    {
        if(event.button == 0 && !mouse.leftDown)
        {
            mouse.leftDown = true;
            mouse.prevX = event.clientX;
            mouse.prevY = event.clientY;
        }
        else if (event.button == 2 && !mouse.rightDown)
        {
            mouse.rightDown = true;
            mouse.prevX = event.clientX;
            mouse.prevY = event.clientY;
        }
    };

	// onmouseup event
	// set flag for left or right mouse button to indicate that mouse is now up
    document.getElementById("gl-canvas").onmouseup = function (event)
    {
        // Mouse is now up
        if (event.button == 0)
        {
            mouse.leftDown = false;
        }
        else if(event.button == 2)
        {
            mouse.rightDown = false;
        }

    };
    document.getElementById("gl-canvas").onmouseleave = function ()
    {
        // Mouse is now up
        mouse.leftDown = false;
        mouse.rightDown = false;
    };
    document.getElementById("gl-canvas").onmousemove = function (event)
    {
		// only record changes if mouse button down
		if (mouse.leftDown || mouse.rightDown) {
			
			// Get changes in x and y at this point in time
			var currentX = event.clientX;
			var currentY = event.clientY;
			
			// calculate change since last record
			var deltaX = event.clientX - mouse.prevX;
			var deltaY = event.clientY - mouse.prevY;
			
			// Compute camera rotation on left click and drag
			if (mouse.leftDown)
			{
				
				// Perform rotation of the camera
				//
				if (viewer.up[1] > 0)
				{
					viewer.theta -= 0.01 * deltaX;
					viewer.phi -= 0.01 * deltaY;
				}
				else
				{
					viewer.theta += 0.01 * deltaX;
					viewer.phi -= 0.01 * deltaY;
				}
				
				// Wrap the angles
				var twoPi = 6.28318530718;
				if (viewer.theta > twoPi)
				{
					viewer.theta -= twoPi;
				}
				else if (viewer.theta < 0)
				{
					viewer.theta += twoPi;
				}

				if (viewer.phi > twoPi)
				{
					viewer.phi -= twoPi;
				}
				else if (viewer.phi < 0)
				{
					viewer.phi += twoPi;
				}

			} // end mouse.leftdown
			else if(mouse.rightDown)
			{
				// Perform zooming; don't get too close           
				viewer.radius -= 0.01 * deltaX;
				viewer.radius = Math.max(0.1, viewer.radius);
			}

			// Recompute eye and up for camera
			var threePiOver2 = 4.71238898;
			var piOver2 = 1.57079632679;		
			var pi = 3.14159265359;

			// pre-compute this value
			var r = viewer.radius * Math.sin(viewer.phi + piOver2);
			
			// eye on sphere with north pole at (0,1,0)
			// assume user init theta = phi = 0, so initialize to pi/2 for "better" view
			
			viewer.eye = vec3(r * Math.cos(viewer.theta + piOver2), viewer.radius * Math.cos(viewer.phi + piOver2), r * Math.sin(viewer.theta + piOver2));
			
			//add vector (at - origin) to move 
			for(k=0; k<3; k++)
				viewer.eye[k] = viewer.eye[k] + viewer.at[k];
			
			if (viewer.phi < piOver2 || viewer.phi > threePiOver2) {
				viewer.up = vec3(0.0, 1.0, 0.0);
			}
			else {
				viewer.up = vec3(0.0, -1.0, 0.0);
			}
	
			// Recompute the view
			modelViewMatrix = lookAt(vec3(viewer.eye), viewer.at, viewer.up);
			modelViewMatrix2 = lookAt(vec3(viewer.eye), viewer.at, viewer.up);

			mouse.prevX = currentX;
			mouse.prevY = currentY;

		} // end if button down

    };
	document.getElementById("Toggle").onclick = function(){ 
		if (flag == 0)
			flag = 1;
		else 
			flag = 0;
	};
	
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
       flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
       flatten(lightPosition) );
       
	gl.uniform1f(gl.getUniformLocation(program, 
      "shininess"),materialShininess);
	   
	
    render();
}

//------------------------------RENDER FUNCTION-------------------------------------------


/*tail = -90 to 90;
Left Legs = 285 to 45
Right Legs = 285 to 45
Right Ear = 220 to 180
Left Ear = 145 to 180*/


var tailAngle = [];
var leftLegAng = [];
var rightLegAng = [];
var LearAng = [];
var RearAng = [];
var Tang = -90;
var Lang = 45;
var Rang = 45;
var LEang = 220;
var REang = 145;
var index = 0;


for (var i = -90; i<270; i+=5)
{
	tailAngle.push(Tang);
	
	if (i < 90){
		Tang += 5;
	}
	else 
		Tang -= 5;
}

for (var i = 0; i < 144; i+=2)
{
	leftLegAng.push(Lang);
	if ( i < 76)
		Lang -= 2;
	else 
		Lang += 2;	
}
for (var i = 0; i < 144; i+=2)
{
	rightLegAng.push(Rang);
	if ( i < 76)
		Rang -= 2;
	else 
		Rang += 2;	
}
for (var i = 0; i < 80; ++i)
{
	LearAng.push(LEang);
	if (i < 40)
		LEang--;
	else
		LEang++;
}
for (var i = 0; i < 80; ++i)
{
	RearAng.push(REang);
	if(i < 40)
		REang++;
	else
		REang--;
}

var modelViewMatrix2;

var render = function() {

	//console.log("tail length: ", tailAngle.length);
	//console.log("leg lenght: ", leftLegAng.length);
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	
	surface();
	
	if (flag){
		modelViewMatrix = mult( modelViewMatrix, translate(.5*Math.cos(angle/2),0, -.5*Math.sin(angle/2)));

		
	}
	theta[frontLeftID] = leftLegAng[index];
	theta[backLeftID] = leftLegAng[index];
	theta[frontRightID] = rightLegAng[index];
	theta[backRightID] = rightLegAng[index];
	theta[ears2ID] = LearAng[index];
	theta[ears1ID] = RearAng[index];
	initNodes(frontLeftID);
	initNodes(backLeftID);
	initNodes(frontRightID);
	initNodes(backRightID);
	initNodes(ears2ID);
	initNodes(ears1ID);
	theta[tailID] = tailAngle[index];
	initNodes(tailID);
	
	

	angle +=.05;
	
	if (angle == 360)
		angle = 0;

	index ++; 
	
	if (index == tailAngle.length)
		index = 0;
	
	traverse(bodyID);
	
	
	
	//console.log(index);
	
   
    requestAnimFrame(render);
}



