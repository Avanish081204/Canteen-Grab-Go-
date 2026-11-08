import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MenuItem } from '@/lib/store';

interface RealFood3DViewerProps {
  item: MenuItem;
  isAutoRotate: boolean;
  lightingMode: 'warm' | 'studio' | 'night';
  isExploded: boolean;
  zoomLevel: number;
}

// ── Build Specific Volumetric 3D Food Meshes ─────────────────────────
function createFoodMesh(item: MenuItem): { group: THREE.Group; explodedParts: { mesh: THREE.Object3D; baseY: number; targetY: number }[] } {
  const root = new THREE.Group();
  const explodedParts: { mesh: THREE.Object3D; baseY: number; targetY: number }[] = [];
  const name = item.name.toLowerCase();
  const cat = item.category.toLowerCase();

  // Ceramic Plate / Serving Platter on which all food rests
  const plateGeo = new THREE.CylinderGeometry(2.5, 2.2, 0.15, 64);
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.2,
    metalness: 0.1,
  });
  const plate = new THREE.Mesh(plateGeo, plateMat);
  plate.position.y = -0.08;
  plate.receiveShadow = true;
  root.add(plate);

  // Subtle plate rim
  const rimGeo = new THREE.TorusGeometry(2.45, 0.06, 16, 64);
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.01;
  plate.add(rim);

  // ───────────────────────────────────────────────────────────────────
  // 1. BURGERS & SANDWICHES
  // ───────────────────────────────────────────────────────────────────
  if (name.includes('burger') || name.includes('sandwich') || cat.includes('sandwich')) {
    const burgerGroup = new THREE.Group();

    // 1. Bottom Bun
    const botBunGeo = new THREE.CylinderGeometry(1.25, 1.15, 0.35, 32);
    const bunMat = new THREE.MeshStandardMaterial({
      color: 0xd98c3b, // Golden brown baked bun
      roughness: 0.7,
      metalness: 0.05,
    });
    const botBun = new THREE.Mesh(botBunGeo, bunMat);
    botBun.position.y = 0.18;
    botBun.castShadow = true;
    burgerGroup.add(botBun);
    explodedParts.push({ mesh: botBun, baseY: 0.18, targetY: -0.4 });

    // 2. Secret Sauce / Mayo
    const sauceGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.05, 32);
    const sauceMat = new THREE.MeshStandardMaterial({ color: 0xff4d4d, roughness: 0.2 });
    const sauce = new THREE.Mesh(sauceGeo, sauceMat);
    sauce.position.y = 0.38;
    burgerGroup.add(sauce);
    explodedParts.push({ mesh: sauce, baseY: 0.38, targetY: 0.0 });

    // 3. Crispy Burger Patty
    const pattyGeo = new THREE.CylinderGeometry(1.3, 1.28, 0.4, 32);
    const pattyMat = new THREE.MeshStandardMaterial({
      color: 0x5a341a, // Dark roasted textured patty
      roughness: 0.9,
      metalness: 0.1,
    });
    const patty = new THREE.Mesh(pattyGeo, pattyMat);
    patty.position.y = 0.58;
    patty.castShadow = true;
    burgerGroup.add(patty);
    explodedParts.push({ mesh: patty, baseY: 0.58, targetY: 0.45 });

    // 4. Melted Cheddar Cheese Slice (with sagging corners!)
    const cheeseShape = new THREE.Shape();
    cheeseShape.moveTo(-1.15, -1.15);
    cheeseShape.lineTo(1.15, -1.15);
    cheeseShape.lineTo(1.15, 1.15);
    cheeseShape.lineTo(-1.15, 1.15);
    cheeseShape.closePath();
    const cheeseGeo = new THREE.ExtrudeGeometry(cheeseShape, { depth: 0.04, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.02, bevelThickness: 0.02 });
    const cheeseMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00, // Vibrant melted cheddar
      roughness: 0.3,
      metalness: 0.05,
    });
    const cheese = new THREE.Mesh(cheeseGeo, cheeseMat);
    cheese.rotation.x = Math.PI / 2;
    cheese.rotation.z = Math.PI / 4;
    cheese.position.y = 0.82;
    cheese.castShadow = true;
    burgerGroup.add(cheese);
    explodedParts.push({ mesh: cheese, baseY: 0.82, targetY: 0.85 });

    // 5. Two Fresh Tomato Slices
    const tomatoGroup = new THREE.Group();
    const tomGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.1, 24);
    const tomMat = new THREE.MeshStandardMaterial({ color: 0xdf2020, roughness: 0.3 });
    const tom1 = new THREE.Mesh(tomGeo, tomMat);
    tom1.position.set(-0.4, 0, 0.2);
    const tom2 = new THREE.Mesh(tomGeo, tomMat);
    tom2.position.set(0.4, 0, -0.2);
    tomatoGroup.add(tom1, tom2);
    tomatoGroup.position.y = 0.96;
    burgerGroup.add(tomatoGroup);
    explodedParts.push({ mesh: tomatoGroup, baseY: 0.96, targetY: 1.25 });

    // 6. Ruffled Fresh Lettuce
    const lettuceGeo = new THREE.CylinderGeometry(1.35, 1.2, 0.1, 16);
    const lettuceMat = new THREE.MeshStandardMaterial({ color: 0x48bb78, roughness: 0.8 });
    const lettuce = new THREE.Mesh(lettuceGeo, lettuceMat);
    lettuce.position.y = 1.08;
    burgerGroup.add(lettuce);
    explodedParts.push({ mesh: lettuce, baseY: 1.08, targetY: 1.6 });

    // 7. Top Bun (Dome Hemisphere)
    const topBunGeo = new THREE.SphereGeometry(1.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const topBun = new THREE.Mesh(topBunGeo, bunMat);
    topBun.position.y = 1.15;
    topBun.castShadow = true;

    // Scatter 3D Sesame Seeds on Top Bun
    const seedGeo = new THREE.SphereGeometry(0.035, 8, 8);
    seedGeo.scale(1, 0.4, 1.8);
    const seedMat = new THREE.MeshStandardMaterial({ color: 0xfff2cc, roughness: 0.4 });
    for (let i = 0; i < 36; i++) {
      const phi = Math.random() * (Math.PI / 2.6);
      const theta = Math.random() * Math.PI * 2;
      const x = 1.3 * Math.sin(phi) * Math.cos(theta);
      const y = 1.3 * Math.cos(phi);
      const z = 1.3 * Math.sin(phi) * Math.sin(theta);

      const seed = new THREE.Mesh(seedGeo, seedMat);
      seed.position.set(x, y, z);
      seed.lookAt(0, 0, 0);
      topBun.add(seed);
    }

    burgerGroup.add(topBun);
    explodedParts.push({ mesh: topBun, baseY: 1.15, targetY: 2.1 });

    root.add(burgerGroup);
  }
  // ───────────────────────────────────────────────────────────────────
  // 2. SAMOSA & SNACKS
  // ───────────────────────────────────────────────────────────────────
  else if (name.includes('samosa') || name.includes('kachori') || (cat.includes('snacks') && !name.includes('fries') && !name.includes('vada'))) {
    const snacksGroup = new THREE.Group();

    // Golden fried samosa crust material
    const crustMat = new THREE.MeshStandardMaterial({
      color: 0xd9822b,
      roughness: 0.6,
      metalness: 0.05,
    });

    // Samosa 1 (Pyramid cone with rounded base)
    const samosa1Geo = new THREE.ConeGeometry(1.15, 1.4, 4);
    const samosa1 = new THREE.Mesh(samosa1Geo, crustMat);
    samosa1.position.set(-0.45, 0.7, 0.2);
    samosa1.rotation.y = 0.5;
    samosa1.rotation.z = -0.15;
    samosa1.castShadow = true;
    snacksGroup.add(samosa1);
    explodedParts.push({ mesh: samosa1, baseY: 0.7, targetY: 1.2 });

    // Samosa 2 (Resting beside)
    const samosa2 = new THREE.Mesh(samosa1Geo, crustMat);
    samosa2.position.set(0.6, 0.6, -0.3);
    samosa2.rotation.y = -0.8;
    samosa2.rotation.z = 0.25;
    samosa2.scale.set(0.9, 0.9, 0.9);
    samosa2.castShadow = true;
    snacksGroup.add(samosa2);
    explodedParts.push({ mesh: samosa2, baseY: 0.6, targetY: 0.6 });

    // Dip Bowls (Chutney Katoris)
    const bowlGeo = new THREE.CylinderGeometry(0.5, 0.35, 0.3, 24);
    const bowlMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });

    // Mint Green Chutney
    const bowl1 = new THREE.Mesh(bowlGeo, bowlMat);
    bowl1.position.set(-1.2, 0.15, -1.0);
    const mintChutney = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.05, 24), new THREE.MeshStandardMaterial({ color: 0x228b22, roughness: 0.3 }));
    mintChutney.position.y = 0.12;
    bowl1.add(mintChutney);
    snacksGroup.add(bowl1);
    explodedParts.push({ mesh: bowl1, baseY: 0.15, targetY: -0.2 });

    // Sweet Tamarind Chutney
    const bowl2 = new THREE.Mesh(bowlGeo, bowlMat);
    bowl2.position.set(1.2, 0.15, 0.9);
    const imliChutney = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.05, 24), new THREE.MeshStandardMaterial({ color: 0x661111, roughness: 0.2 }));
    imliChutney.position.y = 0.12;
    bowl2.add(imliChutney);
    snacksGroup.add(bowl2);
    explodedParts.push({ mesh: bowl2, baseY: 0.15, targetY: -0.2 });

    // Green Fried Chilli Garnish
    const chilliGeo = new THREE.CylinderGeometry(0.04, 0.08, 0.9, 8);
    const chilliMat = new THREE.MeshStandardMaterial({ color: 0x38a169, roughness: 0.3 });
    const chilli = new THREE.Mesh(chilliGeo, chilliMat);
    chilli.rotation.z = Math.PI / 2.5;
    chilli.position.set(0, 0.1, 1.2);
    snacksGroup.add(chilli);

    root.add(snacksGroup);
  }
  // ───────────────────────────────────────────────────────────────────
  // 3. VADA PAV
  // ───────────────────────────────────────────────────────────────────
  else if (name.includes('vada')) {
    const vadaGroup = new THREE.Group();

    // 1. Bottom Pav
    const pavMat = new THREE.MeshStandardMaterial({ color: 0xe6b577, roughness: 0.7 });
    const botPav = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.35, 1.7), pavMat);
    botPav.position.y = 0.18;
    botPav.castShadow = true;
    vadaGroup.add(botPav);
    explodedParts.push({ mesh: botPav, baseY: 0.18, targetY: -0.3 });

    // 2. Fiery Garlic Chutney Dust
    const dust = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshStandardMaterial({ color: 0xdd2200, roughness: 0.9 }));
    dust.rotation.x = -Math.PI / 2;
    dust.position.y = 0.36;
    vadaGroup.add(dust);

    // 3. Batata Vada (Golden Crispy Potato Ball)
    const vadaGeo = new THREE.SphereGeometry(0.9, 24, 24);
    vadaGeo.scale(1.1, 0.85, 1.1);
    const vadaMat = new THREE.MeshStandardMaterial({ color: 0xd99525, roughness: 0.6 });
    const vada = new THREE.Mesh(vadaGeo, vadaMat);
    vada.position.y = 0.95;
    vada.castShadow = true;
    vadaGroup.add(vada);
    explodedParts.push({ mesh: vada, baseY: 0.95, targetY: 0.95 });

    // 4. Top Pav
    const topPav = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.45, 1.7), pavMat);
    topPav.position.y = 1.6;
    topPav.castShadow = true;
    vadaGroup.add(topPav);
    explodedParts.push({ mesh: topPav, baseY: 1.6, targetY: 2.1 });

    // 5. Fried Salted Green Chilli on Top
    const chilli = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.1, 8), new THREE.MeshStandardMaterial({ color: 0x2f855a }));
    chilli.rotation.z = Math.PI / 2.2;
    chilli.rotation.y = 0.3;
    chilli.position.set(0, 1.9, 0);
    vadaGroup.add(chilli);
    explodedParts.push({ mesh: chilli, baseY: 1.9, targetY: 2.5 });

    root.add(vadaGroup);
  }
  // ───────────────────────────────────────────────────────────────────
  // 4. FRENCH FRIES
  // ───────────────────────────────────────────────────────────────────
  else if (name.includes('fries') || name.includes('finger')) {
    const friesGroup = new THREE.Group();

    // Red Fries Box Carton
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xe53e3e, roughness: 0.4 });
    const boxGeo = new THREE.BoxGeometry(1.6, 1.8, 0.9);
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(0, 0.9, 0);
    box.rotation.x = 0.15;
    box.castShadow = true;
    friesGroup.add(box);

    // Individual Golden Fries
    const fryMat = new THREE.MeshStandardMaterial({ color: 0xf6ad55, roughness: 0.5 });
    const fryGeo = new THREE.BoxGeometry(0.12, 1.4, 0.12);

    for (let i = 0; i < 28; i++) {
      const fry = new THREE.Mesh(fryGeo, fryMat);
      const angleX = (Math.random() - 0.5) * 0.4;
      const angleZ = (Math.random() - 0.5) * 0.6;
      const posX = (Math.random() - 0.5) * 1.1;
      const posY = 1.3 + Math.random() * 0.6;
      const posZ = (Math.random() - 0.5) * 0.5;

      fry.position.set(posX, posY, posZ);
      fry.rotation.set(angleX, 0, angleZ);
      fry.castShadow = true;
      friesGroup.add(fry);
      explodedParts.push({ mesh: fry, baseY: posY, targetY: posY + (i % 3 === 0 ? 0.9 : 0.4) });
    }

    // Side Dip Bowl
    const dip = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.35, 0.25, 20), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    dip.position.set(1.4, 0.12, 0.6);
    const ketchup = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.05, 20), new THREE.MeshStandardMaterial({ color: 0xcc1111, roughness: 0.2 }));
    ketchup.position.y = 0.1;
    dip.add(ketchup);
    friesGroup.add(dip);

    root.add(friesGroup);
  }
  // ───────────────────────────────────────────────────────────────────
  // 5. NOODLES / CHINESE
  // ───────────────────────────────────────────────────────────────────
  else if (name.includes('noodle') || cat.includes('chinese') || name.includes('rice') || name.includes('manchurian')) {
    const noodleGroup = new THREE.Group();

    // Deep Ceramic Bowl
    const bowlGeo = new THREE.CylinderGeometry(1.8, 1.1, 1.1, 32);
    const bowlMat = new THREE.MeshStandardMaterial({ color: 0x1a202c, roughness: 0.2, metalness: 0.1 });
    const bowl = new THREE.Mesh(bowlGeo, bowlMat);
    bowl.position.y = 0.55;
    bowl.castShadow = true;
    noodleGroup.add(bowl);
    explodedParts.push({ mesh: bowl, baseY: 0.55, targetY: 0.1 });

    // Heaping Noodles Dome
    const noodleDomeGeo = new THREE.SphereGeometry(1.7, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.2);
    const noodleMat = new THREE.MeshStandardMaterial({ color: 0xd69e2e, roughness: 0.6 });
    const noodleDome = new THREE.Mesh(noodleDomeGeo, noodleMat);
    noodleDome.position.y = 0.9;
    noodleDome.scale.set(1, 0.7, 1);
    noodleGroup.add(noodleDome);
    explodedParts.push({ mesh: noodleDome, baseY: 0.9, targetY: 1.2 });

    // Veggie Bits (Capsicum & Carrots scattered)
    const veggieGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const redMat = new THREE.MeshStandardMaterial({ color: 0xe53e3e });
    const greenMat = new THREE.MeshStandardMaterial({ color: 0x38a169 });

    for (let i = 0; i < 20; i++) {
      const v = new THREE.Mesh(veggieGeo, i % 2 === 0 ? redMat : greenMat);
      const r = Math.random() * 1.2;
      const theta = Math.random() * Math.PI * 2;
      v.position.set(r * Math.cos(theta), 1.25 + Math.random() * 0.15, r * Math.sin(theta));
      noodleGroup.add(v);
      explodedParts.push({ mesh: v, baseY: v.position.y, targetY: v.position.y + 0.6 });
    }

    // Wooden Chopsticks Resting Diagonally
    const stickGeo = new THREE.CylinderGeometry(0.04, 0.08, 2.8, 12);
    const stickMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.5 });
    const stick1 = new THREE.Mesh(stickGeo, stickMat);
    stick1.rotation.set(0.2, 0.4, Math.PI / 2.8);
    stick1.position.set(-0.2, 1.45, 0);
    const stick2 = new THREE.Mesh(stickGeo, stickMat);
    stick2.rotation.set(0.2, 0.4, Math.PI / 2.9);
    stick2.position.set(-0.35, 1.42, 0.15);
    noodleGroup.add(stick1, stick2);
    explodedParts.push({ mesh: stick1, baseY: 1.45, targetY: 2.1 });
    explodedParts.push({ mesh: stick2, baseY: 1.42, targetY: 2.1 });

    root.add(noodleGroup);
  }
  // ───────────────────────────────────────────────────────────────────
  // 6. THALI & MEALS
  // ───────────────────────────────────────────────────────────────────
  else if (cat.includes('meals') || name.includes('thali') || name.includes('paneer') || name.includes('roti')) {
    const mealGroup = new THREE.Group();

    // Steel Katori 1: Shahi Paneer
    const katoriMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.8, roughness: 0.2 });
    const katoriGeo = new THREE.CylinderGeometry(0.65, 0.5, 0.4, 24);

    const k1 = new THREE.Mesh(katoriGeo, katoriMat);
    k1.position.set(-1.1, 0.2, -0.6);
    const gravy = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.06, 24), new THREE.MeshStandardMaterial({ color: 0xdd6b20, roughness: 0.3 }));
    gravy.position.y = 0.16;
    k1.add(gravy);
    // Paneer cube in gravy
    const paneer = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.25), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    paneer.position.set(0.1, 0.22, -0.1);
    k1.add(paneer);
    mealGroup.add(k1);
    explodedParts.push({ mesh: k1, baseY: 0.2, targetY: 0.6 });

    // Steel Katori 2: Dal Tadka
    const k2 = new THREE.Mesh(katoriGeo, katoriMat);
    k2.position.set(0.1, 0.2, -1.2);
    const dal = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.06, 24), new THREE.MeshStandardMaterial({ color: 0xd69e2e, roughness: 0.4 }));
    dal.position.y = 0.16;
    k2.add(dal);
    mealGroup.add(k2);
    explodedParts.push({ mesh: k2, baseY: 0.2, targetY: 0.6 });

    // Steamed Basmati Rice Mound
    const rice = new THREE.Mesh(new THREE.SphereGeometry(0.85, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xf7fafc, roughness: 0.9 }));
    rice.position.set(1.1, 0.05, -0.3);
    rice.scale.set(1, 0.65, 1);
    mealGroup.add(rice);
    explodedParts.push({ mesh: rice, baseY: 0.05, targetY: 0.7 });

    // Butter Roti / Naan (Folded Golden Flatbread)
    const rotiGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.06, 24);
    const rotiMat = new THREE.MeshStandardMaterial({ color: 0xdeb887, roughness: 0.7 });
    const roti = new THREE.Mesh(rotiGeo, rotiMat);
    roti.position.set(-0.5, 0.1, 0.8);
    roti.rotation.x = 0.15;
    roti.rotation.z = -0.1;
    mealGroup.add(roti);
    explodedParts.push({ mesh: roti, baseY: 0.1, targetY: 0.9 });

    root.add(mealGroup);
  }
  // ───────────────────────────────────────────────────────────────────
  // 7. COLD DRINKS & BEVERAGES
  // ───────────────────────────────────────────────────────────────────
  else if (cat.includes('cold') || name.includes('coffee') || name.includes('drink') || name.includes('tea') || name.includes('frappe')) {
    const drinkGroup = new THREE.Group();

    // Transparent Glass Tumbler
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.85,
      opacity: 1,
      transparent: true,
      roughness: 0.1,
      ior: 1.5,
    });
    const glassGeo = new THREE.CylinderGeometry(1.0, 0.75, 2.4, 32, 1, true);
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.y = 1.2;
    glass.castShadow = true;
    drinkGroup.add(glass);

    // Chilled Iced Coffee Liquid
    const liquidColor = name.includes('coffee') ? 0x6f4e37 : 0xdd6b20;
    const liquidMat = new THREE.MeshStandardMaterial({ color: liquidColor, roughness: 0.2 });
    const liquidGeo = new THREE.CylinderGeometry(0.92, 0.72, 2.0, 32);
    const liquid = new THREE.Mesh(liquidGeo, liquidMat);
    liquid.position.y = 1.05;
    drinkGroup.add(liquid);
    explodedParts.push({ mesh: liquid, baseY: 1.05, targetY: 0.6 });

    // Floating Ice Cubes in drink
    const iceMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.9, roughness: 0.1 });
    const ice1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), iceMat);
    ice1.position.set(-0.25, 1.9, 0.2);
    ice1.rotation.set(0.3, 0.5, 0.2);
    const ice2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), iceMat);
    ice2.position.set(0.3, 1.85, -0.2);
    ice2.rotation.set(-0.2, 0.4, 0.5);
    drinkGroup.add(ice1, ice2);

    // Frothy Whipped Cream Swirl on Top
    const creamGeo = new THREE.SphereGeometry(0.95, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2.2);
    const creamMat = new THREE.MeshStandardMaterial({ color: 0xfffff0, roughness: 0.7 });
    const cream = new THREE.Mesh(creamGeo, creamMat);
    cream.position.y = 2.05;
    cream.scale.set(1, 0.55, 1);
    drinkGroup.add(cream);
    explodedParts.push({ mesh: cream, baseY: 2.05, targetY: 2.6 });

    // Red-and-White Striped Drinking Straw
    const strawGeo = new THREE.CylinderGeometry(0.06, 0.06, 3.2, 16);
    const strawMat = new THREE.MeshStandardMaterial({ color: 0xe53e3e, roughness: 0.3 });
    const straw = new THREE.Mesh(strawGeo, strawMat);
    straw.position.set(0.2, 1.8, 0.2);
    straw.rotation.set(0.2, 0, -0.3);
    drinkGroup.add(straw);
    explodedParts.push({ mesh: straw, baseY: 1.8, targetY: 3.1 });

    root.add(drinkGroup);
  }
  // ───────────────────────────────────────────────────────────────────
  // 8. VALUE COMBOS (Grand Platter: Burger + Golden Fries + Beverage)
  // ───────────────────────────────────────────────────────────────────
  else {
    const comboGroup = new THREE.Group();

    // 1. Mini Burger
    const bunMat = new THREE.MeshStandardMaterial({ color: 0xd98c3b, roughness: 0.7 });
    const botBun = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.8, 0.25, 24), bunMat);
    botBun.position.set(-0.8, 0.15, 0.3);
    const patty = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.88, 0.3, 24), new THREE.MeshStandardMaterial({ color: 0x5a341a, roughness: 0.8 }));
    patty.position.set(-0.8, 0.4, 0.3);
    const cheese = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 1.4), new THREE.MeshStandardMaterial({ color: 0xffaa00 }));
    cheese.rotation.y = 0.5;
    cheese.position.set(-0.8, 0.55, 0.3);
    const topBun = new THREE.Mesh(new THREE.SphereGeometry(0.9, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), bunMat);
    topBun.position.set(-0.8, 0.65, 0.3);
    comboGroup.add(botBun, patty, cheese, topBun);
    explodedParts.push({ mesh: topBun, baseY: 0.65, targetY: 1.5 });
    explodedParts.push({ mesh: cheese, baseY: 0.55, targetY: 1.1 });
    explodedParts.push({ mesh: patty, baseY: 0.4, targetY: 0.75 });

    // 2. Crisp Fries Stack
    const fryMat = new THREE.MeshStandardMaterial({ color: 0xf6ad55, roughness: 0.5 });
    const fryGeo = new THREE.BoxGeometry(0.1, 1.1, 0.1);
    for (let i = 0; i < 14; i++) {
      const fry = new THREE.Mesh(fryGeo, fryMat);
      fry.position.set(0.6 + (Math.random() - 0.5) * 0.6, 0.55, 0.6 + (Math.random() - 0.5) * 0.5);
      fry.rotation.set((Math.random() - 0.5) * 0.4, 0, (Math.random() - 0.5) * 0.4);
      comboGroup.add(fry);
    }

    // 3. Mini Chilled Cup
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.4, 1.4, 24), new THREE.MeshStandardMaterial({ color: 0x3182ce, roughness: 0.3 }));
    cup.position.set(0.8, 0.7, -0.7);
    const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    straw.position.set(0.8, 1.4, -0.7);
    straw.rotation.z = -0.25;
    comboGroup.add(cup, straw);
    explodedParts.push({ mesh: cup, baseY: 0.7, targetY: 1.3 });

    root.add(comboGroup);
  }

  return { group: root, explodedParts };
}

