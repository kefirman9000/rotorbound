# Rotorbound

An FPV drone game for Windows (and the browser). You're a freelance drone pilot in a busy city with moving cranes, an elevated train, traffic, alleys, a stunt park, a stadium and a theme park to fly through.

![Downtown](screenshots/01-downtown-skyline-fpv.png)

## Play

- **Windows:** grab the latest **Rotorbound-vX-windows.zip** from [Releases](https://github.com/kefirman9000/rotorbound/releases/latest), unzip it, and double-click **`Rotorbound.bat`**.
- **Browser:** https://kefirman9000.github.io/rotorbound/ (Xbox controllers work there too)

The game opens in its own window and works offline. Each launch checks GitHub for a newer version and **only updates if you click Yes**.

## Maps

- **Rotor City:** a big sprawling city with a stunt park, a stadium, the Skyfair theme park, a river and an elevated train.
- **Neon Canyons:** a compact 380 m vertical city built for FPV flow, with three flight bands (street canyons, facades and skybridges, rooftops up to 140 m). It has a neon crossroads under hanging signs, a scaffolding tower with a crane, a west–east rooftop chain, an alley grid with fire escapes and vertical shafts, an elevated highway with a broken middle, and a canal with two bridges on the south edge. Golden-hour sun shadows.

Switch maps in **Settings → Map**.

![Neon Canyons](screenshots/20-canyons-crossroads-golden-hour.png)

## What's in it

- **Races:** 6 tracks in Rotor City (City Loop, Parking Garage, Bridge Run, Rooftop Run, Stunt Park Slalom, Skyfair Park) and 3 in Neon Canyons (Crossroads Sprint, Canyon Run, Sky Chain). A ghost of your best lap flies alongside you, and the top 10 laps on your PC are kept for each track.
- **Courier jobs:** pick up a package on one rooftop and land it on another before par time. Heavier packages make the drone sluggish, and wind gusts get stronger up high.
- **Free flight & tricks:** flips, rolls, power loops, corkscrews, dives, proximity runs and gaps (rings, fans, under bridges, through the tunnel, the stadium tunnel, the skeleton tower and the Ferris wheel) chain into combos. Combos pay **double in the Stunt Park**.
- **30 hidden tokens** around the map, worth $50 each.
- **Forgiving where it should be:** light poles, cables, wires, AC units, solar panels, trees and scaffolding poles are *soft*, so clipping them wobbles you instead of ending the run. Walls, pillars and building faces are still hard. After a crash you respawn at your last safe spot, or at the last gate in a race, with a 2-second hover assist. Prefer a full restart? Change it in Settings.
- **Flow features:** real ramps and rising roads (the Neon Canyons highway on-ramp, the stair street up to the waterfront terrace, kicker ramps in the Stunt Park), overhanging towers, rooftop-gap jumps, steam vents and wet, reflective streets.
- **The world:** a skeleton tower under construction with tower cranes swinging their hooks, an elevated train looping the city, traffic, alleys with fire escapes, rooftop billboards and water towers, a riverside tunnel, the Stunt Park (giant rings, spinning fans, a half-pipe, dive towers, floating islands), a stadium, and the Skyfair theme park (Ferris wheel, roller coaster, drop tower).
- **Time of day:** day, sunset, night or a full cycle, with lit windows, neon, street lamps, car headlights and a drone headlight.
- **Replay** of your last 30 seconds with 4 camera angles, and a **photo mode** that saves PNGs to your Downloads folder.

## Screenshots

### Neon Canyons

| | |
|---|---|
| ![Scaffolding](screenshots/21-canyons-scaffolding-tower-chase.png) | ![Rooftop chain](screenshots/22-canyons-rooftop-chain-fpv.png) |
| ![Alley](screenshots/23-canyons-alley-fpv.png) | ![Highway](screenshots/24-canyons-highway-break-fpv.png) |
| ![Waterfront](screenshots/25-canyons-waterfront-bridge.png) | ![Neon night](screenshots/26-canyons-neon-night.png) |
| ![Skybridge](screenshots/27-canyons-skybridge-fpv.png) | ![Crossroads](screenshots/20-canyons-crossroads-golden-hour.png) |
| ![Stair street](screenshots/28-canyons-stair-street.png) | ![Highway on-ramp](screenshots/29-canyons-highway-onramp.png) |

### Rotor City

| | |
|---|---|
| ![Crane](screenshots/02-construction-crane-chase.png) | ![Train](screenshots/03-elevated-train-fpv.png) |
| ![Night](screenshots/04-night-street-traffic-fpv.png) | ![Stunt park](screenshots/05-stunt-park-sunset-chase.png) |
| ![Stadium](screenshots/06-stadium-dive-fpv.png) | ![Skyfair](screenshots/07-skyfair-night-fpv.png) |
| ![Tunnel](screenshots/08-riverside-tunnel-fpv.png) | ![Garage](screenshots/09-parking-garage-race-fpv.png) |
| ![Combo](screenshots/10-trick-combo-stunt-park.png) | ![Settings](screenshots/11-settings-menu.png) |

## Xbox controller

Plug it in by USB or pair it over Bluetooth, then press any button.

| Button | Action |
|---|---|
| RT | Throttle (or use the left stick, set in Settings) |
| Left stick ↔ | Yaw |
| Right stick | Pitch / roll |
| A | Start / respawn after a crash |
| B | FPV ⇄ chase camera |
| Y | Acro ⇄ Angle mode (flips need Acro) |
| X | Restart lap / new courier job |
| LB / RB | Camera uptilt − / + |
| L3 (click left stick) | Replay last 30 seconds |
| R3 (click right stick) | Photo mode |
| View | Reset drone |
| Menu | Settings / pause (navigate with the D-pad) |

The keyboard and touch controls are listed on the start screen.

## Roadmap

1. ✅ Flight physics, FPV camera, controls, city
2. ✅ More tracks + ghost replay, courier jobs, time of day
3. ✅ Busy world, stunt park, stadium, theme park, tricks, tokens, replay, photo mode
4. ✅ Neon Canyons map
5. Garage (frames, motors, props, batteries) to spend your earnings
6. Film gigs + defense nights
7. Signal range, sound and polish
8. Online leaderboards (needs a small server)

## Credits

Built with [three.js](https://threejs.org) (MIT license, included in `lib/`).

## ❤ Support

If you enjoy Rotorbound, you can support development through **[GitHub Sponsors](https://github.com/sponsors/kefirman9000)**.
