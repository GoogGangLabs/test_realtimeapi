import * as Kalidokit from "./kalidokit/index.js";
import { socket, videoInfo, bufferQueue, sessionId, fixedFPS } from './context.js';
//Import Helper Functions from Kalidokit
const remap = Kalidokit.Utils.remap;
const clamp = Kalidokit.Utils.clamp;
const lerp = Kalidokit.Vector.lerp;

/* THREEJS WORLD SETUP */
let currentVrm;

// renderer
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// camera
const orbitCamera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
orbitCamera.position.set(0.0, 1.4, 0.7);

// controls
const orbitControls = new THREE.OrbitControls(orbitCamera, renderer.domElement);
orbitControls.screenSpacePanning = true;
orbitControls.target.set(0.0, 1.4, 0.0);
orbitControls.update();

// scene
const scene = new THREE.Scene();

// light
const light = new THREE.DirectionalLight(0xffffff);
light.position.set(1.0, 1.0, 1.0).normalize();
scene.add(light);

// Main Render Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    if (currentVrm) {
        // Update model to render physics
        currentVrm.update(clock.getDelta());
    }
    renderer.render(scene, orbitCamera);
}
animate();

/* VRM CHARACTER SETUP */

// Import Character VRM
const loader = new THREE.GLTFLoader();
const loadingProgress = document.getElementById('loading-progress');
const loadingText = document.getElementById('loading-text');
loader.crossOrigin = "anonymous";
// Import model from URL, add your own model here
loader.load(
    "https://cdn.glitch.com/29e07830-2317-4b15-a044-135e73c7f840%2FAshtra.vrm?v=1630342336981",

    (gltf) => {
        THREE.VRMUtils.removeUnnecessaryJoints(gltf.scene);

        THREE.VRM.from(gltf).then((vrm) => {
            scene.add(vrm.scene);
            currentVrm = vrm;
            currentVrm.scene.rotation.y = Math.PI; // Rotate model 180deg to face camera
        });
    },

    (progress) => {
        const perscent = 100.0 * (progress.loaded / progress.total);
        loadingText.innerHTML = `${perscent.toFixed(1)}%`;
        if (perscent === 100) {
            setTimeout(() => {
                loadingProgress.innerHTML = '';
                loadingProgress.setAttribute('style', 'display=none;')
            }, 1200);
        }
    },

    (error) => console.error(error)
);

// Animate Rotation Helper function
const rigRotation = (name, rotation = { x: 0, y: 0, z: 0 }, dampener = 1, lerpAmount = 0.3) => {
    if (!currentVrm) {
        return;
    }
    const Part = currentVrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName[name]);
    if (!Part) {
        return;
    }

    let euler = new THREE.Euler(
        rotation.x * dampener,
        rotation.y * dampener,
        rotation.z * dampener,
        rotation.rotationOrder || "XYZ"
    );
    let quaternion = new THREE.Quaternion().setFromEuler(euler);
    Part.quaternion.slerp(quaternion, lerpAmount); // interpolate
};

// Animate Position Helper Function
const rigPosition = (name, position = { x: 0, y: 0, z: 0 }, dampener = 1, lerpAmount = 0.3) => {
    if (!currentVrm) {
        return;
    }
    const Part = currentVrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName[name]);
    if (!Part) {
        return;
    }
    let vector = new THREE.Vector3(position.x * dampener, position.y * dampener, position.z * dampener);
    Part.position.lerp(vector, lerpAmount); // interpolate
};

