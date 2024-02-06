/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import * as Jill from './Jill'
import InvisiblePlane from './InvisiblePlane'
import { useControls } from 'leva'

const Game = ({ state, modes }) => {
  const { shadowCatcher } = useControls(
    'Scene',
    {
      shadowCatcher: {
        label: 'Shadow Catcher',
        value: true
      }
    },
    { collapsed: true }
  )

  return (
    <>
      <group position-y={-1}>
        <Jill.Model state={state} modes={modes} />
        <InvisiblePlane position-y={0} visible={shadowCatcher} />
      </group>
    </>
  )
}

export default Game
