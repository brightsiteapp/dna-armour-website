import * as THREE from './assets/vendor/three.module.js';

// Real revolved geometry. Proportions follow the reference, not manufacturing dimensions.
export async function createBottleViewer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 60);
  camera.position.set(0, .7, 11.8);
  camera.lookAt(0, .15, 0);
  const bottle = new THREE.Group();
  // Widen the complete circular footprint equally on X and Z. Scaling only X
  // makes the bottle elliptical when it rotates to a side view.
  bottle.scale.set(1.2, 1, 1.2);
  scene.add(bottle);
  scene.add(new THREE.AmbientLight(0xffffff, .55));
  const key = new THREE.DirectionalLight(0xffffff, 2.5);
  key.position.set(-4, 6, 5); scene.add(key);
  const fill = new THREE.DirectionalLight(0xe2f4ff, .7);
  fill.position.set(4, 1, 3); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 2);
  rim.position.set(3, 5, -3); scene.add(rim);
  const plastic = new THREE.MeshPhysicalMaterial({ color: 0xf4f5f4, roughness: .3, metalness: 0, clearcoat: .22, clearcoatRoughness: .36 });
  const capPlastic = new THREE.MeshStandardMaterial({ color: 0xf5f5f3, roughness: .43 });
  const groove = new THREE.MeshStandardMaterial({ color: 0xcbd0ce, roughness: .55 });
  function lathe(points, material) {
    const curve = new THREE.SplineCurve(points.map(([r, y]) => new THREE.Vector2(r, y)));
    const mesh = new THREE.Mesh(new THREE.LatheGeometry(curve.getPoints(points.length * 5), 160), material);
    bottle.add(mesh); return mesh;
  }
  lathe([[0,-2.16],[.55,-2.16],[.84,-2.14],[.96,-2.08],[1,-1.97],[1,-1.78],
    [1,-1.4],[1,-.5],[1,.4],[1,.85],[.99,1.02],[.94,1.2],[.83,1.36],
    [.75,1.43],[.73,1.53],[.73,1.65],[.7,1.7],[0,1.7]], plastic);
  function cylinder(radius, height, y, material) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,128),material);
    mesh.position.y=y; bottle.add(mesh); return mesh;
  }
  cylinder(.755,.08,1.56,groove);
  cylinder(.8,.075,1.65,capPlastic);
  lathe([[0,1.72],[.74,1.72],[.8,1.74],[.817,1.79],[.817,2.31],[.805,2.37],[.77,2.4],[.55,2.41],[0,2.41]],capPlastic);
  const ribs = new THREE.InstancedMesh(new THREE.CylinderGeometry(.0085,.0085,.54,6),capPlastic,144);
  const matrix = new THREE.Matrix4();
  for(let i=0;i<144;i++) {
    const theta=i/144*Math.PI*2;
    matrix.makeTranslation(Math.sin(theta)*.82,2.055,Math.cos(theta)*.82);
    ribs.setMatrixAt(i,matrix);
  }
  bottle.add(ribs);
  const texture = await new THREE.TextureLoader().loadAsync('./assets/dna-label-texture.png');
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(),8);
  // Preserve the artwork's cyan while shading the cylindrical edges. Filmic tone
  // mapping used for the white plastic otherwise washes out the printed blue.
  const labelMaterial = new THREE.ShaderMaterial({
    uniforms: { artwork: { value: texture } },
    vertexShader: `varying vec2 labelUV; varying vec3 labelNormal;
      void main(){labelUV=uv; labelNormal=normalize(normalMatrix*normal);
      gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `uniform sampler2D artwork; varying vec2 labelUV; varying vec3 labelNormal;
      void main(){vec4 printed=texture2D(artwork,labelUV);
      float shade=0.60+0.40*pow(max(normalize(labelNormal).z,0.0),0.65);
      gl_FragColor=vec4(printed.rgb*shade,1.0);
      #include <colorspace_fragment>
      }`,
    toneMapped: false,
  });
  const label = new THREE.Mesh(new THREE.CylinderGeometry(1.003,1.003,2.45,192,1,true),labelMaterial);
  label.position.y=-.39; bottle.add(label);
  let progress=0;
  let lastRotY=null;
  const angles=[-.445*Math.PI*2,-.16*Math.PI*2,.205*Math.PI*2];
  function pose(p) {
    const segment=Math.min(1,Math.floor(p));
    // Begin turning with the first scroll input so the label and copy move as one.
    const t=THREE.MathUtils.clamp(p-segment,0,1);
    bottle.rotation.y=THREE.MathUtils.lerp(angles[segment],angles[segment+1],t);
    bottle.rotation.z=-.025+Math.sin(p*Math.PI)*.018;
  }
  function render(){renderer.render(scene,camera);}
  function resize(){
    const {width,height}=canvas.getBoundingClientRect();
    if(!width||!height)return;
    renderer.setSize(width,height,false);
    camera.aspect=width/height;
    camera.position.z=camera.aspect<.65?13:10.4;
    camera.updateProjectionMatrix(); render();
  }
  const observer=new ResizeObserver(resize);observer.observe(canvas.parentElement);
  pose(0);resize();
  canvas.closest('.product-stage').dataset.renderer='webgl';
  const fallback=canvas.parentElement.querySelector('.bottle-fallback');
  if(fallback){fallback.style.transition='opacity .5s ease';fallback.style.opacity='0';setTimeout(()=>{fallback.hidden=true;},520);}
  canvas.addEventListener('webglcontextlost',(event)=>{
    event.preventDefault();canvas.hidden=true;
    if(fallback){fallback.style.transition='none';fallback.style.opacity='1';fallback.hidden=false;}
  });
  return {
    setProgress(p,reduced=false){progress=reduced?0:p;pose(progress);if(bottle.rotation.y!==lastRotY){render();lastRotY=bottle.rotation.y;}canvas.dataset.rotation=bottle.rotation.y.toFixed(5);},
    snapshot(){const previous=progress;pose(0);render();const image=canvas.toDataURL('image/png');pose(previous);render();return image;},
    info(){return {rotation:bottle.rotation.y,meshes:bottle.children.length,triangles:renderer.info.render.triangles,texture:'DNA Label.pdf'};},
  };
}
