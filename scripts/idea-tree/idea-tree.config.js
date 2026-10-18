export const IDEA_TREE_QUALITY = {
  low: {
    enableRopeMotion: false,
    enableFrameHover: true,
    enableShadows: false,
    ropeMotionDistance: 6,
    frameCount: 8
  },
  medium: {
    enableRopeMotion: true,
    enableFrameHover: true,
    enableShadows: true,
    ropeMotionDistance: 8,
    frameCount: 10
  },
  high: {
    enableRopeMotion: true,
    enableFrameHover: true,
    enableShadows: true,
    ropeMotionDistance: 10,
    frameCount: 12
  }
};

export const IDEA_TREE_CONFIG = {
  assetMode: "art-blockout",
  assetUrl: "./assets/models/idea-tree/idea-tree-placeholder.glb",
  validationAssetUrl: "./assets/models/idea-tree/idea-tree-validation.glb",
  artBlockoutAssetUrl: "./assets/models/idea-tree/idea-tree-art-blockout.glb",
  productionAssetUrl: "./assets/models/idea-tree/idea-tree-production.glb",
  scale: 1,
  quality: "medium",
  maxPixelRatio: 1.75,
  enableFrameHover: true,
  enableRopeMotion: true,
  debug: {
    enabled: false,
    showAnchorAxes: false,
    showAnchorLabels: false,
    showBoundingBox: false,
    showFrameHotspots: false,
    logMissingAnchors: true,
    logStats: false,
    enableInArtBlockout: false
  },
  ropeMotionDistance: 8,
  foliageQuality: "medium",
  textureQuality: "medium",
  shadowMode: "tree-mass",
  validation: {
    enableShadowAudit: true,
    enableTransformAudit: true,
    showNotFinalLabelOnProductionFallback: true,
    runLifecycleCheck: false
  },
  frameImageFallback: "./image/placeholder.jpg",
  expectedNodes: {
    root: "IdeaTreeRoot",
    static: "TreeStatic",
    trunk: "Trunk",
    branches: "MainBranches",
    roots: "ButtressRoots",
    foliage: "Foliage",
    frameAnchors: "FrameAnchors",
    hangingSystem: "HangingSystem",
    ideaFrames: "IdeaFrames",
    hotspots: "InteractionHotspots"
  }
};

export const IDEA_TREE_PLACEMENT = {
  wallOffset: 0.68,
  widthInset: 0.45,
  heightRatio: 0.82,
  centerYRatio: 0.48
};

export const IDEA_TREE_NICHE = {
  width: 15.2,
  height: 11.0,
  depth: 1.8,
  baseHeight: 0.4,
  frameThickness: 0.24,
  cornerRadius: 0.12,
  backOffset: 0.08,
  debug: {
    showBounds: false
  }
};
