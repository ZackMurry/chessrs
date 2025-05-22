import { ChessInstance, PieceType } from 'chess.js'
import { FC, memo, useEffect, useMemo } from 'react'
import { DragPreviewImageProps, useDrag } from 'react-dnd'
import { useAppSelector } from 'utils/hooks'
import getImageByPiece from './getImageByPiece'
import { getEmptyImage } from 'react-dnd-html5-backend'

interface Props {
  type: PieceType
  color: 'w' | 'b'
  size: string
  position: string
  game: ChessInstance
  onDragStart: () => void
  minSize: string
}

export const DragPreviewImage: FC<
  DragPreviewImageProps & { size: string; minSize: string }
> = memo(function DragPreviewImage({ connect, src, size, minSize }) {
  useEffect(() => {
    if (typeof Image === 'undefined') return

    let connected = false
    const img = new Image()
    img.src = src
    img.setAttribute(
      'style',
      `width: ${size}; height: ${size}; min-width: ${minSize}; min-height: ${minSize};`,
    )
    img.onload = () => {
      connect(img)
      connected = true
    }
    return () => {
      if (connected) {
        connect(null)
      }
    }
  })

  return null
})

const ChessPiece: FC<Props> = ({
  type,
  color,
  size,
  position,
  game,
  onDragStart,
  minSize,
}) => {
  const imageUrl = useMemo(() => getImageByPiece(type, color), [type, color])
  const boardEnabled = useAppSelector((state) => state.board.enabled)
  const [, drag, preview] = useDrag(
    () => ({
      type: color === 'w' ? type.toUpperCase() : type,
      item: {
        position,
        color,
        type,
      },
      canDrag: () => {
        console.log('can drag called')
        return (color === 'w') !== (game.turn() === 'b') && boardEnabled
      },
    }),
    [game],
  )
  // inside the component
  // preview(getEmptyImage(), { captureDraggingState: true })
  // useEffect(() => {
  //   const img = new Image()
  //   img.src = imageUrl
  //   img.onload = () => {
  //     preview(img, {  })
  //   }
  // }, [imageUrl, preview])

  return (
    <>
      <DragPreviewImage
        connect={preview}
        src={imageUrl}
        size={size}
        minSize={minSize}
      />

      <div draggable={false} style={{ userSelect: 'none' }}>
        {/* <DragPreviewImage connect={preview} src={imageUrl} /> */}

        <div
          ref={drag}
          style={{
            cursor: 'pointer',
            userSelect: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'none',
          }}
          onDragStart={onDragStart}
        >
          <img
            src={imageUrl}
            width={size}
            height={size}
            style={{
              width: size,
              height: size,
              minWidth: minSize,
              minHeight: minSize,
              pointerEvents: 'none', // prevents ghost drag artifacts in some browsers
            }}
            draggable={false}
          />
          {/* <div
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: size,
              width: size,
              height: size,
              minWidth: minSize,
              minHeight: minSize,
            }}
          /> */}
        </div>
      </div>
    </>
  )
}

export default ChessPiece
