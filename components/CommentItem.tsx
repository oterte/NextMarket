import { CommentItemType } from '@/pages/products/[id]'
import styled from '@emotion/styled'
import { IconStar } from '@tabler/icons-react'
import { format } from 'date-fns'
import { EditorState, convertFromRaw } from 'draft-js'
import CutsomEditor from './Editor'
import AutoSizeImage from './AutoSizeImage'


export default function CommentItem({ item }: { item: CommentItemType }) {
  return (
    <Wrapper>
      <div>
        <div style={{ display: 'flex' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex' }}>
              {Array.from({ length: 5 }).map((_, idx) => (
                <IconStar
                  key={idx}
                  fill={idx < item.rate ? 'red' : 'none'}
                  stroke={idx < item.rate ? 0 : 1}
                />
              ))}
            </div>
          </div>
          <p className="text-zinc-500 ml-auto">
            {format(new Date(item.updatedAt), 'yyyy년 M월 d일')}
          </p>
        </div>
        <CutsomEditor
          editorState={EditorState.createWithContent(
            convertFromRaw(JSON.parse(item.contents ?? ''))
          )}
          readOnly
          noPadding
        />
      </div>
      <div style={{ display: 'flex' }}>
        {item.images?.split(',').map((image, idx) => (
          <AutoSizeImage key={idx} src={image} size={150} />
        ))}
      </div>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  border: 1px solid black;
  border-radius: 8px;
  padding: 8px;
`