import { AfterViewInit, Component } from '@angular/core';
import * as THREE from 'three';
import { Color } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'bd-app';

  constructor(){
    
  }
  ngAfterViewInit(): void {
    var scene = new THREE.Scene();
    var element = document.getElementById('three');
    var camera = new THREE.PerspectiveCamera( 75, (element?.offsetWidth ?? 400)/(element?.offsetHeight?? 400), 0.1, 1000 );
camera.position.set(400,200,0);


    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( element?.offsetWidth ??400,element?.offsetHeight ??400 );
    element?.appendChild( renderer.domElement );

    let controls = new OrbitControls(camera,renderer.domElement);
    controls.listenToKeyEvents(element ?? document.body);

    var animate = function () {
      requestAnimationFrame( animate );

      //cube.rotation.x += 0.01;
      //cube.rotation.y += 0.01;

      renderer.render( scene, camera );
    };

    var render = function() {
      renderer.render( scene, camera );
    }

    controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    //controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = 100;
    controls.maxDistance = 500;

    controls.maxPolarAngle = Math.PI / 2;

   let pb = this.poleBarn({
     length: 80,
     width: 40,
     roofColor: new THREE.Color('whitesmoke'),
     roofPitch: 4,
     sidewall: 12,
     sidingColor: new THREE.Color('red'),
     trimColor: new THREE.Color(5,100,100)
   });
    scene.add( pb );

    // lights

    const dirLight1 = new THREE.DirectionalLight( 0xffffff );
    dirLight1.position.set( 1, 1, 1 );
    scene.add( dirLight1 );

    const dirLight2 = new THREE.DirectionalLight( 0x002288 );
    dirLight2.position.set( - 1, - 1, - 1 );
    scene.add( dirLight2 );

    const ambientLight = new THREE.AmbientLight( 0x222222 );
    scene.add( ambientLight );
  
    //animate();
  }

  private poleBarn(options: pole_barn){
    const group = new THREE.Group();
    let endWall=this.getWall(options.width, options.sidewall,options.sidingColor);
    group.add(endWall);

    let gable = this.getGable(options.width,options.roofPitch,options.sidingColor);
    gable.position.y=gable.position.y+options.sidewall/2;
    gable.position.x=gable.position.x-options.width/2;
    group.add(gable);

    let endWall2=this.getWall(options.width, options.sidewall,options.sidingColor);
    endWall2.position.z = endWall2.position.z-options.length;
    group.add(endWall2);

    let gable2 = this.getGable(options.width,options.roofPitch,options.sidingColor);
    gable2.position.y=gable2.position.y+options.sidewall/2;
    gable2.position.x=gable2.position.x-options.width/2;
    gable2.position.z=gable2.position.z-options.length;
    group.add(gable2);

    let sideWall=this.getWall(options.length, options.sidewall,options.sidingColor);
    sideWall.rotation.y = Math.PI / 2;
    sideWall.position.x = sideWall.position.x-options.width/2;
    sideWall.position.z = sideWall.position.z-options.length/2;
    group.add(sideWall);

    let sideWall2=this.getWall(options.length, options.sidewall,options.sidingColor);
    sideWall2.rotation.y = Math.PI / 2;
    sideWall2.position.x = sideWall2.position.x+options.width/2;
    sideWall2.position.z = sideWall2.position.z-options.length/2;
    group.add(sideWall2);

    let roof1 = this.getRoofPanel(options.length,options.width,options.roofPitch,options.roofColor);
   roof1.position.z = roof1.position.z - options.length/2;
   //this needs to be halway up roof line--just use slope because tan and arctan cancel
   let op = (options.roofPitch/12)*(options.width/4);
   roof1.position.y=options.sidewall/2+op;
   roof1.position.x=roof1.position.x-options.width/4;
    group.add(roof1);

    let roof2 = this.getRoofPanel(options.length,options.width,options.roofPitch,options.roofColor);
    roof2.position.z = roof2.position.z - options.length/2;
    //this needs to be halway up roof line--just use slope because tan and arctan cancel
    roof2.position.y=options.sidewall/2+op;
    roof2.position.x=roof2.position.x+options.width/4;
    roof2.rotation.x+=Math.PI;
     group.add(roof2);
    return group;
  }

  private hypotenuse(b:number,a: number){
    return Math.sqrt(Math.pow(a,2)+Math.pow(b,2));
  }
  private getRoofPanel(length:number,barnWidth: number, roofPitch: number,color: THREE.Color){
    const texture = new THREE.TextureLoader().load( 'textures/crate.gif' );

    let width = this.hypotenuse(barnWidth/2, roofPitch/12 * barnWidth/2);
    const geometry = new THREE.PlaneGeometry(width,length);

    const material = new THREE.MeshPhysicalMaterial( {color: color, side: THREE.DoubleSide} );
let mesh = new THREE.Mesh( geometry, material );
mesh.rotation.x=Math.PI/2;//Math.atan(options.roofPitch/12);
mesh.rotation.y=Math.atan(roofPitch/12);
    return mesh;
  }
  private getWall(length: number, height: number, color: THREE.Color): THREE.Object3D {
    
    const texture = new THREE.TextureLoader().load( 'textures/crate.gif' );

    const geometry = new THREE.PlaneGeometry(length,height);

    const material = new THREE.MeshPhysicalMaterial( {color: color, side: THREE.DoubleSide} );

    return new THREE.Mesh( geometry, material );
  }

  private getGable(width: number, roofPitch: number, color: THREE.Color){
    const shape = new THREE.Shape();
    shape.moveTo( 0,0 );
    shape.lineTo( width/2, (width/2)*(roofPitch/12));
    shape.lineTo( width,0 );
    shape.lineTo( 0, 0 );
    
    const geometry = new THREE.ShapeGeometry( shape );
    const material = new THREE.MeshPhysicalMaterial( { color: color,side: THREE.DoubleSide } );
    const mesh = new THREE.Mesh( geometry, material ) ;
    return mesh;
  }
  
}


interface pole_barn{
  length: number;
  width: number;
  sidewall: number;
  roofPitch: number;
  roofColor: Color;
  sidingColor: Color;
  trimColor: Color;
}