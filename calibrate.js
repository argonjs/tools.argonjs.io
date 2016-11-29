var app = Argon.init();

app.context.setDefaultReferenceFrame(app.context.localOriginEastNorthUp);

//is there a better way to access the video element?
var video = Argon.ArgonSystem.instance.container.get(Argon.LiveVideoRealityLoader).videoElement;

var flow = new oflow.VideoFlow(video);
var canvas = document.createElement('canvas');
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.width = app.view.element.clientWidth;
canvas.height = app.view.element.clientHeight;
app.view.element.appendChild(canvas);

var sceneCtx = canvas.getContext('2d');

var dx = 0;

flow.onCalculated((dir) =>
    {
        dx += dir.u;

        sceneCtx.clearRect(0, 0, app.view.element.clientWidth, app.view.element.clientHeight);

        for(var i = 0; i < dir.zones.length; ++i) {
            var zone = dir.zones[i];
            sceneCtx.strokeStyle = getDirectionalColor(zone.u, zone.v);
            sceneCtx.beginPath();
            sceneCtx.moveTo(zone.x,zone.y);
            sceneCtx.lineTo((zone.x - zone.u), zone.y + zone.v);
            sceneCtx.stroke();
        }
    });

var button = document.getElementById("calibrateButton");

var Quaternion = Argon.Cesium.Quaternion;

function calibrate() {
    button.disabled = true;
    dx = 0;
    var oldOrientation = Quaternion.clone(app.context.getEntityPose(app.device.displayEntity).orientation);
    console.log(oldOrientation);
    flow.startCapture();
    window.setTimeout(endCalibration, 5000, oldOrientation);
}

function endCalibration(oldOrientation) {
    flow.stopCapture();
    var newOrientation = app.context.getEntityPose(app.device.displayEntity).orientation;
    console.log("old: " + oldOrientation);
    console.log("new: " + newOrientation);
    
    var inverse = new Quaternion();
    Quaternion.inverse(oldOrientation, inverse);
    
    var difference = new Quaternion();
    Quaternion.multiply(newOrientation, inverse, difference);

    var theta = Quaternion.computeAngle(difference);
    var f = dx / 2 * Math.tan(0.5 * theta);
    var approxFov = 2 * Math.atan(video.videoWidth / 2 * f);

    console.log("dx = " + dx);
    console.log("theta = " + theta);
    console.log("fov = " + approxFov);
    button.disabled = false;
}

/*jslint sloppy: true, white: true */
var toDegree = 180 / Math.PI;
function fromArgb(a, r, g, b) {
    return 'rgba(' + [r, g, b, a/255].join(',') + ')';
}
function convertHsvToRgb(h, s, v) {
    var a, b, c, d, hueFloor;
    h = h / 360;
    if (s > 0) {
        if (h >= 1) {
            h = 0;
        }
        h = 6 * h;
        hueFloor = Math.floor(h);
        a = Math.round(255 * v * (1.0 - s));
        b = Math.round(255 * v * (1.0 - (s * (h - hueFloor))));
        c = Math.round(255 * v * (1.0 - (s * (1.0 - (h - hueFloor)))));
        d = Math.round(255 * v);

        switch (hueFloor) {
            case 0: return fromArgb(255, d, c, a);
            case 1: return fromArgb(255, b, d, a);
            case 2: return fromArgb(255, a, d, c);
            case 3: return fromArgb(255, a, b, d);
            case 4: return fromArgb(255, c, a, d);
            case 5: return fromArgb(255, d, a, b);
            default: return fromArgb(0, 0, 0, 0);
        }
    }
    d = v * 255;
    return fromArgb(255, d, d, d);
}

function getDirectionalColor(x, y) {
    var hue = (Math.atan2(y, x) * toDegree + 360) % 360;
    return convertHsvToRgb(hue, 1, 1);
}