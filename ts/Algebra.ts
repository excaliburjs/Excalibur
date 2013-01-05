class Point2D {
	
	constructor (public x: number = 0, public y: number =0){
		
	}
	
	distance(p :Point2D){
		return Math.sqrt(Math.pow(this.x-p.x,2) + Math.pow(this.y -p.y,2));
	}
	
	toString(){
		return "(" + this.x + "," + this.y + ")";
	}
}

class Point3D extends Point2D {
	constructor (x :number = 0, y:number =0 , public z:number = 0){
		super(x,y);
	}
	
	distance(p : Point3D){
		return Math.sqrt(Math.pow(this.x-p.x,2)+Math.pow(this.y-p.y,2)+Math.pow(this.z-p.z,2));
	}
	
	toString(){
		return "(" + this.x + "," + this.y + "," + this.z + ")";
	}
}

var p1: Point2D = new Point2D();
var p2: Point2D = new Point2D(0,5);

var dis: number = p1.distance(p2);


var p3: Point3D = new Point3D();
var p4: Point3D = new Point3D(0,0,5);

var dis2: number = p3.distance(p4);

alert("First:" + p1.toString() + ":" + dis.toString());
alert("Second:" + p3.toString() + ":" + dis2.toString());