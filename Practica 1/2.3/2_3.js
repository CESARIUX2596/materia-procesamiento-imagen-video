var canvas;
var gl;

var numTimesToSubdivide = 3;
 
var index = 0; 

var pointsArray = [];
var normalsArray = [];

var type = 1;

var near = -10;
var far = 10;
var radius = 1.5;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -3.0;
var right = 3.0;
var ytop =3.0;
var bottom = -3.0;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);
//componets of color of a source
var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
//Reflexivity coeficients
var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 20.0; //For the specular component

var ctm;
var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var normalMatrix, normalMatrixLoc;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

function triangle(a, b, c, type) {
    if(type == 1){
        var t1 = subtract(b, a);
        var t2 = subtract(c, a);
        var normal = normalize(cross(t2, t1));
        normal = vec4(normal);
        normal[3]  = 0.0;
        
        normalsArray.push(normal);
        normalsArray.push(normal);
        normalsArray.push(normal);
    }
    else if(type == 2){
        normalsArray.push(normal);
        normalsArray.push(normal);
        normalsArray.push(normal);
    }
    else{
        normalsArray.push(a);
        normalsArray.push(b);
        normalsArray.push(c);
    }
    pointsArray.push(a);
    pointsArray.push(b);      
    pointsArray.push(c);
    index += 3;
}


function divideTriangle(a, b, c, count, type) {
    if ( count > 0 ) {
                
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
                
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
                                
        divideTriangle( a, ab, ac, count - 1, type);
        divideTriangle( ab, b, bc, count - 1, type);
        divideTriangle( bc, c, ac, count - 1, type);
        divideTriangle( ab, bc, ac, count - 1, type);
    }
    else { 
        triangle( a, b, c, type);
    }
}


function tetrahedron(a, b, c, d, n, type) {
    divideTriangle(a, b, c, n, type);
    divideTriangle(d, c, b, n, type);
    divideTriangle(a, d, b, n, type);
    divideTriangle(a, c, d, n, type);
}

window.onload = function init() {

         canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 0.0 );
    
    gl.enable(gl.DEPTH_TEST);

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide, type);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);


    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );


    //// ---------------------------
    //// Crear controles de iluminacion, para incrementar y decrementar 
    //// el radio, angulo theta y angulo phi de la fuente de iluminacion. 
    //// Se recomienda que el radio este en un rango de 0.5 a 2.0. 
    //// Usar radianes para los incrementos de los angulos.

    //// ---------------------------
    document.getElementById("radiusMin").onclick = function(){
     radius *= 0.5;
    };
    document.getElementById("radiusAdd").onclick = function(){
     radius *= 2.0;
    };
    document.getElementById("phiMin").onclick = function(){
     phi -= dr;
    };
    document.getElementById("phiAdd").onclick = function(){
     phi += dr;
    };
    document.getElementById("thetaMin").onclick = function(){
     theta -= dr;
    };
    document.getElementById("thetaAdd").onclick = function(){
     theta += dr;
    };
    document.getElementById("flat").onclick = function(event){
    index = 0;
    pointsArray = []; 
    normalsArray = [];
    type = 1;
    init();
    };
    document.getElementById("phong").onclick = function(event){
    index = 0;
    pointsArray = []; 
    normalsArray = [];
    type = 2;
    init();
    };
    document.getElementById("gourad").onclick = function(event){
    index = 0;
    pointsArray = []; 
    normalsArray = [];
    type = 3;
    init();
    };

    //// ---------------------------    
    //// Crear controles para incrementar y decrementar subdivisiones. 
    //// Dentro de la funcion del control (ya sea de boton o un slider)
    //// se requieren los parametros de nÃºmero de subdivisiones, 
    //// puntos y normales del arreglo
    //// --------------------------
    document.getElementById("subdivisionMin").onclick = function(){
    numTimesToSubdivide--;
    index = 0;
    pointsArray = [];
    normalsArray = [];
    init();
    };
    document.getElementById("subdivisionAdd").onclick = function(){
    if(numTimesToSubdivide) numTimesToSubdivide++;
        index = 0;
        pointsArray = [];
        normalsArray = [];
        init();
    };

    //// ---------------------------
    //// Crear controles de intensidad de iluminacion. 
    //// Utilizar los cuatro componentes para generar la iluminacion
    //// en el programa: iluminaciÃ³n ambiental, difusa y especular
    //// ---------------------------
gl.uniform4fv(gl.getUniformLocation(program,"ambientProduct"), flatten(ambientProduct));
gl.uniform4fv(gl.getUniformLocation(program,"diffuseProduct"), flatten(diffuseProduct));
gl.uniform4fv(gl.getUniformLocation(program,"specularProduct"), flatten(specularProduct));

    //// ---------------------------
    //// Tener en cuenta la posicion de la fuente de iluminacion 
    //// y el material de la superficie de la esfera	
    //// ---------------------------
gl.uniform4fv( gl.getUniformLocation(program,"lightPosition"), flatten(lightPosition) );
gl.uniform1f( gl.getUniformLocation(program,"shininess"),materialShininess );

    render();
}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    //// ---------------------------
    //// La funcion render depende del radio de incidencia de luz
    //// y de los angulos theta y phi de la fuente de iluminacion.
    //// ---------------------------
  eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
           radius*Math.sin(theta)*Math.sin(phi),
          radius*Math.cos(theta));
  
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    normalMatrix = [
        vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
        vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
        vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
    ];

            
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );
        
    for( var i=0; i<index; i+=3) 
        gl.drawArrays( gl.TRIANGLES, i, 3 );

    window.requestAnimFrame(render);
}