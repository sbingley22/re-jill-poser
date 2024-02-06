/* eslint-disable react/prop-types */
import { useSnapshot } from 'valtio'

const HUD = ({ state }) => {
  const snap = useSnapshot(state)

  return (
    <div className="hud">
      <h3 className="top-left">{snap.current}</h3>
    </div>
  )
}

export default HUD
