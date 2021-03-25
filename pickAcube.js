//Vanessa Bracken CSE470 HW2

var canvas;
var gl;

var numVertices  = 36;

var cubeVertices = [];
var cubeColor = [];
var spintheta = 0.0;
var speed = 0.2;
var scale = .2;
var selectedCube = -1;
var r = scale*1;


var pos = [
	vec3(0.0,0.75,0), //top
	vec3(-.56, .56, 0), //top left
	vec3(-0.75, 0.0, 0), //left
	vec3(-.56, -0.56,0), //bottom left
	vec3(0.0,-0.75,0), //bottom
	vec3(0.56, -0.56, 0), // bottom right
	vec3(0.75, 0.0, 0), //right
	vec3(0.56, 0.56, 0) //top right
	];

var axis = [
	
	vec3(0,.75,0),
	vec3(-.56,.56,0),
	vec3(-.75,0,0),
	vec3(-.56,-.56,0),
	vec3(0,-.75,0),
	vec3(.56,-.56,0),
	vec3(.75,0,0),
	vec3(.56,.56,0)
];


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);
	
	var program = initShaders(gl,"vertex-shader","fragment-shader");
	gl.useProgram(program);
	
	createCube();

    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cubeColor), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cubeVertices), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	modelView = gl.getUniformLocation( program, "modelView" );
	
	mvMatrix = mat4();
	mvMatrix2 = mat4();
	
	
	// Event Listeners:
	
	document.getElementById("slider").onchange = function(){
		scale = event.srcElement.value;
		r = scale*1;
		console.log("scale = ",scale);
	}
	document.getElementById("spSlider").onchange = function() {
		speed = event.srcElement.value;
		console.log("speed = ",speed);
	}
	
	document.getElementById("buttonRESET").onclick = function() {
		mvMatrix = mat4();
		mvMatrix = mult(scalem(0.2,0.2,0.2), translate(-0.5,-0.5, 0.5));
		selectedCube = -1;
		console.log("reset button pressed, selectedCube = ",selectedCube);
	}

	canvas.addEventListener("mousedown",function(){
		console.log("(x,y) = ", event.clientX," ",event.clientY);
		
		var winner = 100;
		
		var screenX = event.clientX - canvas.offsetLeft;
		var screenY = event.clientY - canvas.offsetTop;
		var posX = 2*screenX/canvas.width-1;
		var posY = 2*(canvas.height-screenY)/canvas.height-1;
		
		t = vec3(posX,posY,0);
		
		console.log("convert to clip coordinates = ", t);
		
		
		for(var i = 0; 0 < pos.length; i++){
			
			const distX = Math.abs(pos[i][0] - t[0]);
			const distY = Math.abs(pos[i][1] - t[1]);
			console.log("i = ", i);
			console.log("dist = ", distX, " ", distY);
			
			
			
			if (distX < r && distY < r){
				
				if ((distX + distY) < winner){
					winner = distX + distY;
					selectedCube = i;
				}
			}
			
			console.log("selected cube = ",selectedCube);
		}
	});
	
	
	

    render();
}

//to make in the middle. 
// -0.5, -0.5, +0.5 


var mvMatrix, pMatrix;
var mvMatrix2;
var modelView, projection; 
var eye;

var render = function() {
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
        //this is how we send it to the vertex shader
		
		mvMatrix = mult(scalem(scale,scale,scale), translate(-0.5,-0.5, 0.5));
		

		
        
		for ( var i = 0; i < pos.length; ++i){
			
			mvMatrix2 = mult(scalem(scale,scale,scale), translate(-0.5,-0.5, 0.5));
			mvMatrix2 = mult(rotate(spintheta, axis[i]), mvMatrix2); // change axis variable on each iteration
			mvMatrix2 = mult(translate(pos[i]), mvMatrix2);
			
			gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix2) );   //mvMatrix is our key transformation     
			gl.drawArrays( gl.TRIANGLES, 0, numVertices );
			
			if (selectedCube == i){
				mvMatrix = mult(scalem(scale,scale,scale), translate(-0.5,-0.5, 0.5));
				mvMatrix = mult(rotate(spintheta, axis[i]), mvMatrix); 
			}
				
		}
		
		gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );   //mvMatrix is our key transformation     
		gl.drawArrays( gl.TRIANGLES, 0, numVertices );
		
		

		
		spintheta += +speed;
		//console.log("spintheta = ", spintheta);
		
		 
        requestAnimFrame(render);
}



