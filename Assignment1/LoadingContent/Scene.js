// key code for interaction
var KEY_CODE_S = 83;
var KEY_CODE_F = 70;
var KEY_CODE_B = 66;
var KEY_CODE_LEFT_ARROW = 37;
var KEY_CODE_UP_ARROW = 38;
var KEY_CODE_RIGHT_ARROW = 39;
var KEY_CODE_DOWN_ARROW = 40;

var radius = 10;
var height = 80;
var faces = 600;

var incline = 0;
var inclineDelta = Math.PI/72;
var heading = Math.PI / 2;      // heading with respect to +ve x axis
var headingDelta = Math.PI/72;  // 2.5 degrees
var transX = Math.cos(heading); // movement in the x-axis
var transY = Math.sin(heading); // movement in the y-axis
var transYIncline = Math.cos(incline);  // movement in the y-axis when inclining
var transZ = Math.sin(incline); // movement in the z-axis when inclining
var start = false;
var speed = 1;

var planeAngleTransform;

// init method
function init() {
    var canvas = document.getElementById("canvas");
    canvas.addEventListener("keydown", keyPressed);
    canvas.focus();
    enablePicking();
}

// main method that renders content on the page
function createScene() {
    var length = 1000, width = 80;
    var root = new osg.Node();

    // runway and lights on the runaway (enabled and disabled using picking)
    var road = runway(length + 10, width);
    var runwayLights = new osg.MatrixTransform();
    for ( var i = -(length/2); i<(length/2) + 1 ; i+=100 ){
        var rightlight = runwaylights((width+1),i,0.6,1,0,0);
        runwayLights.addChild(rightlight);

        var leftlight = runwaylights(-(width+1),i,0.6,1,0,0);
        runwayLights.addChild(leftlight);

        var centerlight = runwaylights(0,i,0.6,1,191/255,0);
        runwayLights.addChild(centerlight);
    }
    // switch node to turn on and off the runway lights upon picking
    var switchNode = new ee497.Switch();
    switchNode.addChild(runwayLights, false);

    // sunlight
    var sunlight = createDirectionalLight(0, 0, 1, 250 / 255, 250 / 255, 210 / 255);

    // plane
    var plane = createPlane();

    planeAngleTransform = new osg.MatrixTransform();
    planeAngleTransform.addChild(plane);

    var planeMatrix = new osg.Matrix.create();
    osg.Matrix.makeTranslate(0, 0, 10, planeMatrix);

    var planeTransform = new osg.MatrixTransform();
    planeTransform.setMatrix(planeMatrix);
    planeTransform.addChild(planeAngleTransform);
    var planeupdatecallback = new PlaneUpdateCallback();
    planeTransform.addUpdateCallback(planeupdatecallback);


    // moon
    var moonMaterial = new osg.Material();
    moonMaterial.setEmission([1, 1, 1, 1]);
    var moon = osg.createTexturedSphereGeometry(30, 40, 40);
    moon.getOrCreateStateSet().setAttributeAndMode(moonMaterial);
    moon.getOrCreateStateSet().setTextureAttributeAndModes(0, osg.Texture.createFromURL('res/textures/moon.jpeg'));
    var moonlight = createPointLight(1, 1, 1);
    var moonTransform = new osg.MatrixTransform();
    moonTransform.addChild(moon);
    moonTransform.addChild(moonlight);
    var simpleupdatecallback = new SimpleUpdateCallback();
    moonTransform.addUpdateCallback(simpleupdatecallback);

    // city base
    var concreteBase = osg.createTexturedBoxGeometry(width+407, -5, 0, 805, 1010,1);
    concreteBase.getOrCreateStateSet().setTextureAttributeAndModes(0, osg.Texture.createFromURL("res/textures/concrete.jpeg"));

    // city buildings
    var buildingMaterial = new osg.Material();
    buildingMaterial.setDiffuse([105/255, 105/255, 105/255, 1.0]);
    buildingMaterial.setShininess(100);
    buildingMaterial.setSpecular([1.0, 1.0, 1.0, 1.0]);
    buildingMaterial.setAmbient([220/225, 220/255, 220/255, 1.0]);
    var buildingHeight = 500;
    var buildingWidth = 50;
    var buildingDepth = 50;
    for (var x = -350; x < 400; x += 100){
        for (var y = -400; y < 500; y += 100) {
            var translateMatrix = new osg.Matrix.create();
            translateMatrix = osg.Matrix.makeTranslate(6*(width+2), 0, 5, translateMatrix);
            var translateMatrixTransform = new osg.MatrixTransform();
            translateMatrixTransform.setMatrix(translateMatrix);
            root.addChild(translateMatrixTransform);

            var building = osg.createTexturedBoxGeometry(x, y, buildingHeight/2 - 5, buildingWidth, buildingDepth, buildingHeight);
            building.getOrCreateStateSet().setTextureAttributeAndModes(0, osg.Texture.createFromURL("res/textures/building.jpg"));
            building.getOrCreateStateSet().setAttributeAndMode(buildingMaterial);
            translateMatrixTransform.addChild(building);
        }
    }

    // onpick runway lights turn on and off
    var lights = osg.createTexturedBoxGeometry(0,-length/2 - 50,0,50,50,50);
    lights.lightState = false;
    lights.onpick = function () {
        lights.lightState = !lights.lightState;
        console.log(lights.lightState);
        if(lights.lightState == true) {
            switchNode.setChildValue(runwayLights, true);
        }
        else if(lights.lightState == false){
            switchNode.setChildValue(runwayLights, false);
        }
    };

    // ocean base
    var ocean = osg.createTexturedBoxGeometry(-width-407, 5, 0, 805, 1010,1);
    var videoElement = document.createElement("video");
    videoElement.preload = 'auto';
    videoElement.loop = true;
    videoElement.crossOrigin = 'anonymous';
    videoElement.src = 'res/textures/Ocean.mp4';
    videoElement.volume = 0;

    var image = new osg.ImageStream( videoElement );
    image.whenReady().then( function ( imageStream ) {
        var texture = new osg.Texture();
        texture.setImage(image);

        ocean.getOrCreateStateSet().setTextureAttributeAndModes(0, texture);

        imageStream.play();
    });

    // borders
    var oceanBorder = osg.createTexturedBoxGeometry(-(width + 3), -5, 0, 3, length,1);
    oceanBorder.getOrCreateStateSet().setTextureAttributeAndModes(0, osg.Texture.createFromURL('res/textures/yellowroadpaint.jpg'));
    var cityBorder = osg.createTexturedBoxGeometry((width + 3), -5, 0, 3, length,1);
    cityBorder.getOrCreateStateSet().setTextureAttributeAndModes(0, osg.Texture.createFromURL('res/textures/yellowroadpaint.jpg'));

    // add everything to root to be rendered on the screen
    root.addChild(planeTransform);
    root.addChild(road);
    root.addChild(sunlight);
    root.addChild(moonTransform);
    root.addChild(concreteBase);
    root.addChild(ocean);
    root.addChild(oceanBorder);
    root.addChild(cityBorder);
    root.addChild(switchNode);
    root.addChild(lights);
    return root;
}

