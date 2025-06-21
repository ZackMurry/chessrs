import { Box, IconButton } from '@chakra-ui/react'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Plus, RefreshCcw, Search, Sword, Swords, X } from 'lucide-react'
import { FC, FormEvent, useEffect, useState } from 'react'
import { LichessStudy } from 'types'
import { useAppDispatch, useAppSelector } from 'utils/hooks'
import DarkTooltip from './DarkTooltip'
import { loadStudyChapter, resetBoard, updateOpening } from 'store/boardSlice'
import { TextField } from '@radix-ui/themes'
import { parse, ParseTree } from '@mliebelt/pgn-parser'

interface Props {
  onExit: () => void
  onModeChange: () => void
}

const getTagFromPGN = (pgn: string, tagName: string) => {
  const regex = new RegExp(`\\[${tagName}\\s+"([^"]+)"\\]`)
  const match = pgn.match(regex)
  return match ? match[1] : null
}

const LichessStudyPanel: FC<Props> = ({ onExit, onModeChange }) => {
  const [studies, setStudies] = useState<LichessStudy[]>([])
  const [studyIdx, setStudyIdx] = useState(0)
  const { username, isDemo, moveCount } = useAppSelector(state => ({
    username: state.user.account?.username,
    isDemo: state.user.account?.isDemo,
    moveCount: state.board.halfMoveCount
  }))
  const dispatch = useAppDispatch()
  const [isLoading, setLoading] = useState(true)
  const [chapterIdx, setChapterIdx] = useState(0)
  const [chapters, setChapters] = useState([])
  const [chapterName, setChapterName] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [searchError, setSearchError] = useState(false)
  const [comments, setComments] = useState<ParseTree | null>(null)

  useEffect(() => {
    const fetchStudies = async () => {
      const lichessUsername = isDemo ? 'Thinodya' : username
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
    const chName = getTagFromPGN(ch, 'ChapterName')
    setChapterName(chName)
    function hasMovesOutsideComments(pgn) {
      // Remove metadata tags: lines like [Tag "Value"]
      const noTags = pgn.replace(/\[.*?\]\s*/g, '')

      // Remove comments: { ... }
      const noComments = noTags.replace(/\{[^}]*\}/g, '')

      // Now search for move patterns outside comments and tags
      return /\d+\.(\.\.)?\s*[a-hRNBQKO0O\-]/.test(noComments)
    }
    let validPgn = ch
    if (!hasMovesOutsideComments(ch)) {
      validPgn += '*' // End with TBD sign
    }
    const parsed = parse(validPgn, { startRule: 'game' })
    setComments(parsed as ParseTree)
    const opening = getTagFromPGN(ch, 'Opening')
    const eco = getTagFromPGN(ch, 'ECO')
    if (opening !== '?' && eco !== '?') {
      // Todo: lock this as the opening name?
      dispatch(updateOpening({ name: opening, eco }))
    }
  }

  useEffect(() => {
    const fetchStudyFile = async () => {
      const stud = studies[studyIdx]
      if (!stud) return
      const res = await fetch(`https://lichess.org/api/study/${stud.id}.pgn`)
      if (!res.ok) {
        if (studyIdx + 1 < studies.length) {
          setStudyIdx(idx => idx + 1)
        }
        return
      }
      const pgn = await res.text()
      // console.log(pgn)
      const games = pgn.replaceAll('*', '').split(/\n\n\n+/)

      setChapters(games)
      loadChapter(games[chapterIdx])
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

  const reloadChapter = () => {
    loadChapter(chapters[chapterIdx])
  }

  const openCustomStudy = () => {
    setSearchOpen(true)
  }

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault()
    const res = await fetch(`https://lichess.org/api/study/${searchValue}.pgn`)
    if (!res.ok) {
      setSearchError(true)
      return
    }
    const pgn = await res.text()
    // console.log(pgn)
    const games = pgn.replaceAll('*', '').split(/\n\n\n+/)
    const studyName = getTagFromPGN(games[0], 'StudyName')

    setChapters(games)
    setChapterIdx(0)
    loadChapter(games[0])
    setStudyIdx(0)
    setStudies(studs => [
      {
        name: studyName,
        id: searchValue,
        createdAt: new Date().getUTCSeconds(),
        updatedAt: new Date().getUTCSeconds()
      },
      ...studs
    ])
    setSearchOpen(false)
  }

  if (isLoading) {
    return <p>Loading...</p>
  }

  const currentComment =
    comments && (moveCount > 0 ? comments.moves[moveCount - 1]?.commentAfter : comments.gameComment?.comment)

  return (
    <Box py='10px'>
      <div className='text-offwhite'>
        <div className='overflow-y-auto max-h-[20vh]'>{currentComment}</div>
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

        <p className='text-md'>{chapterName}</p>
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
            <DarkTooltip label='Reload chapter'>
              <IconButton
                icon={<RefreshCcw size='18' />}
                aria-label='Reload chapter'
                className='!ring-none !shadow-none ml-1'
                variant='ghost'
                borderRadius='xl'
                padding='0'
                size='xs'
                // className='hover:!bg-none'
                _hover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                // _focus={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                _active={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                onClick={reloadChapter}
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
            {searchOpen ? (
              <form onSubmit={handleSearch}>
                <TextField.Root
                  placeholder='Lichess study ID'
                  size='1'
                  // todo: display search error (red outline)
                  className='mx-2'
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                >
                  <TextField.Slot side='right'>
                    <IconButton
                      icon={<X size='16' />}
                      aria-label='Close study search'
                      className='!ring-none !shadow-none ml-1'
                      variant='ghost'
                      borderRadius='xl'
                      padding='0'
                      size='xs'
                      // className='hover:!bg-none'
                      _hover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                      // _focus={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                      _active={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                      onClick={() => setSearchOpen(false)}
                      onSubmit={() => console.error('submitted!')}
                    />
                  </TextField.Slot>
                </TextField.Root>
              </form>
            ) : (
              <DarkTooltip label='View study by ID'>
                <IconButton
                  icon={<Search size='22' />}
                  aria-label='View study by ID'
                  className='!ring-none !shadow-none ml-1'
                  variant='ghost'
                  borderRadius='xl'
                  padding='0'
                  size='xs'
                  // className='hover:!bg-none'
                  _hover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  // _focus={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                  _active={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                  onClick={openCustomStudy}
                />
              </DarkTooltip>
            )}
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
