var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer({alpha: true});


var texture;
var backgroundMesh;
var backgroundScene; 
var backgroundCamera; 

var div3d;      //div that contains GL viewport
var central;
var drawCanvas;

var width=10;   //viewport width in pixels
var height=10;  //viewport height in pixels

var width3d = 10;
var height3d = 10;

//var controls;

var cubegeometry = new THREE.BoxGeometry(0.2,0.2,0.2);
var cubematerial = new THREE.MeshBasicMaterial( { ambient: 0x030303, color: 0xdddddd, specular: 0xffffff, shininess: 30, shading: THREE.FlatShading } );
var cube;

//..........................................selection
var mouse = new THREE.Vector2();            //mouse coordinates in screen space
var mouse3d=new THREE.Vector3( 0, 0, 0 );   //mouse coordinates in XYZ / ambient space

//used in order to convert between screen and ambient coordinates
var projector = new THREE.Projector();

//intersection [drawing] plane
var planeXY;
//material to apply to new section segments
var sectionMaterial = new THREE.MeshBasicMaterial( { color: 0x000000 });
var thickness0 = 0.1;
var thickness1 = 0.1;

function Main(){

    central = document.getElementById("central");

    width=window.innerWidth;
    height=window.innerHeight;

    draw.addEventListener( 'click', onDrawMouseDown, false );

}

function onDrawMouseDown(event){
    console.log(event);

    width3d = 1200;
    height3d = 600;


    //...............draw btns
    var btnHolder = document.createElement('div');
    var btn1 = document.createElement('div');
    var btn2 = document.createElement('div');
    central.appendChild(btnHolder);
    btnHolder.appendChild(btn1);
    btnHolder.appendChild(btn2);
    btnHolder.id = 'btnHolder';
    btn1.className = 'btns';
    btn2.className = 'btns';

    btnHolder.style.left = ((width/2 - width3d/2)-40) + 'px';
    btnHolder.style.top = (height/2 - height3d/2) + 'px';

    btn1.addEventListener( 'click', onBtn1MouseDown, false );
    btn2.addEventListener( 'click', onBtn2MouseDown, false );



    //...........................................canvas to draw in

    drawCanvas = document.getElementById("canvasDraw");
    /*central.appendChild(drawCanvas);
    drawCanvas.id = 'drawCanvas';
*/
    //drawCanvas.style.width = 100 + 'px';
    //drawCanvas.style.height = width3d + 'px';
    drawCanvas.style.left = (width/2 - width3d/2) + 'px';
    drawCanvas.style.top = (height/2 - height3d/2) + 'px';
    renderer.canvas = drawCanvas;

    //on mouse down add 3D div to scene
    div3d = document.getElementById("div3d");
   // div3d.style.left = (width/2 - width3d/2) + 'px';
   // div3d.style.top = (height/2 - height3d/2) + 'px';
    //drawCanvas.appendChild(div3d);
    div3d.appendChild( renderer.domElement );


    camera.aspect = width3d/height3d;
    camera.position.set( 0, 2, 5 );
    camera.updateProjectionMatrix(); //call this every time you change something in the camera
    //$(div3d).offset;
    //background color
    
    //renderer.setClearColor(0xFFFFFF, 0.5);

    renderer.setSize( width3d, height3d );

    //.......................mouse events
    drawCanvas.addEventListener( 'mousemove', onDocumentMouseMove, false );
    drawCanvas.addEventListener( 'mousedown', onDocumentMouseDown, false );
    drawCanvas.addEventListener( 'mouseup', onDocumentMouseUp, false );

    //...........background
    texture = new THREE.ImageUtils.loadTexture( 'background.jpg');
    backgroundMesh = new THREE.Mesh (
        new THREE.PlaneGeometry(2,2,0), 
        new THREE.MeshBasicMaterial({map: texture})
        );

    backgroundMesh.material.depthTest = false;
    backgroundMesh.material.depthWrite = false;

    backgroundScene = new THREE.Scene();
    backgroundCamera = new THREE.Camera();
    backgroundScene.add(backgroundCamera);
    backgroundScene.add(backgroundMesh);

    //..............................................planeXY [this is the dummy object we intersect to find the location of the mouse on the drawing plane]
    planeXYGeometry=new THREE.PlaneGeometry( 300, 300, 8, 8 );
    planeXY = new THREE.Mesh( planeXYGeometry, new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true, wireframe: true } ) );

    planeXY.visible = false;
    scene.add( planeXY );
    //................................................
    //....................................................cube
   

    cube = new THREE.Mesh( cubegeometry, cubematerial );
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add( cube );


    render();

}