// key event to manipulate plane movement direction (interaction)
function keyPressed(event) {

    var keyCode = event.keyCode;
    var headingMatrix = new osg.Matrix.create();
    var inclineMatrix = new osg.Matrix.create();

    if(keyCode == KEY_CODE_UP_ARROW) {
        incline += inclineDelta;
        transYIncline = Math.cos(incline);
        transZ = Math.sin(incline);
    }
    else if(keyCode == KEY_CODE_DOWN_ARROW) {
        incline -= inclineDelta;
        transYIncline = Math.cos(incline);
        transZ = Math.sin(incline);
    }
    else if(keyCode == KEY_CODE_LEFT_ARROW) {
        heading += headingDelta;
        transX = Math.cos(heading);
        transY = Math.sin(heading);
    }
    else if(keyCode == KEY_CODE_RIGHT_ARROW) {
        heading -= headingDelta;
        transX = Math.cos(heading);
        transY = Math.sin(heading);
    }
    else if(keyCode == KEY_CODE_S){
        start = !start;
    }
    else if(keyCode == KEY_CODE_F){
        speed += 0.1;
    }
    else if(keyCode == KEY_CODE_B){
        speed -= 0.1;
    }

    // rotate plane in the direction of movement
    osg.Matrix.makeRotate(heading + Math.PI/2, 0,0,1,headingMatrix);
    osg.Matrix.makeRotate(-incline, 1,0,0,inclineMatrix);
    osg.Matrix.preMult(headingMatrix, inclineMatrix);
    planeAngleTransform.setMatrix(headingMatrix);
}

// update callback for the moon
var SimpleUpdateCallback = function() {};

SimpleUpdateCallback.prototype = {
    // rotation angle
    angle: 0,

    update: function(node, nodeVisitor) {

        // rotation
        var matrix = node.getMatrix();
        osg.Matrix.makeTranslate( 2000*Math.cos(this.angle), 0.0, 2000*Math.sin(this.angle), matrix);

        this.angle += 0.001;

        return true;
    }
};

// update callback for the plane (action)
var PlaneUpdateCallback = function() {};

