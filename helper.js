import * as THREE from "three";

/**
 * Check if two cylinders are intersecting
 * @param {THREE.Mesh} mesh1
 * @param {THREE.Mesh} mesh2
 * @returns {boolean}
 * @private
 */
export const checkIntersectionBetweenCylinder = (mesh1, mesh2) => {
  let position1 = mesh1.position;
  let position2 = mesh2.position;

  let distance = position1.manhattanDistanceTo(position2);
  console.log(distance);
  let diamter = 10;

  return distance <= diamter;
};

export const checkIntersectingSegments = (segments, mesh) => {
  for (let [index, segment] of segments.entries()) {
    let position1 = segment.position;
    let position2 = mesh.position;

    const dx = position2.x - position1.x;
    const dy = position2.y - position1.y;
    const dz = position2.z - position1.z;

    // const distance = Math.abs(dx * dx) + Math.abs(dy * dy) + Math.abs(dz * dz);
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    // let distance = position1.distanceTo(position2);
    if (distance <= 10) {
      return [true, index];
    }
  }
  return [false, null];
};

export const checkIntersectionWithBoundingBox = (boundingBox, mesh) => {
  const cylinderPosition = mesh.position;
  const boundingBoxCenter = new THREE.Vector3();
  boundingBox.getCenter(boundingBoxCenter);
  const distance = cylinderPosition.distanceTo(boundingBoxCenter);

  const radius = boundingBox.getSize(new THREE.Vector3()).x / 2;
  return distance <= radius;
};

/**
 * Render a wooden object
 * @private
 * @returns {void}
 */
export const renderWood = (scene) => {
  let y = -10;
  let segmentCount = 100;
  let widthOfEachSegment = 20 / segmentCount;
  let segments = [];
  for (let i = 0; i < segmentCount; i++) {
    let geometry = new THREE.CylinderGeometry(5, 5, widthOfEachSegment);
    let material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
    });
    let cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.set(y, 0, 0);
    cylinder.rotation.z = Math.PI / 2;
    scene.add(cylinder);
    y += widthOfEachSegment;
    segments.push(cylinder);
  }
  return segments;
};

/**
 * Render a cylinder using THREE.BufferGeometry()
 * @private
 * @returns {void}
 * @see https://threejs.org/docs/#api/en/core/BufferGeometry
 * @see https://threejs.org/docs/#api/en/core/BufferAttribute
 */
export const renderBufferGeometryCylinder = () => {
  const radiusTop = 5;
  const radiusBottom = 5;
  const height = 20;
  const radialSegments = 32;
  const heightSegments = 1;
  const openEnded = false;

  const geometry = new THREE.BufferGeometry();

  const vertexCount = (radialSegments + 1) * (heightSegments + 1);
  const indexCount = radialSegments * heightSegments * 2 * 3;

  const positions = new Float32Array(vertexCount * 3);
  const indices = new Uint32Array(indexCount);

  const positionAttribute = new THREE.BufferAttribute(positions, 3);
  const indexAttribute = new THREE.BufferAttribute(indices, 1);

  geometry.setAttribute("position", positionAttribute);
  geometry.setIndex(indexAttribute);

  let positionIndex = 0;
  let index = 0;

  for (let y = 0; y <= heightSegments; y++) {
    const v = y / heightSegments;
    const radius = v * (radiusBottom - radiusTop) + radiusTop;

    for (let x = 0; x <= radialSegments; x++) {
      const u = x / radialSegments;
      const theta = u * Math.PI * 2;

      const xPos = radius * Math.cos(theta);
      const yPos = -height / 2 + v * height;
      const zPos = radius * Math.sin(theta);

      positions[positionIndex++] = xPos;
      positions[positionIndex++] = yPos;
      positions[positionIndex++] = zPos;

      if (x < radialSegments && y < heightSegments) {
        const i = x + y * (radialSegments + 1);

        indices[index++] = i;
        indices[index++] = i + 1;
        indices[index++] = i + radialSegments + 1;

        indices[index++] = i + radialSegments + 1;
        indices[index++] = i + 1;
        indices[index++] = i + radialSegments + 2;
      }
    }
  }

  const material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    wireframe: true,
  });
  const cylinder = new THREE.Mesh(geometry, material);

  scene.add(cylinder);

  console.log(cylinder.geometry.attributes.position.array);
};

export const getCylinderEndVertices = (cylinder) => {
  const position = cylinder.position.clone();
  const height = cylinder.geometry.parameters.height;
  const rotation = cylinder.rotation;
  const radius = cylinder.geometry.parameters.radiusTop;

  const topVertex = new THREE.Vector3(0, height / 2, 0)
    .applyEuler(rotation)
    .add(position);
  const bottomVertex = new THREE.Vector3(0, -height / 2, 0)
    .applyEuler(rotation)
    .add(position);

  const vertices = [
    [topVertex.x - radius, topVertex.y, topVertex.z],
    [topVertex.x + radius, topVertex.y, topVertex.z],
    [bottomVertex.x - radius, bottomVertex.y, bottomVertex.z],
    [bottomVertex.x + radius, bottomVertex.y, bottomVertex.z],
  ];

  return vertices;
};

