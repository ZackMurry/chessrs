import { Box, IconButton } from '@chakra-ui/react'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, RefreshCcw, Sword, Swords, X } from 'lucide-react'
import { FC, useEffect, useState } from 'react'
import { LichessStudy } from 'types'
import { useAppDispatch, useAppSelector } from 'utils/hooks'
import DarkTooltip from './DarkTooltip'
import ChessJS from 'chess.js'
import { flipBoard, loadMoves, loadStudyChapter, resetBoard, updateOpening } from 'store/boardSlice'

const Chess = typeof ChessJS === 'function' ? ChessJS : ChessJS.Chess

interface Props {
  onExit: () => void
  onModeChange: () => void
}

const LichessStudyPanel: FC<Props> = ({ onExit, onModeChange }) => {
  const [studies, setStudies] = useState<LichessStudy[]>([])
  const [studyIdx, setStudyIdx] = useState(0)
  const { username, isDemo } = useAppSelector(state => ({
    username: state.user.account?.username,
    isDemo: state.user.account?.isDemo
  }))
  const dispatch = useAppDispatch()
  const [isLoading, setLoading] = useState(true)
  const [chapterIdx, setChapterIdx] = useState(0)
  const [chapters, setChapters] = useState([])

  useEffect(() => {
    const fetchStudies = async () => {
      const lichessUsername = 'Thinodya'
      const res = await fetch(`https://lichess.org/api/study/by/${lichessUsername}`)
      const text = await res.text()
      console.log(text.split('\n'))
      const studs = text
        .split('\n')
        .filter(line => line)
        .map(line => JSON.parse(line) as LichessStudy)
      setStudies(studs)
      setLoading(false)
    }
    fetchStudies()
  }, [])

  const loadChapter = (ch: string) => {
    // todo: this clears analysis for starting position, which should be fixed once board and analysis slices are separated
    console.log('loading', ch)
    dispatch(resetBoard())
    dispatch(loadStudyChapter(ch))
  }

  useEffect(() => {
    const fetchStudyFile = async () => {
      const stud = studies[studyIdx]
      if (!stud) return
      const res = await fetch(`https://lichess.org/api/study/${stud.id}.pgn`)
      const pgn = await res.text()
      // console.log(pgn)
      const games = pgn.replaceAll('*', '').split(/\n\n\n+/)

      setChapters(games)
      loadChapter(games[0])
    }
    fetchStudyFile()
  }, [studyIdx, studies])

  const nextStudy = () => {
    setStudyIdx(idx => idx + 1)
    setChapterIdx(0)
  }

  const prevStudy = () => {
    setStudyIdx(idx => idx - 1)
    setChapterIdx(0)
  }

  const nextChapter = () => {
    loadChapter(chapters[chapterIdx + 1])
    setChapterIdx(idx => idx + 1)
  }

  const prevChapter = () => {
    loadChapter(chapters[chapterIdx - 1])
    setChapterIdx(idx => idx - 1)
  }

  if (isLoading) {
    return <p>Loading...</p>
  }

  return (
    <Box py='10px'>
      <div className='text-offwhite'>
        <h3 className='text-lg font-bold'>{studies[studyIdx].name}</h3>
        {/* todo: parse chapter title */}
        <div className='flex justify-start items-center'>
          <p className='text-md'>Chapter {chapterIdx + 1}</p>

          <DarkTooltip label='Previous chapter'>
            <IconButton
              icon={<ChevronLeft />}
              aria-label='Previous chapter'
              className='!ring-none !shadow-none ml-1'
              variant='ghost'
              borderRadius='xl'
              padding='0'
              size='xs'
              // className='hover:!bg-none'
              _hover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              // _focus={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
              _active={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
              onClick={prevChapter}
              disabled={chapterIdx <= 0}
            />
          </DarkTooltip>
          <DarkTooltip label='Next chapter'>
            <IconButton
              icon={<ChevronRight />}
              aria-label='Next chapter'
              className='!ring-none !shadow-none ml-1'
              variant='ghost'
              borderRadius='xl'
              padding='0'
              size='xs'
              // className='hover:!bg-none'
              _hover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              // _focus={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
              _active={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
              onClick={nextChapter}
              disabled={chapterIdx + 1 >= chapters.length}
            />
          </DarkTooltip>
        </div>

        <p className='text-md'>
          {/* todo: draws */}
          Result: Study
        </p>
        <div className='flex justify-between items-center mt-1'>
          <div className='flex justify-start items-center'>
            <DarkTooltip label='Previous study'>
              <IconButton
                icon={<ArrowLeft />}
                aria-label='Previous study'
                className='!ring-none !shadow-none ml-1'
                variant='ghost'
                borderRadius='xl'
                padding='0'
                size='xs'
                // className='hover:!bg-none'
                _hover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                // _focus={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                _active={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                onClick={prevStudy}
                disabled={studyIdx <= 0}
              />
            </DarkTooltip>
            <DarkTooltip label='Reload game'>
              <IconButton
                icon={<RefreshCcw size='18' />}
                aria-label='Reload game'
                className='!ring-none !shadow-none ml-1'
                variant='ghost'
                borderRadius='xl'
                padding='0'
                size='xs'
                // className='hover:!bg-none'
                _hover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                // _focus={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                _active={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
              />
            </DarkTooltip>
            <DarkTooltip label='Exit Lichess analysis'>
              <IconButton
                icon={<X />}
                aria-label='Exit Lichess analysis'
                className='!ring-none !shadow-none ml-1'
                variant='ghost'
                borderRadius='xl'
                padding='0'
                size='xs'
                // className='hover:!bg-none'
                _hover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                // _focus={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                _active={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                onClick={onExit}
              />
            </DarkTooltip>
            <DarkTooltip label='Next study'>
              <IconButton
                icon={<ArrowRight />}
                aria-label='Next study'
                className='!ring-none !shadow-none ml-1'
                variant='ghost'
                borderRadius='xl'
                padding='0'
                size='xs'
                // className='hover:!bg-none'
                _hover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                // _focus={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                _active={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                onClick={nextStudy}
                disabled={studyIdx + 1 >= studies.length}
              />
            </DarkTooltip>
          </div>
          <DarkTooltip label='Import game'>
            <IconButton
              icon={<Sword />}
              aria-label='Import game'
              className='!ring-none !shadow-none ml-1'
              variant='ghost'
              borderRadius='xl'
              padding='0'
              size='xs'
              // className='hover:!bg-none'
              _hover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              // _focus={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
              _active={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
              onClick={onModeChange}
            />
          </DarkTooltip>
        </div>
      </div>
    </Box>
  )
}

export default LichessStudyPanel