PlaneUpdateCallback.prototype = {
    // rotation angle
    distance: 0,

    update: function(node, nodeVisitor) {
        var currentTime = nodeVisitor.getFrameStamp().getSimulationTime();
        var dt = currentTime - node._lastUpdate;
        if (dt < 0) {
            return true;
        }
        node._lastUpdate = currentTime;

        if(start){
            var matrix = node.getMatrix();

            var currentLocation = osg.Vec3.createAndSet(matrix[12], matrix[13], matrix[14]);
            var targetLocation = osg.Vec3.createAndSet(speed*transX, speed*transY, speed*transZ);
            var newLocation = osg.Vec3.create();
            osg.Vec3.add(currentLocation, targetLocation, newLocation);

            matrix[12] = newLocation[0];
            matrix[13] = newLocation[1];
            matrix[14] = newLocation[2];

            node.setMatrix(matrix);
        }
        return true;
    }
};

// function to create plane (custom geometry)
function createPlane() {
    var material = new osg.Material();
    material.setDiffuse([1.0, 1.0, 1.0, 1.0]);
    material.setShininess(50);
    material.setSpecular([1.0, 1.0, 1.0, 1.0]);
    material.setAmbient([220/225, 220/255, 220/255, 1.0]);

    var body = createCylinderBody();
    body.getOrCreateStateSet().setAttributeAndMode(material);
    body.getOrCreateStateSet().setTextureAttributeAndModes(0, osg.Texture.createFromURL( 'res/textures/ryanair.png' ) );
    var front = osg.createTexturedSphereGeometry(10,20,20);
    front.getOrCreateStateSet().setAttributeAndMode(material);
    var back = osg.createTexturedSphereGeometry(10,40,40);
    back.getOrCreateStateSet().setAttributeAndMode(material);
    var wings = createWings();
    wings.getOrCreateStateSet().setAttributeAndMode(material);
    var tailfin = createTailFin();
    tailfin.getOrCreateStateSet().setAttributeAndMode(material);
    tailfin.getOrCreateStateSet().setTextureAttributeAndModes(0, osg.Texture.createFromURL( 'res/textures/ryanair_logo.jpg' ) );
    var tailwing = createWings();
    tailwing.getOrCreateStateSet().setAttributeAndMode(material);
    var finbeacon = createBeacon(-0.5,50,radius+10.5, 0,0,1, 1,0,0, 90);
    var leftbeacon = createBeacon(50,0,1,1,0,0,1,0,0,90);
    var rightbeacon = createBeacon(-50,0,1,-1,0,0,0,1,0,90);
    var frontleftlight = createBeacon(20,-30,1,0,-1,0,1,1,1,30);
    var frontrightlight = createBeacon(-20,-30,1,0,-1,0,1,1,1,30);

    // position the body of the plane in the scene
    var bodyMatrix = new osg.Matrix.create();
    osg.Matrix.makeRotate(Math.PI/2, 0, 0, 1, bodyMatrix);
    var textureupMatrix = new osg.Matrix.create();
    osg.Matrix.makeRotate(Math.PI, 0, 1, 0, textureupMatrix);
    osg.Matrix.preMult(bodyMatrix, textureupMatrix);
    var bodyTransform = new osg.MatrixTransform();
    bodyTransform.setMatrix(bodyMatrix);
    bodyTransform.addChild(body);

    // position the front wing of the plane on the scene so it is connected to the body of the plane
    var wingMatrix = new osg.Matrix.create();
    osg.Matrix.makeRotate(Math.PI/4, 0, 0, 1, wingMatrix);
    var translateMatrix = new osg.Matrix.create();
    osg.Matrix.makeTranslate(-5,-15,0, translateMatrix);
    osg.Matrix.preMult(wingMatrix,translateMatrix);
    var wingTransform = new osg.MatrixTransform();
    wingTransform.setMatrix(wingMatrix);
    wingTransform.addChild(wings);

    // position the tail fin on the plane
    var tailMatrix = new osg.Matrix.create();
    osg.Matrix.makeTranslate(2,36,radius, tailMatrix);
    var tailSize = new osg.Matrix.create();
    osg.Matrix.makeScale(5,5,5, tailSize);
    osg.Matrix.preMult(tailMatrix, tailSize);
    var tailRot = new osg.Matrix.create();
    osg.Matrix.makeRotate(Math.PI/2,0,0,1, tailRot);
    osg.Matrix.preMult(tailMatrix, tailRot);
    var tailTransform = new osg.MatrixTransform();
    tailTransform.setMatrix(tailMatrix);
    tailTransform.addChild(tailfin);

    // position the tail wing of the plane in the right place
    var tailWingMatrix = new osg.Matrix.create();
    osg.Matrix.makeScale(0.5,0.5,0.5,tailWingMatrix);
    var tailWingRotate = new osg.Matrix.create();
    osg.Matrix.makeRotate(Math.PI/4, 0, 0, 1, tailWingRotate);
    osg.Matrix.preMult(tailWingMatrix,tailWingRotate);
    var tailWingTranslate = new osg.Matrix.create();
    osg.Matrix.makeTranslate(65,55,0, tailWingTranslate );
    osg.Matrix.preMult(tailWingMatrix,tailWingTranslate);
    var tailWingTransform = new osg.MatrixTransform();
    tailWingTransform.setMatrix(tailWingMatrix);
    tailWingTransform.addChild(tailwing);

    // cockpit of the plane
    var frontTranslate = new osg.Matrix.create();
    osg.Matrix.makeTranslate(0,-40,0,frontTranslate);
    var frontTransform = new osg.MatrixTransform();
    frontTransform.setMatrix(frontTranslate);
    frontTransform.addChild(front);

    // tail base of the plane
    var backTranslate = new osg.Matrix.create();
    osg.Matrix.makeTranslate(0,40,0,backTranslate);
    var backTransform = new osg.MatrixTransform();
    backTransform.setMatrix(backTranslate);
    backTransform.addChild(back);

    // combine all parts of the plane
    var root = new osg.MatrixTransform();
    root.addChild(bodyTransform);
    root.addChild(wingTransform);
    root.addChild(tailTransform);
    root.addChild(tailWingTransform);
    root.addChild(frontTransform);
    root.addChild(backTransform);
    root.addChild(finbeacon);
    root.addChild(leftbeacon);
    root.addChild(rightbeacon);
    root.addChild(frontleftlight);
    root.addChild(frontrightlight);

    return root;
}

