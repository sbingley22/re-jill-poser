/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */

import * as THREE from 'three'
import { createRef, useEffect, useRef, useState } from 'react'
import { useGLTF, useCursor } from '@react-three/drei'
import jillGlb from '../../../../resources/JillValentine-v1.0.glb?url'
import { useSnapshot } from 'valtio'
import { button, useControls, folder } from 'leva'
import { useFrame } from '@react-three/fiber'

const worldPosition = new THREE.Vector3()
const usableBones = [
  'DEF-spine',
  'DEF-spine002',
  'DEF-spine005',
  'DEF-thighL',
  'DEF-thighR',
  'DEF-shinL',
  'DEF-shinR',
  'DEF-footL',
  'DEF-footR',
  'DEF-upper_armL',
  'DEF-upper_armR',
  'DEF-forearmL',
  'DEF-forearmR',
  'DEF-handL',
  'DEF-handR',
  'DEF-breastL',
  'DEF-breastR',
  'DEF-shoulderL',
  'DEF-shoulderR'
]
const mainLayer = [
  'DEF-spine',
  'DEF-spine002',
  'DEF-spine005',
  'DEF-thighL',
  'DEF-thighR',
  'DEF-shinL',
  'DEF-shinR',
  'DEF-footL',
  'DEF-footR',
  'DEF-upper_armL',
  'DEF-upper_armR',
  'DEF-forearmL',
  'DEF-forearmR',
  'DEF-handL',
  'DEF-handR'
]
const extraLayer = ['DEF-breastL', 'DEF-breastR', 'DEF-shoulderL', 'DEF-shoulderR']

