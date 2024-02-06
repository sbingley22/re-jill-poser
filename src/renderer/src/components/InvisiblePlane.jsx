/* eslint-disable react/no-unknown-property */
const InvisiblePlane = (props) => {
  return (
    <mesh
      {...props}
      receiveShadow // Enable receiving shadows
      rotation={[-Math.PI / 2, 0, 0]} // Rotate the plane to be horizontal
    >
      <planeGeometry attach="geometry" args={[10, 10]} />
      <shadowMaterial attach="material" opacity={0.8} transparent />
    </mesh>
  )
}

export default InvisiblePlane
