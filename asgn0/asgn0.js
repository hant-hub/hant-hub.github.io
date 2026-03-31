
function DrawVector(ctx, v, color) {

    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.moveTo(200, 200); //move to canvas center
    //+y direction = -y direction on screen
    ctx.lineTo(20 * v.elements[0] + 200, -20 * v.elements[1] + 200); //line to direction + center

    ctx.stroke();
}

function handleDrawEvent() {
    var v1 = new Vector3([
        document.getElementById('v1-x').value,
        document.getElementById('v1-y').value,
        0.0]);

    var v2 = new Vector3([
        document.getElementById('v2-x').value,
        document.getElementById('v2-y').value,
        0.0]);

    var op = document.getElementById('op').value;
    var scalar = document.getElementById('scalar').value;


    // Retrieve <canvas> element <- (1)
    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }


    // Get the rendering context for 2DCG <- (2)
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a blue color
    ctx.fillRect(0, 0, 400, 400); // Fill a rectangle with the color

    DrawVector(ctx, v1, 'red');
    DrawVector(ctx, v2, 'blue');


    switch (op) {
        case "add":
            var v3 = v1.add(v2);  
            DrawVector(ctx, v3, 'green');
            break;
        case "sub":
            var v3 = v1.sub(v2);
            DrawVector(ctx, v3, 'green');
            break;
        case "div":
            var v3 = v1.div(scalar);
            var v4 = v2.div(scalar);
            DrawVector(ctx, v3, 'green');
            DrawVector(ctx, v4, 'green');
            break;
        case "mul":
            var v3 = v1.mul(scalar);
            var v4 = v2.mul(scalar);
            DrawVector(ctx, v3, 'green');
            DrawVector(ctx, v4, 'green');
            break;
        case "mag":
            console.log("V1 Magnitude: " + v1.magnitude());
            console.log("V2 Magnitude: " + v2.magnitude());
            break;
        case "norm":
            var v3 = v1.normalize();
            var v4 = v2.normalize();
            DrawVector(ctx, v3, 'green');
            DrawVector(ctx, v4, 'green');
            break;
        case "angle":
            var v3 = v1.normalize();
            var v4 = v2.normalize();
            let angle = Math.acos(Vector3.dot(v3, v4));
            angle = angle * (180/Math.PI);
            console.log("Angle: " + angle);
            break;
        case "area":
            var area = Vector3.cross(v1, v2).magnitude() / 2;
            console.log("Area of Triangle: " + area);
            break;
    }

}

// DrawRectangle.js
function main() {
    // Retrieve <canvas> element <- (1)
    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    // Get the rendering context for 2DCG <- (2)
    var ctx = canvas.getContext('2d');

    // Draw a blue rectangle <- (3)
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a blue color
    ctx.fillRect(0, 0, 400, 400); // Fill a rectangle with the color



    var v1 = new Vector3([2.25, 2.25, 0.0]);
    DrawVector(ctx, v1, 'rgba(255, 0, 0, 1.0)');
}
