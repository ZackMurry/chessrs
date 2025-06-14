import LichessSignInButton from 'components/landing/LichessSignInButton'
import { FC, useState } from 'react'
import { useHistory } from 'react-router-dom'
import LandingPageChessboard, { DemoEval } from 'components/landing/LandingPageChessboard'
import { Button } from '@radix-ui/themes'
import { Activity, Blocks, BookPlus, BrainCircuit, Cable, ChevronRight, GraduationCap, Plug } from 'lucide-react'

const LandingPage: FC = () => {
  const history = useHistory()

  const demoLogin = () =>
    fetch('/api/v1/auth/demo', { method: 'POST', credentials: 'include' }).then(() => history.push('/home'))

  return (
    <div className='bg-[#1f2224]'>
      <div className='flex justify-between align-center py-3 sm:px-12 md:px-[20%]'>
        <a href='/'>
          <div className='flex justify-start align-center'>
            <img
              src='/whitePawn.png'
              alt='Canvas Sync for Notion logo'
              // className='-mt-2'
              width={48}
              height={48}
            />
            <h2 className='font-redhat my-auto text-xl font-bold text-white pt-2'>Chessrs</h2>
          </div>
        </a>
        <div className='flex justify-between align-center space-x-8 my-auto text-white'>
          <a href='https://github.com/ZackMurry/chessrs' target='_blank' rel='noopener noreferrer'>
            GitHub
          </a>
          {/* todo: change to button */}
          <a href='/api/v1/oauth2/code/lichess'>Login</a>
        </div>
      </div>
      <div className='w-full px-6 sm:px-12 lg:px-[0%] xl:px-[15%]'>
        <section className='md:px-20'>
          <h1 className='text-center text-6xl font-bold pt-36 text-white pb-5'>Study chess openings using science</h1>
          <div className='lg:px-[15%] xl:px-[20%] mb-4 mt-1'>
            <h3 className='text-center text-gray-200 text-xl'>
              Chessrs uses spaced repetition algorithms to model your memory and schedule reviews accordingly.
            </h3>
            <div className='w-full flex justify-center my-7'>
              <div>
                <LichessSignInButton />
                <div className='w-full flex justify-center'>
                  <button onClick={demoLogin} className='text-gray-400 text-center mt-2 text-sm underline cursor-pointer'>
                    Or use a temporary account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* todo: demo video here (after UI is polished) */}
        <img src='/create-page.png' alt='Create page screenshot' className='scale-[0.8] mt-[50px]' />
        {/* 
        <div className='flex h-screen overflow-hidden'>
          <div className='w-2/3 h-full overflow-y-scroll'>
            <div className='h-[200vh] p-8 bg-gray-100'>
              <h1 className='text-xl mb-4'>Scrollable Left</h1>
              <p>Lots of content here...</p>
            </div>
          </div>

          <div className='w-1/3 h-full sticky top-0 bg-white p-8 shadow-lg'>
            <h2 className='text-xl font-bold'>Fixed Right</h2>
            <p>This stays on screen while scrolling.</p>
          </div>
        </div> */}

        <section className='md:px-[10%] mt-20 pb-10'>
          <div className='flex justify-between items-start w-full'>
            <div className='flex-[3]'>
              <div className='py-64'>
                <h2 className='font-redhat font-bold mb-5 text-gray-400'>Integrated with Lichess</h2>
                <h1
                  className='font-redhat text-6xl font-bold'
                  style={{
                    textShadow: '0 0 2px rgba(255, 255, 255, 0.8)'
                  }}
                >
                  Explore openings on the fly or import your games from Lichess
                </h1>
                <h4 className='text-gray-300 text-lg mt-5'>
                  Chessrs helps you improve using real opening lines from your own games and deepen your understanding with
                  over 100,000 user-created{' '}
                  <a href='https://lichess.org/study' rel='noopener noreferrer' target='_blank' className='underline'>
                    Lichess studies
                  </a>{' '}
                  packed with practical positions and expert insights.
                </h4>
                <div className='mt-8 ml-2'>
                  <a href='/api/v1/oauth2/code/lichess'>
                    <Button className='!cursor-pointer' variant='soft' color='iris'>
                      Connect a Lichess account
                      <Plug width='20' />
                    </Button>
                  </a>
                </div>
              </div>
              <div className='py-64'>
                <h2 className='font-redhat font-bold mb-5 text-gray-400'>Learn from the best</h2>
                <h1
                  className='font-redhat text-6xl font-bold'
                  style={{
                    textShadow: '0 0 2px rgba(255, 255, 255, 0.8)'
                  }}
                >
                  Analyze positions using powerful cloud engines
                </h1>
                <h4 className='text-gray-300 text-lg mt-5'>
                  Evaluate positions in real-time with the{' '}
                  <a href='https://stockfishchess.org' rel='noopener noreferrer' target='_blank' className='underline'>
                    Stockfish
                  </a>{' '}
                  engine running in your browser. For deeper insights, leverage powerful cloud engines and explore over 15
                  million pre-analyzed positions from Lichess's cloud database.
                </h4>
                <div className='mt-8 ml-2'>
                  <a href='/api/v1/oauth2/code/lichess'>
                    <Button className='!cursor-pointer' variant='soft' color='iris'>
                      Study positions
                      <GraduationCap width='20' />
                    </Button>
                  </a>
                </div>
              </div>
              <div className='py-64'>
                <h2 className='font-redhat font-bold mb-5 text-gray-400'>Choose moves to learn</h2>
                <h1
                  className='font-redhat text-6xl font-bold'
                  style={{
                    textShadow: '0 0 2px rgba(255, 255, 255, 0.8)'
                  }}
                >
                  Add opening variations to your repertoire
                </h1>
                <h4 className='text-gray-300 text-lg mt-5'>
                  Easily add new lines as you study every response to your favorite openings. Organize them into a personal
                  repertoire (set of openings) for future study.
                </h4>
                <div className='mt-8 ml-2'>
                  <a href='/api/v1/oauth2/code/lichess'>
                    <Button className='!cursor-pointer' variant='soft' color='iris'>
                      Create a repertoire
                      <Blocks className='mb-[2px]' width='20' />
                    </Button>
                  </a>
                </div>
              </div>
              <div className='pt-64 pb-[220px]'>
                <h2 className='font-redhat font-bold mb-5 text-gray-400'>Leverage a Spaced Repetition System (SRS)</h2>
                <h1
                  className='font-redhat text-6xl font-bold'
                  style={{
                    textShadow: '0 0 2px rgba(255, 255, 255, 0.8)'
                  }}
                >
                  Study your repertoire using flashcard techniques
                </h1>
                <h4 className='text-gray-300 text-lg mt-5'>
                  Leverage the same techniques used by{' '}
                  <a href='https://apps.ankiweb.net/' rel='noopener noreferrer' target='_blank' className='underline'>
                    Anki
                  </a>
                  ,{' '}
                  <a href='https://quizlet.com' rel='noopener noreferrer' target='_blank' className='underline'>
                    Quizlet
                  </a>
                  , and more to learn in an effective and reliable learning system{' '}
                  <a
                    href='https://www.pnas.org/doi/10.1073/pnas.1815156116'
                    rel='noopener noreferrer'
                    target='_blank'
                    className='underline'
                  >
                    backed by science
                  </a>
                  .
                </h4>
                <div className='mt-8 ml-2'>
                  <a href='/api/v1/oauth2/code/lichess'>
                    <Button className='!cursor-pointer' color='iris'>
                      Start learning <ChevronRight />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
            <div className='flex-[4] sticky top-[10vh] mt-[140px] pt-[100px]'>
              {/* <img src='/create-page.png' alt='Create page screenshot' className='scale-[0.8] mt-[50px]' /> */}
              <LandingPageChessboard />
            </div>
          </div>
        </section>
      </div>
      <footer className='text-center w-full pb-8 text-offwhite'>
        Created by{' '}
        <a href='https://zackmurry.com' className='underline' rel='noopener noreferrer' target='_blank'>
          Zack Murry
        </a>
      </footer>
    </div>
  )
}

export default LandingPage
