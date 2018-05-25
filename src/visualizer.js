/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import ThreeControls from './three-controls'
import './three-layout'

import * as THREE from 'three'

import Component3d from './component-3d'

// import OBJExporter from 'three-obj-exporter'

import {
  Component,
  Container,
  Layout,
  Layer,
  ScriptLoader,
  error,
  FPS
} from '@hatiolab/things-scene'

import "imports-loader?THREE=three!three/examples/js/loaders/OBJLoader.js";
import "imports-loader?THREE=three!three/examples/js/loaders/MTLLoader.js";
import "imports-loader?THREE=three!three/examples/js/loaders/TGALoader.js";

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'number',
    label: 'fov',
    name: 'fov',
    property: 'fov'
  }, {
    type: 'number',
    label: 'near',
    name: 'near',
    property: 'near'
  }, {
    type: 'number',
    label: 'far',
    name: 'far',
    property: 'far'
  }, {
    type: 'number',
    label: 'zoom',
    name: 'zoom',
    property: 'zoom'
  }, {
    type: 'select',
    label: 'precision',
    name: 'precision',
    property: {
      options: [{
        display: 'High',
        value: 'highp'
      }, {
        display: 'Medium',
        value: 'mediump'
      }, {
        display: 'Low',
        value: 'lowp'
      }]
    }
  }, {
    type: 'checkbox',
    label: 'anti-alias',
    name: 'antialias',
    property: 'antialias'
  }, {
    type: 'checkbox',
    label: 'auto-rotate',
    name: 'autoRotate',
    property: 'autoRotate'
  }, {
    type: 'checkbox',
    label: 'show-axis',
    name: 'showAxis',
    property: 'showAxis'
  }, {
    type: 'checkbox',
    label: '3dmode',
    name: 'threed',
    property: 'threed'
  }, {
    type: 'checkbox',
    label: 'debug',
    name: 'debug',
    property: 'threed'
  }, {
    type: 'string',
    label: 'location-field',
    name: 'locationField'
  }, {
    type: 'string',
    label: 'popup-scene',
    name: 'popupScene'
  }, {
    type: 'string',
    label: 'legend-target',
    name: 'legendTarget'
  }, {
    type: 'number',
    label: 'rotation-speed',
    name: 'rotationSpeed'
  }, {
    type: 'checkbox',
    label: 'hide-empty-stock',
    name: 'hideEmptyStock'
  }]
}

const WEBGL_NO_SUPPORT_TEXT = 'WebGL no support'

function registerLoaders() {
  if (!registerLoaders.done) {
    THREE.Loader.Handlers.add(/\.tga$/i, new THREE.TGALoader());
    registerLoaders.done = true
  }
}

var progress;

function createProgressbar(targetEl) {
  if (progress)
    return;

  progress = document.createElement('div');

  targetEl = targetEl || document.body;

  progress.style.width = `200px`;
  progress.style.height = `20px`;
  progress.style.border = '2px solid #000';
  progress.style.position = 'absolute';
  progress.style.marginLeft = '-100px';
  progress.style.left = '50%';
  progress.style.marginTop = '-10px';
  progress.style.top = '50%';
  progress.style.fontSize = '12px'
  progress.style.color = '#ccc'
  progress.style.textAlign = 'center'
  progress.style.lineHeight = '20px'
  progress.innerText = 'Loading ...'

  progress.style.background = `linear-gradient(90deg, #000 0%, transparent)`

  targetEl.appendChild(progress);

  progress.hidden = (targetEl.clientWidth <= 200 || targetEl.clientHeight <= 20)

}

function showProgressbar(targetEl, loaded, total) {
  if (!progress)
    createProgressbar(targetEl);

  progress.style.background = `linear-gradient(90deg, #000 ${(loaded / total * 100)}%, transparent)`

}

function removeProgressBar(targetEl) {
  targetEl = targetEl || document.body;

  targetEl.removeChild(progress);

  progress.remove();

  progress = null;
}

export default class Visualizer extends Container {

  get legendTarget() {
    var { legendTarget } = this.model

    if (!this._legendTarget && legendTarget) {
      this._legendTarget = this.root.findById(legendTarget)
      this._legendTarget && this._legendTarget.on('change', this.onLegendTargetChanged, this)
    }

    return this._legendTarget
  }

