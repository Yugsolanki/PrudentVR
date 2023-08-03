import * as THREE from "three";

class Helpers {

  /**
   * Get the radius of each wood layer
   * @param {Number} woodLayersCount number of layers to wood
   * @param {Number} startRadius radius of the first wood layer
   * @returns array of radius of each wood layer
   */
  getLayersRadius(woodLayersCount = 15, startRadius = 5) {
    const woodLayersRadius = [startRadius];
    const Dx = woodLayersRadius[0] / woodLayersCount;
    for (let i = 1; i < woodLayersCount; i++) {
      woodLayersRadius[i] = woodLayersRadius[i - 1] - Dx;
    }
    return woodLayersRadius;
  }

  /**
   * Get Collision and Depth of chisel and bounding box of wood layer
   * @param {THREE.Mesh} chisel  chisel mesh
   * @param {THREE.Mesh} boundingBox  bounding box of wood layer
   * @returns  [collision, distance, depth] collision is a boolean, distance is the distance between the chisel and bounding box, depth is the depth of the chisel in the wood layer
   */
  getCollisionAndDepth(chisel, boundingBox) {
    const height = chisel.geometry.parameters.height;
    const position = chisel.position.clone();
    const chiselTop = new THREE.Vector3(
      position.x,
      position.y + height / 2,
      position.z
    );

    const position2 = boundingBox.position.clone();

    const comparision = 5.1;
    let depth = 0;
    let distance = position2.y - chiselTop.y;

    if (distance <= comparision) {
      depth = comparision - distance;
      return [true, distance, depth];
    }

    return [false, distance, depth];
  }


  /**
   * Get the segments of the wood layer that are in contact with the chisel
   * @param {Array<THREE.Mesh>} segments array of wood layer segments
   * @param {THREE.Mesh} chisel chisel mesh
   * @returns [startSegmentIndex, endSegmentIndex] startSegmentIndex is the index of the first segment in contact with the chisel, endSegmentIndex is the index of the last segment in contact with the chisel
   */
  getSegments(segments, chisel) {
    const [topLeftVertex, topRightVertex, bottomLeftVertex, bottomRightVertex] = this.getCylinderEndVertices(chisel);

    let topLeft = new THREE.Vector3(topLeftVertex[0],topLeftVertex[1],topLeftVertex[2]);
    let topRight = new THREE.Vector3(topRightVertex[0],topRightVertex[1],topRightVertex[2]);

    let startSegmentIndex = 0, endSegmentIndex = 0;
    const comparision = 0.050;

    for (let [index, segment] of segments.entries()) {
      const distance = this.getDistanceBetweenTwoPoints(segment.position,topLeft);
      if (distance <= comparision) {
        startSegmentIndex = index;
        break;
      }
    }

    for (let i = segments.length - 1; i >= 0; i--) {
      const distance = this.getDistanceBetweenTwoPoints(segments[i].position,topRight);
      if (distance <= comparision) {
        endSegmentIndex = i;
        break;
      }
    }

    return [startSegmentIndex, endSegmentIndex];
  }

  /**
   * Get the vertices of the cylinder mesh 
   * @param {THREE.Mesh} cylinder cylinder mesh
   * @returns array of vertices of the cylinder mesh, each vertex is an array of x,y,z coordinates
   */
  getCylinderEndVertices = (cylinder) => {
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

  /**
   * Gets you the distance between two Three.Vector3 points
   * @param {THREE.Vector3} point1  first point as a Three.Vector3
   * @param {THREE.Vector3} point2  second point as a Three.Vector3
   * @returns distance between two points as a Number 
   */
  getDistanceBetweenTwoPoints(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    const dz = point1.z - point2.z;
    
    const distance = Math.abs(dx * dx)  + Math.abs(dz * dz);
    return distance;
  }

  /**
   * Get the color of each wood layer
   * @param {Number} numShades number of shades of brown
   * @returns array of colors of each wood layer
   */
  generateShadesOfBrown(numShades) {
    const shades = [];
    const baseHue = 30; // Brown hue in HSL color model
    for (let i = 1; i <= numShades; i++) {
      const lightness = (100 / numShades) * i;
      const color = `hsl(${baseHue}, 100%, ${lightness}%)`;
      shades.push(color);
    }
    return shades;
  }

}

export default Helpers;