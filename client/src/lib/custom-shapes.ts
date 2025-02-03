
import { BaseBoxShapeUtil, TLBaseShape, createCustomShapeId } from "@tldraw/tldraw"

export type CardShape = TLBaseShape<
  'card',
  {
    title: string
    description: string
    imageUrl?: string | null
    w: number
    h: number
  }
>

export class CardUtil extends BaseBoxShapeUtil<CardShape> {
  static type = 'card'

  getDefaultProps(): CardShape['props'] {
    return {
      title: '',
      description: '',
      imageUrl: null,
      w: 250,
      h: 160,
    }
  }

  render(shape: CardShape) {
    const { title, description, imageUrl, w, h } = shape.props

    return (
      <div
        style={{
          width: w,
          height: h,
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {imageUrl && (
          <div style={{ height: '160px', marginBottom: '8px' }}>
            <img
              src={imageUrl}
              alt={title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '4px',
              }}
            />
          </div>
        )}
        <h3 style={{ 
          margin: 0,
          fontSize: '16px',
          fontWeight: 600,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {title}
        </h3>
        {description && (
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#666',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}>
            {description}
          </p>
        )}
      </div>
    )
  }
}