function render() {

    //controls.update();
    renderer.autoClear = false;
    renderer.clear();
    requestAnimationFrame(render);


    cube.rotation.x += 0.1;
    cube.rotation.y += 0.1;

    renderer.render(backgroundScene, backgroundCamera);
    renderer.render(scene, camera);
}

//these are utililty functions that create Vector3 objects from the sums and differences of 
//other vectors. they reduce the amount of count when building geometry
//create a vector from the difference of two vectors
function VDifference(p1, p0) {
    return new THREE.Vector3(p1.x-p0.x, p1.y-p0.y, p1.z-p0.z);
}
function Difference(p1, p0) {
    return Math.sqrt((p1.x-p0.x)*(p1.x-p0.x)) + ((p1.y - p0.y)*(p1.y - p0.y));
     
}
//create a vector from the sum of two vectors
function VSum(p0, p1) {
    return new THREE.Vector3(p1.x+p0.x, p1.y+p0.y, p1.z+p0.z);
}
//create a vector by adding two vectors one of which is scaled by a number m
function VSumScaled(p0, p1, m) {
    return new THREE.Vector3(p1.x*m+p0.x, p1.y*m+p0.y, p1.z*m+p0.z);
}

//create a copy of a vector
function VCopy(p) {
    return new THREE.Vector3(p.x, p.y, p.z);
}

//create a new vector [so you don't need to write new THREE.Vector3(x,y,z)]
function VNew(x,y,z) {
    return new THREE.Vector3(x, y, z);
}

function VHalf(p1,p0){
    var vec = VDifference(p1,p0);
    var scale = vec.divideScalar(2);
    return scale;
}

function VAngle(p1,p0){
    var vec = VHalf(p1,p0);
    var norm = VNew(VHalf.x, mouse.y, 0);
    return vec.angleTo(norm);
}

//this is the utility function that adds a quad made of 4 vertices to a geometry mesh g
//abcd are the indices of the vertices to connect
//this function also adds texture coordinates at the corners [faceVertxUvs] so that a texture
//if applied with the material will cover the whole quad
function addQuad(g, a,b,c,d) {
    g.faces.push(new THREE.Face3(a, b, c));
    g.faces.push(new THREE.Face3(a, c, d));

    g.faceVertexUvs[ 0 ].push( [ new THREE.Vector2(0,0), new THREE.Vector2(1,0), new THREE.Vector2(1,1) ] );
    g.faceVertexUvs[ 0 ].push( [ new THREE.Vector2(0,0), new THREE.Vector2(1,1), new THREE.Vector2(0,1) ] );
}