let oldLookTarget = new THREE.Euler();
const rigFace = (riggedFace) => {
    if (!currentVrm) {
        return;
    }
    rigRotation("Neck", riggedFace.head, 0.7);

    // Blendshapes and Preset Name Schema
    const Blendshape = currentVrm.blendShapeProxy;
    const PresetName = THREE.VRMSchema.BlendShapePresetName;

    // Simple example without winking. Interpolate based on old blendshape, then stabilize blink with `Kalidokit` helper function.
    // for VRM, 1 is closed, 0 is open.
    riggedFace.eye.l = lerp(clamp(1 - riggedFace.eye.l, 0, 1), Blendshape.getValue(PresetName.Blink), 0.5);
    riggedFace.eye.r = lerp(clamp(1 - riggedFace.eye.r, 0, 1), Blendshape.getValue(PresetName.Blink), 0.5);
    riggedFace.eye = Kalidokit.Face.stabilizeBlink(riggedFace.eye, riggedFace.head.y);
    Blendshape.setValue(PresetName.Blink, riggedFace.eye.l);

    // Interpolate and set mouth blendshapes
    Blendshape.setValue(PresetName.I, lerp(riggedFace.mouth.shape.I, Blendshape.getValue(PresetName.I), 0.5));
    Blendshape.setValue(PresetName.A, lerp(riggedFace.mouth.shape.A, Blendshape.getValue(PresetName.A), 0.5));
    Blendshape.setValue(PresetName.E, lerp(riggedFace.mouth.shape.E, Blendshape.getValue(PresetName.E), 0.5));
    Blendshape.setValue(PresetName.O, lerp(riggedFace.mouth.shape.O, Blendshape.getValue(PresetName.O), 0.5));
    Blendshape.setValue(PresetName.U, lerp(riggedFace.mouth.shape.U, Blendshape.getValue(PresetName.U), 0.5));

    //PUPILS
    //interpolate pupil and keep a copy of the value
    let lookTarget = new THREE.Euler(
        lerp(oldLookTarget.x, riggedFace.pupil.y, 0.4),
        lerp(oldLookTarget.y, riggedFace.pupil.x, 0.4),
        0,
        "XYZ"
    );
    oldLookTarget.copy(lookTarget);
    currentVrm.lookAt.applyer.lookAt(lookTarget);
};

