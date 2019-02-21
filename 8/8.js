if (!Detector.webgl) Detector.addGetWebGLMessage();

 var _createClass = function () {
     function defineProperties(target, props) {
         for (var i = 0; i < props.length; i++) {
             var descriptor = props[i];
             descriptor.enumerable = descriptor.enumerable || false;
             descriptor.configurable = true;
             if ("value" in descriptor) descriptor.writable = true;
             Object.defineProperty(target, descriptor.key, descriptor);
         }
     }
     return function (Constructor, protoProps, staticProps) {
         if (protoProps) defineProperties(Constructor.prototype, protoProps);
         if (staticProps) defineProperties(Constructor, staticProps);
         return Constructor;
     };
 }();

 function _classCallCheck(instance, Constructor) {
     if (!(instance instanceof Constructor)) {
         throw new TypeError("Cannot call a class as a function");
     }
 } // utils
 var round = function round(value, precition) {
     var multiplier = Math.pow(10, precition || 0);
     return Math.round(value * multiplier) / multiplier;
 };

 var clearThree = function clearThree(obj) {
     while (obj.children.length > 0) {
         clearThree(obj.children[0]);
         obj.remove(obj.children[0]);
     }
     if (obj.geometry) obj.geometry.dispose();
     if (obj.material) obj.material.dispose();
     if (obj.texture) obj.texture.dispose();
 };


 // App
 var App = function () {
     function App() {
         var _this = this;
         _classCallCheck(this, App);
         this.bars = [];
         this.barsTweening = [];

         this.defaultSettings = {
             numBars: 24,
             sizeBars: 1,
             baseRadius: 3,
             speedAngle: 0.1,
             offsetTween: 1,
             counterClockWise: false
         };


         this.settings = {
             numBars: 24,
             sizeBars: 1,
             baseRadius: 3,
             speedAngle: 0.1,
             offsetTween: 1,
             counterClockWise: false,
             resetScene: function resetScene() {
                 Object.assign(_this.settings, _this.defaultSettings);
                 _this.controls.reset();
                 _this.resetScene();
             }
         };


         this.currentTime = 0;
         this.shapeIndex = 0;

         // flags
         this.isReseting = false;

         this.init();
     }
     _createClass(App, [{
         key: 'init',
         value: function init()

         {
             this.setup();
             this.renderShape();
             this.update();
             this.bindEvents();
         }
    }, {
         key: 'setup',
         value: function setup()

         {
             var _window =
                 window,
                 innerWidth = _window.innerWidth,
                 innerHeight = _window.innerHeight,
                 devicePixelRatio = _window.devicePixelRatio;
             var
                 settings = this.settings;

             // renderer -------------------------------------------------
             this.renderer = new THREE.WebGLRenderer({
                 antialias: true
             });
             this.renderer.setPixelRatio(devicePixelRatio);
             this.renderer.setSize(innerWidth, innerHeight);
             this.renderer.setClearColor('#5200ff');
             document.body.appendChild(this.renderer.domElement);

             // scene ----------------------------------------------------
             this.scene = new THREE.Scene();

             // camera ---------------------------------------------------
             this.camera = new THREE.PerspectiveCamera(
                 75,
                 innerWidth / innerHeight,
                 0.1,
                 1000);

             this.camera.position.z = 20;
             this.camera.lookAt(this.scene.position);
             this.scene.add(this.camera);

             // clock ----------------------------------------------------
             this.clock = new THREE.Clock();

             // controls
             this.controls = new THREE.OrbitControls(
                 this.camera,
                 this.renderer.domElement);


             this.controls.enableDamping = true;
             this.controls.dampingFactor = 0.25;
             this.controls.enablePan = false;
             this.controls.enableZoom = false;
             this.controls.minAzimuthAngle = 0;
             this.controls.maxAzimuthAngle = 0;
             this.controls.rotateSpeed = 0.2;

             this.controls.update();


         }
    }, {
         key: 'resetScene',
         value: function resetScene()

         {
             this.bars = [];
             this.barsTweening = [];
             this.shapeIndex = 0;

             clearThree(this.scene);
             this.renderShape();
         }
    }, {
         key: 'renderShape',
         value: function renderShape()

         {
             var _settings =
                 this.settings,
                 numBars = _settings.numBars,
                 sizeBars = _settings.sizeBars,
                 counterClockWise = _settings.counterClockWise,
                 baseRadius = _settings.baseRadius;

             var angleOffset = Math.PI * 2 / numBars;

             var wrapper = new THREE.Object3D();
             var geom = new THREE.BoxGeometry(sizeBars, 1, 1);
             var mat = new THREE.MeshNormalMaterial({
                 flatShading: true
             });


             for (var i = 0; i < numBars; i++) {
                 var mesh = new THREE.Mesh(geom, mat);
                 var single = new THREE.Object3D();
                 single.add(mesh);

                 single.position.x = Math.cos(angleOffset * i) * baseRadius * 2.5;
                 single.position.y = Math.sin(angleOffset * i) * baseRadius * 2.5;
                 single.rotation.z = angleOffset * i;

                 wrapper.add(single);
                 this.bars.push(mesh);
             }

             wrapper.position.y = 2;
             wrapper.rotation.x = counterClockWise ?
             -Math.PI / 3 : Math.PI - Math.PI / 3;

             this.scene.add(wrapper);
         }
    }, {
         key: 'update',
         value: function update()

         {
             var _this2 = this;
             var _settings2 =
                 this.settings,
                 numBars = _settings2.numBars,
                 offsetTween = _settings2.offsetTween,
                 counterClockWise = _settings2.counterClockWise,
                 speedAngle = _settings2.speedAngle;

             var currentTime = round(this.clock.getElapsedTime(), 1);
             var integerTime = currentTime * 10;

             if (this.currentTime !== currentTime && integerTime % offsetTween === 0) {
                 this.currentTime = currentTime;

                 this.shapeIndex += 1;
                 if (this.shapeIndex === numBars) {
                     this.shapeIndex = 0;
                 }

                 this.barsTweening.push(this.bars[this.shapeIndex]);
             }

             if (this.barsTweening.length > 0) {
                 var _loop = function _loop(
                     i) {
                     var bar = _this2.barsTweening[i];

                     if (counterClockWise) {
                         bar.rotation.y += speedAngle;
                     } else {
                         bar.rotation.y -= speedAngle;
                     }

                     if (bar.rotation.y >= Math.PI || bar.rotation.y <= -Math.PI) {
                         bar.rotation.y = 0;
                         _this2.barsTweening = _this2.barsTweening.filter(function (item) {
                             return item !== bar;
                         });
                     }
                 };
                 for (var i = 0; i < this.barsTweening.length; i++) {
                     _loop(i);
                 }
             }

             this.controls.update();
             this.renderer.render(this.scene, this.camera);
             window.requestAnimationFrame(this.update.bind(this));
         }
    }, {
         key: 'bindEvents',
         value: function bindEvents()

         {
             window.addEventListener('resize', this.resizeHandler.bind(this));
         }
    }, {
         key: 'resizeHandler',
         value: function resizeHandler()

         {
             var _window2 =
                 window,
                 innerWidth = _window2.innerWidth,
                 innerHeight = _window2.innerHeight;

             this.renderer.setSize(innerWidth, innerHeight);
             this.camera.aspect = innerWidth / innerHeight;
             this.camera.updateProjectionMatrix();
         }
    }]);
     return App;
 }();


 new App();