export const deleteSegmentsBetweenVertices = (segments, vertices) => {
  //   let [topVertex1, topVertex2, bottomVertex1, bottomVertex2] = vertices;
  let [topVertex, bottomVertex] = [vertices[0], vertices[1]];

  let topVertex1 = new THREE.Vector3(...topVertex);
  let topVertex2 = new THREE.Vector3(...topVertex);
  let bottomVertex1 = new THREE.Vector3(...bottomVertex);
  let bottomVertex2 = new THREE.Vector3(...bottomVertex);

  topVertex1.x -= 5;
  topVertex2.x += 5;
  bottomVertex1.x -= 5;
  bottomVertex2.x += 5;

  let topSegmentIndex = null;
  let bottomSegmentIndex = null;

  for (let [index, segment] of segments.entries()) {
    let position1 = segment.position;
    let position2 = topVertex1;

    const dx = position2.x - position1.x;
    const dy = position2.y - position1.y;
    const dz = position2.z - position1.z;

    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    // let distance = position1.distanceTo(position2);
    if (distance <= 10) {
      topSegmentIndex = index;
      break;
    }
  }

  for (let [index, segment] of segments.entries()) {
    let position1 = segment.position;
    let position2 = topVertex2;

    const dx = position2.x - position1.x;
    const dy = position2.y - position1.y;
    const dz = position2.z - position1.z;

    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    // let distance = position1.distanceTo(position2);
    if (distance <= 10) {
      topSegmentIndex = index;
      break;
    }
  }

  for (let [index, segment] of segments.entries()) {
    let position1 = segment.position;
    let position2 = bottomVertex1;

    const dx = position2.x - position1.x;
    const dy = position2.y - position1.y;
    const dz = position2.z - position1.z;

    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    // let distance = position1.distanceTo(position2);
    if (distance <= 10) {
      bottomSegmentIndex = index;
      break;
    }
  }

  for (let [index, segment] of segments.entries()) {
    let position1 = segment.position;
    let position2 = bottomVertex2;

    const dx = position2.x - position1.x;
    const dy = position2.y - position1.y;
    const dz = position2.z - position1.z;

    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distance <= 10) {
      bottomSegmentIndex = index;
      break;
    }
  }

  if (topSegmentIndex !== null && bottomSegmentIndex !== null) {
    segments.splice(topSegmentIndex, bottomSegmentIndex - topSegmentIndex);
  }

  return segments;
};

export const temp = (segments, vertices) => {
  const [topLeftVertex, topRightVertex, bottomLeftVertex, bottomRightVertex] =
    vertices;

  let topSegmentIndex = null;
  let bottomSegmentIndex = null;

  for (let [index, segment] of segments.entries()) {
    let position1 = segment.position;
    let position2 = topLeftVertex;

    const dx = position2.x - position1.x;
    const dy = position2.y - position1.y;
    const dz = position2.z - position1.z;

    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    // const distance = Math.abs(dx * dx) + Math.abs(dy * dy) + Math.abs(dz * dz);

    // let distance = position1.distanceTo(position2);
    if (distance <= 0.5) {
      topSegmentIndex = index;
      break;
    }
  }

  for (let [index, segment] of segments.entries()) {
    let position1 = segment.position;
    let position2 = topRightVertex;

    const dx = position2.x - position1.x;
    const dy = position2.y - position1.y;
    const dz = position2.z - position1.z;

    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    // const distance = Math.abs(dx * dx) + Math.abs(dy * dy) + Math.abs(dz * dz);

    // let distance = position1.distanceTo(position2);
    if (distance <= 0.5) {
      topSegmentIndex = index;
      break;
    }
  }

  for (let [index, segment] of segments.entries()) {
    let position1 = segment.position;
    let position2 = bottomLeftVertex;

    const dx = position2.x - position1.x;
    const dy = position2.y - position1.y;
    const dz = position2.z - position1.z;

    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    // const distance = Math.abs(dx * dx) + Math.abs(dy * dy) + Math.abs(dz * dz);
    // let distance = position1.distanceTo(position2);
    if (distance <= 0.5) {
      bottomSegmentIndex = index;
      break;
    }
  }

  for (let [index, segment] of segments.entries()) {
    let position1 = segment.position;
    let position2 = bottomRightVertex;

    const dx = position2.x - position1.x;
    const dy = position2.y - position1.y;
    const dz = position2.z - position1.z;

    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    // const distance = Math.abs(dx * dx) + Math.abs(dy * dy) + Math.abs(dz * dz);

    if (distance <= 0.5) {
      bottomSegmentIndex = index;
      break;
    }
  }

  if (topSegmentIndex !== null && bottomSegmentIndex !== null) {
    segments.splice(topSegmentIndex, bottomSegmentIndex - topSegmentIndex + 1);
  }
  // console.log(segments);
  return segments;
};

export const getSegments = (segments, vertices) => {
  const [topLeftVertex, topRightVertex, bottomLeftVertex, bottomRightVertex] = vertices;
  let topLeft = new THREE.Vector3(topLeftVertex[0], topLeftVertex[1], topLeftVertex[2]);
  let newSegments = [];

  let startSegmentIndex = null;
  let endSegmentIndex = null;

  // Find the segment closest to the top left vertex
  for (let [index, segment] of segments.entries()) {
    const position = segment.position;
    const dx = position.x - topLeft.x;
    const dy = position.y - topLeft.y-5;
    const dz = position.z - topLeft.z;

    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distance <= 0.1) {
      startSegmentIndex = index;
      break;
    }
  }

  // // Find the end segment based on width calculations
  const totalSegments = segments.length;
  const widthOfEachSegment = 20 / totalSegments;
  let start = 0;

  for (let i = startSegmentIndex; i < segments.length; i++) {
    const segment = segments[i];
    const end = start + widthOfEachSegment;

    if (end >= 2) {
  		endSegmentIndex = i;
  		break;
    }
    start += widthOfEachSegment;
  }

  // // Copy the selected segments to the newSegments array
  
  return [startSegmentIndex, endSegmentIndex+1];
};
