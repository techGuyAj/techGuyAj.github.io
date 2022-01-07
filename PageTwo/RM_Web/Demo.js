import * as THREE from "./build/three.module.js";
//import { DDSLoader } from "./jsm/loaders/DDSLoader.js";
//import { MTLLoader } from "./jsm/loaders/MTLLoader.js";
import { OBJLoader } from "./jsm/loaders/OBJLoader.js";
//import { OrbitControls } from "./jsm/controls/OrbitControls.js";
//import { HDRCubeTextureLoader } from "./jsm/loaders/HDRCubeTextureLoader.js";
import { RGBELoader } from "./jsm/loaders/RGBELoader.js";
import { DEG2RAD, degToRad, radToDeg } from "./src/math/MathUtils.js";

//import { GUI } from "./jsm/libs/dat.gui.module"
//import { load } from "../editor/js/libs/ternjs/def.js";

var cube, vase;
var controls;
var renderer, scene, sceneMatt, camera, cameraMatt;
var hdrCubeMap, hdrCubeRenderTarget, newEnvMap;
var angle = 0;
var pointLight3;
var isVase = true;
var isGlossy = true;
var isMouseDown = false;

var animDir = true;

var prevX = -1;
var prevY = -1;

var xVelocity = 0.0;

var lastAnimTime = 0;
var lastRenderTime = 0;

var animBX = 0; // Begin
var animBY = 0;
var animEX = 0; // End
var animEY = 0;

var animVelocity = 0.0;
var vaseHeadingVelocity = 0.0;
var vaseHeading = 180.0;
var vaseTilt = 0.0;
var applyZoom = false;
var ZoomFactor = 0;
var objectGlossy, objectMatt;
var boundingBox = [0.0, 0.0, 0.0];
var rMax=0,rMin=0;
var zoomValue = 0;
var onLoadRadius = 0;