// function to make tail fin (custom geometry)
function createTailFin() {

    var depth = 1;

    // vertex definition
    var vertexAttribArray = new osg.BufferArray(osg.BufferArray.ARRAY_BUFFER, null , 3);
    vertexAttribArray.setElements(new Float32Array(
        [  -1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            0.7, 0.0, 1.0,
            2.0, 0.0, 1.0,
            2.5, 0.0, 2.0,
            3.0, 0.0, 2.0
        ]));

    var vertexAttribArrayBehind = new osg.BufferArray(osg.BufferArray.ARRAY_BUFFER, null , 3);
    vertexAttribArrayBehind.setElements(new Float32Array(
        [
            1.0, depth, 0.0,
            -1.0, depth, 0.0,
            2.0, depth, 1.0,
            0.7, depth, 1.0,
            3.0, depth, 2.0,
            2.5, depth, 2.0
        ]));

    var vertexAttribArrayDepth = new osg.BufferArray(osg.BufferArray.ARRAY_BUFFER, null , 3);
    vertexAttribArrayDepth.setElements(new Float32Array(
        [
            1.0, 0.0, 0.0,      // 0
            1.0, depth, 0.0,    // 1
            -1.0, 0.0, 0.0,     // 2
            -1.0, depth, 0.0,   // 3

            3.0, 0.0, 2.0,      // 4
            3.0, depth, 2.0,    // 5

            2.5, 0.0, 2.0,      // 6
            2.5, depth, 2.0    // 7
        ]));

    var indices = new osg.BufferArray(osg.BufferArray.ELEMENT_ARRAY_BUFFER, null, 1 );
    indices.setElements(new Uint16Array(
        [
            2, 3, 0,
            0, 3, 1,

            1, 5, 0,
            0, 5, 4,

            5, 7, 4,
            4, 7, 6,

            2, 6, 3,
            3, 6, 7
        ]));

    // normals definition for the shape (front, back and depth)
    var normalsGeometry = new osg.BufferArray(osg.BufferArray.ARRAY_BUFFER, null , 3);
    normalsGeometry.setElements(new Float32Array(
        [
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0
        ]));

    var normalsGeometryBehind = new osg.BufferArray(osg.BufferArray.ARRAY_BUFFER, null , 3);
    normalsGeometryBehind.setElements(new Float32Array(
        [   0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0
        ]));

    var normalsGeometryDepth = new osg.BufferArray(osg.BufferArray.ARRAY_BUFFER, null , 3);
    normalsGeometryDepth.setElements(new Float32Array(
        [   1, 0, 0,
            1, 0, 0,
            0, 0, 1,
            0, 0, 1,
            Math.cos(Math.PI/4), 0 , Math.cos(Math.PI/4),
            Math.cos(Math.PI/4), 0 , Math.cos(Math.PI/4),
            -Math.cos(1.0516), 0 , Math.cos(1.0516),
            -Math.cos(1.0516), 0 , Math.cos(1.0516)
        ]));

    var colorGeometryDepth = new osg.BufferArray(osg.BufferArray.ARRAY_BUFFER, null , 4);
    colorGeometryDepth.setElements(new Float32Array(
        [   17/255, 76/255, 180/255, 1,
            17/255, 76/255, 180/255, 1,
            17/255, 76/255, 180/255, 1,
            17/255, 76/255, 180/255, 1,
            17/255, 76/255, 180/255, 1,
            17/255, 76/255, 180/255, 1,
            17/255, 76/255, 180/255, 1,
            17/255, 76/255, 180/255, 1
        ]));

    // texture coordinates for the shape so as to let it know how to map a texture (image) onto the shape
    var texGeometry = new osg.BufferArray(osg.BufferArray.ARRAY_BUFFER, null , 2);
    texGeometry.setElements(new Float32Array(
        [
            0, 0,
            0.7, 0,
            0.1, 0.6,
            0.8, 0.6,
            0.8, 1,
            1, 1
        ]));


    // front view of the shape: triangle strip to save memory (efficient)
    var geometry = new osg.Geometry();
    geometry.setVertexAttribArray('Vertex', vertexAttribArray);
    geometry.setVertexAttribArray('Normal', normalsGeometry);
    geometry.setVertexAttribArray('TexCoord0', texGeometry);
    geometry.getPrimitives().push(new osg.DrawArrays(osg.PrimitiveSet.TRIANGLE_STRIP, 0, 6));

    // rear view of the shape: : triangle strip to save memory (efficient)
    var geometryBehind = new osg.Geometry();
    geometryBehind.setVertexAttribArray('Vertex', vertexAttribArrayBehind);
    geometryBehind.setVertexAttribArray('Normal', normalsGeometryBehind);
    geometryBehind.getPrimitives().push(new osg.DrawArrays(osg.PrimitiveSet.TRIANGLE_STRIP, 0, 6));

    // depth view of the shape
    var geometryDepth = new osg.Geometry();
    geometryDepth.setVertexAttribArray('Vertex', vertexAttribArrayDepth);
    geometryDepth.setVertexAttribArray('Normal', normalsGeometryDepth);
    geometryDepth.setVertexAttribArray('Color', colorGeometryDepth);
    geometryDepth.getPrimitives().push(new osg.DrawElements(osg.PrimitiveSet.TRIANGLES, indices));

    // combine all views of the shape (creation of a group node)
    var tailTransform = new osg.MatrixTransform();
    tailTransform.addChild(geometry);
    tailTransform.addChild(geometryBehind);
    tailTransform.addChild(geometryDepth);
    return tailTransform;
}

