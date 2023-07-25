import * as THREE from "three";

class Helpers {

  /**
   * Gives a array of radiuses that layers of the wood will have.
   * @param {Number} woodLayersCount Number of layers of the wood
   * @param {Number} startRadius Radius of the first/outer layer of the wood
   * @returns Array of radiuses
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
   * Gives if chisel and bounding box are intersecting
   * @param {THREE.Mesh} chisel
   * @param {THREE.Mesh} boundingBox
   * @returns
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
   * Gets you the wood segments between the top left vertex and the top right vertex of the chisel which needs to be deleted
   * @param {Array<THREE.Mesh>} segments
   * @param {THREE.Mesh} chisel
   * @returns starting segment and ending segment number which need to be deleted
   */
  getSegments(segments, chisel) {
    const [topLeftVertex, topRightVertex, bottomLeftVertex, bottomRightVertex] = this.getCylinderEndVertices(chisel);

    let topLeft = new THREE.Vector3(topLeftVertex[0],topLeftVertex[1],topLeftVertex[2]);
    let topRight = new THREE.Vector3(topRightVertex[0],topRightVertex[1],topRightVertex[2]);

    let startSegmentIndex = 0, endSegmentIndex = 0;
    const comparision = 0.1;

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
   * Gives the end vertices of a cylinder
   * @param {THREE.Mesh} cylinder 
   * @returns Position of 4 visible vertices of the cylinder
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
   * @param {THREE.Vector3} point1 
   * @param {THREE.Vector3} point2 
   * @returns distance between two points
   */
  getDistanceBetweenTwoPoints(point1, point2) {
    const dx = point1.x - point2.x;
    // const dy = point1.y - point2.y;
    const dz = point1.z - point2.z;
    
    const distance = Math.abs(dx * dx)  + Math.abs(dz * dz);
    return distance;
  }

  /**
   * Generates an array of hsl values with of shades of brown going from dark to light
   * @param {Number} numShades 
   * @returns array of hsl values
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