function init() {
	scene = new THREE.Scene();
	sceneMatt = new THREE.Scene();
	//scene.background = new THREE.Color( 0x7579BB);
	var width = window.innerWidth,
		height = window.innerHeight;
	//var width = 512,height = 512;
	camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
	//camera.position.z = 20;

	//Matt Camera
	cameraMatt = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
	//cameraMatt.position.z = 10;

	if (isVase) {
		camera.position.z = 5;
		camera.position.y = 1;
	} else {
		camera.position.z = 20;
	}
	//scene.add(camera);

	//sceneMatt.add(cameraMatt);

	renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
	renderer.setClearColor(0x7579bb, 0);
	renderer.setSize(width, height);
	renderer.setPixelRatio(window.devicePixelRatio);

	//renderer.physicallyCorrectLights = false;
	// renderer.toneMapping = THREE.ACESFilmicToneMapping;

	document.body.appendChild(renderer.domElement);

	// controls

	// controls = new OrbitControls(camera, renderer.domElement);
	// controls.listenToKeyEvents(window); // optional
	// //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
	// controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	// controls.dampingFactor = 0.05;
	// controls.screenSpacePanning = false;
	// controls.minDistance = 0.5;
	// controls.maxDistance = 500;
	// // controls.autoRotate=true;
	// controls.autoRotateSpeed = 10;
	// //controls.maxPolarAngle = Math.PI / 2;

	const geometry = new THREE.SphereGeometry();
	const materialBasic = new THREE.MeshBasicMaterial({ color: "purple" }); //Basic Material

	//*************************Standard (PBR)********************************************/
	const material = new THREE.MeshStandardMaterial();
	const material_Matt = new THREE.MeshStandardMaterial();
	const material_logo = new THREE.MeshStandardMaterial();

	var textureLoader = new THREE.TextureLoader();

	/******************************Environment********************** */
	var envMap;
	const pmremGenerator = new THREE.PMREMGenerator(renderer);
	new RGBELoader()
		.setDataType(THREE.UnsignedByteType)
		.setPath("textures/equirectangular/")
		.load("royal_esplanade_1k.hdr", function (texture) {
			envMap = pmremGenerator.fromEquirectangular(texture).texture;

			//scene.background = envMap;
			scene.environment = envMap;
			sceneMatt.environment = envMap;
		});

	//ReallyMake Assets
	var texturePath = "";
	if (isVase) texturePath = "./textures/ReallyMake/Model_7_txt.png";
	else texturePath = "./textures/ReallyMake/Model_5_txt_1.png";
	var brickTex = textureLoader.load(texturePath);
	var logoTex = textureLoader.load("./textures/ReallyMake/reallymake_logo.png");
	
	var normalTex = textureLoader.load("./textures/ReallyMake/normal_obj.png");

	var aoRougnessMetallicTex = textureLoader.load(
		"./textures/ReallyMake/vase_ao_roughness_metal_glossy.png"
	);

	var aoRougnessMetallicMattTex = textureLoader.load(
		"./textures/ReallyMake/vase_ao_roughness_metal_matt.png"
	);

	var sceneBackgroundTex = textureLoader.load(
		"./textures/ReallyMake/new_solomodel_background.jpg"
	);

	scene.background = sceneBackgroundTex;
	sceneMatt.background = sceneBackgroundTex;

	document.addEventListener("keydown", onDocumentKeyDown, false);
	function onDocumentKeyDown(event) {
		var keyCode = event.which;
		if (keyCode == 65) {
			//controls.reset();
			resetVase();
		}
		if (keyCode == 71) {
			isGlossy = !isGlossy;
		}
	}

	//Touch events
	document.addEventListener("touchstart", onDocumentMouseDown, false);
	document.addEventListener("touchend", onDocumentMouseUp, false);
	document.addEventListener("touchmove", onDocumentMouseMove, false);
	//Mouse evenets
	document.addEventListener("mousedown", onDocumentMouseDown, false);
	document.addEventListener("mouseup", onDocumentMouseUp, false);
	document.addEventListener("mousemove", onDocumentMouseMove, false);
	document.addEventListener("wheel", onDocumentMouseScroll, false);

	function onDocumentMouseDown(event) {
		//event.which == 1 ? (isMouseDown = true) : (isMouseDown = false); //left mouse button

		if (event.which == 1) {
			isMouseDown = true;

			animBX = event.x;
			animBY = event.y;
			lastAnimTime = new Date().getMilliseconds();
		}
	}
	function onDocumentMouseUp(event) {
		isMouseDown = false;

		prevY = -1;
		prevX = -1;
		//takeScreenShot = true
		animEX = event.x;
		animEY = event.y;
		let animTime = new Date().getMilliseconds();

		let deltaTime = animTime - lastAnimTime;
		var timeGap = deltaTime / 1000.0;
		let threshold = 5.0 / width;
		let swipeDist = Math.abs(animEX - animBX) / width;
		if (timeGap > 0.02 && timeGap < 0.5 && swipeDist >= threshold) {
			let diffTime = deltaTime * 0.12;
			let distSquareSum =
				Math.pow(animEX - animBX, 2.0) + Math.pow(animEY - animBY, 2.0);
			let distance = Math.sqrt(distSquareSum);
			var velocity = distance / diffTime;
			var posDir = false;
			let xDiff = animBX - animEX;
			let yDiff = animBY - animEY;

			if (xDiff > 0) {
				velocity *= -1;
				posDir = false;
			} else {
				posDir = true;
			}

			if (posDir) {
				if (velocity > 18) velocity = 18.0;
			} else if (velocity < -18) velocity = -18.0;

			animDir = posDir;
			animVelocity = velocity;
		}
	}
	function onDocumentMouseMove(event) {
		let x = event.x;
		let y = event.y;
		if (isMouseDown) {
			if (prevX == -1 || prevY == -1) {
				prevX = x;
				prevY = y;
			}
			xVelocity += (x - prevX) * 0.02;
			//  localCamera.rotateEye((prevY - y).toFloat() * 0.02f, (x - prevX).toFloat() * 0.02f)
			//Log.e("Camera","phi : ${localCamera.phi} , theta : ${localCamera.theta}");

			if (prevX >= 1 || prevY >= 1) {
				var xDiff = (x - prevX) * 0.1;
				var yDiff = (prevY - y) * 0.1;
				vaseTilt += yDiff;
				vaseHeadingVelocity += xDiff;
			}

			prevX = x;
			prevY = y;
		}
	}

	function onDocumentMouseScroll(event) {
		if (event.deltaY > 0) ZoomFactor = 1;
		else ZoomFactor = -1;

		applyZoom = true;
	}

	//We have to create 2 materials 1 for body and 1 for the logo.

	material.map = brickTex;
	material.normalMap = normalTex;
	material.aoMap = aoRougnessMetallicTex;
	material.roughnessMap = aoRougnessMetallicTex;
	material.metalnessMap = aoRougnessMetallicTex;
	material.emissiveMap = envMap;
	// material.bumpMap =bumpTex;
	material.bumpScale = 0.01;

	//Matt
	material_Matt.map = brickTex;
	material_Matt.normalMap = normalTex;
	material_Matt.aoMap = aoRougnessMetallicMattTex;
	material_Matt.roughnessMap = aoRougnessMetallicMattTex;
	material_Matt.metalnessMap = aoRougnessMetallicMattTex;
	material_Matt.emissiveMap = envMap;
	// material.bumpMap =bumpTex;
	material_Matt.bumpScale = 0.01;

	material_logo.map = logoTex;
	material_logo.normalMap = normalTex;
	material_logo.aoMap = aoRougnessMetallicTex;
	material_logo.roughnessMap = aoRougnessMetallicTex;
	material_logo.metalnessMap = aoRougnessMetallicTex;
	material_logo.emissiveMap = envMap;
	// material.bumpMap =bumpTex;
	material.bumpScale = 0.01;
	//material.roughnessMap=brickRougnessTex;
	//   material.di

	//Load obj
	const loader = new OBJLoader();
	var path = "models/obj/reallymake/"
	var name_vase = "Model_7.obj";
	var name_obj = "BabyDinosaur.obj";
	var fileName = "";
	if (isVase) fileName = path + name_vase;
	else fileName = path + name_obj;
	loader.load(
		fileName,
		// called when resource is loaded
		function (object) {
		//	console.log(object);
			var bbox = new THREE.Box3().setFromObject(object);
		
			boundingBox[0] =bbox.max.x + Math.abs(bbox.min.x );
			boundingBox[1] =bbox.max.y + Math.abs(bbox.min.y );
			boundingBox[2] =bbox.max.z + Math.abs(bbox.min.z );

			var count = object.children.length;
			var i = 0;
			for (i = 0; i < count; i++) {
				object.children[i].material = material;
			}
			if (isVase) {
				object.rotation.x = degToRad(-90);
				object.children[1].material = material_logo;
			}
			objectGlossy = object;
			scene.add(object);
		}
	);

	loader.load(
		fileName,
		// called when resource is loaded
		function (object) {
			var count = object.children.length;
			var i = 0;
			for (i = 0; i < count; i++) {
				object.children[i].material = material_Matt;
			}

			if (isVase) {
				object.rotation.x = degToRad(-90);
				object.children[1].material = material_logo;
			}

			objectMatt = object;
			sceneMatt.add(object);
           
			adjustCamera();
		}
	);

	cube = new THREE.Mesh(geometry, material);
	//scene.add(cube);

	//Directional Light
	var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
	directionalLight.position.x = -100;
	directionalLight.position.y = 100;
	scene.add(directionalLight);

	var directionalLightMatt = new THREE.DirectionalLight(0xffffff, 0.5);
	directionalLightMatt.position.x = -100;
	directionalLightMatt.position.y = 100;
	sceneMatt.add(directionalLightMatt);

	const ambientLight = new THREE.AmbientLight(0xffffff, 1.84);
	ambientLight.position.x = 100;
	ambientLight.position.y = 100;
	scene.add(ambientLight);

	const ambientLightMatt = new THREE.AmbientLight(0xffffff, 2.54);
	ambientLightMatt.position.x = 100;
	ambientLightMatt.position.y = 100;
	sceneMatt.add(ambientLightMatt);

	//front
	const pointLight = new THREE.PointLight(0xffffff, 0.4);
	pointLight.position.x = -100;
	pointLight.position.y = 0;
	pointLight.position.z = 100;
	scene.add(pointLight);

	const pointLightMatt = new THREE.PointLight(0xffffff, 0.4);
	pointLightMatt.position.x = -100;
	pointLightMatt.position.y = 0;
	pointLightMatt.position.z = 100;
	sceneMatt.add(pointLightMatt);


}

