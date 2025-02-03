/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React from 'react'
import { BaseBoxShapeUtil, TLBaseShape } from "@tldraw/tldraw"

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

  component = (props: { shape: CardShape }): JSX.Element => {
    const { title, description, imageUrl, w, h } = props.shape.props

    const containerStyle: React.CSSProperties = {
      width: w,
      height: h,
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }

    const imageContainerStyle: React.CSSProperties = {
      height: '160px',
      marginBottom: '8px',
    }

    const imageStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: '4px',
    }

    const titleStyle: React.CSSProperties = {
      margin: 0,
      fontSize: '16px',
      fontWeight: 600,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
    }

    const descriptionStyle: React.CSSProperties = {
      margin: 0,
      fontSize: '14px',
      color: '#666',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
    }

    return React.createElement('div', { style: containerStyle },
      imageUrl && React.createElement('div', { style: imageContainerStyle },
        React.createElement('img', { src: imageUrl, alt: title, style: imageStyle })
      ),
      React.createElement('h3', { style: titleStyle }, title),
      description && React.createElement('p', { style: descriptionStyle }, description)
    )
  }

  indicator = (shape: CardShape): JSX.Element => {
    return React.createElement('rect', { width: shape.props.w, height: shape.props.h })
  }
}