// function to construct the wings of the plane (custom geometry)
function createWings() {
    var depth = 2;

    // vertex definition
    var vertexAttribArray = new osg.BufferArray(osg.BufferArray.ARRAY_BUFFER, null , 3);
    vertexAttribArray.setElements(new Float32Array(
        [   -1.0, 0.0, 0.0,
            5, 0.0, 0.0,
            4, 0.0, 2,
            -3.0, 0.0, 2.0,
            -3.0, 0.0, -5.0,
            -1.0, 0.0, -6.0]));

    var vertexAttribArrayBehind = new osg.BufferArray(osg.BufferArray.ARRAY_BUFFER, null , 3);
    vertexAttribArrayBehind.setElements(new Float32Array(
        [  -1.0, depth, 0.0,
            -1.0, depth, -6.0,
            -3.0, depth, -5.0,
            -3.0, depth, 2.0,
            4.0, depth, 2.0,
            5.0, depth, 0.0]));

    var vertexAttribArrayDepth = new osg.BufferArray(osg.BufferArray.ARRAY_BUFFER, null , 3);
    vertexAttribArrayDepth.setElements(new Float32Array(
        [
            4,0,2,  // 0
            4,depth,2, // 1
            5,0,0,  // 2
            5,depth,0, // 3

            -1,0,0, // 4
            -1,depth,0, // 5

            -3,0,2, // 6
            -3,depth,2, // 7

            -3,0,-5, // 8
            -3,depth,-5, // 9

            -1,0,-6, // 10
            -1,depth,-6 // 11
        ]));

    var indices = new osg.BufferArray(osg.BufferArray.ELEMENT_ARRAY_BUFFER, null, 1 );
    indices.setElements(new Uint16Array(
        [
            1,0,3,
            3,0,2,

            5,3,2,
            5,2,4,

            1,6,0,
            1,7,6,

            7,9,8,
            7,8,6,

            9,11,10,
            9,10,8,

            11,5,4,
            11,4,10
        ]));

    // normals definition for the shape (front, back and depth)
    var normalsGeometry = new osg.BufferArray(osg.BufferArray.ARRAY_BUFFER, null , 3);
    normalsGeometry.setElements(new Float32Array(
        [   0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0
        ]));

    var normalsGeometryBehind = new osg.BufferArray(osg.BufferArray.ARRAY_BUFFER, null , 3);
    normalsGeometryBehind.setElements(new Float32Array(
        [   0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0
        ]));

    var normalsGeometryDepth = new osg.BufferArray(osg.BufferArray.ARRAY_BUFFER, null , 3);
    normalsGeometryDepth.setElements(new Float32Array(
        [   1, 0, 0,
            1, 0, 0,
            Math.cos(Math.PI/4), 0 , Math.cos(Math.PI/4),
            Math.cos(Math.PI/4), 0 , Math.cos(Math.PI/4),
            Math.cos(Math.PI/4), 0 , -Math.cos(Math.PI/4),
            Math.cos(Math.PI/4), 0 , -Math.cos(Math.PI/4),
            -Math.cos(Math.PI/4), 0 , Math.cos(Math.PI/4),
            -Math.cos(Math.PI/4), 0 , Math.cos(Math.PI/4),
            -Math.cos(Math.PI/4), 0 , -Math.cos(Math.PI/4),
            -Math.cos(Math.PI/4), 0 , -Math.cos(Math.PI/4),
            0,0,-1,
            0,0,-1
        ]));

    // front view of the shape
    var geometry = new osg.Geometry();
    geometry.setVertexAttribArray('Vertex', vertexAttribArray);
    geometry.setVertexAttribArray('Normal', normalsGeometry);
    geometry.getPrimitives().push(new osg.DrawArrays(osg.PrimitiveSet.TRIANGLE_FAN, 0, 6));

    // rear view of the shape
    var geometryBehind = new osg.Geometry();
    geometryBehind.setVertexAttribArray('Vertex', vertexAttribArrayBehind);
    geometryBehind.setVertexAttribArray('Normal', normalsGeometryBehind);
    geometryBehind.getPrimitives().push(new osg.DrawArrays(osg.PrimitiveSet.TRIANGLE_FAN, 0, 6));

    // depth view of the shape
    var geometryDepth = new osg.Geometry();
    geometryDepth.setVertexAttribArray('Vertex', vertexAttribArrayDepth);
    geometryDepth.setVertexAttribArray('Normal', normalsGeometryDepth);
    geometryDepth.getPrimitives().push(new osg.DrawElements(osg.PrimitiveSet.TRIANGLES, indices));

    // combine all views of the shape (creation of a group node)
    var transform = new osg.MatrixTransform();
    transform.addChild(geometry);
    transform.addChild(geometryBehind);
    transform.addChild(geometryDepth);

    // rotate and scale matrices for the wing so as to align it with the body of the plane
    var transformMatrix = new osg.Matrix.create();
    osg.Matrix.makeRotate(Math.PI/2,1,0,0,transformMatrix);
    var scaleMatrix = new osg.Matrix.create();
    osg.Matrix.makeScale(10,1,10, scaleMatrix);
    osg.Matrix.preMult(transformMatrix,scaleMatrix);
    transform.setMatrix(transformMatrix);

    return transform;
}