const animate = function () {
	requestAnimationFrame(animate);
	if (objectMatt != null) {
		if (isVase) {
			objectMatt.rotation.z = degToRad(vaseHeadingVelocity);
			objectMatt.rotation.x = degToRad(-90 - vaseTilt);
		} else {
			//For 3d objects the orientation will be diferent ->it is y Axis as Up vector
			objectMatt.rotation.y = degToRad(vaseHeadingVelocity);
			objectMatt.rotation.x = degToRad(-vaseTilt);
		}
	}
	if (objectGlossy != null) {
		if (isVase) {
			objectGlossy.rotation.z = degToRad(vaseHeadingVelocity);
			objectGlossy.rotation.x = degToRad(-90 - vaseTilt);
		} else {
			//For 3d objects the orientation will be diferent ->it is y Axis as Up vector
			objectGlossy.rotation.y = degToRad(vaseHeadingVelocity);
			objectGlossy.rotation.x = degToRad(-vaseTilt);
		}
	}
	if (vase != null) {
		// vase.rotation.z += 0.01;
		//vase.rotation.y += 0.01;
	}
	if (isGlossy) renderer.render(scene, camera);
	else renderer.render(sceneMatt, camera);

	//controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

	//Zoom
	if (applyZoom) {
		applyZoom = false;
		camera.position.z += ZoomFactor;

      //Boundary conditions
	  
	  if(camera.position.z < rMin)
		 camera.position.z=rMin;
	  

	  if(camera.position.z>rMax)
	     camera.position.z=rMax;

	}

	//animate vase
	let date = new Date();
	let currTime = date.getMilliseconds();
	if (lastRenderTime == 0.0) lastRenderTime = currTime;
	let elapsed = Math.abs((currTime - lastRenderTime) / 80.0);
	//if (elapsed > 1) elapsed = 1;
	animateVase(elapsed);
	lastRenderTime = currTime;
};
function animateVase(vStep) {
	if (animDir) {
		animVelocity -= vStep / 3;
		if (animVelocity < 0) {
			animVelocity = 0;
		}
	} else {
		animVelocity += vStep / 3;
		if (animVelocity > 0) {
			animVelocity = 0.0;
		}
	}
	vaseHeadingVelocity += animVelocity;
}
function adjustCamera() {
	//have to adust the camera based on the mesh bounding box

	var heightOfVase = boundingBox[2]; //height of the vase in our case it is along z-Axis
	var coverExtra = 0.0;
	if ( boundingBox[0] < boundingBox[2])
		coverExtra = heightOfVase * 0.1 + boundingBox[0] * 0.2;
	//cover on top and bottom
	else coverExtra = heightOfVase + boundingBox[0];
	heightOfVase += coverExtra; //total height
	var angle = degToRad(75/2);
	var tanValue = Math.tan(angle);
	var radNew = heightOfVase / tanValue + boundingBox[2] + boundingBox[0]; //Initial radius
    

	zoomValue = radNew-radNew*0.5;
	onLoadRadius = zoomValue;
	applyZoom = true;
 


	//calculation of Maximum and minimum radius for Zoom
	var height = boundingBox[1]; //height of the vase in our case it is along z-Axis
	var cover = height * 1.2; //cover on top and bottom
	height += cover; //total height

	var tanVal = Math.tan(angle);
	rMax = ((height / tanVal) * boundingBox[2]) / 4; //maximum radius
	var rad = boundingBox[2];
	rMin = boundingBox[1] +boundingBox[1] *0.25;
	if(!isVase)
	rMin = boundingBox[1];
	//  rMax = boundingBox[1]*boundingBox[2]
	rMax = onLoadRadius + 25;

	camera.position.z =zoomValue;
}
function resetVase()
{
	//reseting vase
	vaseHeadingVelocity =0.0;
	animVelocity = 0.0;
	vaseHeading=0.0;
	vaseTilt =0.0;
	zoomValue = onLoadRadius
	camera.position.z=onLoadRadius;
}
init();
animate();