export default function RealFood3DViewer({
  item,
  isAutoRotate,
  lightingMode,
  isExploded,
  zoomLevel,
}: RealFood3DViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const foodGroupRef = useRef<THREE.Group | null>(null);
  const explodedPartsRef = useRef<{ mesh: THREE.Object3D; baseY: number; targetY: number }[]>([]);
  const lightsRef = useRef<{ keyLight: THREE.DirectionalLight; fillLight: THREE.PointLight; ambientLight: THREE.AmbientLight } | null>(null);

  // Pointer drag state
  const isDragging = useRef(false);
  const prevMousePos = useRef({ x: 0, y: 0 });
  const rotationVelocity = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = mount.clientWidth || 400;
    const height = mount.clientHeight || 400;

    // Camera Setup (Angled culinary 3D perspective)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.5, 6.2);
    camera.lookAt(0, 0.6, 0);
    cameraRef.current = camera;

    // WebGL Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // ── 3D Lighting Setup ───────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.2);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0xffd699, 1.5, 20);
    fillLight.position.set(-4, 3, -3);
    scene.add(fillLight);

    lightsRef.current = { keyLight, fillLight, ambientLight };

    // ── Build 3D Food Model ─────────────────────────────────────────
    const { group, explodedParts } = createFoodMesh(item);
    foodGroupRef.current = group;
    explodedPartsRef.current = explodedParts;
    scene.add(group);

    // ── Animation Loop ──────────────────────────────────────────────
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (foodGroupRef.current) {
        // Auto-orbit rotation
        if (isAutoRotate && !isDragging.current) {
          foodGroupRef.current.rotation.y += 0.008;
        }

        // Apply drag momentum
        if (!isDragging.current) {
          foodGroupRef.current.rotation.y += rotationVelocity.current.y;
          foodGroupRef.current.rotation.x += rotationVelocity.current.x;
          rotationVelocity.current.x *= 0.92;
          rotationVelocity.current.y *= 0.92;
        }

        // Clamp vertical tilt
        foodGroupRef.current.rotation.x = Math.max(-0.4, Math.min(0.8, foodGroupRef.current.rotation.x));

        // Smoothly animate exploded layers
        explodedPartsRef.current.forEach(part => {
          const currentY = part.mesh.position.y;
          const destY = isExploded ? part.targetY : part.baseY;
          part.mesh.position.y += (destY - currentY) * 0.12;
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Observer
    const handleResize = () => {
      if (!mount || !renderer || !camera) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (mount && renderer.domElement) {
        mount.innerHTML = '';
      }
    };
  }, [item]);

  // Handle Dynamic Lighting Mode Updates
  useEffect(() => {
    if (!lightsRef.current) return;
    const { keyLight, fillLight, ambientLight } = lightsRef.current;

    if (lightingMode === 'warm') {
      keyLight.color.setHex(0xfff0db);
      keyLight.intensity = 2.4;
      fillLight.color.setHex(0xff9900);
      ambientLight.color.setHex(0xffe8cc);
      ambientLight.intensity = 1.2;
    } else if (lightingMode === 'studio') {
      keyLight.color.setHex(0xffffff);
      keyLight.intensity = 2.8;
      fillLight.color.setHex(0x88ccff);
      ambientLight.color.setHex(0xf0f4f8);
      ambientLight.intensity = 1.4;
    } else {
      // Night Mode
      keyLight.color.setHex(0x7928ca);
      keyLight.intensity = 1.8;
      fillLight.color.setHex(0x0070f3);
      ambientLight.color.setHex(0x1a202c);
      ambientLight.intensity = 0.8;
    }
  }, [lightingMode]);

  // Handle Zoom Updates
  useEffect(() => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = 6.2 / zoomLevel;
  }, [zoomLevel]);

  // Pointer Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    prevMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !foodGroupRef.current) return;
    const deltaX = e.clientX - prevMousePos.current.x;
    const deltaY = e.clientY - prevMousePos.current.y;

    foodGroupRef.current.rotation.y += deltaX * 0.01;
    foodGroupRef.current.rotation.x += deltaY * 0.007;

    rotationVelocity.current = {
      x: deltaY * 0.003,
      y: deltaX * 0.004,
    };

    prevMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[360px] sm:min-h-[440px] cursor-grab active:cursor-grabbing select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  );
}