/* VRM Character Animator */
const animateVRM = async (vrm, results) => {
    if (!vrm) {
        return;
    }
    // Take the results from `Holistic` and animate character based on its Face, Pose, and Hand Keypoints.
    let riggedPose, riggedLeftHand, riggedRightHand, riggedFace;

    const faceLandmarks = results.face.length ? results.face : undefined;
    // Pose 3D Landmarks are with respect to Hip distance in meters
    const pose3DLandmarks = results.poseWorld.length ? results.poseWorld : undefined;
    // Pose 2D landmarks are with respect to videoWidth and videoHeight
    const pose2DLandmarks = results.pose.length ? results.pose : undefined;
    // Be careful, hand landmarks may be reversed
    const leftHandLandmarks = results.rightHand.length ? results.rightHand : undefined;
    const rightHandLandmarks = results.leftHand.length ? results.leftHand : undefined;

    // Animate Face
    if (faceLandmarks) {
        riggedFace = Kalidokit.Face.solve(faceLandmarks, {
            runtime: "mediapipe",
            video: videoElement,
        });
        rigFace(riggedFace);
    }

    // Animate Pose
    if (pose2DLandmarks && pose3DLandmarks) {
        riggedPose = Kalidokit.Pose.solve(pose3DLandmarks, pose2DLandmarks, {
            runtime: "mediapipe",
            video: videoElement,
        });
        rigRotation("Hips", riggedPose.Hips.rotation, 0.7);
        rigPosition(
            "Hips",
            {
                x: riggedPose.Hips.position.x, // Reverse direction
                y: riggedPose.Hips.position.y + 1, // Add a bit of height
                z: -riggedPose.Hips.position.z, // Reverse direction
            },
            1,
            0.07
        );

        rigRotation("Chest", riggedPose.Spine, 0.25, 0.3);
        rigRotation("Spine", riggedPose.Spine, 0.45, 0.3);

        rigRotation("RightUpperArm", riggedPose.RightUpperArm, 1, 0.3);
        rigRotation("RightLowerArm", riggedPose.RightLowerArm, 1, 0.3);
        rigRotation("LeftUpperArm", riggedPose.LeftUpperArm, 1, 0.3);
        rigRotation("LeftLowerArm", riggedPose.LeftLowerArm, 1, 0.3);

        rigRotation("LeftUpperLeg", riggedPose.LeftUpperLeg, 1, 0.3);
        rigRotation("LeftLowerLeg", riggedPose.LeftLowerLeg, 1, 0.3);
        rigRotation("RightUpperLeg", riggedPose.RightUpperLeg, 1, 0.3);
        rigRotation("RightLowerLeg", riggedPose.RightLowerLeg, 1, 0.3);
    }

    // Animate Hands
    if (leftHandLandmarks) {
        riggedLeftHand = Kalidokit.Hand.solve(leftHandLandmarks, "Left");
        rigRotation("LeftHand", {
            // Combine pose rotation Z and hand rotation X Y
            z: riggedPose.LeftHand.z,
            y: riggedLeftHand.LeftWrist.y,
            x: riggedLeftHand.LeftWrist.x,
        });
        rigRotation("LeftRingProximal", riggedLeftHand.LeftRingProximal);
        rigRotation("LeftRingIntermediate", riggedLeftHand.LeftRingIntermediate);
        rigRotation("LeftRingDistal", riggedLeftHand.LeftRingDistal);
        rigRotation("LeftIndexProximal", riggedLeftHand.LeftIndexProximal);
        rigRotation("LeftIndexIntermediate", riggedLeftHand.LeftIndexIntermediate);
        rigRotation("LeftIndexDistal", riggedLeftHand.LeftIndexDistal);
        rigRotation("LeftMiddleProximal", riggedLeftHand.LeftMiddleProximal);
        rigRotation("LeftMiddleIntermediate", riggedLeftHand.LeftMiddleIntermediate);
        rigRotation("LeftMiddleDistal", riggedLeftHand.LeftMiddleDistal);
        rigRotation("LeftThumbProximal", riggedLeftHand.LeftThumbProximal);
        rigRotation("LeftThumbIntermediate", riggedLeftHand.LeftThumbIntermediate);
        rigRotation("LeftThumbDistal", riggedLeftHand.LeftThumbDistal);
        rigRotation("LeftLittleProximal", riggedLeftHand.LeftLittleProximal);
        rigRotation("LeftLittleIntermediate", riggedLeftHand.LeftLittleIntermediate);
        rigRotation("LeftLittleDistal", riggedLeftHand.LeftLittleDistal);
    }
    if (rightHandLandmarks) {
        riggedRightHand = Kalidokit.Hand.solve(rightHandLandmarks, "Right");
        rigRotation("RightHand", {
            // Combine Z axis from pose hand and X/Y axis from hand wrist rotation
            z: riggedPose.RightHand.z,
            y: riggedRightHand.RightWrist.y,
            x: riggedRightHand.RightWrist.x,
        });
        rigRotation("RightRingProximal", riggedRightHand.RightRingProximal);
        rigRotation("RightRingIntermediate", riggedRightHand.RightRingIntermediate);
        rigRotation("RightRingDistal", riggedRightHand.RightRingDistal);
        rigRotation("RightIndexProximal", riggedRightHand.RightIndexProximal);
        rigRotation("RightIndexIntermediate", riggedRightHand.RightIndexIntermediate);
        rigRotation("RightIndexDistal", riggedRightHand.RightIndexDistal);
        rigRotation("RightMiddleProximal", riggedRightHand.RightMiddleProximal);
        rigRotation("RightMiddleIntermediate", riggedRightHand.RightMiddleIntermediate);
        rigRotation("RightMiddleDistal", riggedRightHand.RightMiddleDistal);
        rigRotation("RightThumbProximal", riggedRightHand.RightThumbProximal);
        rigRotation("RightThumbIntermediate", riggedRightHand.RightThumbIntermediate);
        rigRotation("RightThumbDistal", riggedRightHand.RightThumbDistal);
        rigRotation("RightLittleProximal", riggedRightHand.RightLittleProximal);
        rigRotation("RightLittleIntermediate", riggedRightHand.RightLittleIntermediate);
        rigRotation("RightLittleDistal", riggedRightHand.RightLittleDistal);
    }
};

/* SETUP MEDIAPIPE HOLISTIC INSTANCE */
const videoElement = document.querySelector(".input_video"),
    guideCanvas = document.querySelector("canvas.guides");

