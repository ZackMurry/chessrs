import LichessSignInButton from 'components/landing/LichessSignInButton'
import { FC, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Timeline } from '@primer/react'
import { BrainCircuit, Microscope, PackagePlus, Save } from 'lucide-react'
import LandingPageChessboard, { DemoEval } from 'components/landing/LandingPageChessboard'

const LandingPage: FC = () => {
  const history = useHistory()

  const demoLogin = () =>
    fetch('/api/v1/auth/demo', { method: 'POST', credentials: 'include' }).then(() => history.push('/home'))

  return (
    <div className='bg-[#1f2224] pb-[2000px]'>
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

        <section className='md:px-[10%] my-20'>
          <div className='flex justify-between items-start w-full'>
            <div className='flex-[2]'>
              <div className='py-64'>
                <h2 className='font-redhat font-bold mb-5 text-gray-400'>Integrated with Lichess</h2>
                <h1 className='font-redhat text-6xl font-bold'>
                  Explore openings on the fly or import recent games from Lichess
                </h1>
              </div>
              <div className='py-64'>
                <h2 className='font-redhat font-bold mb-5 text-gray-400'>Learn from Stockfish</h2>
                <h1 className='font-redhat text-6xl font-bold'>Analyze positions using powerful cloud engines</h1>
              </div>
              <div className='py-64'>
                <h2 className='font-redhat font-bold mb-5 text-gray-400'>Choose moves to learn</h2>
                <h1 className='font-redhat text-6xl font-bold'>Add opening variations to your repertoire</h1>
              </div>
              <div className='py-64'>
                <h2 className='font-redhat font-bold mb-5 text-gray-400'>Leverage a Spaced Repetition System (SRS)</h2>
                <h1 className='font-redhat text-6xl font-bold'>Study your repertoire using flashcard techniques</h1>
              </div>
            </div>
            <div className='flex-[3] sticky top-[10vh] mt-[120px] pt-[100px]'>
              {/* <img src='/create-page.png' alt='Create page screenshot' className='scale-[0.8] mt-[50px]' /> */}
              <LandingPageChessboard />
            </div>
          </div>
        </section>

        {/* <section className='md:px-[20%] my-20'>
          <h2 className='text-4xl font-bold mb-4'>Learn chess theory using flashcards</h2>
          <Timeline className='text-offwhite'>
            <Timeline.Item className='items-center'>
              <Timeline.Badge className='!bg-[#1f2224] !w-[48px] !h-[48px] !-ml-[24px]'>
                <PackagePlus
                  aria-label='Commit'
                  className='bg-[#1f2224] rounded-[50%]'
                  size='32'
                />
              </Timeline.Badge>
              <Timeline.Body><h4 className='text-xl pb-1'>Import a game from Lichess</h4></Timeline.Body>
            </Timeline.Item>
            <Timeline.Item className='items-center'>
              <Timeline.Badge className='!bg-[#1f2224] !w-[48px] !h-[48px] !-ml-[24px]'>
                <Microscope
                  aria-label='Commit'
                  className='bg-[#1f2224] rounded-[50%]'
                  size='32'
                />
              </Timeline.Badge>
              <Timeline.Body><h4 className='text-xl pb-1'>Analyze the opening using Chessrs</h4></Timeline.Body>
            </Timeline.Item>
            <Timeline.Item className='items-center'>
              <Timeline.Badge className='!bg-[#1f2224] !w-[48px] !h-[48px] !-ml-[24px]'>
                <Save
                  aria-label='Commit'
                  className='bg-[#1f2224] rounded-[50%]'
                  size='32'
                />
              </Timeline.Badge>
              <Timeline.Body><h4 className='text-xl pb-1'>Pick opening variations to add to your repertoire</h4></Timeline.Body>
            </Timeline.Item>
            <Timeline.Item className='items-center'>
              <Timeline.Badge className='!bg-[#1f2224] !w-[48px] !h-[48px] !-ml-[24px]'>
                <BrainCircuit
                  aria-label='Commit'
                  className='bg-[#1f2224] rounded-[50%]'
                  size='32'
                />
              </Timeline.Badge>
              <Timeline.Body><h4 className='text-xl pb-1'>Study your repertoire using a Spaced Repetition System (SRS)</h4></Timeline.Body>
            </Timeline.Item>
          </Timeline>
        </section> */}
      </div>
    </div>
  )
}

export default LandingPage