  containable(component) {
    return component.is3dish()
  }

  putObject(id, object) {
    if (!this._objects)
      this._objects = {}

    this._objects[id] = object;
  }

  getObject(id) {
    if (!this._objects)
      this._objects = {}

    return this._objects[id]
  }

  added() {
    if (!this.app.isViewMode)
      return;

    var loadLoaders = () => {
      if (!THREE)
        return;

      // ScriptLoader.load(OBJLoader);
      // ScriptLoader.load(MTLLoader);
      // ScriptLoader.load(TGALoader);
    }

    if (!THREE) {
      ScriptLoader.load(three)
        .then(() => {
          THREE.Cache.enabled = true
          // require('./object-3d-overload');
          // ScriptLoader.load
          // loadLoaders();
        }, error)
    }
    //  else
    //   loadLoaders();
  }

  /* THREE Object related .. */

  createFloor(color, width, height) {

    let fillStyle = this.model.fillStyle

    var floorMaterial

    if (fillStyle.type == 'pattern' && fillStyle.image) {

      var floorTexture = this._textureLoader.load(this.app.url(fillStyle.image), texture => {
        texture.minFilter = THREE.LinearFilter

        texture.repeat.set(1, 1)
        this.render_threed()
      })

      var floorMaterial = [
        new THREE.MeshLambertMaterial({
          color: color
        }),
        new THREE.MeshLambertMaterial({
          color: color
        }),
        new THREE.MeshLambertMaterial({
          color: color
        }),
        new THREE.MeshLambertMaterial({
          color: color
        }),
        new THREE.MeshLambertMaterial({
          map: floorTexture
        }),
        new THREE.MeshLambertMaterial({
          color: color
        })
      ]
    } else {
      floorMaterial = new THREE.MeshLambertMaterial({
        color: color
      })
    }


    var floorGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial)

    floor.scale.set(width, height, 5);
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -2

    floor.name = 'floor'

    this._scene3d.add(floor)