const drawResults = async (results) => {
    guideCanvas.width = videoElement.videoWidth;
    guideCanvas.height = videoElement.videoHeight;
    let canvasCtx = guideCanvas.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);
    // Use `Mediapipe` drawing functions
    drawConnectors(canvasCtx, results.pose, POSE_CONNECTIONS, {
        color: "#00cff7",
        lineWidth: 4,
    });
    drawLandmarks(canvasCtx, results.pose, {
        color: "#ff0364",
        lineWidth: 2,
    });
    drawConnectors(canvasCtx, results.face, FACEMESH_TESSELATION, {
        color: "#C0C0C070",
        lineWidth: 1,
    });
    if (results.face && results.face.length === 478) {
        //draw pupils
        drawLandmarks(canvasCtx, [results.face[468], results.face[468 + 5]], {
            color: "#ffe603",
            lineWidth: 2,
        });
    }
    drawConnectors(canvasCtx, results.leftHand, HAND_CONNECTIONS, {
        color: "#eb1064",
        lineWidth: 5,
    });
    drawLandmarks(canvasCtx, results.leftHand, {
        color: "#00cff7",
        lineWidth: 2,
    });
    drawConnectors(canvasCtx, results.rightHand, HAND_CONNECTIONS, {
        color: "#22c3e3",
        lineWidth: 5,
    });
    drawLandmarks(canvasCtx, results.rightHand, {
        color: "#ff0364",
        lineWidth: 2,
    });
};

let flag = false;
let selectedCamera = undefined;
const bufferCanvas = document.getElementById('buffer-canvas');
const bufferContext = bufferCanvas.getContext('2d');
bufferCanvas.width = 640;
bufferCanvas.height = 480;

const checkFrameTime = (timestamp, currTime) => {
    const sub = [];
  
    for (let i = 0; i < timestamp.length - 1; i++) {
        sub.push(timestamp[i + 1] - timestamp[i]);
    }
  
    return `총 시간: ${currTime - timestamp[0]}, 이미지 추출: ${sub[0]}, Base64 인코딩: ${sub[1]}, Base64 이미지 추출: ${sub[2]}, 이미지 압축: ${sub[3]}`;
}

const getByteLength = (s, b = 0, i = 0, c = 0) => {
    for(b=i=0;c=s.charCodeAt(i++);b+=c>>11?3:c>>7?2:1);
    return b;
}

const handleFrame = () => {
    if (!flag) return;
  
    const timestamp = [Date.now()];
    bufferContext.drawImage(videoElement, 0, 0, bufferCanvas.width, bufferCanvas.height);
    timestamp.push(Date.now());
    const base64 = bufferCanvas.toDataURL('image/jpeg', 0.3);
    timestamp.push(Date.now());
    
    if (base64.length <= 5000) return;
    
    const imageData = base64.split(',')[1];
    timestamp.push(Date.now());
    const compressedData = pako.deflate(imageData, { level: 9 });
    timestamp.push(Date.now());
  
    videoInfo.sequence++;
    // bufferQueue.push(videoInfo.sequence, base64);
    // console.log(checkFrameTime(timestamp, Date.now()));
    socket.io.emit('client:preprocess:stream', { sequence: videoInfo.sequence, frame: compressedData, timestamp: timestamp[0], inputSize: compressedData.length });
}


const loadVideo = async () => {
    if (flag) return;
    
    flag = true;
  
    videoInfo.sequence = 0;
    videoInfo.startedAt = Date.now();
    videoInfo.fps = [];
    for (const key in videoInfo.latency) {
      videoInfo.latency[key] = [];
    }

    const constraints = {
        video: {
            deviceId: selectedCamera === 'default' ? selectedCamera : { exact: selectedCamera },
            width: { exact: 640 },
            height: { exact: 480 },
            frameRate: { ideal: fixedFPS, max: fixedFPS }
        }
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
            videoElement.srcObject = stream;
            videoElement.play();
    
            const cameraInterval = setInterval(() => {
                if (!flag) return clearInterval(cameraInterval);
                handleFrame();
            }, 1000 / fixedFPS);
        })
        .catch((error) => {
            if (error instanceof OverconstrainedError && error.constraint === 'deviceId') {
                alert('카메라 정보가 올바르지 않습니다.\n카메라가 존재하지 않거나, 장치를 찾을 수 없습니다.');
            } else {
                alert('알 수 없는 오류입니다.\n미디어 장치 오류일 가능성이 있습니다.');
            }
            window.location.href = '/';
        })
  };

