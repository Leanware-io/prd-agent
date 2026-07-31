const THREE = {
  AdditiveBlending: "additive",

  BufferAttribute: jest.fn(),

  BufferGeometry: jest.fn().mockImplementation(() => ({
    setAttribute: jest.fn(),
  })),

  Group: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    remove: jest.fn(),
    rotation: { x: 0, y: 0 },
  })),

  Line: jest.fn(),

  LineBasicMaterial: jest.fn(),

  PerspectiveCamera: jest.fn().mockImplementation(() => ({
    aspect: 1,
    position: { z: 0 },
    updateProjectionMatrix: jest.fn(),
  })),

  Points: jest.fn(),

  PointsMaterial: jest.fn().mockImplementation(() => ({
    size: 0,
  })),

  Scene: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    remove: jest.fn(),
  })),

  WebGLRenderer: jest.fn().mockImplementation(() => ({
    domElement: document.createElement("div"),
    render: jest.fn(),
    setClearColor: jest.fn(),
    setSize: jest.fn(),
  })),
};

module.exports = THREE;
