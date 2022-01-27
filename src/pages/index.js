import * as React from "react"
import * as THREE from 'three';
import { OrbitControls } from "../../node_modules/three/examples/jsm/controls/OrbitControls.js";
import { TextureLoader } from "../../node_modules/three/src/loaders/TextureLoader.js";

// markup
class IndexPage extends React.Component{
  constructor(props){
    super(props);
    this.scale = 1.4e-5;
    
    this.rad_earth = 7379e3;
    this.rad_sun = 696340e3;
    this.distance_sun_earth = 149600000000;
    // this.time_scale = 10; //10 seconds every milliseconds - 1 min per day
    this.time_scale = 6.2e5;
  }


  componentDidMount(){
    this.create_scene();
  }

  tilt_earth(){
    this.earth.rotateX(-(47/360) * Math.PI)
    this.line.rotateX(-(47/360) * Math.PI)
    let seconds = 1;
    let rotate = () => {setTimeout(() => {
      let T = 26000 * 365 * 24 * 60 * 60;
      let proportion = (seconds / T) * 2 * Math.PI;
      // this.earth.rotateY(proportion);
      // this.line.rotateY(proportion);
      this.earth.rotateOnWorldAxis(new THREE.Vector3(0,1,0), proportion)
      this.line.rotateOnWorldAxis(new THREE.Vector3(0,1,0), proportion)
      seconds += this.time_scale;
      rotate();
    }, 1)}
    rotate();
  }

  create_scene(){
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000000000000);

    const renderer =  new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    let container = document.getElementById("container");
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls( camera, renderer.domElement )
    
    camera.position.set(150, 150, 150);
    controls.update();

    let { earth, line } = this.create_earth();
    this.earth = earth;
    this.line = line;
    this.tilt_earth();
    scene.add(earth);
    scene.add(line);

    let { sun, light } = this.create_sun();
    scene.add(sun);
    scene.add(light);

    let axis_line = this.create_line();
    scene.add(axis_line)

    var seconds = 1;
    let move = () => {setTimeout(() => {
      
      let theta = seconds * 7.2722e-5;
      let x = this.distance_sun_earth * this.scale * Math.cos(theta);
      let y = this.distance_sun_earth * this.scale * Math.sin(theta);

      light.position.set(x, 0, y)
      sun.position.set(x, 0, y)
      seconds = seconds + this.time_scale;
      move();
    }, 1)}
    move();

    var lt = new Date();
    var loop = function(){
      var now = new Date(),
      secs = (now - lt) / 1000;
      lt = now;
      requestAnimationFrame(loop);
      controls.update(1 * secs);
      renderer.render(scene, camera)
    }
    loop();
  }

  create_sun(){
    const geometry = new THREE.SphereGeometry(this.rad_sun * this.scale, 64, 64)
    const loader = new TextureLoader().load("static/sun.jpg");
    const material = new THREE.MeshBasicMaterial( { map: loader } );
    const sun = new THREE.Mesh( geometry, material );

    let light = new THREE.PointLight(0xffffff, 1, 100000000000);
    sun.position.set(this.distance_sun_earth * this.scale, 0, 0);
    light.position.set(this.distance_sun_earth * this.scale, 0, 0)


    return { sun, light };
  }

  create_earth(){
    const geometry = new THREE.SphereGeometry(this.rad_earth * this.scale, 32, 32);
    const loader = new TextureLoader().load("static/earth.jpg");
    const material = new THREE.MeshPhysicalMaterial( { map: loader } );
    const earth = new THREE.Mesh( geometry, material )

    const line_material = new THREE.LineBasicMaterial({
      color:0xff0000,
      linewidth: 10,
    })
    const points = [new THREE.Vector3(0, 150, 0), new THREE.Vector3(0, -150, 0)];
    const line_geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line( line_geometry, line_material);
    return { earth, line };
  }

  create_line(){
    const line_material = new THREE.LineBasicMaterial({
      color:0x0000ff,
      linewidth: 10,
    })
    const points = [new THREE.Vector3(0, 150, 0), new THREE.Vector3(0, -150, 0)];
    const line_geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line( line_geometry, line_material);
    return line
  }
  
  render(){
    return (
      <main>
        <title>Home Page</title>
        <div id="container"></div>
      </main>
    )
  }
}

export default IndexPage
