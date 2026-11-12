# Revforge W12 integration

Source: https://github.com/Wasabules/revforge

Author: Wasabules. License: MIT; see LICENSE.

Pinned source commit: c9c79647f7a0c849f961de53b50337777e3e727b.

The dashboard reuses the existing engine geometry, W12 architecture, firing order, piston/rod solver, valves, camshafts and closed timing-chain paths. The complete upstream simulator, vehicle and audio are not included.

Local adaptations are in revforge-entry.ts and engine.js. They add task-based assembly stages, the external connected fuel system, the dashboard color scheme, prime/crank/run presentation and a shared-mesh software renderer. engineScene.ts imports a small render-bridge.ts and interpolates its existing chain paths to remove stepping during slow motion. Illustrative combustion color is driven by the source cylinder cycle, not by the upstream gas solver. This is an educational visualization, not a factory CAD model or a physical engine test.

Build the embedded adapter with node build-vendor.cjs. Prebuilt browser and CommonJS versions are included.
