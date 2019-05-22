
function createScene() {

    var size = 7;
    var cube = osg.createTexturedBoxGeometry(0, 0, 0, size, size, size);
    var material = new osg.Material();
    material.setDiffuse([0.6, 0.8, 1.0, 1.0]);
    cube.getOrCreateStateSet().setAttributeAndModes(material);

    var root = new osg.Node();
    root.addChild(cube);
    return root;

}