// function to construct the body of the plane
function createCylinderBody() {

    // Define the attributes for the cylinder
    var angle = 0.0;
    var angleIncrement = (2*Math.PI)/faces;
    var s0 = 0;

    // create an empty array of floats to hold the coordinates (texture, normal and vertex)
    var coordinates = new Array();
    var normals = new Array();
    var texCoords = new Array();
    var z = height/2.0;

    // for loop to construct the cylinder shape
    for(var f=0; f<faces; f++)
    {
        // Generate the four coordinates required for each face as well as the normals for each of the vertex coordinates
        var x0 = radius*Math.cos(angle);
        var y0 = radius*Math.sin(angle);
        var nx0 = Math.cos(angle);
        var ny0 = Math.sin(angle);
        var s1 = angle / (2*Math.PI);
        angle += angleIncrement;
        var x1 = radius*Math.cos(angle);
        var y1 = radius*Math.sin(angle);
        var nx1 = Math.cos(angle);
        var ny1 = Math.sin(angle);

        // vertex coordinates
        coordinates.push(z, 0, 0);
        coordinates.push(z, y1, x1);
        coordinates.push(z, y0, x0);

        coordinates.push(-z, y0, x0);
        coordinates.push(z, y0, x0);
        coordinates.push(z, y1, x1);

        coordinates.push(-z, y0, x0);
        coordinates.push(z, y1, x1);
        coordinates.push(-z, y1, x1);

        coordinates.push(-z, 0, 0);
        coordinates.push(-z, y0, x0);
        coordinates.push(-z, y1, x1);


        // normals coordinates
        normals.push(1, 0, 0);
        normals.push(1, 0, 0);
        normals.push(1, 0, 0);

        normals.push(0, ny0, nx0);
        normals.push(0, ny1, nx1);
        normals.push(0, ny0, nx0);

        normals.push(0, ny0, nx0);
        normals.push(0, ny1, nx1);
        normals.push(0, ny1, nx1);

        normals.push(-1, 0, 0);
        normals.push(-1, 0, 0);
        normals.push(-1, 0, 0);

        // texture coordinates

        texCoords.push(0, 0);
        texCoords.push(0, 0);
        texCoords.push(0, 0);

        texCoords.push(1-s0, 0.0);
        texCoords.push(1-s0, 1.0);
        texCoords.push(1-s1, 1.0);

        texCoords.push(1-s0, 0.0);
        texCoords.push(1-s1, 1.0);
        texCoords.push(1-s1, 0.0);

        texCoords.push(0, 0);
        texCoords.push(0, 0);
        texCoords.push(0, 0);

        s0 = s1;
    }

    // combine coordinates together (vertex, texture and normals)
    var geometry = new osg.Geometry();

    var vertexCoordAttribArray = new osg.BufferArray(osg.BufferArray.ARRAY_BUFFER, null , 3);
    vertexCoordAttribArray.setElements(new Float32Array(coordinates));
    geometry.setVertexAttribArray('Vertex', vertexCoordAttribArray);

    var textureAttribArray = new osg.BufferArray(osg.BufferArray.ARRAY_BUFFER, null, 2);
    textureAttribArray.setElements(new Float32Array(texCoords));
    geometry.setVertexAttribArray('TexCoord0', textureAttribArray);

    var normalAttribArray = new osg.BufferArray(osg.BufferArray.ARRAY_BUFFER, null, 3);
    normalAttribArray.setElements(new Float32Array(normals ));
    geometry.setVertexAttribArray('Normal', normalAttribArray);

    geometry.getPrimitives().push(new osg.DrawArrays(osg.PrimitiveSet.TRIANGLES, 0, 6*faces+3*faces+3*faces));

    return geometry;

}