export function Model(props) {
  const group = useRef()
  const { nodes, materials } = useGLTF(jillGlb)
  //console.log(nodes)

  const { clickButton, lockGizmo } = useControls('Selection', {
    Deselect: button(() => {
      props.state.current = null
    }),
    clickButton: {
      label: 'Click Button',
      value: 1,
      min: 0,
      max: 4,
      step: 1
    },
    lockGizmo: {
      label: 'Lock Gizmo',
      value: true
    }
  })
  const { showBones, showMain, showExtra } = useControls('Bones', {
    showBones: {
      label: 'Show Bones',
      value: false
    },
    layers: folder(
      {
        showMain: {
          label: 'Main',
          value: true
        },
        showExtra: {
          label: 'Extras',
          value: false
        }
      },
      { collapsed: true }
    )
  })
  const { charPos, charRot, charScale } = useControls(
    'Transform',
    {
      charPos: [0, 0, 0],
      charRot: [0, 0, 0],
      charScale: [1, 1, 1]
    },
    { collapsed: true }
  )

  const snap = useSnapshot(props.state)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  const bonesRef = useRef([])
  const refControls = useRef(usableBones.map(() => createRef()))
  const activeBones = useRef([])

  // Get bones that will be posable
  useEffect(() => {
    if (bonesRef.current.length > 0) return
    //console.log(nodes)

    for (const nodeName in nodes) {
      if (Object.hasOwnProperty.call(nodes, nodeName)) {
        const node = nodes[nodeName]

        for (var i = 0; i < usableBones.length; i++) {
          if (nodeName == usableBones[i]) {
            bonesRef.current.push(node)
          }
        }
      }
    }
    setBoneControlHidden()
    //console.log(bonesRef.current)
  }, [])

  // Fix bad bone parenting
  useEffect(() => {
    const fixableBones = [
      'ORG-shoulderR',
      'ORG-shoulderL',
      'DEF-upper_armL',
      'DEF-upper_armR',
      'ORG-breastL',
      'ORG-breastR',
      'ORG-pelvisL',
      'ORG-pelvisR',
      'DEF-thighL',
      'DEF-thighR'
    ]
    for (const nodeName in nodes) {
      if (Object.hasOwnProperty.call(nodes, nodeName)) {
        const node = nodes[nodeName]

        for (var i = 0; i < fixableBones.length; i++) {
          if (nodeName == fixableBones[i]) {
            const parentName = node.parent.name
            const newName = parentName.replace(/ORG-/g, 'DEF-')
            node.parent = findObjectWithName(newName)
            //console.log(node)
          }
        }
      }
    }
  }, [])

  const findObjectWithName = (name) => {
    for (const nodeName in nodes) {
      if (Object.hasOwnProperty.call(nodes, nodeName)) {
        const node = nodes[nodeName]

        if (nodeName === name) return node
      }
    }
    return null
  }

  const isActiveBone = (bone) => {
    for (let i = 0; i < activeBones.current.length; i++) {
      const activeBone = activeBones.current[i]
      if (bone === activeBone) return true
    }
    return false
  }

  const meshClicked = (e) => {
    // Click sets the mesh as the new target
    if (clickButton !== e.button) return
    e.stopPropagation()

    let nearestBone = -1
    let nearestDist = 99999
    for (let i = 0; i < bonesRef.current.length; i++) {
      const bone = bonesRef.current[i]
      if (!isActiveBone(bone.name)) continue

      bone.getWorldPosition(worldPosition)

      const dist = worldPosition.distanceTo(e.point)
      if (dist < nearestDist) {
        nearestBone = i
        nearestDist = dist
      }
    }

    props.state.current = bonesRef.current[nearestBone].name
    //console.log(props.state.current)
  }

  const meshMissed = (e) => {
    // If a click happened but this mesh wasn't hit we null out the target,
    // This works because missed pointers fire before the actual hits
    if (e.button != clickButton) return
    props.state.current = null
  }

  const setBoneControlHidden = () => {
    bonesRef.current.forEach((bone) => {
      bone.ctrlVisible = false
    })
  }
  const setBoneControlVisibility = () => {
    bonesRef.current.forEach((bone) => {
      activeBones.current.forEach((active) => {
        if (bone.name == active) bone.ctrlVisible = true
        //console.log(bone.name, active)
      })
    })
  }

  // Update bone control visibility
  useEffect(() => {
    setBoneControlHidden()
    activeBones.current = []
    if (showMain) activeBones.current = activeBones.current.concat(mainLayer)
    if (showExtra) activeBones.current = activeBones.current.concat(extraLayer)
    setBoneControlVisibility()
    //console.log(activeBones.current)
  }, [showMain, showExtra])

  useFrame((state) => {
    if (bonesRef.current.length <= 0) return

    // Update control visibility and positions
    refControls.current.forEach((control, index) => {
      const bone = bonesRef.current[index]
      bone.getWorldPosition(worldPosition)

      // Controls need to be parented to scene for
      // world position to work correctly
      if (control.current.parent.type != 'Scene') {
        control.current.parent.remove(control.current)
        state.scene.add(control.current)
        //console.log(control.current.parent)
      }

      control.current.position.copy(worldPosition)

      if (!showBones) control.current.visible = false
      else control.current.visible = bone.ctrlVisible
    })
  })

  return (
    <>
      <group
        ref={group}
        {...props}
        dispose={null}
        onPointerUp={meshClicked}
        onPointerDown={meshMissed}
        onPointerMissed={meshMissed}
        // Right click cycles through transform modes
        onContextMenu={(e) => {
          e.stopPropagation()
          if (lockGizmo) return
          props.state.mode = (snap.mode + 1) % props.modes.length
        }}
        onPointerOver={(e) => (e.stopPropagation(), setHovered(true))}
        onPointerOut={() => setHovered(false)}
      >
        <group name="Scene">
          <group name="rig" position={charPos} rotation={charRot} scale={charScale}>
            <primitive object={nodes.root} />
            <primitive object={nodes['MCH-torsoparent']} />
            <primitive object={nodes['MCH-hand_ikparentL']} />
            <primitive object={nodes['MCH-upper_arm_ik_targetparentL']} />
            <primitive object={nodes['MCH-hand_ikparentR']} />
            <primitive object={nodes['MCH-upper_arm_ik_targetparentR']} />
            <primitive object={nodes['MCH-foot_ikparentL']} />
            <primitive object={nodes['MCH-thigh_ik_targetparentL']} />
            <primitive object={nodes['MCH-foot_ikparentR']} />
            <primitive object={nodes['MCH-thigh_ik_targetparentR']} />
            <skinnedMesh
              name="Body"
              geometry={nodes.Body.geometry}
              material={materials.skin}
              skeleton={nodes.Body.skeleton}
              castShadow
            />
            <group name="Pistol">
              <skinnedMesh
                name="Cube"
                geometry={nodes.Cube.geometry}
                material={materials['Silver-Sandblasted']}
                skeleton={nodes.Cube.skeleton}
              />
              <skinnedMesh
                name="Cube_1"
                geometry={nodes.Cube_1.geometry}
                material={materials['Silver-Sandblasted.Darker']}
                skeleton={nodes.Cube_1.skeleton}
              />
              <skinnedMesh
                name="Cube_2"
                geometry={nodes.Cube_2.geometry}
                material={materials.Grip}
                skeleton={nodes.Cube_2.skeleton}
              />
            </group>
          </group>
        </group>
      </group>
      {usableBones.map((bone, index) => (
        <mesh key={bone} ref={refControls.current[index]} scale={0.02}>
          <boxGeometry />
          <meshBasicMaterial color={'purple'} depthTest={false} depthWrite={false} />
        </mesh>
      ))}
    </>
  )
}

useGLTF.preload(jillGlb)
