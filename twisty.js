//
//CSE 470 HW 1 TWISTY!  
//
/*
Written by: HW470: Vanessa Bracken
Date: Jan 2021

Description: 
This program ..... HW470: I hardcoded the vertices and colors. I made it harder than it needed to 
be by doing this. I slowly did one part of my cat face at a time, one side and then reflecting
x,y to the other side for a symmetrical cat face. The colors I just repeated 5 of them in 
groups of three for the length of the vertices array. 
*/

var canvas;
var gl;

//store the vertices
//Each triplet represents one triangle
var vertices = [];

//store a color for each vertex
var colors = []

//HW470: control the rotation
//I decided to stick with theta and just make that the control.

var theta = 0.0;

var thetaLoc;

//HW470: control the redraw rate
var delay = 50;
var direction = true;

// =============== function init ======================
 
// When the page is loaded into the browser, start webgl stuff
window.onload = function init()
{
	// notice that gl-canvas is specified in the html code
    canvas = document.getElementById( "gl-canvas" );
    
	// gl is a canvas object
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

	// Track progress of the program with print statement
    console.log("Opened canvas");
        
    //HW470:
    // Define  data for object 
	// See HW specs for number of vertices  required
	// Recommendation: each set of three points corresponds to a triangle.
	// Here is one triangle. You can use parametric equations, for example of a circle to generate (x,y) values
	
    vertices = [
        vec2( -0.80, 0.95 ), 
        vec2( -.90, .60 ),
        vec2( -0.60, 0.70 ),
		
		vec2(.80,.95),
		vec2(.90,.60),
		vec2(.60,.70),
		
		vec2(0.5, 0.55),
		vec2(0.75,.30),
		vec2(.25,0.30),
		
		vec2(-0.5, 0.55),
		vec2(-0.75,.30),
		vec2(-.25,0.30),
		
		vec2(-0.25,0.25),
		vec2(0.0,0.0),
		vec2(0.25,0.25),
		
		vec2(-0.5, -0.10),
		vec2(0.5,-0.10),
		vec2(0.0,-0.75),
		
		vec2(-0.30,-.10),
		vec2(-.10,-.10),
		vec2(-.20,-.30),
		
		vec2(0.30,-.10),
		vec2(.10,-.10),
		vec2(.20,-.30),
		
		vec2(0.5,0.0),
		vec2(0.5,-.02),
		vec2(1,.06),
		
		vec2(-.5,0.0),
		vec2(-0.5,-.02),
		vec2(-1,.06),
		
		vec2(-1.0,-1.0),
		vec2(1.0,1.0),
		
    ];
	
	/*for (var i = 0; i < 1.0; i+=.1){
	
		if(i%2 == 0){
			vertices.push(vec2(i *2 ,-i));
		}
		else 
			vertices.push(vec2(-i ,i));
	}*/
	 
	
	//HW470: Create colors for the core and outer parts
	// See HW specs for the number of colors needed
	for(var i=0; i < vertices.length; i++) {
		
		colors.push(vec3(1.0, 0.0, 0.0))
		colors.push(vec3(1.0, 0.0, 0.0));
		colors.push(vec3(1.0, 0.0, 0.0));
		
		colors.push(vec3(0.0, 1.0, 0.0));
		colors.push(vec3(0.0, 1.0, 0.0));
		colors.push(vec3(0.0, 1.0, 0.0));
		
		colors.push(vec3(1.0, 0.0, 1.0));
		colors.push(vec3(1.0, 0.0, 1.0));
		colors.push(vec3(1.0, 0.0, 1.0));
		
		colors.push(vec3(1.0, 1.0, 0.0));
		colors.push(vec3(1.0, 1.0, 0.0));
		colors.push(vec3(1.0, 1.0, 0.0));
		
		colors.push(vec3(0.0, 1.0, 1.0));
		colors.push(vec3(0.0, 1.0, 1.0));
		colors.push(vec3(0.0, 1.0, 1.0));
	};
	 
	 
	
	
	// HW470: Print the input vertices and colors to the console
	console.log("Input vertices and colors:");
	
	for(var i=0; i < vertices.length; i++) {
		
		console.log("vertices["+i+"] = " + vertices[i]);
		console.log("colors["+i+"] = "+ colors[i]);
	}
	 
	 

    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
	// Background color to white
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Define shaders to use  
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
	//
	// color buffer: create, bind, and load
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
	
	// Associate shader variable for  r,g,b color
	var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, true, 0, 0 );
    gl.enableVertexAttribArray( vColor );
    
    // vertex buffer: create, bind, load
    var vbuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vbuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate shader variables for x,y vertices	
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	//HW470: associate shader explode variable ("Loc" variables defined here) 
	
	thetaLoc = gl.getUniformLocation( program, "theta" );
     

    console.log("Data loaded to GPU -- Now call render");

    render();
};


// =============== function render ======================

function render()
{
    // clear the screen 
    gl.clear( gl.COLOR_BUFFER_BIT );
	
	//HW470: send uniform(s) to vertex shader
	
	
	
	theta += (direction ? 0.01 : -0.01);
	
   
	if (theta >= Math.PI/2 || theta <= 0.0)
	{
		direction = !direction;
	}
   
	gl.uniform1f(thetaLoc, theta);
	
	//HW470: draw the object
	// You will need to change this to create the twisting outer parts effect
	// Hint: you will need more than one draw function call
		
	
	//I didn't end up doing it here? I did the twisting in the vertex shader?
	
    gl.drawArrays( gl.TRIANGLES, 0, 30 );
	
	//stationary object. 
	gl.uniform1f(thetaLoc, 0.0);
	gl.drawArrays(gl.LINES, 30,31);
	

	
	//re-render after delay
	setTimeout(function (){requestAnimFrame(render);}, delay);
	

	 
}