/* function to add spot light to the scene where
    x, y, z: direction the light is shining towards
    r, g, b: color of the light
    c, l, q: attenuation
    cutoff: cutoff angle for the light to shine in from the center
    blend: level of degradation of the light
 */

function createSpotLight(x, y, z, r, g, b, c, l, q, cutoff, blend) {
    var lightNumber = getNextLightNumber();
    var spotLight = new osg.Light(lightNumber);

    spotLight.setPosition([0, 0, 0, 1]);

    if(typeof x === 'undefined') x = 0.0;
    if(typeof y === 'undefined') y = 1.0;
    if(typeof z === 'undefined') z = 0.0;
    spotLight.setDirection([x, y, z]);

    if(typeof r === 'undefined') r = 0.8;
    if(typeof g === 'undefined') g = 0.8;
    if(typeof b === 'undefined') b = 0.8;
    spotLight.setDiffuse([r, g, b, 1.0]);
    spotLight.setSpecular([r, g, b, 1.0]);
    spotLight.setAmbient([0.0, 0.0, 0.0, 1.0]);

    if(typeof c === 'undefined') c = 1.0;
    if(typeof l === 'undefined') l = 0.0;
    if(typeof q === 'undefined') q = 0.0;
    spotLight.setConstantAttenuation(c);
    spotLight.setLinearAttenuation(l);
    spotLight.setQuadraticAttenuation(q);

    if(typeof cutoff === 'undefined') cutoff = 25.0;
    spotLight.setSpotCutoff(cutoff);

    if(typeof blend === 'undefined') blend = 1.0;
    spotLight.setSpotBlend(blend);

    var lightSource = new osg.LightSource();
    lightSource.setLight(spotLight);
    return lightSource;
}

/* function to create beacon spotlights on the plane
    x, y, z: location of the group (beacon and the spot light) in the scen
    lightx, lighty, lightz: direction the light is shining towards
    r, g, b: color of the light
    cutoff: cutoff angle for the light to shine in from the center
 */
function createBeacon(x, y, z, lightx, lighty, lightz, r, g, b, cutoff) {
    // emissive material to emit the same light as the light inside the sphere
    var beaconMaterial = new osg.Material();
    beaconMaterial.setEmission([r, g, b, 1.0]);

    // sphere beacon
    var beacon = osg.createTexturedSphereGeometry(1, 40, 40);
    beacon.getOrCreateStateSet().setAttributeAndMode(beaconMaterial);

    // group the beacon sphere geometry and the light that emanates from it
    var beaconlight = createSpotLight(lightx,lighty,lightz,r,g,b,1,0,0,cutoff);
    var beaconMatrix = new osg.Matrix.create();
    osg.Matrix.makeTranslate(x,y,z,beaconMatrix);
    var beaconTransform = new osg.MatrixTransform();
    beaconTransform.setMatrix(beaconMatrix);
    beaconTransform.addChild(beacon);
    beaconTransform.addChild(beaconlight);

    return beaconTransform;
}

/*  function to stud the runway with lights
    x, y, z: location of the light sphere
    r, g, b: color of the light
 */
function runwaylights(x,y,z,r,g,b){
    // emissive material
    var emissiveMaterial = new osg.Material();
    emissiveMaterial.setEmission([r, g, b, 1.0]);
    emissiveMaterial.setDiffuse([r,g,b,1]);
    emissiveMaterial.setSpecular([1,1,1,1]);

    // creation of point light
    var light = createPointLight(r, g, b);

    // housing for the runway light
    var bulb = osg.createTexturedSphere(5, 20, 20);
    bulb.getOrCreateStateSet().setAttributeAndModes(emissiveMaterial);

    // grouping the point light and its shell on the runway
    var bulbMatrix = new osg.Matrix.create();
    osg.Matrix.makeTranslate(x, y, z, bulbMatrix);
    var bulbMatrixTransform = new osg.MatrixTransform();
    bulbMatrixTransform.setMatrix(bulbMatrix);
    bulbMatrixTransform.addChild(light);
    bulbMatrixTransform.addChild(bulb);

    return bulbMatrixTransform;
}