const stopVideo = () => {
    if (!flag) return;
  
    flag = false;
  
    videoElement.srcObject.getTracks()[0].stop();
    videoElement.srcObject = null;
 
    if (!videoInfo.fps.length) return;

    axios.post(`${socket.host}/latency/slack`, {
        startedAt: videoInfo.startedAt,
        totalLatency: Date.now() - videoInfo.startedAt,
        fixedFps: fixedFPS,
        fpsList: videoInfo.fps,
        latencyInfo: {
            input: videoInfo.latency.input,
            grpc: videoInfo.latency.grpc,
            inference: videoInfo.latency.inference,
            output: videoInfo.latency.output,
            client: videoInfo.latency.client,
        },
        dataSizeInfo: {
            input: videoInfo.dataSize.input,
            output: videoInfo.dataSize.output,
        }
    })
  
};

const checkLatency = (step, dataSize, fps, endedAt) => {
    videoInfo.latency.input.push(step[0]);
    videoInfo.latency.grpc.push(step[1]);
    videoInfo.latency.inference.push(step[2]);
    videoInfo.latency.output.push(step[3]);
    videoInfo.latency.client.push(step[4]);
    videoInfo.dataSize.input.push(dataSize[0]);
    videoInfo.dataSize.output.push(dataSize[1]);
    videoInfo.fps.push(fps);
}

const streamPreProcessOn = () => {
    socket.io.on('server:preprocess:connection', () => {});
  
    socket.io.on('server:preprocess:error', (message) => {
      window.location.href = '/entrypoint';
      alert(message);
    });

    socket.io.on('server:postprocess:stream', (data) => {
        const dataSize = data.byteLength;
        console.log(dataSize, data)
        const clientTime = Date.now();
        const unPackedData = JSON.parse(new TextDecoder().decode(pako.ungzip(data)));
        console.log(clientTime - unPackedData.startedAt);
        unPackedData.step.push(clientTime - unPackedData.timestamp[unPackedData.timestamp.length - 1]);
        unPackedData.timestamp.push(clientTime);
        unPackedData.dataSize.push(dataSize);
        checkLatency(unPackedData.step, unPackedData.dataSize, unPackedData.fps);
        // console.log(unPackedData);
    
        // const base64Data = bufferQueue.pop(unPackedData.sequence);
        const results = unPackedData.result;
        const fps = unPackedData.fps;
        const latency = clientTime - unPackedData.startedAt;
        const log = document.getElementById('latency-log');

        log.innerHTML = `${fps}fps, ${latency}ms`;

        drawResults(results);
        animateVRM(currentVrm, results);
    })
};

const changeCamera = (event) => {
    const camera = event.target;
    selectedCamera = camera.options[camera.selectedIndex].value;
}

const connectStreamPreProcess = () => {
    socket.io = io(socket.host, { path: '/preprocess', extraHeaders: { sessionId } });
    streamPreProcessOn();
};
  
export const initialHostSetting = async () => {
    const cameras = (await navigator.mediaDevices.enumerateDevices()).filter(device => device.kind === 'videoinput');
    const select = document.getElementById('camera-select');
    
    cameras.forEach((camera) => {
        if (!camera.deviceId) return;
        const option = document.createElement('option');
        option.value = camera.deviceId;
        option.innerHTML = camera.label;
        select.appendChild(option);
    })

    if (!select.childNodes.length) {
        const option = document.createElement('option');
        option.value = 'default'
        option.innerHTML = '기본 카메라 선택됨';
        select.appendChild(option);
        select.setAttribute('disabled', 'true');
    }

    selectedCamera = select.options[0].value;
    
    socket.host = `https://goodganglabs.xyz`;
    connectStreamPreProcess();
};

document.getElementById('button-start').addEventListener('click', loadVideo);
document.getElementById('button-stop').addEventListener('click', stopVideo);
document.getElementById('camera-select').addEventListener('change', changeCamera);