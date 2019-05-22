
var radius = 10;
var height = 80;
var faces = 600;

function createScene() {

    var material = new osg.Material();
    material.setDiffuse([1.0, 1.0, 1.0, 1.0]);

    var body = createCylinderBody();
    body.getOrCreateStateSet().setAttributeAndMode(material);
    body.getOrCreateStateSet().setTextureAttributeAndModes(0, osg.Texture.createFromURL( 'res/textures/ryanair.png' ) );
    var front = osg.createTexturedSphereGeometry(10,10,10);
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
    var finbeacon = createbeacon(-0.5,50,radius+10.5, 0,0,1, 1,0,0, 90);
    var leftbeacon = createbeacon(50,0,1,1,0,0,1,0,0,90);
    var rightbeacon = createbeacon(-50,0,1,-1,0,0,0,1,0,90);
    var frontleftlight = createbeacon(20,-30,1,0,-1,0,1,1,1,30);
    var frontrightlight = createbeacon(-20,-30,1,0,-1,0,1,1,1,30);

    var bodyMatrix = new osg.Matrix.create();
    osg.Matrix.makeRotate(Math.PI/2, 0, 0, 1, bodyMatrix);
    var textureupMatrix = new osg.Matrix.create();
    osg.Matrix.makeRotate(Math.PI, 0, 1, 0, textureupMatrix);
    osg.Matrix.preMult(bodyMatrix, textureupMatrix);
    var bodyTransform = new osg.MatrixTransform();
    bodyTransform.setMatrix(bodyMatrix);
    bodyTransform.addChild(body);

    var wingMatrix = new osg.Matrix.create();
    osg.Matrix.makeRotate(Math.PI/4, 0, 0, 1, wingMatrix);
    var translateMatrix = new osg.Matrix.create();
    osg.Matrix.makeTranslate(-5,-15,0, translateMatrix);
    osg.Matrix.preMult(wingMatrix,translateMatrix);
    var wingTransform = new osg.MatrixTransform();
    wingTransform.setMatrix(wingMatrix);
    wingTransform.addChild(wings);

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

    var frontTranslate = new osg.Matrix.create();
    osg.Matrix.makeTranslate(0,-40,0,frontTranslate);
    var frontTransform = new osg.MatrixTransform();
    frontTransform.setMatrix(frontTranslate);
    frontTransform.addChild(front);

    var backTranslate = new osg.Matrix.create();
    osg.Matrix.makeTranslate(0,40,0,backTranslate);
    var backTransform = new osg.MatrixTransform();
    backTransform.setMatrix(backTranslate);
    backTransform.addChild(back);

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

var nextLightNumber = 0;
function getNextLightNumber() {
    return nextLightNumber++;
}

function createbeacon(x,y,z,lightx,lighty,lightz,r,g,b,cutoff) {
    var beaconMaterial = new osg.Material();
    beaconMaterial.setEmission([r, g, b, 1.0]);

    var beacon = osg.createTexturedSphereGeometry(1, 40, 40);
    beacon.getOrCreateStateSet().setAttributeAndMode(beaconMaterial);

    var beaconlight = createSpotLight(lightx,lighty,lightz,r,g,b,1,0,0,cutoff);
    var beaconMatrix = new osg.Matrix.create();
    osg.Matrix.makeTranslate(x,y,z,beaconMatrix);
    var beaconTransform = new osg.MatrixTransform();
    beaconTransform.setMatrix(beaconMatrix);
    beaconTransform.addChild(beacon);
    beaconTransform.addChild(beaconlight);

    return beaconTransform;
}

function createTailFin() {

    var depth = 1;

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


    var geometry = new osg.Geometry();
    geometry.setVertexAttribArray('Vertex', vertexAttribArray);
    geometry.setVertexAttribArray('Normal', normalsGeometry);
    geometry.setVertexAttribArray('TexCoord0', texGeometry);
    geometry.getPrimitives().push(new osg.DrawArrays(osg.PrimitiveSet.TRIANGLE_STRIP, 0, 6));

    var geometryBehind = new osg.Geometry();
    geometryBehind.setVertexAttribArray('Vertex', vertexAttribArrayBehind);
    geometryBehind.setVertexAttribArray('Normal', normalsGeometryBehind);
    geometryBehind.getPrimitives().push(new osg.DrawArrays(osg.PrimitiveSet.TRIANGLE_STRIP, 0, 6));

    var geometryDepth = new osg.Geometry();
    geometryDepth.setVertexAttribArray('Vertex', vertexAttribArrayDepth);
    geometryDepth.setVertexAttribArray('Normal', normalsGeometryDepth);
    geometryDepth.setVertexAttribArray('Color', colorGeometryDepth);
    geometryDepth.getPrimitives().push(new osg.DrawElements(osg.PrimitiveSet.TRIANGLES, indices));

    var tailTransform = new osg.MatrixTransform();
    tailTransform.addChild(geometry);
    tailTransform.addChild(geometryBehind);
    tailTransform.addChild(geometryDepth);
    return tailTransform;
}

function createWings() {
    var depth = 2;

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

    var geometry = new osg.Geometry();
    geometry.setVertexAttribArray('Vertex', vertexAttribArray);
    geometry.setVertexAttribArray('Normal', normalsGeometry);
    geometry.getPrimitives().push(new osg.DrawArrays(osg.PrimitiveSet.TRIANGLE_FAN, 0, 6));

    var geometryBehind = new osg.Geometry();
    geometryBehind.setVertexAttribArray('Vertex', vertexAttribArrayBehind);
    geometryBehind.setVertexAttribArray('Normal', normalsGeometryBehind);
    geometryBehind.getPrimitives().push(new osg.DrawArrays(osg.PrimitiveSet.TRIANGLE_FAN, 0, 6));

    var geometryDepth = new osg.Geometry();
    geometryDepth.setVertexAttribArray('Vertex', vertexAttribArrayDepth);
    geometryDepth.setVertexAttribArray('Normal', normalsGeometryDepth);
    geometryDepth.getPrimitives().push(new osg.DrawElements(osg.PrimitiveSet.TRIANGLES, indices));

    var transform = new osg.MatrixTransform();
    transform.addChild(geometry);
    transform.addChild(geometryBehind);
    transform.addChild(geometryDepth);

    var transformMatrix = new osg.Matrix.create();
    osg.Matrix.makeRotate(Math.PI/2,1,0,0,transformMatrix);
    var scaleMatrix = new osg.Matrix.create();
    osg.Matrix.makeScale(10,1,10, scaleMatrix);

    osg.Matrix.preMult(transformMatrix,scaleMatrix);

    transform.setMatrix(transformMatrix);

    return transform;
}

function createCylinderBody() {

    // Define the attributes for the cylinder

    var angle = 0.0;
    var angleIncrement = (2*Math.PI)/faces;
    var s0 = 0;

    // create an empty array of floats to hold the coordinates
    var coordinates = new Array();
    var normals = new Array();
    var texCoords = new Array();
    var z = height/2.0;

    for(var f=0; f<faces; f++)
    {
        // Generate the four coordinates required for each face
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


    /* Normals */
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

    /* Texture coordinates */

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