//function that creates a box section segment mesh from point p0 to p1
function onBtn1MouseDown(event){
    sectionMaterial = new THREE.MeshBasicMaterial({color: 0x000000 });
    thickness1 = 0.05;
}
function onBtn2MouseDown(event){
    sectionMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00 });
    thickness1 = 0.1;
}
function addCircle(p0, p1){

    //RingGeometry(innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength)
   
    var half = VHalf(p1, p0);
    var trans2 = VDifference(half.x, half.y, 0);
    var len = trans2.length();

    var angle = VAngle(p1, p0);

    var d=Difference(p1, p0);
    var r = d/2;
    var iR = r-0.5;
    var s = 32;
    var ts = 32;
    var ps = 32;
    var start = angle;
    var length =  Math.PI;

    var circleGeometry3 = new THREE.CircleGeometry( 0.25, s );
    

    var circleGeometry = new THREE.RingGeometry( iR, r, ts, ps, start, length);
    var circleGeometry2 = new THREE.RingGeometry( iR, r, ts, 32, 0, length);
    var circleMaterial = new THREE.MeshBasicMaterial({color: 0x000000, side:THREE.DoubleSide});

    var circle = new THREE.Mesh( circleGeometry, circleMaterial);
    var circle2 = new THREE.Mesh( circleGeometry2, circleMaterial);
    var circle3 = new THREE.Mesh( circleGeometry3, circleMaterial);
    circle.position.set(half.x, half.y, 0);
    //circle.translateOnAxis(trans2.normalize(), len);

    scene.add( circle );
    //scene.add( circle2 );
    //scene.add( circle3 );
    return circle;

}
function addSegment(p0, p1, thickness0, thickness1) {

    //create new geometry
    var g=new THREE.Geometry();
    


    var dv=VDifference(p1, p0);         //vector from p0 to p1 [axis of section]
    var dvp0=VNew(dv.y, -dv.x, 0.0);    //vector perpendicular to section axis at p0
    dvp0.setLength(thickness0);         //scale by start thickness

    var dvp1=VNew(dv.y, -dv.x, 0.0);    //vector perpendicular to section axis at p1
    dvp1.setLength(thickness1);         //scale by end thickness

    
    
    var v0=VSumScaled(p0, dvp0, 1.0);   //points of front face
    var v1=VSumScaled(p1, dvp1, 1.0);
    var v2=VSumScaled(p1, dvp1, -1.0);
    var v3=VSumScaled(p0, dvp0, -1.0);

    

    g.vertices.push(v0);    //add the points to the geometry
    g.vertices.push(v1);
    g.vertices.push(v2);
    g.vertices.push(v3);

  

    addQuad(g, 0,1,2,3);    //add quads connecting the points to form the 6 sides of the box
    

    g.computeFaceNormals();         //recompute normals for lighting calculations
    g.computeVertexNormals();

    g.verticesNeedUpdate = true;    //designate to THREE.js that it needs to upload the geometry to the graphics card memory next time it renders
    g.normalsNeedUpdate = true;
  
    g.computeBoundingSphere();      //recompute the bounding sphere of the geometry [usefull later for collision detection etc...]

    //create a mesh object with the new geometry and add to the scene
    var gm = new THREE.Mesh( g, sectionMaterial );
    gm.castShadow = true;
    gm.receiveShadow = true;

    scene.add( gm );

    return gm;
}

function onDocumentMouseMove( event ) {
    //prevent default mouse interactions from the web browser
    event.preventDefault();


    //get the normalized screen coordinates of the mouse location [-1,-1] to [1,1]
    mouse.x = ( (event.x - $(div3d).offset().left)/ width3d ) * 2 - 1;
    console.log(event);
    mouse.y = - ( (event.y - $(div3d).offset().top) / height3d ) * 2 + 1;

    //form a vector from the screen coordinates and transform it to find the mouse position in the actual XYZ space
    var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
    projector.unprojectVector( vector, camera );

    //create a ray from the viewer eye to the mouse
    var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

    //intersect the ray with the drawing plane
    var intersects = raycaster.intersectObject( planeXY );
    if ( intersects.length > 0 ) {
            //if an intersection was found set the mouse3d location to that point 
            mouse3d=intersects[ 0 ].point;
            cube.position.copy( mouse3d );
    }

}

//on mouse down just add a new SPoint at the mouse location [calculated each time the mouse moves]
function onDocumentMouseDown( event ) {
    if (event.button==0) {
        var np=new SPoint(mouse3d);
    }
}

function onDocumentMouseUp( event ) {
 
}

//points repository
var points=[];

function SPoint(_p){
    this.p=new THREE.Vector3(_p.x, _p.y, _p.z);
    this.t=new Date();

    points.push(this);

    //if this point is added when there is at least one more point in the list
    //then a new segment mesh is created between this point and its previous neighbour
    //each points holds the segment tat connects it to its predecessor in the this.mesh variable
    //this is usefull so that later if you move points you can find out 
    //which meshes to update
    this.mesh=null;
    this.mesh2 = null;
    if (points.length>=2) {
        this.mesh2=addCircle(points[points.length-2].p, points[points.length-1].p);
        this.mesh=addSegment(points[points.length-2].p, points[points.length-1].p, thickness1, thickness1);
        
    }

}