    return floor
  }

  createObjects(components, canvasSize) {

    components.forEach(component => {
      var clazz = Component3d.register(component.model.type)
      if (!clazz) {
        console.warn(`Class not found : 3d ${component.model.type} class is not exist`);
        return;
      }

      var item = new clazz(component.hierarchy, canvasSize, this, component)
      if (item) {
        item.name = component.model.id;
        this._scene3d.add(item)
        this.putObject(component.model.id, item);
      }
    })
  }


  destroy_scene3d() {
    this.stop();

    window.removeEventListener('focus', this._onFocus);

    if (this._renderer)
      this._renderer.clear()
    delete this._renderer
    delete this._camera
    delete this._2dCamera
    delete this._keyboard
    delete this._controls
    delete this._projector
    delete this._load_manager
    delete this._objects

    if (this._scene3d) {
      let children = this._scene3d.children.slice();
      for (let i in children) {
        let child = children[i]
        if (child.dispose)
          child.dispose();
        if (child.geometry && child.geometry.dispose)
          child.geometry.dispose();
        if (child.material && child.material.dispose)
          child.material.dispose();
        if (child.texture && child.texture.dispose)
          child.texture.dispose();
        this._scene3d.remove(child)
      }
    }

    delete this._scene3d
  }

  init_scene3d() {

    this.trigger("visualizer-initialized", this)

    this.root.on('redraw', this.onredraw, this)

    if (this._scene3d)
      this.destroy_scene3d()

    // var self = this;

    // THREE.DefaultLoadingManager.onStart = function (item, loaded, total) {
    //   createProgressbar(self.root.target_element);
    //   self._loadComplete = false;
    // }

    // THREE.DefaultLoadingManager.onProgress = function (item, loaded, total) {
    //   var a = this;
    //   showProgressbar(self.root.target_element, loaded, total)
    // }
    // THREE.DefaultLoadingManager.onLoad = function (item, loaded, total) {
    //   removeProgressBar(self.root.target_element)
    //   self._loadComplete = true;
    // }

    // THREE.DefaultLoadingManager.onError = function (url) {
    //   console.warn('There was an error loading ' + url);
    // }

    registerLoaders()
    this._textureLoader = new THREE.TextureLoader(THREE.DefaultLoadingManager)
    this._textureLoader.withCredential = true
    this._textureLoader.crossOrigin = 'use-credentials'

    // this._exporter = new OBJExporter();

    var {
      width,
      height
    } = this.bounds

    var {
      fov = 45,
      near = 0.1,
      far = 20000,
      fillStyle = '#424b57',
      light = 0xffffff,
      antialias = true,
      precision = 'highp',
      legendTarget
    } = this.model


    var components = this.components || []

    // SCENE
    this._scene3d = new THREE.Scene()

    // CAMERA
    var aspect = width / height

    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far)

    this._scene3d.add(this._camera)
    this._camera.position.set(height * 0.8, Math.floor(Math.min(width, height)), width * 0.8)
    this._camera.lookAt(this._scene3d.position)
    this._camera.zoom = this.model.zoom * 0.01

    if (this.model.showAxis) {
      var axisHelper = new THREE.AxesHelper(width);
      this._scene3d.add(axisHelper);
    }

    try {
      // RENDERER
      this._renderer = new THREE.WebGLRenderer({
        precision: precision,
        alpha: true,
        antialias: antialias
      });

    } catch (e) {
      this._noSupportWebgl = true
    }

    if (this._noSupportWebgl)
      return

    this._renderer.autoClear = true
    this._renderer.setClearColor(0xffffff, 0) // transparent
    this._renderer.setSize(Math.min(width, window.innerWidth), Math.min(height, window.innerHeight))
    // this._renderer.setPixelRatio(window.devicePixelRatio)

    // CONTROLS
    this._controls = new ThreeControls(this._camera, this)
    this._controls.cameraChanged = true

    // LIGHT
    var _light = new THREE.HemisphereLight(light, 0x000000, 1)

    _light.position.set(-this._camera.position.x, this._camera.position.y, -this._camera.position.z)
    this._camera.add(_light)

    this._raycaster = new THREE.Raycaster()
    this._mouse = new THREE.Vector2()

    this._tick = 0
    this._clock = new THREE.Clock(true)
    this.mixers = new Array();

    this.createFloor(fillStyle, width, height)
    this.createObjects(components, {
      width,
      height
    })

    this._camera.updateProjectionMatrix();

    this._onFocus = function () {
      this.render_threed();
    }.bind(this)

    window.addEventListener('focus', this._onFocus);

    this.invalidate();
  }

  threed_animate() {
    if (!this._controls)
      return;

    this._controls.update()
    this.render_threed();

  }

  stop() {

  }

  get scene3d() {
    if (!this._scene3d)
      this.init_scene3d()
    return this._scene3d
  }

  render_threed() {
    if (this._renderer) {
      this._renderer.render(this._scene3d, this._camera)
    }
  }

  /* Container Overides .. */
  render(ctx) {
    if (this.app.isViewMode) {
      if (!this.model.threed)
        this.model.threed = true
    }

    if (this.model.threed && !this._noSupportWebgl) {
      return
    }

    super.render(ctx)

  }

  postrender(ctx) {
    var {
      left,
      top,
      debug,
      threed
    } = this.model

    var {
      width,
      height
    } = this.bounds

    // ios에서 width, height에 소수점이 있으면 3d를 표현하지 못하는 문제가 있어 정수화
    width = Math.floor(width);
    height = Math.floor(height);

    if (threed) {

      if (!this._scene3d) {
        this.init_scene3d()
        this.render_threed()
      }

      if (this._noSupportWebgl) {
        this._showWebglNoSupportText(ctx);
        return
      }

      if (this._dataChanged) {
        this._onDataChanged()
      }

      if (this._loadComplete === false)
        return;

      if (!this._renderer)
        return;

      var rendererSize = this._renderer.getSize();
      var {
        width: rendererWidth,
        height: rendererHeight
      } = rendererSize;

      ctx.drawImage(
        this._renderer.domElement, 0, 0, rendererWidth, rendererHeight,
        left, top, width, height
      )

      if (debug) {
        ctx.font = 100 + 'px Arial'
        ctx.textAlign = 'center'
        ctx.fillStyle = 'black'
        ctx.globalAlpha = 0.5
        ctx.fillText(FPS(), 100, 100)
        this.invalidate()
      }

    } else {
      super.postrender(ctx);
    }
  }

  dispose() {

    this._legendTarget && this._legendTarget.off('change', this.onLegendTargetChanged, this)
    delete this._legendTarget

    this.root.off('redraw', this.onredraw, this);

    this.destroy_scene3d()

    super.dispose();
  }

  get layout() {
    return Layout.get('three')
  }

  get nature() {
    return NATURE
  }

  getObjectByRaycast() {

    var intersects = this.getObjectsByRaycast()
    var intersected

    if (intersects.length > 0) {
      intersected = intersects[0].object
    }

    return intersected
  }

  getObjectsByRaycast() {
    // find intersections

    // create a Ray with origin at the mouse position
    //   and direction into the scene (camera direction)

    var vector = this._mouse
    if (!this._camera)
      return

    this._raycaster.setFromCamera(vector, this._camera)

    // create an array containing all objects in the scene with which the ray intersects
    var intersects = this._raycaster.intersectObjects(this._scene3d.children, true);

    return intersects
  }

  exportModel() {
    // var exported = this._exporter.parse(this._scene3d);
    // var blob = new Blob([exported], { type: "text/plain;charset=utf-8" });
    // console.log(exported)
    // saveAs(blob, "exported.txt");
  }

  _showWebglNoSupportText(context) {
    context.save();

    var {
      width,
      height
    } = this.model

    context.font = width / 20 + 'px Arial'
    context.textAlign = 'center'
    context.fillText(WEBGL_NO_SUPPORT_TEXT, width / 2 - width / 40, height / 2)

    context.restore();
  }

  resetMaterials() {
    if (!this._stock_materials)
      return;

    this._stock_materials.forEach(m => {
      if (m.dispose)
        m.dispose();
    })

    delete this._stock_materials
  }

  _onDataChanged() {

    var locationField = this.getState('locationField') || 'location';

    if (this._data) {
      if (this._data instanceof Array) {
        /**
         *  Array type data
         *  (e.g. data: [{
         *    'loc' : 'location1',
         *    'description': 'description1'
         *  },
         *  ...
         *  ])
         */

        this._data = this._data.reduce((acc, value, i, arr) => {
          var val = JSON.parse(JSON.stringify(value));
          var id = locationField;
          if (!val[id]) // Rack 데이터가 아니면
            id = "id";

          if (acc[value[id]]) {

            if (!acc[value[id]]["items"]) {
              var clone = JSON.parse(JSON.stringify(acc[value[id]]))
              acc[value[id]] = { items: [] }
              acc[value[id]]["items"].push(clone)
            }

          } else {
            acc[value[id]] = { items: [] };
          }

          acc[value[id]]["items"].push(val)

          return acc
        }, {})

        return this._onDataChanged();

        // this._data.forEach(d => {
        //   let data = d

        //   let loc = data[locationField];
        //   let object = this.getObject(loc)
        //   if (object) {
        //     object.userData = data;
        //     object.onUserDataChanged()
        //   }
        // })
      } else {
        /**
         *  Object type data
         *  (e.g. data: {
         *    'location1': {description: 'description'},
         *    ...
         *  })
         */
        for (var key in this._data) {
          let id = key
          if (this._data.hasOwnProperty(id)) {
            let d = this._data[id]
            let object = this.getObject(id)
            if (object) {
              object.userData = d;
              object.onUserDataChanged()

            }
          }
        }
      }
    }

    this._dataChanged = false

    this.invalidate();
  }

  /* Event Handlers */

  onLegendTargetChanged(after, before) {
    if (after.hasOwnProperty('status') && before.hasOwnProperty('status'))
      this.resetMaterials()
  }

  onchange(after, before) {

    if (before.hasOwnProperty('legendTarget') || after.hasOwnProperty('legendTarget')) {
      this._legendTarget && this._legendTarget.off('change', this.onLegendTargetChanged, this)
      delete this._legendTarget
      this.resetMaterials()
      this._onDataChanged()
    }

    if (after.hasOwnProperty('width') ||
      after.hasOwnProperty('height') ||
      after.hasOwnProperty('threed'))
      this.destroy_scene3d()

    if (after.hasOwnProperty('autoRotate')) {
      if (this._controls) {
        this._controls.doAutoRotate(after.autoRotate)
      }
    }

    if (after.hasOwnProperty('fov') ||
      after.hasOwnProperty('near') ||
      after.hasOwnProperty('far') ||
      after.hasOwnProperty('zoom')) {

      if (this._camera) {
        this._camera.near = this.model.near
        this._camera.far = this.model.far
        this._camera.zoom = this.model.zoom * 0.01
        this._camera.fov = this.model.fov
        this._camera.updateProjectionMatrix();

        this._controls.cameraChanged = true
      }

    }

    if (after.hasOwnProperty("data")) {
      if (this._data !== after.data) {
        this._data = after.data
        this._dataChanged = true
      }
    }

    this.invalidate()
  }

  onmousedown(e) {
    if (this._controls) {
      this._controls.onMouseDown(e)
    }
  }

  onmouseup(e) {
    if (this._controls) {
      if (this._lastFocused)
        this._lastFocused._focused = false;

      var modelLayer = Layer.register('model-layer')
      var popup = modelLayer.Popup;
      var ref = this.model.popupScene

      var pointer = this.transcoordC2S(e.offsetX, e.offsetY)

      this._mouse.x = ((pointer.x - this.model.left) / (this.model.width)) * 2 - 1;
      this._mouse.y = -((pointer.y - this.model.top) / this.model.height) * 2 + 1;

      var object = this.getObjectByRaycast()

      if (object && object.onmouseup) {
        if (ref)
          object.onmouseup(e, this, popup.show.bind(this, this, ref))

        object._focused = true;
        object._focusedAt = performance.now();
        this._lastFocused = object
      }
      else {
        popup.hide(this.root)
      }

      this.invalidate();
      e.stopPropagation()
    }

  }

  onmousemove(e) {
    if (this._controls) {
      var pointer = this.transcoordC2S(e.offsetX, e.offsetY);

      this._mouse.x = ((pointer.x - this.model.left) / (this.model.width)) * 2 - 1;
      this._mouse.y = -((pointer.y - this.model.top) / this.model.height) * 2 + 1;

      this._controls.onMouseMove(e);

      e.stopPropagation();
    }
  }

  onmouseleave(e) {
    if (!this._scene2d)
      return

    var tooltip = this._scene2d.getObjectByName('tooltip')
    if (tooltip) {
      this._scene2d.remove(tooltip)
    }
  }

  onwheel(e) {
    if (this._controls) {
      this.handleMouseWheel(e)
      e.stopPropagation()
    }
  }

  ondblclick(e) {
    if (this._controls) {
      this._controls.reset();
      e.stopPropagation()
    }
  }

  ondragstart(e) {
    if (this._controls) {
      var pointer = this.transcoordC2S(e.offsetX, e.offsetY)

      this._mouse.x = ((pointer.x - this.model.left) / (this.model.width)) * 2 - 1;
      this._mouse.y = -((pointer.y - this.model.top) / this.model.height) * 2 + 1;

      this._controls.onDragStart(e)
      e.stopPropagation()
    }
  }

  ondragmove(e) {
    if (this._controls) {
      this._controls.cameraChanged = true
      this._controls.onDragMove(e)
      e.stopPropagation()
    }
  }

  ondragend(e) {
    if (this._controls) {
      this._controls.cameraChanged = true
      this._controls.onDragEnd(e)
      e.stopPropagation()
    }
  }

  ontouchstart(e) {
    if (this._controls) {
      this._controls.onTouchStart(e)
      e.stopPropagation()
    }
  }

  onpan(e) {
    if (this._controls) {
      this._controls.cameraChanged = true
      this._controls.onTouchMove(e)
      e.stopPropagation()
    }
  }
  ontouchend(e) {
    if (this._controls) {
      this._controls.onTouchEnd(e)
      this.onmouseup(e);
      e.stopPropagation()
    }
  }

  onkeydown(e) {
    if (this._controls) {
      this._controls.onKeyDown(e)
      e.stopPropagation()
    }
  }

  onpinch(e) {
    if (this._controls) {
      var zoom = this.model.zoom
      zoom *= e.scale

      if (zoom < 100)
        zoom = 100

      this.set('zoom', zoom)
      e.stopPropagation()
    }
  }

  ondoubletap() {
    this._controls.reset();
  }

  handleMouseWheel(event) {
    var delta = 0;
    var zoom = this.model.zoom

    delta = -event.deltaY
    zoom += delta * 0.1
    if (zoom < 100)
      zoom = 100

    this.set('zoom', zoom)
  }

  onredraw() {
    this.threed_animate();
  }

}

Component.register('visualizer', Visualizer)