/*  function to construct the runway for the plane
    length: length in the y direction
    width: width in the x direction
  */
function runway(length, width) {
    var material = new osg.Material();
    material.setShininess(100);

    var roadmarking = osg.createTexturedBoxGeometry(0,0,0,1,length,1);
    roadmarking.getOrCreateStateSet().setTextureAttributeAndModes(0, osg.Texture.createFromURL( 'res/textures/whiteroadpaint.jpg' ) );
    roadmarking.getOrCreateStateSet().setAttributeAndModes(material);

    var rightHalf = osg.createTexturedBoxGeometry((width+1)/2,0,0,width,length,1);
    rightHalf.getOrCreateStateSet().setTextureAttributeAndModes(0, osg.Texture.createFromURL( 'res/textures/road.jpeg' ) );
    rightHalf.getOrCreateStateSet().setAttributeAndModes(material);

    var leftHalf = osg.createTexturedBoxGeometry(-(width+1)/2,0,0,width,length,1);
    leftHalf.getOrCreateStateSet().setTextureAttributeAndModes(0, osg.Texture.createFromURL( 'res/textures/road.jpeg' ) );
    leftHalf.getOrCreateStateSet().setAttributeAndModes(material);

    var leftRoadmarking = osg.createTexturedBoxGeometry(-(width+1),0,0,1,length,1);
    leftRoadmarking.getOrCreateStateSet().setTextureAttributeAndModes(0, osg.Texture.createFromURL( 'res/textures/whiteroadpaint.jpg' ) );
    leftRoadmarking.getOrCreateStateSet().setAttributeAndModes(material);

    var rightRoadmarking = osg.createTexturedBoxGeometry((width+1),0,0,1,length,1);
    rightRoadmarking.getOrCreateStateSet().setTextureAttributeAndModes(0, osg.Texture.createFromURL( 'res/textures/whiteroadpaint.jpg' ) );
    rightRoadmarking.getOrCreateStateSet().setAttributeAndModes(material);

    // grouping all aspects of a runway
    var runway = new osg.MatrixTransform();
    runway.addChild(roadmarking);
    runway.addChild(rightHalf);
    runway.addChild(leftHalf);
    runway.addChild(leftRoadmarking);
    runway.addChild(rightRoadmarking);
    return runway;
}

// function to designate a number to all the lights in the scene
var nextLightNumber = 1;
function getNextLightNumber() {
    return nextLightNumber++;
}

/*  function to create point light in the scene
    r, g, b: color of the light
    c, l, q: attenuation of the light
 */
function createPointLight(r, g, b, c, l, q) {

    var lightNumber = getNextLightNumber();
    var pointLight = new osg.Light(lightNumber);
    pointLight.setPosition([0, 0, 0, 1]);

    if(typeof r === 'undefined') r = 0.8;
    if(typeof g === 'undefined') g = 0.8;
    if(typeof b === 'undefined') b = 0.8;
    pointLight.setDiffuse([r, g, b, 1.0]);
    pointLight.setSpecular([r, g, b, 1.0]);
    pointLight.setAmbient([0.0, 0.0, 0.0, 1.0]);

    if(typeof c === 'undefined') c = 1.0;
    if(typeof l === 'undefined') l = 0.0;
    if(typeof q === 'undefined') q = 0.0;
    pointLight.setConstantAttenuation(c);
    pointLight.setLinearAttenuation(l);
    pointLight.setQuadraticAttenuation(q);

    var lightSource = new osg.LightSource();
    lightSource.setLight(pointLight);

    return lightSource;
}

/*  function to create directional light in the scene
    x, y, z: location of the light in the scene
    r, g, b: color of the light
 */
function createDirectionalLight(x, y, z, r, g, b) {

    var lightNumber = getNextLightNumber();
    var directionalLight = new osg.Light(lightNumber);

    if(typeof x === 'undefined') x = 1.0;
    if(typeof y === 'undefined') y = -1.0;
    if(typeof z === 'undefined') z = 1.0;
    directionalLight.setPosition([x, y, z, 0.0]);

    if(typeof r === 'undefined') r = 0.8;
    if(typeof g === 'undefined') g = 0.8;
    if(typeof b === 'undefined') b = 0.8;
    directionalLight.setDiffuse([r, g, b, 1.0]);
    directionalLight.setSpecular([r, g, b, 1.0]);
    directionalLight.setAmbient([0.0, 0.0, 0.0, 1.0]);

    var lightSource = new osg.LightSource();
    lightSource.setLight(directionalLight);
    return lightSource;
}
